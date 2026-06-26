// server/middlewares/upload.js
const multer = require('multer');
const path = require('path');

// 1. Définir le moteur de stockage
const storage = multer.diskStorage({
    // La destination : où on sauvegarde le fichier
    destination: (req, file, callback) => {
        // Stock dans dossier "uploads" à la racine du projet backend 
        callback(null, 'uploads/'); 
    },
    // Le nom du fichier
    filename: (req, file, callback) => {
        // On renomme le fichier pour le rendre unique : "DateActuelle-NomDorigine.pdf"
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Créer l'objet d'upload qu'on va exporter
const upload = multer({ storage: storage });

module.exports = upload;