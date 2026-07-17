const ReunionModel = require('../models/ReunionModel');
const fs = require('fs');
const db = require('../config/db');

const getAllReunions = (req, res) => {
    ReunionModel.getAllReunions((err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur lors de la récupération des réunions",
                error: err
            });
        }

        res.status(200).json(results);
    });
};

const getReunionById = (req, res) => {
    const id = req.params.id;
    ReunionModel.getReunionById(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur lors de la récupération de la réunion",
                error: err
            })
        }

        res.status(200).json(result);
    });
};

// +Logique importante pour éviter les chevauchements / vérifier si tous les utilisateurs n'ont pas de réunions à cette date-heure
const createReunion = (req, res) => {
    const {
        titre, date_reunion, heure_debut, heure_fin_prevue,
        id_salle, id_organisateur,
        ids_participants, points
    } = req.body;

    const allUsers = [id_organisateur, ...(ids_participants || [])];

    ReunionModel.checkChevauchement(id_salle, date_reunion, heure_debut, heure_fin_prevue, allUsers, (err, overlaps) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la vérification des conflits", error: err });
        }

        if (overlaps && overlaps.length > 0) {
            // ── Construire un rapport de conflit lisible ──────────────────────
            // Les résultats peuvent contenir plusieurs lignes pour la même réunion
            // (une par participant). On déduplique et on groupe par type de conflit.

            const formatTime = (t) => t ? t.substring(0, 5) : '?';

            // Réunions conflictuelles distinctes (par id_reunion)
            const reunionsConflitMap = new Map();
            overlaps.forEach(row => {
                if (!reunionsConflitMap.has(row.id_reunion)) {
                    reunionsConflitMap.set(row.id_reunion, {
                        titre: row.titre_reunion_conflit,
                        horaire: `${formatTime(row.heure_debut_conflit)} – ${formatTime(row.heure_fin_conflit)}`,
                        salleConflit: row.id_salle == id_salle,
                        personnesOccupees: new Set()
                    });
                }
                if (row.nom_utilisateur && allUsers.includes(Number(row.id_utilisateur))) {
                    reunionsConflitMap.get(row.id_reunion).personnesOccupees.add(
                        `${row.prenom_utilisateur} ${row.nom_utilisateur}`
                    );
                }
            });

            // Convertir en tableau sérialisable (Set → Array)
            const conflits = Array.from(reunionsConflitMap.values()).map(c => ({
                titre: c.titre,
                horaire: c.horaire,
                salleDejaReservee: c.salleConflit,
                personnesOccupees: Array.from(c.personnesOccupees)
            }));

            return res.status(409).json({
                message: "Impossible de créer la réunion : des conflits ont été détectés.",
                conflits
            });
        }

        db.getConnection((err, connection) => {
            if (err) return res.status(500).json({ message: "Erreur de connexion à la BDD", error: err });

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return res.status(500).json({ message: "Erreur au démarrage de la transaction", error: err });
                }

                const insertReunionQuery = 'INSERT INTO reunion (titre, date_reunion, heure_debut, heure_fin_prevue, id_salle) VALUES (?, ?, ?, ?, ?)';
                connection.query(insertReunionQuery, [titre, date_reunion, heure_debut, heure_fin_prevue, id_salle], (err, reunionResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ message: "Erreur lors de la création de la réunion", error: err });
                        });
                    }

                    const id_reunion_creee = reunionResult.insertId;
                    const insertOrgQuery = 'INSERT INTO convoquer_interne (id_reunion, id_utilisateur, role_reunion) VALUES (?, ?, ?)';

                    connection.query(insertOrgQuery, [id_reunion_creee, id_organisateur, 'ORGANISATEUR'], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ message: "Erreur lors de l'assignation de l'organisateur", error: err });
                            });
                        }

                        // Fonction pour finaliser (commit et envoi de réponse)
                        const finaliserReunion = (message) => {
                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ message: "Erreur lors de la validation finale", error: err });
                                    });
                                }
                                connection.release();
                                return res.status(201).json({ message });
                            });
                        };

                        // Fonction pour insérer les points (Étape D)
                        const insererPoints = () => {
                            if (!points || points.length === 0) {
                                return finaliserReunion("Réunion créée avec succès !");
                            }

                            const pointsValues = points.map(pt => [
                                pt.titre_point || pt.description,
                                pt.est_discute ? 1 : 0,
                                id_reunion_creee
                            ]);

                            const insertPointsQuery = 'INSERT INTO point (description, est_discute, id_reunion) VALUES ?';
                            connection.query(insertPointsQuery, [pointsValues], (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ message: "Erreur lors de l'insertion des points", error: err });
                                    });
                                }
                                finaliserReunion("Réunion, participants et points créés avec succès !");
                            });
                        };

                        // Étape C : Insérer les participants
                        // On filtre l'organisateur au cas où il aurait été sélectionné dans les participants
                        const participantsFiltres = (ids_participants || []).filter(id => Number(id) !== Number(id_organisateur));

                        if (participantsFiltres.length === 0) {
                            insererPoints();
                        } else {
                            const participantsValues = participantsFiltres.map(id_user => [id_reunion_creee, id_user, 'PARTICIPANT']);
                            const insertParticipantsQuery = 'INSERT INTO convoquer_interne (id_reunion, id_utilisateur, role_reunion) VALUES ?';

                            connection.query(insertParticipantsQuery, [participantsValues], (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ message: "Erreur lors de l'invitation des participants", error: err });
                                    });
                                }
                                insererPoints();
                            });
                        }
                    });
                });
            });
        });
    });
};

const updateReunion = (req, res) => {
    const id_reunion = req.params.id;
    const appelant = req.user;

    // Logique commune : parser le body et préparer reunionData
    const execUpdate = () => {
        const { titre, date_reunion, heure_debut, heure_fin_prevue, heure_fin_reelle, id_salle } = req.body;

        let points = [];
        try {
            if (req.body.points) points = JSON.parse(req.body.points);
        } catch (parseErr) {
            return res.status(400).json({ message: 'Format des points invalide.' });
        }

        let reunionData = {
            titre, date_reunion, heure_debut, heure_fin_prevue,
            heure_fin_reelle: heure_fin_reelle || null,
            id_salle: parseInt(id_salle),
            pv_rapport: null,
            points
        };

        if (req.file) {
            try {
                reunionData.pv_rapport = fs.readFileSync(req.file.path);
                fs.unlinkSync(req.file.path);
            } catch (fileError) {
                return res.status(500).json({ message: "Erreur lors du traitement du fichier PV." });
            }
        }

        ReunionModel.updateReunion(id_reunion, reunionData, (err) => {
            if (err) return res.status(500).json({ message: "Erreur lors de la modification de la réunion", error: err });
            res.status(200).json({ message: "Réunion modifiée avec succès" });
        });
    };

    // ── Cas 1 : Admin → accès direct ─────────────────────────────────────────
    if (appelant.role && appelant.role.toUpperCase() === 'ADMIN') {
        return execUpdate();
    }

    // ── Cas 2 : User normal → doit être ORGANISATEUR ──────────────────────────
    const checkQuery = `
        SELECT role_reunion FROM convoquer_interne
        WHERE id_reunion = ? AND id_utilisateur = ?
    `;
    db.query(checkQuery, [id_reunion, appelant.id_utilisateur], (err, rows) => {
        if (err) return res.status(500).json({ message: "Erreur lors de la vérification du rôle", error: err });

        if (!rows || rows.length === 0)
            return res.status(403).json({ message: "Vous n'êtes pas impliqué dans cette réunion." });

        if (rows[0].role_reunion !== 'ORGANISATEUR')
            return res.status(403).json({ message: "Seul l'organisateur peut modifier cette réunion." });

        execUpdate();
    });
};


//  Transaction pour supprimer les enfants puis les parents, pour ne pas avoir une erreur de suppression  des données orphelines
const deleteReunion = (req, res) => {
    const id_reunion = req.params.id;
    const appelant = req.user; // injecté par authMiddleware (contient id_utilisateur + role)
    // ── Cas 1 : L'admin a tous les droits ────────────────────────────────────
    if (appelant.role && appelant.role.toUpperCase() === 'ADMIN') {
        return ReunionModel.deleteReunion(id_reunion, (err) => {
            if (err) return res.status(500).json({ message: "Erreur lors de la suppression", error: err });
            res.status(200).json({ message: "Réunion supprimée avec succès (admin)" });
        });
    }
    // ── Cas 2 : User normal → vérifier qu'il est ORGANISATEUR ────────────────
    // On interroge convoquer_interne pour voir son rôle dans cette réunion.
    const checkQuery = `
        SELECT role_reunion
        FROM convoquer_interne
        WHERE id_reunion = ? AND id_utilisateur = ?
    `;
    db.query(checkQuery, [id_reunion, appelant.id_utilisateur], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la vérification du rôle", error: err });
        }
        // L'utilisateur n'est pas dans cette réunion du tout
        if (!rows || rows.length === 0) {
            return res.status(403).json({ message: "Vous n'êtes pas impliqué dans cette réunion." });
        }
        const role = rows[0].role_reunion;
        // Il est juste participant → interdit
        if (role !== 'ORGANISATEUR') {
            return res.status(403).json({
                message: "Seul l'organisateur peut supprimer cette réunion."
            });
        }
        // Il est bien organisateur → on supprime
        ReunionModel.deleteReunion(id_reunion, (err2) => {
            if (err2) return res.status(500).json({ message: "Erreur lors de la suppression", error: err2 });
            res.status(200).json({ message: "Réunion supprimée avec succès" });
        });
    });
};

const getMyReunions = (req, res) => {
    // req.user est injecté par le middleware JWT
    const userId = req.user.id_utilisateur;

    ReunionModel.getReunionsByUserId(userId, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur lors de la récupération de vos réunions",
                error: err
            });
        }
        res.status(200).json(results);
    });
};

const searchPoints = (req, res) => {
    // Le mot-clé vient du query param: /api/reunions/search/points?q=budget+RH
    const q = req.query.q || '';
    if (!q.trim()) {
        return res.status(400).json({ message: 'Paramètre de recherche manquant.' });
    }

    // On découpe la chaîne en mots individuels (séparés par des espaces)
    const keywords = q.trim().split(/\s+/);

    ReunionModel.searchPointsByKeyword(keywords, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la recherche', error: err });
        }
        res.status(200).json(results);
    });
};

const getReunionByPointId = (req, res) => {
    const pointId = req.params.pointId;
    ReunionModel.getReunionByPointId(pointId, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération', error: err });
        }
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'Aucune réunion trouvée pour ce point.' });
        }
        res.status(200).json(results[0]);
    });
};

const showPV = (req, res) => {
    const id = req.params.id;
    ReunionModel.getReunionById(id, (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur lors de la récupération de la réunion", error: err });
        if (!result || result.length === 0) return res.status(404).json({ message: "Réunion non trouvée" });

        const reunion = result[0];
        if (!reunion.pv_rapport) return res.status(404).json({ message: "Aucun PV associé à cette réunion" });

        const buffer = Buffer.from(reunion.pv_rapport);

        // ── Détection du type de fichier par les "magic bytes" ────────────────
        // Chaque format de fichier commence par une séquence d'octets connue.
        // On lit les 4 premiers octets pour identifier le vrai format,
        // sans se fier à l'extension (qui peut être fausse ou absente).
        let mimeType = 'application/octet-stream'; // type générique par défaut
        let extension = 'bin';

        if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
            // %PDF → PDF
            mimeType = 'application/pdf';
            extension = 'pdf';
        } else if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
            // PK → ZIP / DOCX / XLSX (Office Open XML)
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            extension = 'docx';
        } else if (buffer[0] === 0xD0 && buffer[1] === 0xCF) {
            // D0CF → anciens formats Office (.doc, .xls)
            mimeType = 'application/msword';
            extension = 'doc';
        }

        // inline → le navigateur l'ouvre dans l'onglet, pas de téléchargement forcé
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename=pv_reunion_${id}.${extension}`);
        res.send(buffer);
    });
};

const getReunionDetails = (req, res) => {
    const id = req.params.id;
    ReunionModel.getReunionDetails(id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération des détails', error: err });
        }
        if (!result) {
            return res.status(404).json({ message: 'Réunion non trouvée.' });
        }
        res.status(200).json(result);
    });
};

const getNextReunion = (req, res) => {
    const id_utilisateur = req.user.id_utilisateur; // Récupéré depuis le token JWT par le middleware
    console.log(`[getNextReunion] Fetching for user: ${id_utilisateur}`);
    ReunionModel.getNextReunion(id_utilisateur, (err, result) => {
        if (err) {
            console.error('[getNextReunion] Error:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération de la prochaine réunion', error: err });
        }
        if (!result) {
            console.log('[getNextReunion] No reunion found, returning null.');
            return res.status(200).json(null);
        }
        console.log('[getNextReunion] Reunion found:', result.titre);
        res.status(200).json(result);
    });
};

module.exports = {
    getAllReunions,
    getReunionById,
    createReunion,
    updateReunion,
    deleteReunion,
    getMyReunions,
    showPV,
    searchPoints,
    getReunionByPointId,
    getReunionDetails,
    getNextReunion
};