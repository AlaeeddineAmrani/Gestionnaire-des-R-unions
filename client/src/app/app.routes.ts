import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { AddReunionComponent } from './add-reunion/add-reunion';
import { ReunionListComponent } from './reunion-list/reunion-list';
import { EditReunionComponent } from './edit-reunion/edit-reunion';
import { AddUserComponent } from './add-user/add-user';
import { EditUserComponent } from './edit-user/edit-user';
import { UtilisateurListComponent } from './user-list/user-list';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { UserDashboardComponent } from './user-dashboard/user-dashboard';
import { AddServiceComponent } from './add-service/add-service';
import { AddDivisionComponent } from './add-division/add-division';
import { AddSalleComponent } from './add-salle/add-salle';
import { SalleListComponent } from './salle-list/salle-list';
import { EditSalleComponent } from './edit-salle/edit-salle';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// Nouveaux composants
import { ServiceListComponent } from './service-list/service-list';
import { EditServiceComponent } from './edit-service/edit-service';
import { DivisionListComponent } from './division-list/division-list';
import { EditDivisionComponent } from './edit-division/edit-division';
import { SearchPageComponent } from './search-page/search-page';
import { ViewReunionComponent } from './view-reunion/view-reunion';

export const routes: Routes = [

  // ── Route publique ──────────────────────────────────────────────────────
  { path: 'login', component: AuthComponent },

  // ── Dashboards ──────────────────────────────────────────────────────────
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard]   // connexion + rôle ADMIN
  },
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [authGuard]               // connexion suffisante
  },

  // ── Réunions (tout utilisateur connecté) ────────────────────────────────
  {
    path: 'addreunion',
    component: AddReunionComponent,
    canActivate: [authGuard]
  },
  {
    path: 'getreunions',
    component: ReunionListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'edit-reunion/:id',
    component: EditReunionComponent,
    canActivate: [authGuard]   // user (ses propres) et admin modifient les réunions
  },

  // ── Utilisateurs (ADMIN uniquement) ────────────────────────────────────
  {
    path: 'adduser',
    component: AddUserComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'getusers',
    component: UtilisateurListComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'edit-user/:id',
    component: EditUserComponent,
    canActivate: [authGuard, adminGuard]
  },

  // ── Salles (ADMIN uniquement) ───────────────────────────────────────────
  {
    path: 'addsalle',
    component: AddSalleComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'getsalles',
    component: SalleListComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'edit-salle/:id',
    component: EditSalleComponent,
    canActivate: [authGuard, adminGuard]
  },

  // ── Services & Divisions (ADMIN uniquement) ─────────────────────────────
  {
    path: 'addservice',
    component: AddServiceComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'getservices',
    component: ServiceListComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'edit-service/:id',
    component: EditServiceComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'adddivision',
    component: AddDivisionComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'getdivisions',
    component: DivisionListComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'edit-division/:id',
    component: EditDivisionComponent,
    canActivate: [authGuard, adminGuard]
  },

  // ── Recherche ──────────────────────────────────────────────────────────
  { path: 'search', component: SearchPageComponent, canActivate: [authGuard] },
  { path: 'view-reunion/:id', component: ViewReunionComponent, canActivate: [authGuard] },

  // ── Redirection par défaut ──────────────────────────────────────────────
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // ── Route inconnue → login ──────────────────────────────────────────────
  { path: '**', redirectTo: '/login' },
];

