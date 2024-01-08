import { Component,  OnDestroy, OnInit } from '@angular/core';
import { NurscareService } from '../../shared/services/nuscare.service';
import { AuthService } from '../../shared/services/auth.service';
import { EMPTY, Subscription, catchError } from 'rxjs';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.scss',
})

export class AdministrationComponent implements OnInit, OnDestroy {

  personnels: any;
  private subscription!: Subscription;

  roles = [
    { value: 1, libelle_role: 'Stagiaire' },
    { value: 2, libelle_role: 'Directeur' },
    { value: 3, libelle_role: 'Secrétaire Médicale' },
    { value: 4, libelle_role: 'Personnel Soignant' }
  ];

  constructor(private authService: AuthService, private nurscareService: NurscareService) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.LoadUser();
  }

  onSelectionChanged(e: { component: { collapseAll: (arg0: number) => void; expandRow: (arg0: any) => void; }; currentSelectedRowKeys: any[]; }) {
    e.component.collapseAll(-1);
    e.component.expandRow(e.currentSelectedRowKeys[0]);
  }

  onRoleChange(usercourant:any, event:any): void {
    console.log('Changement de rôle pour l\'utilisateur :', usercourant);
    console.log('Nouveau rôle (id_role) :', event.value);

    this.nurscareService.updateinfouser(usercourant).subscribe({
      next: (response) => {
        console.log('Form successfully submitted:', usercourant);
      },
      error: (error) => {
        console.error('Error submitting form:', error);
      },
    });
  }
  

  onContentReady(e:any) {
    if (!e.component.getSelectedRowKeys().length) { e.component.selectRowsByIndexes(0); }
  }

  LoadUser() {
    this.subscription = this.nurscareService.getUser().pipe(
      catchError((error: any) => {
        console.error('something happened',error);
        return EMPTY;
      })
    ).subscribe(
      (res: any) => {
        this.personnels = res;
        console.log('LoadPersonnel :', JSON.stringify(res));
      }
    );
  }

  
}
