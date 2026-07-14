import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Obligatoire pour utiliser *ngFor
import { UtilisateurService } from '../services/utilisateur';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
// On implémente OnInit
export class UtilisateurListComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  // States
  // Tableau qui va stocker les données reçues de l'API
  utilisateurs: any[] = [];
  
  // Variables pour gérer l'affichage pendant le chargement
  isLoading = true;
  errorMessage = '';

  // Cette fonction se lance toute seule au chargement du composant
  ngOnInit() {
    this.fetchUtilisateurs();
  }

  // fetcher les utilisateurs de la base de données à travers le service qui consomme les routes utilisateurs du backend 
  fetchUtilisateurs() {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data; // On stocke les données
        this.isLoading = false; // On arrête le chargement
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Quand on clique sur le bouton modifier utilisateur du frontend
  onEdit(id: number) {
    this.router.navigate(['/edit-user', id]); 
  }

  // Quand on clique sur le bouton ajouter utilisateur du frontend
  goToAdd() {
    this.router.navigate(['/adduser']);
  }

  // Quand on clique sur le bouton retourner du frontend
  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }

  // Quand on clique sur le bouton supprimer utilisateur du frontend
  onDelete(id: number) {
    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?');
    
    if (confirmDelete) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: (response) => {
          // Succès : On met à jour l'interface en retirant l'utilisateur du tableau
          this.utilisateurs = this.utilisateurs.filter(utilisateur => utilisateur.id_utilisateur !== id);
          alert('Utilisateur supprimé avec succès !');
        },
        error: (err) => {
          // Erreur : On affiche un message
          console.error('Erreur lors de la suppression', err);
          alert('Impossible de supprimer l\'utilisateur.');
        }
      });
    }
  }
}
