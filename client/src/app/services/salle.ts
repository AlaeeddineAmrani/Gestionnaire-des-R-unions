import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Salle {
  id_salle: number;
  nom_salle: string;
  capacite: number;
}

@Injectable({
  providedIn: 'root',
})
export class SalleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/salles';

  getAllSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(this.apiUrl);
  }

  getSalleById(id: number): Observable<Salle> {
    return this.http.get<Salle>(`${this.apiUrl}/${id}`);
  }

  createSalle(salleData: { nom_salle: string; capacite: number }): Observable<any> {
    return this.http.post(this.apiUrl, salleData);
  }

  updateSalle(id: number, salleData: { nom_salle: string; capacite: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, salleData);
  }

  deleteSalle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
