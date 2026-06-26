const db = require('../config/db');

class SalleModel {
    static getAllSalles(callback) {
        const query = 'SELECT * FROM salle';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des salles :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    static getSalleById(id, callback) {
        const query = 'SELECT * FROM salle WHERE id_salle = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération de la salle :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static createSalle(salleData, callback) {
        const query = 'INSERT INTO salle(nom_salle, capacite) VALUES (?, ?)';
        db.query(query, [salleData.nom_salle, salleData.capacite], (err, result) => {
            if (err) {
                console.error('Erreur lors de la création de la salle :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static deleteSalle(id, callback) {
        const query = 'DELETE FROM salle WHERE id_salle = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la suppression de la salle :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }
}

module.exports = SalleModel;

