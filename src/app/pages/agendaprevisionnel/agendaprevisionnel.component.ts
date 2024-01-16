import { Component, OnInit } from '@angular/core';
import { NurscareService } from '../../shared/services/nuscare.service';

@Component({
  selector: 'app-agendaprevisionnel',
  templateUrl: './agendaprevisionnel.component.html',
  styleUrls: ['./agendaprevisionnel.component.scss']
})
export class AgendaprevisionnelComponent implements OnInit {
  agendasPrevisionnels: any[] = [];
  agendasPrevisionnels2: any[] = [];
  prestations: any[]=[];
  getMovieById: any;

  constructor(private nurscareService: NurscareService) {}

  currentDate: Date = new Date;

  ngOnInit(): void {
    this.AgendaInterventions();
    this.AgendaPrestations();
  }

  AgendaInterventions(): void {
    this.nurscareService.getInterventions().subscribe(
      (result) => {
        console.log('Résultat de la requête côté client:', result);
  
        if (result && result.agendasInterventions) {
          this.agendasPrevisionnels = result.agendasInterventions;
  
          this.agendasPrevisionnels2 = this.agendasPrevisionnels.map((item) => {
            return {
              text: item.libelle_intervention,
              startDate: item.date_intervention_debut,
              endDate: item.date_intervention_fin,
              id_intervention: item.id_intervention,
            };
          });
  
          console.log('AGENDA', this.agendasPrevisionnels2);
        } else {
          console.error('Result or result.agendasPrevisionnels is undefined');
        }
      },
      (error) => {
        console.error('Erreur côté client:', error);
      }
    );
  }

  AgendaPrestations(): void {
    this.nurscareService.getPrestations().subscribe(
      (result) => {
        console.log('Résultat de la requête côté client pour les prestations:', result);
        this.prestations = result.agendasPrestations
      },
      (error) => {
        console.error('Erreur côté client:', error);
      }
    );
  }
  
  onAppointmentFormOpening(e: any): void {
    const idInterventionSelectionnee = e.appointmentData.id_intervention;
    console.log('PRESTATION ICI', this.prestations)
    const prestationsFiltrees = this.prestations.filter(
      (item: any) => item.id_intervention === idInterventionSelectionnee
    );
    console.log('Prestations filtrées:', prestationsFiltrees);

            e.form.option('items', [
                {
                    itemType: 'group',
                    caption: 'Information Supplémentaire',
                    colSpan: 2,
                    items: [
                        {
                            label: {
                                text: 'Description des prestations à réaliser',
                            },
                            editorType: 'dxDataGrid',
                            editorOptions: {
                                dataSource: prestationsFiltrees,
                                scrolling: {
                                    mode: 'virtual',
                                },
                                selection: {
                                    mode: 'single',
                                },
                                columns: [
                                    { dataField: 'libelle_prestation', caption: 'Libellé Prestation' },
                                    { dataField: 'libelle_intervention', caption: 'Libellé Intervention' },
                                    { dataField: 'id_intervention', caption: 'ID Intervention' },
                                    { dataField: 'id_personnel', caption: 'ID Personnel' },
                                    { dataField: 'etat_prestation', caption: 'Etat de la Prestation' },
                                ],
                                onSelectionChanged: (innerE: any) => {
                                    const selectedRowData = innerE.selectedRowsData[0];
                                    if (selectedRowData) {
                                        console.log('Ligne sélectionnée:', selectedRowData);
                                        this.displayTextBoxes(e, true, selectedRowData);
                                    } else {
                                        this.displayTextBoxes(e, false);
                                    }
                                }
                            },
                        },
                        {
                            editorType: 'dxTextBox',
                            dataField: 'nomPatient',
                            label: {
                                text: 'Nom Patient',
                            },
                            editorOptions: {
                                readOnly: true,
                                value: '',
                                visible: false,
                            },
                        },
                        {
                            editorType: 'dxTextBox',
                            dataField: 'prenomPatient',
                            label: {
                                text: 'Prénom Patient',
                            },
                            editorOptions: {
                                readOnly: true,
                                value: '',
                                visible: false,
                            },
                        },
                        {
                            editorType: 'dxTextBox',
                            dataField: 'adressePatient',
                            label: {
                                text: 'Adresse Patient',
                            },
                            editorOptions: {
                                readOnly: true,
                                value: '',
                                visible: false,
                            },
                        },
                    ],
                },
            ]);
            e.form.option('height', 300);
        }

displayTextBoxes(e: any, show: boolean, rowData?: any): void {
    const nomTextBoxIndex = e.form.option('items')[0].items.findIndex((item: any) => item.dataField === 'nomPatient');
    e.form.option(`items[0].items[${nomTextBoxIndex}].editorOptions.visible`, show);
    if (show) {
        e.form.option(`items[0].items[${nomTextBoxIndex}].editorOptions.value`, rowData?.nom_patient || '');
    }

    const prenomTextBoxIndex = e.form.option('items')[0].items.findIndex((item: any) => item.dataField === 'prenomPatient');
    e.form.option(`items[0].items[${prenomTextBoxIndex}].editorOptions.visible`, show);
    if (show) {
        e.form.option(`items[0].items[${prenomTextBoxIndex}].editorOptions.value`, rowData?.prenom_patient || '');
    }

    const adresseTextBoxIndex = e.form.option('items')[0].items.findIndex((item: any) => item.dataField === 'adressePatient');
    e.form.option(`items[0].items[${adresseTextBoxIndex}].editorOptions.visible`, show);
    if (show) {
        e.form.option(`items[0].items[${adresseTextBoxIndex}].editorOptions.value`, rowData?.adresse_patient || '');
    }
}
}
