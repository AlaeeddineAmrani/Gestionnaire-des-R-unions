const UtilisateurModel = require('../models/utilisateurModel');

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

const createUtilisateur = (req, res) => {
    const UtilisateurData = req.body;
    UtilisateurModel.createUtilisateur(UtilisateurData, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la création de l\'utilisateur", 
                error: err 
        })}

        res.status(200).json({
                message: "Utilisateur créé avec succes"
            })
        });
};

const updateUtilisateur = (req, res) => {
    const id = req.params.id;
    const UtilisateurData = req.body;
    UtilisateurModel.updateUtilisateur(id, UtilisateurData, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la modification de l\'utilisateur", 
                error: err 
        })}

        res.status(200).json({
            message: "utilisateur modifié avec succes"
        })
    });
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