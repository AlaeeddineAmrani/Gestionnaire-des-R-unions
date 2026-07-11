const ServiceModel = require('../models/ServiceModel');

const getAllServices = (req, res) => {
    ServiceModel.getAllServices((err, results) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération des services", 
                error: err 
            });
        }
        res.status(200).json(results);
    });
};

const getServiceById = (req, res) => {
    const id = req.params.id;
    ServiceModel.getServiceById(id, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération du service", 
                error: err 
            });
        }
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Service non trouvé" });
        }
        res.status(200).json(result[0]);
    });
};

const createService = (req, res) => {
    const serviceData = req.body;

    if (!serviceData.nom_service || !serviceData.id_division) {
        return res.status(400).json({ message: "Le nom du service et la division sont requis." });
    }

    ServiceModel.createService(serviceData, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la création du service", 
                error: err 
            });
        }
        res.status(201).json({ 
            message: "Service créé avec succès",
            id_service: result.insertId 
        });
    });
};

const updateService = (req, res) => {
    const id = req.params.id;
    const serviceData = req.body;

    if (!serviceData.nom_service || !serviceData.id_division) {
        return res.status(400).json({ message: "Le nom du service et la division sont requis." });
    }

    ServiceModel.updateService(id, serviceData, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la modification du service", 
                error: err 
            });
        }
        res.status(200).json({ message: "Service modifié avec succès" });
    });
};

const deleteService = (req, res) => {
    const id = req.params.id;
    ServiceModel.deleteService(id, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la suppression du service", 
                error: err 
            });
        }
        res.status(200).json({ message: "Service supprimé avec succès" });
    });
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};
