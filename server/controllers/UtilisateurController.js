const UtilisateurModel = require('../models/utilisateurModel');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10; // Nombre de tours de salage pour bcrypt

const getAllUtilisateurs = (req, res) => {
    UtilisateurModel.getAllUtilisateurs((err, results) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération des utilisateurs", 
                error: err 
            });
        }
        
        res.status(200).json(results);
    });
};

const getUtilisateurById = (req, res) => {
    const id = req.params.id;
    UtilisateurModel.getUtilisateurById(id, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération de l\'utilisateur ", 
                error: err 
            })
        }

        res.status(200).json(result);
    });
};

const createUtilisateur = async (req, res) => {
    try {
        const utilisateurData = req.body;

        // Hasher le mot de passe avant insertion
        const hashedPassword = await bcrypt.hash(utilisateurData.mot_de_passe, SALT_ROUNDS);
        utilisateurData.mot_de_passe = hashedPassword;

        UtilisateurModel.createUtilisateur(utilisateurData, (err, result) => {
            if (err) {
                return res.status(500).json({ 
                    message: "Erreur lors de la création de l\'utilisateur", 
                    error: err 
                });
            }

            res.status(200).json({
                message: "Utilisateur créé avec succes"
            });
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors du hashage du mot de passe", 
            error: error.message 
        });
    }
};

const updateUtilisateur = async (req, res) => {
    try {
        const id = req.params.id;
        const utilisateurData = req.body;

        // Hasher le nouveau mot de passe avant mise à jour
        if (utilisateurData.mot_de_passe) {
            const hashedPassword = await bcrypt.hash(utilisateurData.mot_de_passe, SALT_ROUNDS);
            utilisateurData.mot_de_passe = hashedPassword;
        }

        UtilisateurModel.updateUtilisateur(id, utilisateurData, (err, result) => {
            if (err) {
                return res.status(500).json({ 
                    message: "Erreur lors de la modification de l\'utilisateur", 
                    error: err 
                });
            }

            res.status(200).json({
                message: "utilisateur modifié avec succes"
            });
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors du hashage du mot de passe", 
            error: error.message 
        });
    }
};

const deleteUtilisateur = (req, res) => {
    const id = req.params.id;
    UtilisateurModel.deleteUtilisateur(id, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la suppression de l\'utilisateur", 
                error: err 
        })}

        res.status(200).json({
            message: "Utilisateur supprimé avec succes"
        })
    });
};

module.exports = {
    getAllUtilisateurs,
    getUtilisateurById,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur
};