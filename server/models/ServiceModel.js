const db = require('../config/db');

class ServiceModel {

    static getAllServices(callback) {
        const query = `
            SELECT s.id_service, s.nom_service, s.id_division, d.nom_division
            FROM service s
            LEFT JOIN division d ON s.id_division = d.id_division
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des services :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    static getServiceById(id, callback) {
        const query = `
            SELECT s.id_service, s.nom_service, s.id_division, d.nom_division
            FROM service s
            LEFT JOIN division d ON s.id_division = d.id_division
            WHERE s.id_service = ?
        `;
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération du service :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static createService(serviceData, callback) {
        const query = 'INSERT INTO service (nom_service, id_division) VALUES (?, ?)';
        db.query(query, [serviceData.nom_service, serviceData.id_division], (err, result) => {
            if (err) {
                console.error('Erreur lors de la création du service :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static updateService(id, serviceData, callback) {
        const query = 'UPDATE service SET nom_service = ?, id_division = ? WHERE id_service = ?';
        db.query(query, [serviceData.nom_service, serviceData.id_division, id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la mise à jour du service :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static deleteService(id, callback) {
        const query = 'DELETE FROM service WHERE id_service = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la suppression du service :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }
}

module.exports = ServiceModel;
