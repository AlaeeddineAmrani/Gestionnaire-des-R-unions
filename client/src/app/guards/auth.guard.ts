import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { isPlatformBrowser } from '@angular/common';

/**
 * authGuard — Protège toutes les routes nécessitant une connexion valide.
 *
 * Vérifie :
 *  1. Exécution dans le navigateur (pas côté serveur SSR — localStorage absent).
 *  2. Token JWT présent dans le localStorage.
 *  3. Token non expiré (vérification locale du champ "exp" du payload).
 *
 * Si l'une des conditions échoue → redirection vers /login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Côté serveur SSR : localStorage n'existe pas.
  // On laisse passer pour que le navigateur prenne le relais.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoggedIn()) {
    return true; // ✅ Token valide et non expiré
  }

  // ❌ Pas de token ou token expiré → retour à la page de connexion
  router.navigate(['/login']);
  return false;
};
