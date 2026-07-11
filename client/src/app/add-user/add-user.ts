import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UtilisateurService } from '../services/utilisateur';
import { ServiceAngularService, Service } from '../services/service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css',
})
export class AddUserComponent implements OnInit {

  private router = inject(Router);
  private utilisateurService = inject(UtilisateurService);
  private serviceAngularService = inject(ServiceAngularService);

  nom = '';
  prenom = '';
  email = '';
  mot_de_passe = '';
  role: string = 'User';
  id_service: number | null = null;

  services: Service[] = [];

  ngOnInit(): void {
    this.serviceAngularService.getAllServices().subscribe({
      next: (data) => this.services = data,
      error: (err) => console.error('Erreur de chargement des services', err)
    });
  }

  onSubmit() {
    if (!this.nom || !this.prenom || !this.email || !this.mot_de_passe || !this.id_service) {
      alert('Veuillez remplir tous les champs et sélectionner un service.');
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

    this.utilisateurService.createUtilisateur(utilisateurData).subscribe({
      next: (response) => {
        alert('Utilisateur créé avec succès dans la base de données !');
        this.router.navigate(['/admin-dashboard']);
      },
      error: (err) => {
        console.error(err);
        alert('Une erreur est survenue lors de la création.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/getusers']);
  }
}
