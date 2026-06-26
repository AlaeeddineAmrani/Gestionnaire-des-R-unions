import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = 'http://localhost:3000/api';

  // 1. Envoyer les identifiants au backend
  login(email: string, mot_de_passe: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, mot_de_passe }).pipe(
      // 'tap' permet d'exécuter du code discrètement quand la réponse arrive, 
      // sans modifier la donnée renvoyée au composant.
      tap((response: any) => {
        if (response && response.token) {
          // Si on reçoit un token, on le sauvegarde dans le navigateur
          this.setToken(response.token);
          // On sauvegarde aussi les infos de l'utilisateur pour l'affichage (Dashboard)
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  // 2. Sauvegarder le token dans le LocalStorage
  private setToken(token: string) {
    localStorage.setItem('token', token);
  }

  // 3. Récupérer le token (utile pour les requêtes futures)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 4. Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    // Si le token existe, on considère qu'il est connecté (on pourrait ajouter une vérification d'expiration plus tard)
    return this.getToken() !== null;
  }

  // 5. Déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}