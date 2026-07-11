import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DivisionService, Division } from '../services/division';

@Component({
  selector: 'app-division-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './division-list.html',
  styleUrl: './division-list.css',
})
export class DivisionListComponent implements OnInit {

  private router = inject(Router);
  private divisionService = inject(DivisionService);
  private cdr = inject(ChangeDetectorRef);

  divisions: Division[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.divisionService.getAllDivisions().subscribe({
      next: (data) => {
        this.divisions = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des divisions.';
        this.isLoading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  goToAdd() {
    this.router.navigate(['/adddivision']);
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }

  goToEdit(id: number) {
    this.router.navigate(['/edit-division', id]);
  }

  onDelete(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette division ?')) return;

    this.divisionService.deleteDivision(id).subscribe({
      next: () => {
        this.divisions = this.divisions.filter(d => d.id_division !== id);
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression.');
      }
    });
  }
}
