import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReunionService } from '../services/reunion';

@Component({
  selector: 'app-view-reunion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-reunion.html',
  styleUrl: './view-reunion.css'
})
export class ViewReunionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reunionService = inject(ReunionService);
  private cdr = inject(ChangeDetectorRef);

  reunion: any = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.reunionService.getReunionDetails(Number(idParam)).subscribe({
        next: (data) => {
          this.reunion = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur chargement réunion :', err);
          this.errorMessage = 'Impossible de charger les détails de cette réunion.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private location = inject(Location);

  goBack() {
    this.location.back();
  }

  goBackDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }

  downloadPV() {
    if (this.reunion?.id_reunion) {
      this.reunionService.downloadPV(this.reunion.id_reunion).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pv_reunion_${this.reunion.id_reunion}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: () => alert('Impossible de télécharger le PV.')
      });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatTime(t: string): string {
    if (!t) return '—';
    return t.substring(0, 5);
  }

  getOrganisateur(): any {
    if (!this.reunion?.participants) return null;
    return this.reunion.participants.find((p: any) => p.role_reunion === 'ORGANISATEUR');
  }

  getParticipants(): any[] {
    if (!this.reunion?.participants) return [];
    return this.reunion.participants.filter((p: any) => p.role_reunion !== 'ORGANISATEUR');
  }
}
