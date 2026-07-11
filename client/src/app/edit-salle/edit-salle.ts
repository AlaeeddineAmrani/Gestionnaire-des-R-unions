import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SalleService } from '../services/salle';

@Component({
  selector: 'app-edit-salle',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-salle.html',
  styleUrl: './edit-salle.css',
})
export class EditSalleComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private salleService = inject(SalleService);

  salleId: number = 0;
  nom_salle = '';
  capacite: number | null = null;
  errorMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.salleId = Number(this.route.snapshot.paramMap.get('id'));
    this.salleService.getSalleById(this.salleId).subscribe({
      next: (data: any) => {
        // getSalleById peut retourner un tableau ou un objet selon le contrôleur
        const salle = Array.isArray(data) ? data[0] : data;
        this.nom_salle = salle.nom_salle;
        this.capacite = salle.capacite;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger la salle.';
        console.error(err);
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.nom_salle.trim() || !this.capacite || this.capacite < 1) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.isLoading = true;
    this.salleService.updateSalle(this.salleId, {
      nom_salle: this.nom_salle,
      capacite: this.capacite
    }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Salle modifiée avec succès !');
        this.router.navigate(['/getsalles']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Une erreur est survenue lors de la modification.';
      }
    });
  }

  onCancel() {
    this.router.navigate(['/getsalles']);
  }
}
