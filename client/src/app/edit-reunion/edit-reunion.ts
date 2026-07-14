import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReunionService } from '../services/reunion';

// Interface locale pour typer chaque point
interface Point {
  description: string;
  est_discute: boolean;
}

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

  // ── Champs de base de la réunion ──────────────────────────────────────────
  id_reunion: number = 0;
  titre = '';
  date_reunion = '';
  heure_debut = '';
  heure_fin_prevue = '';
  heure_fin_reelle = '';
  id_salle: number | null = null;
  fichierExistant = false;
  fichierSelectionne: File | null = null;
  minDate = '';

  // ── Points de l'ordre du jour ─────────────────────────────────────────────
  // C'est un tableau d'objets simples { description, est_discute }
  points: Point[] = [];

  // ── Champ pour saisir un nouveau point ───────────────────────────────────
  // On utilise un champ temporaire "en cours de saisie", séparé du tableau.
  nouveauPoint = '';

  // ── Gestion des erreurs ───────────────────────────────────────────────────
  errorMessage = '';

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.id_reunion = Number(idParam);

    // ── POURQUOI getReunionDetails et pas getReunionById ? ────────────────
    // getReunionById retourne juste la ligne de la table `reunion`.
    // getReunionDetails fait une JOIN avec `point` et retourne aussi les points.
    // C'est exactement ce dont on a besoin pour pré-remplir le formulaire.
    this.reunionService.getReunionDetails(this.id_reunion).subscribe({
      next: (data) => {
        this.titre             = data.titre;
        this.date_reunion      = data.date_reunion.split('T')[0];
        this.heure_debut       = data.heure_debut;
        this.heure_fin_prevue  = data.heure_fin_prevue;
        this.heure_fin_reelle  = data.heure_fin_reelle || '';
        this.id_salle          = data.id_salle;
        this.fichierExistant   = !!data.pv_rapport;

        // Pré-remplir les points :
        // data.points = [{ id_point, description, est_discute }, ...]
        // On map vers notre interface locale { description, est_discute (boolean) }
        this.points = (data.points || []).map((p: any) => ({
          description: p.description,
          est_discute: !!p.est_discute   // MySQL retourne 0/1 → on convertit en boolean
        }));
      },
      error: (err) => {
        console.error('Erreur de chargement :', err);
        this.errorMessage = 'Impossible de charger les données de la réunion.';
      }
    });
  }

  // ── Gestion des points ────────────────────────────────────────────────────

  /** Ajoute un nouveau point vide à la liste */
  ajouterPoint() {
    const desc = this.nouveauPoint.trim();
    if (!desc) return;
    this.points.push({ description: desc, est_discute: false });
    this.nouveauPoint = '';   // Réinitialise le champ de saisie
  }

  /** Supprime un point par son index dans le tableau */
  supprimerPoint(index: number) {
    this.points.splice(index, 1);
  }

  /** Capture le fichier sélectionné */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) this.fichierSelectionne = file;
  }

  // ── Soumission du formulaire ──────────────────────────────────────────────
  onSubmit() {
    this.errorMessage = '';

    // Validation des champs obligatoires
    if (!this.titre || !this.date_reunion || !this.heure_debut || !this.heure_fin_prevue || !this.id_salle) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.heure_fin_prevue <= this.heure_debut) {
      this.errorMessage = "L'heure de fin prévue doit être ultérieure à l'heure de début.";
      return;
    }

    // ── POINT CLÉ : Sérialisation des points ─────────────────────────────
    // FormData ne peut envoyer que des chaînes ou des fichiers.
    // Pour envoyer un tableau d'objets, on le sérialise avec JSON.stringify.
    // Côté serveur (controller), on fera JSON.parse(req.body.points).
    const formData = new FormData();
    formData.append('titre',            this.titre);
    formData.append('date_reunion',     this.date_reunion);
    formData.append('heure_debut',      this.heure_debut);
    formData.append('heure_fin_prevue', this.heure_fin_prevue);
    formData.append('heure_fin_reelle', this.heure_fin_reelle || '');
    formData.append('id_salle',         this.id_salle!.toString());
    formData.append('points',           JSON.stringify(this.points));  // ← sérialisation

    if (this.fichierSelectionne) {
      formData.append('pv_rapport', this.fichierSelectionne);
    }

    this.reunionService.updateReunion(this.id_reunion, formData).subscribe({
      next: () => {
        this.router.navigate(['/getreunions']);
      },
      error: (err) => {
        console.error('Erreur de modification', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la modification de la réunion.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/getreunions']);
  }
}