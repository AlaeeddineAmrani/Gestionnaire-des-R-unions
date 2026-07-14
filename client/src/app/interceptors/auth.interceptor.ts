import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Crée avec: ng g interceptor mon-intercepteur
 * Intercepteur HTTP fonctionnel.
 *
 * Ajoute automatiquement le header `Authorization: Bearer <token>`
 * à toutes les requêtes HTTP sortantes (sauf la route de login).
 *
 * Compatible avec le SSR (Server-Side Rendering) :
 * côté serveur, le localStorage n'existe pas, donc on laisse passer sans modification.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const platformId = inject(PLATFORM_ID);
    
    // Côté serveur SSR : pas de localStorage, on laisse passer
    if (!isPlatformBrowser(platformId)) {
      return next(req);
    }

    // Ne pas ajouter le token sur la route de login
    if (req.url.includes('/api/login')) {
      return next(req);
    }

    const token = localStorage.getItem('token');

    if (token) {
      // Cloner la requête en ajoutant le header Authorization
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedReq);
    }

    // Pas de token → on laisse passer (le serveur renverra 401)
    return next(req);
  } catch (error) {
    console.error('[Interceptor Error]', error);
    return next(req);
  }
};
