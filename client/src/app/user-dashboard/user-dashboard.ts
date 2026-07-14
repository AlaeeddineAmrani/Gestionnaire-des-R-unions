import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ReunionService } from '../services/reunion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private reunionService = inject(ReunionService);
  private cdr = inject(ChangeDetectorRef);

  userName: string = '';
  nextReunion: any = null;

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = `${user.prenom} ${user.nom}`;
    }
    
    // Le token JWT contient déjà l'ID de l'utilisateur, donc le backend le saura automatiquement !
    this.reunionService.getNextReunion().subscribe({
      next: (data) => {
        this.nextReunion = data;
        this.cdr.detectChanges(); // <-- FORCE L'AFFICHAGE DU COMPOSANT !
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la prochaine réunion:', err);
      }
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  onLogout() {
    this.authService.logout();
  }
}