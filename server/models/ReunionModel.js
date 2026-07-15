const db = require('../config/db');

class ReunionModel {
    static getAllReunions(callback) {
        // Ne pas récupérer le LONGBLOB pv_rapport complet, juste un booléen pour savoir s'il existe
        const query = 'SELECT id_reunion, titre, date_reunion, heure_debut, heure_fin_prevue, heure_fin_reelle, id_salle, IF(pv_rapport IS NOT NULL, 1, 0) AS pv_rapport FROM reunion';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des réunions :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    static getReunionById(id, callback) {
        const query = 'SELECT * FROM reunion WHERE id_reunion = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération de la réunion :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static createReunion(reunionData, callback) {
        const query = 'INSERT INTO reunion (titre, date_reunion, heure_debut, heure_fin_prevue, heure_fin_reelle, id_salle, pv_rapport) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const queryConvoquerInterne = 'INSERT INTO convoquer_interne(id_utilisateur, id_reunion, role_reunion) VALUES (?, ?, ?)';

        db.query(query, [reunionData.titre, reunionData.date_reunion, reunionData.heure_debut, reunionData.heure_fin_prevue, reunionData.heure_fin_reelle, reunionData.id_salle, reunionData.pv_rapport], (err, result) => {
            if (err) {
                console.error('Erreur lors de la création de la réunion :', err);
                return callback(err, null);
            }

            const newReunionId = result.insertId;
            const participants = reunionData.participants;

            // Si aucun participant, on retourne directement
            if (!participants || participants.length === 0) {
                return callback(null, result);
            }

            // Insérer une ligne par participant dans convoquer_interne
            const insertPromises = participants.map(id_utilisateur => {
                return new Promise((resolve, reject) => {
                    db.query(queryConvoquerInterne, [id_utilisateur, newReunionId, 'PARTICIPANT'], (errC, resultC) => {
                        if (errC) return reject(errC);
                        resolve(resultC);
                    });
                });
            });

            Promise.all(insertPromises)
                .then(() => callback(null, result))
                .catch(errC => {
                    console.error('Erreur lors de l\'insertion des participants :', errC);
                    callback(errC, null);
                });
        });
    }


    static updateReunion(id, reunionData, callback) {
        // ──────────────────────────────────────────────────────────────────────
        // POURQUOI UNE TRANSACTION ?
        // On touche deux tables différentes (reunion + point). Si l'une échoue,
        // on ne veut pas laisser la BDD dans un état incohérent (réunion modifiée
        // mais points non mis à jour). Un ROLLBACK annule tout.
        // ──────────────────────────────────────────────────────────────────────
        const db = require('../config/db');

        db.getConnection((connErr, connection) => {
            if (connErr) return callback(connErr, null);

            connection.beginTransaction((txErr) => {
                if (txErr) { connection.release(); return callback(txErr, null); }

                // ── ÉTAPE 1 : Mettre à jour les infos de base de la réunion ──
                let query = 'UPDATE reunion SET titre = ?, date_reunion = ?, heure_debut = ?, heure_fin_prevue = ?, heure_fin_reelle = ?, id_salle = ?';
                let values = [
                    reunionData.titre,
                    reunionData.date_reunion,
                    reunionData.heure_debut,
                    reunionData.heure_fin_prevue,
                    reunionData.heure_fin_reelle,
                    reunionData.id_salle
                ];

                if (reunionData.pv_rapport) {
                    query += ', pv_rapport = ?';
                    values.push(reunionData.pv_rapport);
                }

                query += ' WHERE id_reunion = ?';
                values.push(id);

                connection.query(query, values, (updateErr) => {
                    if (updateErr) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(updateErr, null);
                        });
                    }

                    // ── ÉTAPE 2 : Supprimer tous les anciens points ──────────
                    // Stratégie "delete then reinsert" : plus simple que de
                    // différencier les points créés / modifiés / supprimés.
                    connection.query('DELETE FROM point WHERE id_reunion = ?', [id], (delErr) => {
                        if (delErr) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(delErr, null);
                            });
                        }

                        // ── ÉTAPE 3 : Réinsérer les nouveaux points ─────────
                        const points = reunionData.points || [];

                        if (points.length === 0) {
                            // Pas de points → on commit directement
                            return connection.commit((commitErr) => {
                                connection.release();
                                if (commitErr) return callback(commitErr, null);
                                callback(null, { message: 'Réunion mise à jour (sans points).' });
                            });
                        }

                        // Construction du tableau de valeurs pour l'INSERT multiple :
                        // chaque ligne = [description, est_discute (0/1), id_reunion]
                        const pointsValues = points.map(pt => [
                            pt.description,
                            pt.est_discute ? 1 : 0,
                            id
                        ]);

                        // INSERT ... VALUES ? : MySQL accepte un tableau de tableaux
                        // pour insérer plusieurs lignes en une seule requête.
                        connection.query(
                            'INSERT INTO point (description, est_discute, id_reunion) VALUES ?',
                            [pointsValues],
                            (insertErr) => {
                                if (insertErr) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(insertErr, null);
                                    });
                                }

                                connection.commit((commitErr) => {
                                    connection.release();
                                    if (commitErr) return callback(commitErr, null);
                                    callback(null, { message: 'Réunion et points mis à jour avec succès.' });
                                });
                            }
                        );
                    });
                });
            });
        });
    }

    // Transaction pour supprimer les enfants puis les parents, pour ne pas avoir une erreur de suppression  des données orphelines
    static deleteReunion(id, callback) {
        const db = require('../config/db');

        db.getConnection((connErr, connection) => {
            if (connErr) return callback(connErr, null);

            connection.beginTransaction((txErr) => {
                if (txErr) { connection.release(); return callback(txErr, null); }

                // ── ÉTAPE 1 : Supprimer les points liés à la réunion ─────────
                // On doit d'abord supprimer les enfants avant le parent
                // (contrainte de clé étrangère FK).
                connection.query('DELETE FROM point WHERE id_reunion = ?', [id], (err1) => {
                    if (err1) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err1, null);
                        });
                    }

                    // ── ÉTAPE 2 : Supprimer les convocations liées ───────────
                    connection.query('DELETE FROM convoquer_interne WHERE id_reunion = ?', [id], (err2) => {
                        if (err2) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err2, null);
                            });
                        }

                        // ── ÉTAPE 3 : Supprimer la réunion elle-même ─────────
                        // Le parent peut maintenant être supprimé sans conflit.
                        connection.query('DELETE FROM reunion WHERE id_reunion = ?', [id], (err3, result) => {
                            if (err3) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(err3, null);
                                });
                            }

                            // Tout réussi alors on commit
                            connection.commit((commitErr) => {
                                connection.release();
                                if (commitErr) return callback(commitErr, null);
                                callback(null, result);
                            });
                        });
                    });
                });
            });
        });
    }

    static checkChevauchement(id_salle, date_reunion, heure_debut, heure_fin_prevue, allUsersIds, callback) {
        // La requête SQL vérifie deux choses qui chevauchent l'horaire prévu :
        // 1. Soit la salle est la même.
        // 2. Soit l'un des utilisateurs (IN) fait déjà partie d'une autre réunion à ce moment-là.
        const query = `
            SELECT r.id_reunion, r.titre, r.id_salle, c.id_utilisateur 
            FROM reunion r
            LEFT JOIN convoquer_interne c ON r.id_reunion = c.id_reunion
            WHERE r.date_reunion = ?
            AND (r.heure_debut < ? AND r.heure_fin_prevue > ?)
            AND (r.id_salle = ? OR c.id_utilisateur IN (?))
        `;

        // Les paramètres remplacent les '?' dans l'ordre de la requête
        const params = [
            date_reunion,
            heure_fin_prevue,  // r.heure_debut doit être AVANT la fin de la nouvelle
            heure_debut,       // r.heure_fin_prevue doit être APRÈS le début de la nouvelle
            id_salle,
            allUsersIds
        ];

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Erreur SQL (checkChevauchement) :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    /**
     * Récupère toutes les réunions auxquelles un utilisateur participe
     * (en tant qu'ORGANISATEUR ou PARTICIPANT via la table convoquer_interne).
     */
    /**
     * Recherche des points de l'ordre du jour par mot(s) clé(s)
     * Retourne les points correspondants avec leur titre et leur id_reunion
     */
    static searchPointsByKeyword(keywords, callback) {
        // On construit une condition LIKE pour chaque mot-clé
        const conditions = keywords.map(() => 'p.description LIKE ?').join(' OR ');
        const params = keywords.map(kw => `%${kw}%`);

        const query = `
            SELECT p.id_point, p.description, p.est_discute, p.id_reunion,
                   r.titre AS titre_reunion, r.date_reunion, r.heure_debut, r.heure_fin_prevue
            FROM point p
            INNER JOIN reunion r ON p.id_reunion = r.id_reunion
            WHERE ${conditions}
            ORDER BY r.date_reunion DESC
        `;

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Erreur lors de la recherche des points :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    /**
     * Récupère la réunion associée à un point donné (par son id_point)
     */
    static getReunionByPointId(pointId, callback) {
        const query = `
            SELECT r.id_reunion, r.titre, r.date_reunion, r.heure_debut, r.heure_fin_prevue,
                   r.heure_fin_reelle, r.id_salle,
                   IF(r.pv_rapport IS NOT NULL, 1, 0) AS pv_rapport,
                   p.id_point, p.description, p.est_discute
            FROM point p
            INNER JOIN reunion r ON p.id_reunion = r.id_reunion
            WHERE p.id_point = ?
        `;
        db.query(query, [pointId], (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération de la réunion par point :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    /**
     * Récupère une réunion complète avec ses points ET ses participants
     */
    static getReunionDetails(id, callback) {
        // Requête 1 : réunion + tous ses points
        const reunionQuery = `
            SELECT r.id_reunion, r.titre, r.date_reunion, r.heure_debut, r.heure_fin_prevue,
                   r.heure_fin_reelle, r.id_salle,
                   IF(r.pv_rapport IS NOT NULL, 1, 0) AS pv_rapport,
                   p.id_point, p.description, p.est_discute
            FROM reunion r
            LEFT JOIN point p ON r.id_reunion = p.id_reunion
            WHERE r.id_reunion = ?
            ORDER BY p.id_point ASC
        `;

        // Requête 2 : participants avec leur nom/prénom et rôle
        const participantsQuery = `
            SELECT u.id_utilisateur, u.nom, u.prenom, u.email, c.role_reunion
            FROM convoquer_interne c
            INNER JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
            WHERE c.id_reunion = ?
            ORDER BY c.role_reunion DESC
        `;

        db.query(reunionQuery, [id], (err, rows) => {
            if (err) {
                console.error('Erreur (getReunionDetails - reunion) :', err);
                return callback(err, null);
            }

            if (!rows || rows.length === 0) {
                return callback(null, null);
            }

            // On assemble : la réunion est dans toutes les lignes, les points sont distincts
            const reunionBase = {
                id_reunion: rows[0].id_reunion,
                titre: rows[0].titre,
                date_reunion: rows[0].date_reunion,
                heure_debut: rows[0].heure_debut,
                heure_fin_prevue: rows[0].heure_fin_prevue,
                heure_fin_reelle: rows[0].heure_fin_reelle,
                id_salle: rows[0].id_salle,
                pv_rapport: rows[0].pv_rapport,
                points: rows
                    .filter(r => r.id_point !== null)
                    .map(r => ({ id_point: r.id_point, description: r.description, est_discute: r.est_discute }))
            };

            // Requête 2 pour les participants
            db.query(participantsQuery, [id], (err2, participants) => {
                if (err2) {
                    console.error('Erreur (getReunionDetails - participants) :', err2);
                    return callback(err2, null);
                }
                reunionBase.participants = participants || [];
                callback(null, reunionBase);
            });
        });
    }

    static getReunionsByUserId(userId, callback) {
        const query = `
            SELECT r.id_reunion, r.titre, r.date_reunion, r.heure_debut, r.heure_fin_prevue, r.heure_fin_reelle, r.id_salle, 
                   IF(r.pv_rapport IS NOT NULL, 1, 0) AS pv_rapport 
            FROM reunion r
            INNER JOIN convoquer_interne c ON r.id_reunion = c.id_reunion
            WHERE c.id_utilisateur = ?
            ORDER BY r.date_reunion DESC, r.heure_debut DESC
        `;
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des réunions de l\'utilisateur :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    // Récupère la prochaine réunion à venir pour l'utilisateur (la plus proche dans le futur)
    static getNextReunion(id_utilisateur, callback) {
        const query = `
            SELECT r.id_reunion, r.titre, r.date_reunion, r.heure_debut, r.heure_fin_prevue, r.id_salle,
                   IF(r.pv_rapport IS NOT NULL, 1, 0) AS pv_rapport
            FROM reunion r
            JOIN convoquer_interne c ON r.id_reunion = c.id_reunion
            WHERE c.id_utilisateur = ? 
              AND (r.date_reunion > CURDATE() OR (r.date_reunion = CURDATE() AND r.heure_debut >= CURTIME()))
            ORDER BY r.date_reunion ASC, r.heure_debut ASC
            LIMIT 1
        `;
        db.query(query, [id_utilisateur], (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération de la prochaine réunion :', err);
                return callback(err, null);
            }
            if (results.length === 0) {
                return callback(null, null); // Aucune réunion future trouvée
            }
            callback(null, results[0]);
        });
    }
}

module.exports = ReunionModel;