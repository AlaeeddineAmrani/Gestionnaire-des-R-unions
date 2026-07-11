import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Service {
  id_service: number;
  nom_service: string;
  id_division: number;
  nom_division?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceAngularService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/services';

  // Récupérer tous les services
  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

  // Récupérer un service par ID
  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  // Créer un service
  createService(serviceData: { nom_service: string; id_division: number }): Observable<any> {
    return this.http.post(this.apiUrl, serviceData);
  }

  // Modifier un service
  updateService(id: number, serviceData: { nom_service: string; id_division: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, serviceData);
  }

  // Supprimer un service
  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
