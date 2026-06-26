import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Obligatoire pour utiliser *ngFor
import { UtilisateurService } from '../services/utilisateur';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
// On implémente OnInit
export class UtilisateurListComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);

  private router = inject(Router);
  
  // Tableau qui va stocker les données reçues de l'API
  utilisateurs: any[] = [];
  
  // Variables pour gérer l'affichage pendant le chargement
  isLoading = true;
  errorMessage = '';

  // Cette fonction se lance toute seule au chargement du composant
  ngOnInit() {
    this.fetchUtilisateurs();
  }

  fetchUtilisateurs() {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data; // On stocke les données
        this.isLoading = false; // On arrête le chargement
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.isLoading = false;
      }
    });
  }

  onEdit(id: number) {
    // Redirige vers une route du type /edit-utilisateur/5
    this.router.navigate(['/edit-user', id]); 
  }

  onDelete(id: number) {
    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?');
    
    if (confirmDelete) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: (response) => {
          // 1. Succès : On met à jour l'interface en retirant l'utilisateur du tableau
          this.utilisateurs = this.utilisateurs.filter(utilisateur => utilisateur.id_utilisateur !== id);
          alert('Utilisateur supprimé avec succès !');
        },
        error: (err) => {
          // 2. Erreur : On affiche un message
          console.error('Erreur lors de la suppression', err);
          alert('Impossible de supprimer l\'utilisateur.');
        }
      });
    }
  }
}
