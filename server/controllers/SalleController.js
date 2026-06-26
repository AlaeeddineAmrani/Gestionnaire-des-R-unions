const SalleModel = require('../models/SalleModel');

const getAllSalles = (req, res) => {
    SalleModel.getAllSalles((err, results) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération des salles", 
                error: err 
            });
        }
        
        res.status(200).json(results);
    });
};

const getSalleById = (req, res) => {
    const id = req.params.id;
    SalleModel.getSalleById(id, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération de la salle", 
                error: err 
            })
        }

        res.status(200).json(result);
    });
};

const createSalle = (req, res) => {
    const salleData = req.body;
    SalleModel.createSalle(salleData, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la création de la salle", 
                error: err 
        })}

        res.status(200).json({
                message: "Salle créée avec succes"
            })
        });
};

const updateSalle = (req, res) => {
    const id = req.params.id;
    const SalleData = req.body;
    SalleModel.updateSalle(id, SalleData, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la modification de la salle", 
                error: err 
        })}

        res.status(200).json({
            message: "salle modifiée avec succes"
        })
    });
};

const deleteSalle = (req, res) => {
    const id = req.params.id;
    SalleModel.deleteSalle(id, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la suppression de salle", 
                error: err 
        })}

        res.status(200).json({
            message: "Salle supprimée avec succes"
        })
    });
};

module.exports = {
    getAllSalles,
    getSalleById,
    createSalle,
    updateSalle,
    deleteSalle
};