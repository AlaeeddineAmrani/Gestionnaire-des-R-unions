const mysql = require('mysql2');
require('dotenv').config();

// On utilise createPool au lieu de createConnection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Jusqu'à 10 "tuyaux" en simultané
  queueLimit: 0
});

// Pour tester si le pool arrive à se connecter (optionnel)
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connexion à la base de données (Pool) réussie !');
    connection.release(); // On rend le tuyau au pool immédiatement
});

module.exports = db;
