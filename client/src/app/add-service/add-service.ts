import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ServiceAngularService } from '../services/service';
import { DivisionService, Division } from '../services/division';

@Component({
  selector: 'app-add-service',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './add-service.html',
  styleUrl: './add-service.css',
})
export class AddServiceComponent implements OnInit {

  private router = inject(Router);
  private serviceAngularService = inject(ServiceAngularService);
  private divisionService = inject(DivisionService);

  nom_service = '';
  id_division: number | null = null;
  divisions: Division[] = [];
  errorMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.divisionService.getAllDivisions().subscribe({
      next: (data) => this.divisions = data,
      error: (err) => console.error('Erreur de chargement des divisions', err)
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.nom_service || !this.id_division) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.serviceAngularService.createService({
      nom_service: this.nom_service,
      id_division: this.id_division
    }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Service créé avec succès !');
        this.router.navigate(['/admin-dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Une erreur est survenue lors de la création.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/getservices']);
  }
}
