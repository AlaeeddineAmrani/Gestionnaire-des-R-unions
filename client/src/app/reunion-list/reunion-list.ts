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
  // Permet de forcer la page à la maj après récéption des données...
  private cdr = inject(ChangeDetectorRef);
  
  // Comme les States en React
  // Tableau qui va stocker les données reçues de l'API
  reunions: any[] = [];
  
  // Variable pour gérer l'affichage pendant le chargement 
  isLoading = true;
  errorMessage = '';

  // Cette fonction se lance toute seule au chargement du composant (like the useEffect hook in React)
  ngOnInit() {
    // On fetch les réunions
    this.fetchReunions();
  }

  // Fonction qui fetch les réunions de la base de données en utilisant le service qui consomme les routes du backend 
  fetchReunions() {
    const isAdmin = this.authService.isAdmin();
    // Si ADMIN on affiche toutes les réunions si juste USER alors on lui affiche seulement ses propres réunions
    const fetchObservable = isAdmin ? this.reunionService.getAllReunions() : this.reunionService.getMyReunions();

    fetchObservable.subscribe({
      next: (data) => {
        //console.log('[DEBUG] Réunions reçues:', data);
        this.reunions = data; // On stocke les données dans le tableau reunions
        this.isLoading = false; // On arrête le chargement
        this.cdr.detectChanges(); // Pour forcer le chargement de la page de nouveau
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réunions', err);
        this.errorMessage = 'Impossible de charger les réunions.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Fonction permet le téléchargement du pv quand le bouton télécharger du frontend est cliqué
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

  // Redirection vers la page des détails sur la réunion, appellée lors du clique sur le bouton voir du frontend
  onView(id: number) {
    this.router.navigate(['/view-reunion', id]);
  }

  // Redirection vers la page de modification de réunion quand le bouton modifier du frontend est cliqué
  onEdit(id: number) {
    this.router.navigate(['/edit-reunion', id]); 
  }

  // Redirection vers la page d'ajout de réunion quand le bouton ajouter est cliqué
  goToAdd() {
    this.router.navigate(['/addreunion']);
  }

  // Retourner vers le dashboard correspondant quand le bouton retourner est cliqué
  goBack() {
    const isAdmin = this.authService.isAdmin();
    // Si ADMIN alors redirection vers admin-dashboard sinon vers user-dashboard
    const dest = isAdmin ? '/admin-dashboard' : '/user-dashboard';
    this.router.navigate([dest]);
  }

  // Fonction pour supprimer une réunion de la base de données quand le bouton supprimer du frontend est cliqué
  onDelete(id: number) {
    // Afficher une confirmation
    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cette réunion ?');
    
    if (confirmDelete) {
      // Utilisant le service qui permet de consommer les routes du backend pour les réunions
      this.reunionService.deleteReunion(id).subscribe({
        next: (response) => {
          // Succès : On met à jour l'interface en retirant la réunion du tableau (maj grace à ngOnInit)
          this.reunions = this.reunions.filter(reunion => reunion.id_reunion !== id);
          alert('Réunion supprimée avec succès !');
        },
        error: (err) => {
          // Erreur : On affiche un message
          console.error('Erreur lors de la suppression', err);
          alert('Impossible de supprimer la réunion.');
        }
      });
    }
  }
}