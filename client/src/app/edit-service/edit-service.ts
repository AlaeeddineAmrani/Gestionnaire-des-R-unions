import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceAngularService } from '../services/service';
import { DivisionService, Division } from '../services/division';

@Component({
  selector: 'app-edit-service',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-service.html',
  styleUrl: './edit-service.css',
})
export class EditServiceComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private serviceAngularService = inject(ServiceAngularService);
  private divisionService = inject(DivisionService);

  serviceId: number = 0;
  nom_service = '';
  id_division: number | null = null;
  divisions: Division[] = [];
  errorMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Charger les divisions pour le select
    this.divisionService.getAllDivisions().subscribe({
      next: (data) => this.divisions = data,
      error: (err) => console.error('Erreur de chargement des divisions', err)
    });

    // Charger le service actuel
    this.serviceAngularService.getServiceById(this.serviceId).subscribe({
      next: (data: any) => {
        const service = Array.isArray(data) ? data[0] : data;
        this.nom_service = service.nom_service;
        this.id_division = service.id_division;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger le service.';
        console.error(err);
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.nom_service.trim() || !this.id_division) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.serviceAngularService.updateService(this.serviceId, {
      nom_service: this.nom_service,
      id_division: this.id_division
    }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Service modifié avec succès !');
        this.router.navigate(['/getservices']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Une erreur est survenue lors de la modification.';
      }
    });
  }

  onCancel() {
    this.router.navigate(['/getservices']);
  }
}
