import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { ReunionService } from '../services/reunion'; // 1. Importe le service

@Component({
  selector: 'app-add-reunion',
  imports: [FormsModule],
  templateUrl: './add-reunion.html',
  styleUrl: './add-reunion.css',
})
export class AddReunionComponent {
  private router = inject(Router);
  private reunionService = inject(ReunionService); // 2. Injecte le service
  
  titre = '';
  date_reunion = '';
  heure_debut = '';
  heure_fin_prevue = '';
  id_salle: number | null = null;
  // On simule que l'utilisateur connecté est l'admin avec l'ID 1
  id_utilisateur: number = 1; 

  onSubmit() {
    if (!this.titre || !this.date_reunion || !this.heure_debut || !this.heure_fin_prevue || !this.id_salle) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const reunionData = {
      titre: this.titre,
      date_reunion: this.date_reunion,
      heure_debut: this.heure_debut,
      heure_fin_prevue: this.heure_fin_prevue,
      heure_fin_reelle: null,
      id_salle: this.id_salle,
      id_utilisateur: this.id_utilisateur,
      pv_rapport: null
    };

    // 3. On utilise le service pour envoyer les données
    // Le "subscribe" écoute la réponse du serveur (Express)
    this.reunionService.createReunion(reunionData).subscribe({
      next: (response) => {
        // Succès (Statut 200)
        alert('Réunion créée avec succès dans la base de données !');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Erreur (ex: Statut 409 Conflit si la salle est prise)
        console.error(err);
        if (err.status === 409) {
          alert('Erreur : La salle est déjà réservée sur ce créneau.');
        } else {
          alert('Une erreur est survenue lors de la création.');
        }
      }
    });
  }
}