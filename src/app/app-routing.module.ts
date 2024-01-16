import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent, ResetPasswordFormComponent, CreateAccountFormComponent, ChangePasswordFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { AdministrationComponent } from './pages/administration/administration.component';
import { PatientComponent } from './pages/patient/patient.component';
import { AgendaprevisionnelComponent } from './pages/agendaprevisionnel/agendaprevisionnel.component';
import { DxDataGridModule, DxFormModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular';
import { NurscareService } from '../app/shared/services/nuscare.service'; 

const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'administration',
    component: AdministrationComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'patient',
    component: PatientComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'agenda',
    component: AgendaprevisionnelComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'reset-password',
    component: ResetPasswordFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'create-account',
    component: CreateAccountFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'change-password/:recoveryCode',
    component: ChangePasswordFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: '**',
    redirectTo: 'login-form',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), DxDataGridModule, DxFormModule, DxButtonModule],
  providers: [AuthGuardService, NurscareService],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
  ]
})
export class AppRoutingModule { }
