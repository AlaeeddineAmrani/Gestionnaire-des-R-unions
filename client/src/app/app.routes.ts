import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { AddReunionComponent } from './add-reunion/add-reunion';
import { ReunionListComponent } from './reunion-list/reunion-list';
import { EditReunionComponent } from './edit-reunion/edit-reunion';
import { AddUserComponent } from './add-user/add-user';
import { EditUserComponent } from './edit-user/edit-user';
import { UtilisateurListComponent } from './user-list/user-list';

/*
import { AddSalle } from './add-salle/add-salle';
import { SalleListComponent } from './salle-list/salle-list';
import { EditSalle } from './edit-salle/edit-salle';
*/

export const routes: Routes = [
  // 1. The login route
  { path: 'login', component: AuthComponent },

  // 2. Reunion routes
  { path: 'addreunion', component: AddReunionComponent },

  { path: 'getreunions', component: ReunionListComponent },

  { path: 'edit-reunion/:id', component: EditReunionComponent },

  // 3. User routes
  { path: 'adduser', component: AddUserComponent },

  { path: 'getusers', component: UtilisateurListComponent },

  { path: 'edit-user/:id', component: EditUserComponent },


  // 4. Salle routes
  /*
  { path: 'addsalle', component: AddSalle },
  
  { path: 'getsalles', component: SalleListComponent },

  { path: 'edit-salle/:id', component: EditSalle },
  */

  // The default route (redirects empty path to login)
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
