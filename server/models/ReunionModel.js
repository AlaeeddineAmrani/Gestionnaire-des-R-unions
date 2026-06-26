const db = require('../config/db');

class ReunionModel {
    static getAllReunions(callback) {
        const query = 'SELECT * FROM reunion';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des réunions :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    static getReunionById(id, callback) {
        const query = 'SELECT * FROM reunion WHERE id_reunion = ?';
        db.query(query, [id], (err, result) => {
            if (err){
                console.error('Erreur lors de la récupération de la réunion :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static createReunion(reunionData, callback) {
        const query = 'INSERT INTO reunion (titre, date_reunion, heure_debut, heure_fin_prevue, heure_fin_reelle, id_salle, id_utilisateur, pv_rapport) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [reunionData.titre, reunionData.date_reunion, reunionData.heure_debut, reunionData.heure_fin_prevue, reunionData.heure_fin_reelle, reunionData.id_salle, reunionData.id_utilisateur, reunionData.pv_rapport], (err, result) => {
            if (err) {
                console.error('Erreur lors de la création de la réunion :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static updateReunion(id, reunionData, callback) {
        // 1. On prépare le début de la requête (sans le PV)
        let query = 'UPDATE reunion SET titre = ?, date_reunion = ?, heure_debut = ?, heure_fin_prevue = ?, heure_fin_reelle = ?, id_salle = ?, id_utilisateur = ?';
        
        // 2. On prépare le tableau des valeurs correspondantes
        let values = [
            reunionData.titre, 
            reunionData.date_reunion, 
            reunionData.heure_debut, 
            reunionData.heure_fin_prevue, 
            reunionData.heure_fin_reelle, 
            reunionData.id_salle, 
            reunionData.id_utilisateur
        ];

        // 3. On vérifie si un Buffer binaire a été passé par le contrôleur
        if (reunionData.pv_rapport) {
            query += ', pv_rapport = ?'; // On ajoute la colonne à modifier
            values.push(reunionData.pv_rapport); // On ajoute le Buffer dans les valeurs
        }

        // 4. On termine la requête avec la clause WHERE
        query += ' WHERE id_reunion = ?';
        values.push(id); // L'ID se met toujours à la fin du tableau

        // 5. On exécute la requête finale !
        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Erreur SQL lors de la mise à jour de la réunion :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static deleteReunion(id, callback) {
        const query = 'DELETE FROM reunion WHERE id_reunion = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la suppression de la réunion :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }
    
    static checkChevauchement(id_salle, date_reunion, heure_debut, heure_fin, callback) {
        const query = `
            SELECT * FROM reunion 
            WHERE id_salle = ? 
            AND date_reunion = ? 
            AND (heure_debut < ? AND heure_fin_prevue > ?)
        `;
        db.query(query, [id_salle, date_reunion, heure_fin, heure_debut], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }
}

module.exports = ReunionModel;