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
    // 1. Extraction des données envoyées par Angular
    const {
        titre, date_reunion, heure_debut, heure_fin_prevue,
        id_salle, id_organisateur,
        ids_participants, points
    } = req.body;

    // ids_participants est un tableau. 
    // On fusionne tout le monde dans un seul tableau pour vérifier les chevauchements
    const allUsers = [id_organisateur, ...ids_participants];

    // --- BLOC 2 : VÉRIFICATION DES CONFLITS ---
    ReunionModel.checkChevauchement(id_salle, date_reunion, heure_debut, heure_fin_prevue, allUsers, (err, overlaps) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la vérification des conflits", error: err });
        }

        // Si la requête renvoie des données, c'est qu'il y a un conflit
        if (overlaps && overlaps.length > 0) {
            return res.status(409).json({
                message: "Conflit détecté. La salle ou certains participants sont déjà occupés.",
                details: overlaps // Utile pour afficher côté Angular qui est occupé !
            });
        }

        // --- BLOC 3 : LA TRANSACTION MYSQL ---

        // On demande un "tuyau" exclusif à la base de données
        db.getConnection((err, connection) => {
            if (err) return res.status(500).json({ message: "Erreur de connexion à la BDD", error: err });

            // On démarre la transaction (MySQL retient son souffle)
            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return res.status(500).json({ message: "Erreur au démarrage de la transaction", error: err });
                }

                // ÉTAPE A : Insérer la réunion (sans id_utilisateur)
                const insertReunionQuery = 'INSERT INTO reunion (titre, date_reunion, heure_debut, heure_fin_prevue, id_salle) VALUES (?, ?, ?, ?, ?)';

                connection.query(insertReunionQuery, [titre, date_reunion, heure_debut, heure_fin_prevue, id_salle], (err, reunionResult) => {
                    // S'il y a une erreur, on ROLLBACK (annule tout) et on rend la connexion
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ message: "Erreur lors de la création de la réunion", error: err });
                        });
                    }

                    // On récupère l'ID de la réunion fraîchement créée
                    const id_reunion_creee = reunionResult.insertId;

                    // ÉTAPE B : Insérer l'Organisateur dans la table de liaison
                    const insertOrgQuery = 'INSERT INTO convoquer_interne (id_reunion, id_utilisateur, role_reunion) VALUES (?, ?, ?)';

                    connection.query(insertOrgQuery, [id_reunion_creee, id_organisateur, 'ORGANISATEUR'], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ message: "Erreur lors de l'assignation de l'organisateur", error: err });
                            });
                        }

                        // ÉTAPE C : Insérer les Participants
                        // Si le tableau est vide (réunion en solo), on valide direct !
                        if (!ids_participants || ids_participants.length === 0) {
                            return connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ message: "Erreur lors de la validation finale", error: err });
                                    });
                                }
                                connection.release();
                                return res.status(201).json({ message: "Réunion créée avec succès !" });
                            });
                        }

                        // S'il y a des invités, on prépare une requête d'insertion multiple (Bulk Insert)
                        // mysql2 attend un tableau de tableaux : [[id_reunion, id_user1, 'PARTICIPANT'], [id_reunion, id_user2, 'PARTICIPANT']]
                        const participantsValues = ids_participants.map(id_user => [id_reunion_creee, id_user, 'PARTICIPANT']);
                        const insertParticipantsQuery = 'INSERT INTO convoquer_interne (id_reunion, id_utilisateur, role_reunion) VALUES ?';

                        // Les valeurs du bulk insert doivent être enveloppées dans un tableau [participantsValues]
                        connection.query(insertParticipantsQuery, [participantsValues], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ message: "Erreur lors de l'invitation des participants", error: err });
                                });
                            }

                            // TOUT S'EST BIEN PASSÉ : On valide définitivement (COMMIT) !
                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ message: "Erreur lors de la validation de la transaction", error: err });
                                    });
                                }
                                connection.release(); // On libère le tuyau
                                res.status(201).json({ message: "Réunion et invitations créées avec succès !" });
                            });
                        });
                        // ... (Fin de l'étape C : insertion des participants réussie)

                        // ÉTAPE D : Insérer les Points de l'ordre du jour
                        if (!points || points.length === 0) {
                            // S'il n'y a pas de points, on valide directement
                            return connection.commit((err) => {
                                if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: err }); });
                                connection.release();
                                return res.status(201).json({ message: "Réunion créée avec succès (sans points) !" });
                            });
                        }

                        // S'il y a des points, on prépare le Bulk Insert
                        // On mappe les données : [[titre, boolean_converti, id_reunion], [...]]
                        const pointsValues = points.map(pt => [
                            pt.titre_point,
                            pt.est_discute ? 1 : 0, // MySQL stocke les booléens en 1 ou 0
                            id_reunion_creee
                        ]);

                        const insertPointsQuery = 'INSERT INTO point (titre_point, est_discute, id_reunion) VALUES ?';

                        connection.query(insertPointsQuery, [pointsValues], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ message: "Erreur lors de l'insertion des points", error: err });
                                });
                            }

                            // TOUT S'EST BIEN PASSÉ : On valide définitivement (COMMIT) !
                            connection.commit((err) => {
                                if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: err }); });
                                connection.release();
                                res.status(201).json({ message: "Réunion, participants et points créés avec succès !" });
                            });
                        });
                    });
                });
            });
        });
    });
};

const updateReunion = (req, res) => {
    const id = req.params.id;

    // 1. Les champs texte envoyés par FormData se retrouvent dans req.body
    const { titre, date_reunion, heure_debut, heure_fin_prevue, heure_fin_reelle, id_salle, id_utilisateur } = req.body;

    // 2. On prépare l'objet de données pour le modèle
    let reunionData = {
        titre,
        date_reunion,
        heure_debut,
        heure_fin_prevue,
        heure_fin_reelle: heure_fin_reelle || null,
        id_salle: parseInt(id_salle),
        pv_rapport: null // Par défaut, pas de modification du fichier
    };

    // 3. Si un nouveau fichier a été téléchargé par l'admin
    if (req.file) {
        try {
            // On lit le fichier temporaire du dossier /uploads sous forme binaire (Buffer)
            const binaryData = fs.readFileSync(req.file.path);
            reunionData.pv_rapport = binaryData;

            // Optionnel : Une fois qu'on a le buffer, on peut supprimer le fichier physique du dossier uploads
            // pour ne pas accumuler des doublons sur le serveur.
            fs.unlinkSync(req.file.path);
        } catch (fileError) {
            console.error("Erreur lors de la lecture du fichier :", fileError);
            return res.status(500).json({ message: "Erreur lors du traitement du fichier PV." });
        }
    }

    // 4. On appelle le modèle existant avec les données prêtes
    ReunionModel.updateReunion(id, reunionData, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur lors de la modification de la réunion",
                error: err
            });
        }

        res.status(200).json({
            message: "Réunion modifiée avec succès"
        });
    });
};

const deleteReunion = (req, res) => {
    const id = req.params.id;
    ReunionModel.deleteReunion(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur lors de la suppression de la réunion",
                error: err
            });
        }
        res.status(200).json({ message: "Réunion supprimée avec succès" });
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

const downloadPV = (req, res) => {
    const id = req.params.id;
    ReunionModel.getReunionById(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur lors de la récupération de la réunion",
                error: err
            });
        }

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Réunion non trouvée" });
        }

        const reunion = result[0];
        if (!reunion.pv_rapport) {
            return res.status(404).json({ message: "Aucun PV associé à cette réunion" });
        }

        // Le fichier est stocké en LONGBLOB
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=pv_reunion_${id}.pdf`);
        res.send(reunion.pv_rapport);
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

module.exports = {
    getAllReunions,
    getReunionById,
    createReunion,
    updateReunion,
    deleteReunion,
    getMyReunions,
    downloadPV,
    searchPoints,
    getReunionByPointId,
    getReunionDetails
};