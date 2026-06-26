const db = require('../config/db');

class UtilisateurModel {
    static getAllUtilisateurs(callback) {
        const query = 'SELECT * FROM utilisateur';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des utilisateurs :', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    static getUtilisateurById(id, callback) {
        const query = 'SELECT * FROM utilisateur WHERE id_utilisateur = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération de l\'utilisateur :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static createUtilisateur(utilisateurData, callback) {
        const query = 'INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, id_service) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [utilisateurData.nom, utilisateurData.prenom, utilisateurData.email, utilisateurData.mot_de_passe, utilisateurData.id_service], (err, result) => {
            if (err) {
                console.error('Erreur lors de la création de l\'utilisateur :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static updateUtilisateur(id, utilisateurData, callback) {
        const query = 'UPDATE utilisateur SET nom = ?, prenom = ?, email = ?, mot_de_passe = ? WHERE id_utilisateur = ?';
        db.query(query, [utilisateurData.nom, utilisateurData.prenom, utilisateurData.email, utilisateurData.mot_de_passe, id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la mise à jour de l\'utilisateur :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }

    static deleteUtilisateur(id, callback){
        const query = 'DELETE FROM utilisateur WHERE id_utilisateur = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la suppression de l\'utilisateur :', err);
                return callback(err, null);
            }
            callback(null, result);
        });
    }
}

module.exports = UtilisateurModel;