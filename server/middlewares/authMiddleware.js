// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware d'authentification JWT.
 * 
 * Vérifie que chaque requête contient un token JWT valide 
 * dans le header `Authorization: Bearer <token>`.
 * 
 * Si le token est valide, le payload décodé est stocké dans `req.user`
 * pour être accessible par les contrôleurs en aval.
 */
const authMiddleware = (req, res, next) => {
    console.log(`[AuthMiddleware] Requête entrante : ${req.method} ${req.originalUrl}`);
    // 1. Récupérer le header Authorization
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log(`[AuthMiddleware] Aucun token fourni pour ${req.originalUrl}`);
        return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
    }

    // 2. Extraire le token (format attendu : "Bearer <token>")
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Format du token invalide." });
    }

    // 3. Vérifier et décoder le token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Stocker les infos de l'utilisateur dans req.user
        // (id_utilisateur, nom, prenom, role — issus du payload JWT)
        req.user = decoded;
        
        // 5. Passer au middleware/contrôleur suivant
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ message: "Token expiré. Veuillez vous reconnecter." });
        }
        return res.status(401).json({ message: "Token invalide." });
    }
};

module.exports = authMiddleware;
