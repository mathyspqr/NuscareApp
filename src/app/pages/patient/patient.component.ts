import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/services';
import { NurscareService } from 'src/app/shared/services/nuscare.service';
import { EMPTY, Subscription, catchError } from 'rxjs';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss'
})
export class PatientComponent {
  
  private subscription!: Subscription;

  patients: any;

  constructor(private authService: AuthService, private nurscareService: NurscareService) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.LoadPatient();
  }

  onSelectionChanged(e: { component: { collapseAll: (arg0: number) => void; expandRow: (arg0: any) => void; }; currentSelectedRowKeys: any[]; }) {
    e.component.collapseAll(-1);
    e.component.expandRow(e.currentSelectedRowKeys[0]);
  }

  onContentReady(e:any) {
    if (!e.component.getSelectedRowKeys().length) { e.component.selectRowsByIndexes(0); }
  }

  LoadPatient() {
    this.subscription = this.nurscareService.getPatient().pipe(
      catchError((error: any) => {
        console.error('something happened',error);
        return EMPTY;
      })
    ).subscribe(
      (res: any) => {
        this.patients = res;
        console.log('LoadPatient :', JSON.stringify(res));
      }
    );
  }

  onRowInserting(e: any) {
    const newPatient = e.data;
    console.log('Data to insert:', newPatient);
    this.subscription = this.nurscareService.createPatient(newPatient).subscribe(
      (response) => {
        console.log('Patient created successfully', response);
      },
      (error) => {
        console.error('Error creating patient:', error);
      }
    );
  }

  onRowUpdating(e: any) {
    const oldData = e.oldData;
    const newData = e.newData;
    const updatedData = { ...oldData, ...newData };
    console.log('old data', oldData)
    console.log('newData data update', newData)
    console.log('Données mises à jour', updatedData);
    this.nurscareService.modifiedPatient(updatedData.id_patient, updatedData).subscribe(
      response => {
        console.log('Mise à jour réussie', response);

      },
      error => {
        console.error('Erreur lors de la mise à jour', error);
      }
    );
  }

  onRowRemoving(e: any) {
    const DeletePatient = e.data;
    console.log('data remove', DeletePatient.id_patient)
    this.subscription = this.nurscareService.deletePatient(DeletePatient.id_patient).subscribe(
      (response) => {
        console.log('Patient deleted successfully', response);
        notify('Le patient a été supprimé avec succès')
      },
      (error) => {
        console.error('Error deleted patient:', error);
      }
    );
  }

}
