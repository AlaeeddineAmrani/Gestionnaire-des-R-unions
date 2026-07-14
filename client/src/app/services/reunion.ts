import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReunionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/reunions';

  // Get des réunions
  getAllReunions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Post createReunion
  createReunion(reunionData: any): Observable<any> {
    return this.http.post(this.apiUrl, reunionData);
  }

  // Delete réunion
  deleteReunion(reunionID: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reunionID}`);
  }

  // Récupérer une seule réunion par son ID
  getReunionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Update Réunion
  updateReunion(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Récupérer les réunions de l'utilisateur connecté
  getMyReunions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }

  // Télécharger le PV d'une réunion (retourne un Blob)
  downloadPV(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pv`, { responseType: 'blob' });
  }

  // Rechercher des points par mot(s) clé(s)
  searchPoints(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search/points`, {
      params: { q: query }
    });
  }

  // Récupérer la réunion liée à un point
  getReunionByPointId(pointId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/point/${pointId}/reunion`);
  }

  // Récupérer les détails complets d'une réunion (infos + points + participants)
  getReunionDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`);
  }

  getNextReunion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/next`);
  }
}