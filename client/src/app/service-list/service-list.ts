import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceAngularService, Service } from '../services/service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
})
export class ServiceListComponent implements OnInit {

  private router = inject(Router);
  private serviceAngularService = inject(ServiceAngularService);
  private cdr = inject(ChangeDetectorRef);

  services: Service[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.serviceAngularService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des services.';
        this.isLoading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  goToAdd() {
    this.router.navigate(['/addservice']);
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }

  goToEdit(id: number) {
    this.router.navigate(['/edit-service', id]);
  }

  onDelete(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    this.serviceAngularService.deleteService(id).subscribe({
      next: () => {
        this.services = this.services.filter(s => s.id_service !== id);
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression.');
      }
    });
  }
}
