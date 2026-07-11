import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = 'http://localhost:3000/api';

  // ─── Accès sécurisé au localStorage (absent côté serveur SSR) ────────────
  private storage = {
    getItem: (key: string): string | null => {
      if (!isPlatformBrowser(this.platformId)) return null;
      return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
      if (!isPlatformBrowser(this.platformId)) return;
      localStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
      if (!isPlatformBrowser(this.platformId)) return;
      localStorage.removeItem(key);
    }
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  login(email: string, mot_de_passe: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, mot_de_passe }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.storage.setItem('token', response.token);
          this.storage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  // ─── TOKEN ────────────────────────────────────────────────────────────────
  getToken(): string | null {
    return this.storage.getItem('token');
  }

  /**
   * Décode le payload du JWT sans bibliothèque externe.
   * Un JWT = header.payload.signature (séparés par des ".")
   * Le payload est encodé en Base64URL.
   */
  private decodeToken(): { exp: number; role: string; [key: string]: any } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null; // Token malformé → invalide
    }
  }

  /**
   * Vérifie si le token JWT est expiré.
   * Le champ "exp" est un timestamp Unix en secondes.
   */
  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload || !payload['exp']) return true;
    return Date.now() >= payload['exp'] * 1000;
  }

  /**
   * L'utilisateur est connecté SI :
   *   1. Un token existe dans le localStorage
   *   2. Ce token n'est pas encore expiré
   * Si le token est expiré → nettoyage automatique.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    if (this.isTokenExpired()) {
      this.clearSession();
      return false;
    }
    return true;
  }

  /**
   * Récupère le rôle depuis le payload du token JWT.
   */
  getRole(): string | null {
    if (!this.isLoggedIn()) return null;
    const payload = this.decodeToken();
    return payload ? payload['role'] : null;
  }

  /**
   * Vérifie si l'utilisateur connecté est un ADMIN.
   */
  isAdmin(): boolean {
    const role = this.getRole();
    return role?.toUpperCase() === 'ADMIN';
  }

  // ─── SESSION ──────────────────────────────────────────────────────────────
  private clearSession(): void {
    this.storage.removeItem('token');
    this.storage.removeItem('user');
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}