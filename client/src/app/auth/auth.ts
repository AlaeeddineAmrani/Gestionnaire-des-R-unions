import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule], 
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {

  // Inject the Router service and auth (like navigate = useNavigate())
  private router = inject(Router);
  private authService = inject(AuthService);
  
  // "State"
  email = '';
  mot_de_passe = '';
  errorMessage = '';

  // Submit handler
  onSubmit() {

    this.errorMessage = '';

    if (!this.email || !this.mot_de_passe) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    console.log('Form Submitted!');

    // On appelle le service d'authentification
    this.authService.login(this.email, this.mot_de_passe).subscribe({
      next: (response) => {
        console.log('Connexion réussie !', response);
        
        // 1. On récupère le rôle en s'assurant qu'il est en majuscule pour éviter les erreurs de casse
        const role = response.user.role.toUpperCase();

        // 2. On dirige vers le bon Dashboard selon le rôle
        if (role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error: (err) => {
        console.error('Erreur de connexion', err);
        if (err.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else {
          this.errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
        }
      }
  })}
}