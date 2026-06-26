const ReunionModel = require('../models/ReunionModel');
const fs = require('fs');

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

// +Logique importante pour éviter les chevauchements / à ajouter: vérifier si tous les utilisateurs n'ont pas de réunions à cette date-heure
const createReunion = (req, res) => {
    const reunionData = req.body;

    // On vérifie d'abord les chevauchements
    ReunionModel.checkChevauchement(
        reunionData.id_salle, 
        reunionData.date_reunion, 
        reunionData.heure_debut, 
        reunionData.heure_fin_prevue, 
        (err, overlaps) => {
            if (err) {
                return res.status(500).json({ message: "Erreur serveur", error: err });
            }

            // Si on trouve une réunion existante sur ce créneau
            if (overlaps.length > 0) {
                return res.status(409).json({ 
                    message: "La salle est déjà réservée sur ce créneau horaire." 
                });
            }
            ReunionModel.createReunion(reunionData, (err, result) => {
                if (err) {
                    return res.status(500).json({ 
                        message: "Erreur lors de la création de la réunion", 
                        error: err 
                })}

                res.status(200).json({
                    message: "Réunion créée avec succes"
                })
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
        id_utilisateur: parseInt(id_utilisateur), //créateur de réunion
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
                message: "Erreur lors de la suppression de réunion", 
                error: err 
        })}

        res.status(200).json({
            message: "Réunion supprimée avec succes"
        })
    });
};

module.exports = {
    getAllReunions,
    getReunionById,
    createReunion,
    updateReunion,
    deleteReunion
};