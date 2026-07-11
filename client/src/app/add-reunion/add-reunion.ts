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

  titre = '';
  date_reunion = '';
  heure_debut = '';
  heure_fin_prevue = '';
  id_salle: number | null = null;
  users: Utilisateur[] = [];
  selectedUserIds: number[] = [];
  nouveauPointTitre = ''; // Ce qui est tapé dans l'input
  pointsList: { titre_point: string, est_discute: boolean }[] = []; // La liste des points

  constructor(private utilisateurService: UtilisateurService) { }

  ngOnInit(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur de chargement', err)
    })
  }

  onSubmit() {
    if (!this.titre || !this.date_reunion || !this.heure_debut || !this.heure_fin_prevue || !this.id_salle || this.selectedUserIds.length < 1) {
      alert('Veuillez remplir tous les champs et sélectionner au moins un participant.');
      return;
    }

    // Récupérer l'ID de l'organisateur connecté depuis le LocalStorage
    const userStr = localStorage.getItem('user');
    let id_organisateur = null;

    if (userStr) {
      const userObj = JSON.parse(userStr);
      id_organisateur = userObj.id_utilisateur;
    }

    if (!id_organisateur) {
      alert("Erreur: Impossible d'identifier l'organisateur. Veuillez vous reconnecter.");
      return;
    }

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
          alert(err.error.message);
          console.log("Détails du conflit :", err.error.details);
        } else {
          alert('Une erreur est survenue lors de la création.');
        }
      }
    });
  }

  ajouterPoint() {
    // On vérifie que ce n'est pas vide
    if (this.nouveauPointTitre.trim()) {
      this.pointsList.push({ 
        titre_point: this.nouveauPointTitre.trim(), 
        est_discute: false // Par défaut, non discuté lors de la création
      });
      this.nouveauPointTitre = ''; // On vide l'input pour le prochain point
      this.cdr.detectChanges(); // Forcer la mise à jour de la vue
    }
  }

  retirerPoint(index: number) {
    this.pointsList.splice(index, 1);
    this.cdr.detectChanges();
  }

  goBack() {
    this.router.navigate(['/getreunions']);
  }
}