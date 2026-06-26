import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { AddReunion } from './add-reunion/add-reunion';
import { ReunionListComponent } from './reunion-list/reunion-list';
import { EditReunion } from './edit-reunion/edit-reunion';
import { AddUser } from './add-user/add-user';
/*
import { UserListComponent } from './user-list/user-list';
import { EditUser } from './edit-user/edit-user';

import { AddSalle } from './add-salle/add-salle';
import { SalleListComponent } from './salle-list/salle-list';
import { EditSalle } from './edit-salle/edit-salle';
*/

export const routes: Routes = [
  // 1. The login route
  { path: 'login', component: AuthComponent },

  // 2. Reunion routes
  { path: 'addreunion', component: AddReunion },

  { path: 'getreunions', component: ReunionListComponent },

  { path: 'edit-reunion/:id', component: EditReunion },

  // 3. User routes
  { path: 'adduser', component: AddUser },
  /*
  { path: 'getusers', component: UserListComponent },

  { path: 'edit-user/:id', component: EditUser },
  */

  // 4. Salle routes
  /*
  { path: 'addsalle', component: AddSalle },
  
  { path: 'getsalles', component: SalleListComponent },

  { path: 'edit-salle/:id', component: EditSalle },
  */

  // The default route (redirects empty path to login)
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
