const db = require('../config/db');

class DivisionModel {

    static getAllDivisions(callback) {
        const query = 'SELECT * FROM division';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des divisions :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    static getDivisionById(id, callback) {
        const query = 'SELECT * FROM division WHERE id_division = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération de la division :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static createDivision(divisionData, callback) {
        const query = 'INSERT INTO division (nom_division) VALUES (?)';
        db.query(query, [divisionData.nom_division], (err, result) => {
            if (err) {
                console.error('Erreur lors de la création de la division :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static updateDivision(id, divisionData, callback) {
        const query = 'UPDATE division SET nom_division = ? WHERE id_division = ?';
        db.query(query, [divisionData.nom_division, id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la mise à jour de la division :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static deleteDivision(id, callback) {
        const query = 'DELETE FROM division WHERE id_division = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la suppression de la division :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }
}

module.exports = DivisionModel;
