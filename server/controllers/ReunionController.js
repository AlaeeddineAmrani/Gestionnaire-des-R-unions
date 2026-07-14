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
            return res.status(409).json({
                message: "Conflit détecté. La salle ou certains participants sont déjà occupés.",
                details: overlaps
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
    const id = req.params.id;

    // 1. Les champs texte envoyés par FormData se retrouvent dans req.body
    const { titre, date_reunion, heure_debut, heure_fin_prevue, heure_fin_reelle, id_salle } = req.body;

    // ─── POINT IMPORTANT : FormData envoie TOUT en string ───────────────
    // Les points sont envoyés comme JSON.stringify([...]) côté Angular.
    // On doit les parser ici pour retrouver le tableau d'objets.
    let points = [];
    try {
        if (req.body.points) {
            points = JSON.parse(req.body.points);
        }
    } catch (parseErr) {
        console.error('Erreur de parsing des points :', parseErr);
        return res.status(400).json({ message: 'Format des points invalide.' });
    }

    // 2. On prépare l'objet de données pour le modèle
    let reunionData = {
        titre,
        date_reunion,
        heure_debut,
        heure_fin_prevue,
        heure_fin_reelle: heure_fin_reelle || null,
        id_salle: parseInt(id_salle),
        pv_rapport: null,
        points  // <- tableau d'objets { description, est_discute }
    };

    // 3. Si un nouveau fichier a été téléchargé
    if (req.file) {
        try {
            const binaryData = fs.readFileSync(req.file.path);
            reunionData.pv_rapport = binaryData;
            fs.unlinkSync(req.file.path);
        } catch (fileError) {
            console.error("Erreur lors de la lecture du fichier :", fileError);
            return res.status(500).json({ message: "Erreur lors du traitement du fichier PV." });
        }
    }

    // 4. On appelle le modèle
    ReunionModel.updateReunion(id, reunionData, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur lors de la modification de la réunion",
                error: err
            });
        }

        res.status(200).json({ message: "Réunion modifiée avec succès" });
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
    downloadPV,
    searchPoints,
    getReunionByPointId,
    getReunionDetails,
    getNextReunion
};