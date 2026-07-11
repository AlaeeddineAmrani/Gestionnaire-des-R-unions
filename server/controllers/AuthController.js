const AuthModel = require('../models/AuthModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const login = (req, res) => {
    const { email, mot_de_passe } = req.body;

    // 1. On cherche l'utilisateur via le Modèle
    AuthModel.getUserByEmail(email, (err, results) => {
        if (err) {
            return res.status(500).json({ 
                message: "Erreur lors de la récupération des données", 
                error: err 
            });
        }

        // 2. Si l'email n'existe pas dans la base
        if (results === null) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        // 3. Si l'email existe, on vérifie le mot de passe avec bcrypt
        bcrypt.compare(mot_de_passe, results.mot_de_passe, (errBcrypt, isMatch) => {
            if (errBcrypt) {
                return res.status(500).json({ 
                    message: "Erreur lors de la vérification du mot de passe" 
                });
            }

            if (isMatch) {
                // DÉFINITION DU PAYLOAD : Ce qu'on emballe dans le jeton
                const payload = {
                    id_utilisateur: results.id_utilisateur,
                    nom: results.nom,
                    prenom: results.prenom,
                    role: results.role
                };

                // Génération du token
                const secretKey = process.env.JWT_SECRET;
                const options = { expiresIn: '1h' }; 
                const token = jwt.sign(payload, secretKey, options);

                // Renvoyer le token ET les infos de base au client
                return res.status(200).json({
                    message: 'Connexion réussie',
                    token: token,
                    user: {
                        id_utilisateur: results.id_utilisateur,
                        nom: results.nom,
                        prenom: results.prenom,
                        role: results.role
                    }
                });
            } else {
                // 4. Si le mot de passe est faux !
                return res.status(401).json({
                    message: "Email ou mot de passe incorrect"
                });
            }
        });
    });
};

module.exports = {
    login
};