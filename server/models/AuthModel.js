const db = require('../config/db');

class AuthModel {
    static getUserByEmail(email, callback) {
        const query = 'SELECT * FROM utilisateur WHERE email = ?';
        
        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('Erreur SQL lors de la recherche de l\'utilisateur :', err);
                return callback(err, null);
            }

            if (results.length > 0) {
                return callback(null, results[0]);
            }

            return callback(null, null);
        });
    }
}

module.exports = AuthModel;