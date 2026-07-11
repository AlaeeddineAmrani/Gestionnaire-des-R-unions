import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // ActivatedRoute est le radar de l'URL
import { ReunionService } from '../services/reunion';

@Component({
  selector: 'app-edit-reunion',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-reunion.html',
  styleUrl: './edit-reunion.css' 
})
export class EditReunionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reunionService = inject(ReunionService);

  // 1. Initialisation des variables (qui sont liées au HTML via ngModel)
  id_reunion: number = 0;
  titre = '';
  date_reunion = '';
  heure_debut = '';
  heure_fin_prevue = '';
  heure_fin_reelle = '';
  id_salle: number | null = null;
  id_utilisateur: number = 0;
  fichierExistant = false; // Petit booléen pour l'affichage UI du fichier

  ngOnInit() {
    // MISSION 1 : Intercepter l'ID dans l'URL
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.id_reunion = Number(idParam);
      
      // MISSION 2 : Le GET initial pour pré-remplir le formulaire
      this.reunionService.getReunionById(this.id_reunion).subscribe({
        next: (data) => {
          
          // Récuperer la réunion
          const reunion = data[0]; 

          // Affectation des variables => Le HTML va se remplir tout seul !
          this.titre = reunion.titre;
          
          // Formatage de la date (MySQL renvoie souvent un format complet avec l'heure, l'input type="date" n'accepte que YYYY-MM-DD)
          this.date_reunion = reunion.date_reunion.split('T')[0]; 
          
          this.heure_debut = reunion.heure_debut;
          this.heure_fin_prevue = reunion.heure_fin_prevue;
          this.heure_fin_reelle = reunion.heure_fin_reelle || '';
          this.id_salle = reunion.id_salle;
          this.id_utilisateur = reunion.id_utilisateur;
          
          // S'il y a déjà un blob/fichier en base, on informe l'utilisateur
          if (reunion.pv_rapport) {
            this.fichierExistant = true;
          }
        },
        error: (err) => {
          console.error("Erreur de récupération :", err);
          alert("Impossible de charger les données de la réunion.");
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  minDate = '';
  fichierSelectionne: File | null = null; // Stockera le fichier uploadé

  // --- MISSION 5 (Partie 1) : Capturer le fichier ---
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fichierSelectionne = file;
    }
  }

  // --- MISSIONS 4 & 5 : Validation et Envoi ---
  onSubmit() {
    // 1. Vérification des champs obligatoires
    if (!this.titre || !this.date_reunion || !this.heure_debut || !this.heure_fin_prevue || !this.id_salle) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // 2. MISSION 4 : Validation stricte de l'heure
    if (this.date_reunion === this.minDate) {
      // Si la réunion est aujourd'hui, on vérifie l'heure actuelle
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      if (this.heure_debut < currentTime) {
        alert("Impossible de planifier une réunion à une heure déjà passée aujourd'hui.");
        return;
      }
    }

    // L'heure de fin doit toujours être après l'heure de début
    if (this.heure_fin_prevue <= this.heure_debut) {
      alert("L'heure de fin prévue doit être ultérieure à l'heure de début.");
      return;
    }

    // 3. MISSION 5 : Création du paquet de données avec FormData
    const formData = new FormData();
    formData.append('titre', this.titre);
    formData.append('date_reunion', this.date_reunion);
    formData.append('heure_debut', this.heure_debut);
    formData.append('heure_fin_prevue', this.heure_fin_prevue);
    formData.append('heure_fin_reelle', this.heure_fin_reelle || '');
    formData.append('id_salle', this.id_salle.toString());
    formData.append('id_utilisateur', this.id_utilisateur.toString());
    
    // Si un nouveau fichier a été sélectionné, on l'ajoute dans le colis
    if (this.fichierSelectionne) {
      formData.append('pv_rapport', this.fichierSelectionne);
    }

    // 4. Appel au service (Il faudra créer cette méthode dans reunion.service.ts !)
    this.reunionService.updateReunion(this.id_reunion, formData).subscribe({
      next: (response) => {
        alert('Réunion modifiée avec succès !');
        this.router.navigate(['/getreunions']);
      },
      error: (err) => {
        console.error('Erreur de modification', err);
        alert('Erreur lors de la modification de la réunion.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/getreunions']);
  }
}