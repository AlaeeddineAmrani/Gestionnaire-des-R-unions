import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SalleService, Salle } from '../services/salle';

@Component({
  selector: 'app-salle-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salle-list.html',
  styleUrl: './salle-list.css',
})
export class SalleListComponent implements OnInit {

  private router = inject(Router);
  private salleService = inject(SalleService);
  private cdr = inject(ChangeDetectorRef);

  salles: Salle[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.salleService.getAllSalles().subscribe({
      next: (data) => {
        console.log('[DEBUG] Salles reçues:', data);
        this.salles = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des salles.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  goToAdd() {
    this.router.navigate(['/addsalle']);
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }

  goToEdit(id: number) {
    this.router.navigate(['/edit-salle', id]);
  }

  onDelete(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;

    this.salleService.deleteSalle(id).subscribe({
      next: () => {
        this.salles = this.salles.filter(s => s.id_salle !== id);
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression.');
      }
    });
  }
}
