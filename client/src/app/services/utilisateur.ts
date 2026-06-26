import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/utilisateurs';

  // Get des utilisateurs
  getAllUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Post createUtilisateur
  createUtilisateur(utilisateurData: any): Observable<any> {
    return this.http.post(this.apiUrl, utilisateurData);
  }

  // Delete utilisateur
  deleteUtilisateur(utilisateurID: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${utilisateurID}`);
  }

  // Récupérer un seul utilisateur par son ID
  getUtilisateurById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Update Utilisateur
  updateUtilisateur(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
