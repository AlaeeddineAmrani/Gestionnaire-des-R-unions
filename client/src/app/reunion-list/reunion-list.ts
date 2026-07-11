import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Obligatoire pour utiliser *ngFor
import { ReunionService } from '../services/reunion';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-reunion-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reunion-list.html',
  styleUrl: './reunion-list.css'
})
// On implémente OnInit
export class ReunionListComponent implements OnInit {
  private reunionService = inject(ReunionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
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
    const isAdmin = this.authService.isAdmin();
    const fetchObservable = isAdmin ? this.reunionService.getAllReunions() : this.reunionService.getMyReunions();

    fetchObservable.subscribe({
      next: (data) => {
        console.log('[DEBUG] Réunions reçues:', data);
        this.reunions = data; // On stocke les données
        this.isLoading = false; // On arrête le chargement
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réunions', err);
        this.errorMessage = 'Impossible de charger les réunions.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDownloadPV(id: number) {
    this.reunionService.downloadPV(id).subscribe({
      next: (blob) => {
        // Créer un lien temporaire pour forcer le téléchargement du fichier
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pv_reunion_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du PV', err);
        alert('Impossible de télécharger le PV.');
      }
    });
  }


  onEdit(id: number) {
    this.router.navigate(['/edit-reunion', id]); 
  }

  goToAdd() {
    this.router.navigate(['/addreunion']);
  }

  goBack() {
    const dest = this.authService.isAdmin() ? '/admin-dashboard' : '/user-dashboard';
    this.router.navigate([dest]);
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