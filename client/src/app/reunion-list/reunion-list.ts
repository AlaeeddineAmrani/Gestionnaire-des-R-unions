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

  // Ouvre le PV dans un nouvel onglet du navigateur
  onShowPV(id: number) {
    // window.open(url) DIRECT est impossible ici :
    // le navigateur ne peut pas joindre le header Authorization à une navigation normale.
    // → On passe par Angular HttpClient qui, lui, attache le token JWT via l'interceptor.
    // Une fois le Blob reçu, on crée une URL temporaire locale (blob:...) et on l'ouvre.
    this.reunionService.downloadPV(id).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        // Note : on ne révoque pas l'URL immédiatement pour laisser le temps à l'onglet de charger.
        // Elle sera libérée automatiquement à la fermeture de la page.
      },
      error: () => alert('Impossible d\'ouvrir le PV. Vérifiez qu\'un fichier est bien associé.')
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
    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cette réunion ?');

    if (confirmDelete) {
      this.reunionService.deleteReunion(id).subscribe({
        next: () => {
          this.reunions = this.reunions.filter(reunion => reunion.id_reunion !== id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          // On affiche le message précis renvoyé par le serveur (ex: 403 interdit)
          const msg = err.error?.message || 'Impossible de supprimer la réunion.';
          alert(msg);
        }
      });
    }
  }
}