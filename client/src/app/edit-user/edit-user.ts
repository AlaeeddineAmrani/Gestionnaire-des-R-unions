import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../services/utilisateur';

@Component({
  selector: 'app-edit-user',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private utilisateurService = inject(UtilisateurService);

  // ID de l'utilisateur récupéré depuis l'URL
  id_utilisateur: number = 0;

  nom = '';
  prenom = '';
  email = '';
  mot_de_passe = '';
  role: string | null = 'User';
  id_service: number | null = 0;

  ngOnInit() {
    // Lire l'ID depuis l'URL (ex: /edit-user/5)
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.id_utilisateur = Number(idParam);

      // Pré-remplir le formulaire avec les données existantes
      this.utilisateurService.getUtilisateurById(this.id_utilisateur).subscribe({
        next: (data) => {
          const user = data[0];
          this.nom = user.nom;
          this.prenom = user.prenom;
          this.email = user.email;
          this.mot_de_passe = ''; // On ne pré-remplit jamais un mot de passe
          this.role = user.role;
          this.id_service = user.id_service;
        },
        error: (err) => {
          console.error('Erreur de récupération :', err);
          alert("Impossible de charger les données de l'utilisateur.");
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  onSubmit() {
    if (!this.nom || !this.prenom || !this.email || !this.id_service) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // updateUtilisateur attend (id: number, data: FormData)
    const formData = new FormData();
    formData.append('nom', this.nom);
    formData.append('prenom', this.prenom);
    formData.append('email', this.email);
    formData.append('role', this.role ?? 'User');
    formData.append('id_service', this.id_service.toString());

    // On n'envoie le mot de passe que si l'utilisateur en a saisi un nouveau
    if (this.mot_de_passe) {
      formData.append('mot_de_passe', this.mot_de_passe);
    }

    // UpdateUtilisateur(id, formData)
    this.utilisateurService.updateUtilisateur(this.id_utilisateur, formData).subscribe({
      next: (response) => {
        alert('Utilisateur modifié avec succès !');
        this.router.navigate(['/getusers']);
      },
      error: (err) => {
        console.error(err);
        alert("Une erreur est survenue lors de la modification.");
      }
    });
  }

  goBack() {
    this.router.navigate(['/getusers']);
  }
}
