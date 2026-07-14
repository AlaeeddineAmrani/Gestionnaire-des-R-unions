import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReunionService } from '../services/reunion'; // 1. Importe le service
import { CommonModule } from '@angular/common';
import { UtilisateurService, Utilisateur } from '../services/utilisateur';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-reunion',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  templateUrl: './add-reunion.html',
  styleUrl: './add-reunion.css',
})
export class AddReunionComponent implements OnInit {
  private router = inject(Router);
  private reunionService = inject(ReunionService); // 2. Injecte le service
  private cdr = inject(ChangeDetectorRef);

  // States/Variables
  titre = '';
  date_reunion = '';
  heure_debut = '';
  heure_fin_prevue = '';
  id_salle: number | null = null;
  users: Utilisateur[] = [];
  selectedUserIds: number[] = [];
  nouveauPointTitre = ''; // Ce qui est tapé dans l'input
  pointsList: { titre_point: string, est_discute: boolean }[] = []; // La liste des points
  backendError: string = ''; // Pour afficher les erreurs du backend

  constructor(private utilisateurService: UtilisateurService) { }

  /*  Fonction qui se lance au chargement pour récupérer tous les utilisateurs dans la bdd 
  pour qu'ils peuvent etres ajoutés dans la réunion comme participants  */
  ngOnInit(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur de chargement', err)
    })
  }

  // Fonction appellée quand on envoie le formulaire de création de réunion
  onSubmit() {
    this.backendError = ''; // Réinitialiser l'erreur
    // Si un champ du formulaire est non remplit
    if (!this.titre || !this.date_reunion || !this.heure_debut || !this.heure_fin_prevue || !this.id_salle || this.selectedUserIds.length < 1) {
      alert('Veuillez remplir tous les champs et sélectionner au moins un participant.');
      return;
    }

    // Récupérer l'ID de l'organisateur connecté depuis le LocalStorage (dans le browser)
    const userStr = localStorage.getItem('user');
    let id_organisateur = null;

    if (userStr) {
      const userObj = JSON.parse(userStr);
      id_organisateur = userObj.id_utilisateur;
    }

    // Si on trouve pas l'ID alors on demande à l'ADMIN de se reconnecter pour qu'il soit ajouté correctement
    if (!id_organisateur) {
      alert("Erreur: Impossible d'identifier l'organisateur. Veuillez vous reconnecter.");
      return;
    }

    // Si tout va bien, on crée un objet réunion avec les données du formulaire
    const reunionData = {
      titre: this.titre,
      date_reunion: this.date_reunion,
      heure_debut: this.heure_debut,
      heure_fin_prevue: this.heure_fin_prevue,
      heure_fin_reelle: null,
      id_salle: this.id_salle,
      pv_rapport: null,
      id_organisateur: id_organisateur,
      ids_participants: this.selectedUserIds,  // tableau d'IDs : [2, 3, 5]
      points: this.pointsList
    };

    // 3. On utilise le service pour envoyer les données
    this.reunionService.createReunion(reunionData).subscribe({
      next: (response) => {
        alert('Réunion créée avec succès dans la base de données !');
        this.router.navigate(['/admin-dashboard']);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 409) {
          this.backendError = err.error.message;
          if (err.error.details) {
            this.backendError += " (Conflit détecté pour certains participants ou salle)";
          }
        } else {
          this.backendError = err.error?.message || 'Une erreur est survenue lors de la création.';
          if (err.error?.error?.sqlMessage) {
            this.backendError += `\nDétail SQL: ${err.error.error.sqlMessage}`;
          } else if (err.error?.error) {
            this.backendError += `\nDétails: ${JSON.stringify(err.error.error)}`;
          }
        }
        this.cdr.detectChanges();
      }
    });
  }

  // Fonction appellée quand on entre un point et on clique sur ajouter point
  ajouterPoint() {
    // On vérifie que ce n'est pas vide
    if (this.nouveauPointTitre.trim()) {
      this.pointsList.push({ 
        titre_point: this.nouveauPointTitre.trim(), 
        est_discute: false // Par défaut, non discuté lors de la création
      });
      this.nouveauPointTitre = ''; // On vide l'input pour le prochain point
      this.cdr.detectChanges(); // Forcer la mise à jour de la vue, pour que le point juste ajouté apparait au dessous
    }
  }

  /*  Quand la X en rouge qui est à coté du point est cliquée alors on appel cette fonction pour supprimer 
  le point du tableau et on force la maj pour qu'il disparait  */
  retirerPoint(index: number) {
    this.pointsList.splice(index, 1);
    this.cdr.detectChanges();
  }

  // Quand le bouton retourner est cliqué
  goBack() {
    this.router.navigate(['/getreunions']);
  }
}