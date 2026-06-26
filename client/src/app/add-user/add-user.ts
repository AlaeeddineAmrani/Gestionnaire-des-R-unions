import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../services/utilisateur';

@Component({
  selector: 'app-add-user',
  imports: [FormsModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css',
})
export class AddUserComponent {

  private router = inject(Router);
  private utilisateurService = inject(UtilisateurService); // 2. Injecte le service
  
  nom = '';
  prenom = '';
  email = '';
  mot_de_passe = '';
  role: string | null ='User';
  id_service: number | null = 0; 

  onSubmit() {
    if (!this.nom || !this.prenom || !this.email || !this.mot_de_passe || !this.id_service) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const utilisateurData = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      mot_de_passe: this.mot_de_passe,
      role: this.role,
      id_service: this.id_service
    };

    // 3. On utilise le service pour envoyer les données
    // Le "subscribe" écoute la réponse du serveur (Express)
    this.utilisateurService.createUtilisateur(utilisateurData).subscribe({
      next: (response) => {
        // Succès (Statut 200)
        alert('Utilisateur créé avec succès dans la base de données !');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);          
        alert('Une erreur est survenue lors de la création.');
      }
    });
  }
}
