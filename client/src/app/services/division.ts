import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Division {
  id_division: number;
  nom_division: string;
}

@Injectable({
  providedIn: 'root',
})
export class DivisionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/divisions';

  // Récupérer toutes les divisions
  getAllDivisions(): Observable<Division[]> {
    return this.http.get<Division[]>(this.apiUrl);
  }

  // Récupérer une division par ID
  getDivisionById(id: number): Observable<Division> {
    return this.http.get<Division>(`${this.apiUrl}/${id}`);
  }

  // Créer une division
  createDivision(divisionData: { nom_division: string }): Observable<any> {
    return this.http.post(this.apiUrl, divisionData);
  }

  // Modifier une division
  updateDivision(id: number, divisionData: { nom_division: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, divisionData);
  }

  // Supprimer une division
  deleteDivision(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
