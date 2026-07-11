const DivisionModel = require('../models/DivisionModel');

const getAllDivisions = (req, res) => {
    DivisionModel.getAllDivisions((err, results) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération des divisions", 
                error: err 
            });
        }
        res.status(200).json(results);
    });
};

const getDivisionById = (req, res) => {
    const id = req.params.id;
    DivisionModel.getDivisionById(id, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération de la division", 
                error: err 
            });
        }
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Division non trouvée" });
        }
        res.status(200).json(result[0]);
    });
};

const createDivision = (req, res) => {
    const divisionData = req.body;

    if (!divisionData.nom_division) {
        return res.status(400).json({ message: "Le nom de la division est requis." });
    }

    DivisionModel.createDivision(divisionData, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la création de la division", 
                error: err 
            });
        }
        res.status(201).json({ 
            message: "Division créée avec succès",
            id_division: result.insertId 
        });
    });
};

const updateDivision = (req, res) => {
    const id = req.params.id;
    const divisionData = req.body;

    if (!divisionData.nom_division) {
        return res.status(400).json({ message: "Le nom de la division est requis." });
    }

    DivisionModel.updateDivision(id, divisionData, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la modification de la division", 
                error: err 
            });
        }
        res.status(200).json({ message: "Division modifiée avec succès" });
    });
};

const deleteDivision = (req, res) => {
    const id = req.params.id;
    DivisionModel.deleteDivision(id, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la suppression de la division", 
                error: err 
            });
        }
        res.status(200).json({ message: "Division supprimée avec succès" });
    });
};

module.exports = {
    getAllDivisions,
    getDivisionById,
    createDivision,
    updateDivision,
    deleteDivision
};
