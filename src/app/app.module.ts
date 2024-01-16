// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { SideNavOuterToolbarModule, SideNavInnerToolbarModule, SingleCardModule } from './layouts';
import { FooterModule, ResetPasswordFormModule, CreateAccountFormModule, ChangePasswordFormModule, LoginFormModule } from './shared/components';
import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { UnauthenticatedContentModule } from './unauthenticated-content';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { NurscareService } from './shared/services/nuscare.service';
import { ThemeService } from './shared/services/theme.service';
import { TasksComponent } from '../app/pages/tasks/tasks.component'; // Assurez-vous de spécifier le chemin correct
import { DxDataGridModule, DxSchedulerComponent, DxSelectBoxModule,DxSchedulerModule, DxContextMenuModule } from 'devextreme-angular';
import { AdministrationComponent } from './pages/administration/administration.component';
import { DxoDetailsModule, DxoMasterDetailModule } from 'devextreme-angular/ui/nested';
import { PatientComponent } from './pages/patient/patient.component';
import { AgendaprevisionnelComponent } from './pages/agendaprevisionnel/agendaprevisionnel.component';

@NgModule({
  declarations: [
    AppComponent,
    TasksComponent,
    PatientComponent,
    AdministrationComponent,
    AgendaprevisionnelComponent,
  ],
  imports: [
    BrowserModule,
    SideNavOuterToolbarModule,
    SideNavInnerToolbarModule,
    SingleCardModule,
    FooterModule,
    CommonModule,
    ResetPasswordFormModule,
    CreateAccountFormModule,
    ChangePasswordFormModule,
    LoginFormModule,
    UnauthenticatedContentModule,
    AppRoutingModule,
    HttpClientModule,
    DxDataGridModule,
    DxoMasterDetailModule,
    DxSelectBoxModule,
    DxSchedulerModule,
    DxContextMenuModule,
  ],
  providers: [
    AuthService,
    ScreenService,
    AppInfoService,
    NurscareService,
    ThemeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
