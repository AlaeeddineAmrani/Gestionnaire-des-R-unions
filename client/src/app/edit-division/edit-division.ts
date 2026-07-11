import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DivisionService } from '../services/division';

@Component({
  selector: 'app-edit-division',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-division.html',
  styleUrl: './edit-division.css',
})
export class EditDivisionComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private divisionService = inject(DivisionService);

  divisionId: number = 0;
  nom_division = '';
  errorMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.divisionId = Number(this.route.snapshot.paramMap.get('id'));

    // Charger la division actuelle
    this.divisionService.getDivisionById(this.divisionId).subscribe({
      next: (data: any) => {
        const division = Array.isArray(data) ? data[0] : data;
        this.nom_division = division.nom_division;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger la division.';
        console.error(err);
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.nom_division.trim()) {
      this.errorMessage = 'Veuillez saisir le nom de la division.';
      return;
    }

    this.isLoading = true;
    this.divisionService.updateDivision(this.divisionId, {
      nom_division: this.nom_division
    }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Division modifiée avec succès !');
        this.router.navigate(['/getdivisions']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Une erreur est survenue lors de la modification.';
      }
    });
  }

  onCancel() {
    this.router.navigate(['/getdivisions']);
  }
}
