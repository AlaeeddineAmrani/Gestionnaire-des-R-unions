import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 1. Import FormsModule
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-auth',
  imports: [FormsModule], // 2. Add it to the imports array
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {

  // Inject the Router service and auth (Think of this like const navigate = useNavigate())
  private router = inject(Router);
  private authService = inject(AuthService);
  
  // 3. This is your "State"
  email = '';
  mot_de_passe = '';
  errorMessage = '';

  // 4. This is your submit handler
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
        // Le token a été sauvegardé par le service (grâce au 'tap')
        console.log('Connexion réussie !', response);
        // Redirection vers le Dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erreur de connexion', err);
        // On vérifie si c'est l'erreur 401 qu'on a configurée dans le backend
        if (err.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else {
          this.errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
        }
      }
  })}
}