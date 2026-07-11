import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SalleService } from '../services/salle';

@Component({
  selector: 'app-add-salle',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-salle.html',
  styleUrl: './add-salle.css',
})
export class AddSalleComponent {

  private router = inject(Router);
  private salleService = inject(SalleService);

  nom_salle = '';
  capacite: number | null = null;
  errorMessage = '';
  isLoading = false;

  onSubmit() {
    this.errorMessage = '';

    if (!this.nom_salle.trim() || !this.capacite || this.capacite < 1) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.isLoading = true;
    this.salleService.createSalle({
      nom_salle: this.nom_salle,
      capacite: this.capacite
    }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Salle créée avec succès !');
        this.router.navigate(['/getsalles']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Une erreur est survenue lors de la création.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/getsalles']);
  }
}
