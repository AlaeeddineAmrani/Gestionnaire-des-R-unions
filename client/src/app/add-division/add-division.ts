import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DivisionService } from '../services/division';

@Component({
  selector: 'app-add-division',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-division.html',
  styleUrl: './add-division.css',
})
export class AddDivisionComponent {

  private router = inject(Router);
  private divisionService = inject(DivisionService);

  nom_division = '';
  errorMessage = '';
  isLoading = false;

  onSubmit() {
    this.errorMessage = '';

    if (!this.nom_division.trim()) {
      this.errorMessage = 'Veuillez saisir le nom de la division.';
      return;
    }

    this.isLoading = true;
    this.divisionService.createDivision({ nom_division: this.nom_division }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Division créée avec succès !');
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
    this.router.navigate(['/getdivisions']);
  }
}
