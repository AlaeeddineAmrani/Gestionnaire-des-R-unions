import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { isPlatformBrowser } from '@angular/common';

/**
 * adminGuard — Protège les routes réservées aux administrateurs.
 *
 * Présuppose que authGuard a déjà été exécuté (token valide).
 * Lit le rôle depuis le payload JWT décodé localement.
 *
 * - Rôle ADMIN → accès autorisé.
 * - Autre rôle → redirection vers /user-dashboard.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Côté serveur SSR : on laisse passer (le navigateur fera la vraie vérification)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isAdmin()) {
    return true; // ✅ Rôle ADMIN confirmé
  }

  // ❌ Utilisateur connecté mais pas admin → son tableau de bord
  router.navigate(['/user-dashboard']);
  return false;
};
