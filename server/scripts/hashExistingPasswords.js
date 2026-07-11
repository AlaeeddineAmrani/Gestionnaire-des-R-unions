/**
 * Script de migration one-shot : Hashage des mots de passe existants
 * 
 * Ce script lit tous les utilisateurs de la table `utilisateur`,
 * hash chaque mot de passe en clair avec bcrypt, puis met à jour la base.
 * 
 * ⚠️  À EXÉCUTER UNE SEULE FOIS après le déploiement des changements.
 * 
 * Usage : node scripts/hashExistingPasswords.js
 */

const bcrypt = require('bcrypt');
const db = require('../config/db');

const SALT_ROUNDS = 10;

console.log('🔐 Début de la migration des mots de passe...\n');

// 1. Récupérer tous les utilisateurs
db.query('SELECT id_utilisateur, mot_de_passe FROM utilisateur', async (err, users) => {
    if (err) {
        console.error('❌ Erreur lors de la récupération des utilisateurs :', err);
        process.exit(1);
    }

    console.log(`📋 ${users.length} utilisateur(s) trouvé(s).\n`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
        // Vérifier si le mot de passe est déjà hashé (commence par $2b$ ou $2a$)
        if (user.mot_de_passe && user.mot_de_passe.startsWith('$2')) {
            console.log(`⏭️  Utilisateur #${user.id_utilisateur} — déjà hashé, ignoré.`);
            skipped++;
            continue;
        }

        try {
            // Hasher le mot de passe en clair
            const hashedPassword = await bcrypt.hash(user.mot_de_passe, SALT_ROUNDS);

            // Mettre à jour en base
            await new Promise((resolve, reject) => {
                db.query(
                    'UPDATE utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?',
                    [hashedPassword, user.id_utilisateur],
                    (err) => {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            });

            console.log(`✅ Utilisateur #${user.id_utilisateur} — mot de passe hashé avec succès.`);
            updated++;
        } catch (hashErr) {
            console.error(`❌ Erreur pour l'utilisateur #${user.id_utilisateur} :`, hashErr);
        }
    }

    console.log(`\n🎉 Migration terminée ! ${updated} mis à jour, ${skipped} déjà hashé(s).`);
    process.exit(0);
});
