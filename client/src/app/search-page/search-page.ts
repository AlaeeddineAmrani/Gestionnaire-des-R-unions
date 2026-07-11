import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReunionService } from '../services/reunion';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reunionService = inject(ReunionService);
  private cdr = inject(ChangeDetectorRef);

  // Le mot-clé affiché dans la barre de recherche de cette page
  searchQuery: string = '';

  // Les résultats retournés par l'API (liste de points)
  results: any[] = [];

  // États de l'UI
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  ngOnInit() {
    // On écoute les changements de paramètres dans l'URL (ex: ?q=budget)
    this.route.queryParams.subscribe(params => {
      const q = params['q'] || '';
      this.searchQuery = q;
      if (q.trim()) {
        this.performSearch(q.trim());
      }
      this.cdr.detectChanges();
    });
  }

  performSearch(query: string) {
    this.isLoading = true;
    this.hasSearched = false;
    this.errorMessage = '';
    this.results = [];

    this.reunionService.searchPoints(query).subscribe({
      next: (data) => {
        this.results = data;
        this.isLoading = false;
        this.hasSearched = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur de recherche :', err);
        this.errorMessage = 'Une erreur est survenue lors de la recherche.';
        this.isLoading = false;
        this.hasSearched = true;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    const q = this.searchQuery.trim();
    if (q) {
      // Met à jour l'URL, ce qui déclenche ngOnInit via queryParams
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  // Quand on clique sur une carte de point → navigue vers la réunion associée
  goToReunion(point: any) {
    this.router.navigate(['/view-reunion', point.id_reunion]);
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }

  // Formate la date MySQL en format lisible
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
