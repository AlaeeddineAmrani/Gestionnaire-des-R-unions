import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Obligatoire pour utiliser *ngFor
import { ReunionService } from '../services/reunion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reunion-list',
  imports: [CommonModule],
  templateUrl: './reunion-list.html',
  styleUrl: './reunion-list.css'
})
// On implémente OnInit
export class ReunionListComponent implements OnInit {
  private reunionService = inject(ReunionService);

  private router = inject(Router);
  
  // Tableau qui va stocker les données reçues de l'API
  reunions: any[] = [];
  
  // Variable pour gérer l'affichage pendant le chargement
  isLoading = true;
  errorMessage = '';

  // Cette fonction se lance toute seule au chargement du composant
  ngOnInit() {
    this.fetchReunions();
  }

  fetchReunions() {
    this.reunionService.getAllReunions().subscribe({
      next: (data) => {
        this.reunions = data; // On stocke les données
        this.isLoading = false; // On arrête le chargement
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réunions', err);
        this.errorMessage = 'Impossible de charger les réunions.';
        this.isLoading = false;
      }
    });
  }

  onEdit(id: number) {
    // Redirige vers une route du type /edit-reunion/5
    this.router.navigate(['/edit-reunion', id]); 
  }

  onDelete(id: number) {
    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cette réunion ?');
    
    if (confirmDelete) {
      this.reunionService.deleteReunion(id).subscribe({
        next: (response) => {
          // 1. Succès : On met à jour l'interface en retirant la réunion du tableau
          this.reunions = this.reunions.filter(reunion => reunion.id_reunion !== id);
          alert('Réunion supprimée avec succès !');
        },
        error: (err) => {
          // 2. Erreur : On affiche un message
          console.error('Erreur lors de la suppression', err);
          alert('Impossible de supprimer la réunion.');
        }
      });
    }
  }
}