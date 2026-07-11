import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Configuration du rendu côté serveur (SSR) pour chaque route.
 *
 * - RenderMode.Client  : L'HTML est généré dans le NAVIGATEUR (CSR classique).
 *   → À utiliser pour toutes les pages protégées qui utilisent le localStorage
 *     (token JWT, guards) car localStorage n'existe pas côté serveur Node.js.
 *
 * - RenderMode.Server  : L'HTML est généré côté serveur à chaque requête.
 *   → Utile pour les pages publiques qui bénéficient du SEO.
 *
 * - RenderMode.Prerender : L'HTML est généré UNE FOIS au moment du build.
 *   → Uniquement pour les pages 100 % statiques (pas de données dynamiques).
 */
export const serverRoutes: ServerRoute[] = [

  // ── Page de connexion : rendu serveur pour le SEO ──────────────────────
  {
    path: 'login',
    renderMode: RenderMode.Server
  },

  // ── Routes avec paramètres dynamiques ─────────────────────────────────
  // Ces routes ne peuvent pas être pré-rendues sans connaître les IDs à l'avance
  {
    path: 'edit-reunion/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'edit-user/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'edit-salle/:id',
    renderMode: RenderMode.Client
  },

  // ── Toutes les autres routes (protégées par authGuard) ─────────────────
  // OBLIGATOIREMENT en Client car :
  //   1. Elles utilisent localStorage (token JWT) → absent côté serveur
  //   2. Les guards Angular ne peuvent pas s'exécuter côté serveur
  //   3. Le rechargement de page doit renvoyer index.html et laisser
  //      Angular Router gérer la navigation côté client
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
