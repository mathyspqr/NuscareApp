import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { NurscareService } from '../../shared/services/nuscare.service';
import {
  AuthGuardService,
  AuthService,
} from '../../shared/services/auth.service';
import { EMPTY, Subscription, catchError, forkJoin } from 'rxjs';
import notify from 'devextreme/ui/notify';
import { TasksComponent } from '../tasks/tasks.component';
import { dxSchedulerAppointment } from 'devextreme/ui/scheduler';
import { DxPopupComponent } from 'devextreme-angular';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-agendaprevisionnel',
  templateUrl: './agendaprevisionnel.component.html',
  styleUrls: ['./agendaprevisionnel.component.scss'],
})
export class AgendaprevisionnelComponent implements OnInit {
  agendasPrevisionnels: any[] = [];
  agendasPrevisionnels2: any[] = [];
  prestations: any[] = [];
  prestationsall: any[] = [];
  filteredUsers  :any=[]

  idsIntervention: any[] = [];
  idsIntervention2: any[] = [];

  private subscription!: Subscription;

  id_prestationsupp!: number;

  adresseInfo: any[] = [];
  agendasPrevisionnels3!: {
    text: any;
    startDate: any;
    endDate: any;
    id_intervention: any;
    etat_intervention: any;
  }[];

  constructor(
    private nurscareService: NurscareService,
    private authservice: AuthService
  ) {}

  interventionfiltrer: any[] = [];
  interventionfiltrermap: any[] = [];
  interventionfiltrermapday: any[] = [];
  patients: any[] = [];
  soignants: any[] = [];
  idsInterventionArray: any = [];

  categories = [
    { id_categorie: 1, libelle_categorie: 'Actes de soin' },
    { id_categorie: 2, libelle_categorie: 'Actes d’analyse' },
    { id_categorie: 3, libelle_categorie: 'Actes préventifs' },
  ];

  interventionbool!: boolean;

  popupVisibleIntervention = false;
  popupVisibleEditIntervention = false;
  popupVisibleEditInterventionAll = false;
  popupVisiblePrestation = false;
  popupVisibleitineraire = false;
  popupVisibleAddPrestation = false;
  popupVisibleAddPrestationAll = false;

  currentDate: Date = new Date();
  user: any;

  itinerairemap: any[] = [];
  geocodeResult: any[] = [];
  prestationsFiltrees: any[] = [];

  interventionForm: any = {
    text: '',
    startDate: null,
    endDate: null,
    id_personnel: '',
    id_prestation: [],
  };

  addPrest: any = {
    id_intervention: '',
    id_prestations: [],
    id_personnel: '',
  };

  addPrestAll: any = {
    id_intervention: '',
    id_prestations: [],
    id_personnel: '',
  };

  ngOnInit(): void {
    this.user = this.authservice._user;

    if (
      (this.user && this.user.role_personnel === 3) ||
      this.user.role_personnel === 2
    ) {
      this.interventionbool = true;
    }

    if (this.user && this.user.role_personnel === 4) {
      this.interventionbool = false;
    }

    console.log('USER ICI', this.user);

    this.AgendaInterventions();
    this.AgendaPrestations();
    this.fetchInterventions(this.user.id_personnel);
    this.LoadPatient();
    this.LoadUser();
    this.AgendaPrestationsAll();
  }

  onSubmit(event: any): void {
    const formData = this.interventionForm;

    if (typeof formData.startDate === 'string') {
      formData.startDate = new Date(formData.startDate);
    }

    if (typeof formData.endDate === 'string') {
      formData.endDate = new Date(formData.endDate);
    }

    formData.startDate = formData.startDate
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    formData.endDate = formData.endDate
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // Assurez-vous que id_patient n'est pas nul
    if (formData.id_patient !== null && formData.id_patient !== undefined) {
      console.log('Extended Form Data:', formData);
      this.popupVisibleIntervention = false;

      this.nurscareService.addIntervention(formData).subscribe(
        (response) => {
          console.log('Intervention added successfully', response);
          this.AgendaInterventions();
          this.AgendaPrestations();
          this.fetchInterventions(this.user.id_personnel);
          this.LoadPatient();
          this.LoadUser();
          this.filtrerInterventionsPourAujourdhui();
          this.resetForm();
        },
        (error) => {
          console.error('Error adding intervention', error);
        }
      );
    } else {
      console.error('id_patient is null or undefined. Cannot submit the form.');
    }
  }

  onSubmitNewPrest(event: any): void {
    const formData = this.addPrest;
    this.addPrest.id_intervention = formData.id_intervention.id_intervention;
    formData.id_personnel = this.user.id_personnel;

    console.log('Submitting formData:', formData);

    this.nurscareService
      .addPrestationIntoExistentIntervention(
        this.addPrest.id_intervention,
        formData
      )
      .subscribe(
        (response) => {
          console.log("Prestation ajoutée avec succès à l'intervention.");
          this.popupVisibleAddPrestation = false;
          this.popupVisibleEditIntervention = false;
          this.loadGridData();
          this.resetForm2;
        },
        (error) => {
          console.error(
            "Erreur lors de l'ajout de la prestation à l'intervention:",
            error
          );
          notify("Cette prestation est déjà affectée à l'intervention");
        }
      );
  }

  onSubmitNewPrestAll(event: any): void {
    const formData = { ...this.addPrestAll };
    this.addPrestAll.id_intervention = formData.id_intervention;
    formData.id_personnel = this.user.id_personnel;

    console.log('Submitting formData:', formData);

    this.nurscareService
      .addPrestationIntoExistentIntervention(
        this.addPrestAll.id_intervention,
        formData
      )
      .subscribe(
        (response) => {
          console.log("Prestation ajoutée avec succès à l'intervention.");
          this.popupVisibleAddPrestationAll = false;
          this.popupVisibleEditInterventionAll = false;
          this.loadGridData();
          this.resetForm2;
        },
        (error) => {
          console.error(
            "Erreur lors de l'ajout de la prestation à l'intervention:",
            error
          );
          notify("Cette prestation est déjà affectée à l'intervention");
        }
      );
  }

  loadGridData() {
    this.AgendaInterventions();
    this.AgendaPrestations();
    this.AgendaPrestationsAll();
    this.filtrerInterventionsPourAujourdhui();
  }

  LoadPatient() {
    this.subscription = this.nurscareService
      .getPatient()
      .pipe(
        catchError((error: any) => {
          console.error('Something happened', error);
          return EMPTY;
        })
      )
      .subscribe((res: any) => {
        this.patients = res.map((patient: any) => ({
          id_patient: patient.id_patient,
          nom: patient.nom_patient,
          prenom: patient.prenom_patient,
          nomPrenom: `${patient.nom_patient} ${patient.prenom_patient}`,
        }));
        console.log('LoadPatient :', this.patients);
      });
  }

  LoadUser() {
    this.subscription = this.nurscareService
      .getUser()
      .pipe(
        catchError((error: any) => {
          console.error('Something happened', error);
          return EMPTY;
        })
      )
      .subscribe((res: any) => {
        const filteredUsers = res.filter((user: any) => user.id_role === 4);

        this.soignants = filteredUsers.map((user: any) => ({
          id_personnel: user.id_personnel,
          nomPrenom: `${user.prenom_personnel} ${user.nom_personnel}`,
        }));

        console.log('LoadUser :', this.soignants);
      });
  }

  fetchInterventions(idPersonnel: string): void {
    this.nurscareService.getInterventionsSoignant(idPersonnel).subscribe(
      (data) => {
        console.log(data);
        this.interventionfiltrer = data.agendasInterventions;
        console.log('INTERVENTION POUR LE SOIGNANT', this.interventionfiltrer);

        this.interventionfiltrermap = this.interventionfiltrer.map((item) => {
          return {
            text: item.libelle_intervention,
            startDate: item.date_intervention_debut,
            endDate: item.date_intervention_fin,
            id_intervention: item.id_intervention,
          };
        });
        console.log('INTERVENTIONS MAPPED', this.interventionfiltrermap);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  AgendaInterventions(): void {
    this.nurscareService.getInterventions().subscribe(
      (result) => {
        console.log('Résultat de la requête côté client:', result);

        if (result && result.agendasInterventions) {
          this.agendasPrevisionnels = result.agendasInterventions;

          this.agendasPrevisionnels2 = this.agendasPrevisionnels.map(
            (item) => ({
              text: item.libelle_intervention,
              startDate: item.date_intervention_debut,
              endDate: item.date_intervention_fin,
              id_intervention: item.id_intervention,
            })
          );

          this.agendasPrevisionnels3 = this.agendasPrevisionnels.map(
            (item) => ({
              text: item.libelle_intervention,
              startDate: item.date_intervention_debut,
              endDate: item.date_intervention_fin,
              id_intervention: item.id_intervention,
              etat_intervention: item.etat_intervention,
            })
          );

          this.idsIntervention2 = this.agendasPrevisionnels2.map((item) => ({
            id_intervention: item.id_intervention,
          }));

          console.log('IDs des interventions', this.idsIntervention2);
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
        console.log(
          'Résultat de la requête côté client pour les prestations:',
          result
        );
        this.prestations = result.agendasPrestations;
      },
      (error) => {
        console.error('Erreur côté client:', error);
      }
    );
  }

  AgendaPrestationsAll(): void {
    this.nurscareService.getPrestationsall().subscribe(
      (result) => {
        console.log('PRESTALL:', result);
        this.prestationsall = result.agendasPrestations;
      },
      (error) => {
        console.error('Erreur côté client:', error);
      }
    );
  }

  onAppointmentFormOpening(e: any): void {
    const idInterventionSelectionnee = e.appointmentData.id_intervention;
    console.log('PRESTATION ICI', this.prestations);
    this.prestationsFiltrees = this.prestations.filter(
      (item: any) => item.id_intervention === idInterventionSelectionnee
    );
    console.log('Prestations filtrées:', this.prestationsFiltrees);

    if (this.prestationsFiltrees.length === 0) {
      e.form.option('items', [
        {
          itemType: 'group',
          caption: 'Information Supplémentaire',
          colSpan: 2,
          items: [
            {
              template:
                '<div style="color: red;">Pas de prestation associée.</div>',
            },
          ],
        },
      ]);
      e.form.option('height', 100);
      return;
    }

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
              dataSource: this.prestationsFiltrees,
              scrolling: {
                mode: 'virtual',
              },
              selection: {
                mode: 'single',
              },
              columns: [
                {
                  dataField: 'libelle_prestation',
                  caption: 'Libellé Prestation',
                },
                {
                  dataField: 'libelle_intervention',
                  caption: 'Libellé Intervention',
                },
                { dataField: 'id_intervention', caption: 'ID Intervention' },
                { dataField: 'id_personnel', caption: 'ID Personnel' },
                {
                  dataField: 'etat_prestation',
                  caption: 'Etat de la Prestation',
                },
              ],
              texts: {
                searchPlaceholder: 'Rechercher',
                noDataText: 'Aucune donnée disponible',
                saveRowChanges: 'Enregistrer',
                cancelRowChanges: 'Annuler',
              },
              onSelectionChanged: (innerE: any) => {
                const selectedRowData = innerE.selectedRowsData[0];
                this.id_prestationsupp =
                  innerE.selectedRowsData[0].id_prestation;
                if (selectedRowData) {
                  console.log('Ligne sélectionnée:', selectedRowData);
                  this.displayTextBoxes(e, true, selectedRowData);
                } else {
                  this.displayTextBoxes(e, false);
                }
              },
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
          {
            editorType: 'dxTextBox',
            dataField: 'email_patient',
            label: {
              text: 'Email Patient',
            },
            editorOptions: {
              readOnly: true,
              value: '',
              visible: false,
            },
          },
          {
            itemType: 'button',
            horizontalAlignment: 'left',
            buttonOptions: {
              text: 'Supprimer Prestation',
              onClick: () => this.onDeleteButtonClick(e),
            },
          },
          {
            itemType: 'button',
            horizontalAlignment: 'left',
            buttonOptions: {
              text: 'Supervise Stagiaire',
              onClick: () => this.onNewButtonClicked(e),
            },
          },
          {
            itemType: 'button',
            horizontalAlignment: 'left',
            buttonOptions: {
              text: 'Facturer intervention',
              onClick: () => this.onNewButtonClickedFacturation(e),
            },
          },
        ],
      },
    ]);
    e.form.option('height', 300);
  }

  displayTextBoxes(e: any, show: boolean, rowData?: any): void {
    const nomTextBoxIndex = e.form
      .option('items')[0]
      .items.findIndex((item: any) => item.dataField === 'nomPatient');
    e.form.option(
      `items[0].items[${nomTextBoxIndex}].editorOptions.visible`,
      show
    );
    if (show) {
      e.form.option(
        `items[0].items[${nomTextBoxIndex}].editorOptions.value`,
        rowData?.nom_patient || ''
      );
    }

    const prenomTextBoxIndex = e.form
      .option('items')[0]
      .items.findIndex((item: any) => item.dataField === 'prenomPatient');
    e.form.option(
      `items[0].items[${prenomTextBoxIndex}].editorOptions.visible`,
      show
    );
    if (show) {
      e.form.option(
        `items[0].items[${prenomTextBoxIndex}].editorOptions.value`,
        rowData?.prenom_patient || ''
      );
    }

    const emailTextBoxIndex = e.form
      .option('items')[0]
      .items.findIndex((item: any) => item.dataField === 'email_patient');
    e.form.option(
      `items[0].items[${emailTextBoxIndex}].editorOptions.visible`,
      show
    );
    if (show) {
      e.form.option(
        `items[0].items[${emailTextBoxIndex}].editorOptions.value`,
        rowData?.email_patient || ''
      );
    }

    const adresseTextBoxIndex = e.form
      .option('items')[0]
      .items.findIndex((item: any) => item.dataField === 'adressePatient');
    e.form.option(
      `items[0].items[${adresseTextBoxIndex}].editorOptions.visible`,
      show
    );
    if (show) {
      e.form.option(
        `items[0].items[${adresseTextBoxIndex}].editorOptions.value`,
        rowData?.adresse_patient || ''
      );
    }
  }

  onDeleteButtonClick(e: any): void {
    const idPrestationToDelete = this.id_prestationsupp;
    console.log('prestation a supprimer', idPrestationToDelete);

    this.nurscareService.deletePrestation(idPrestationToDelete).subscribe(
      (response) => {
        console.log('Prestation deleted successfully', response);
        this.AgendaInterventions();
        this.AgendaPrestations();
        this.fetchInterventions(this.user.id_personnel);
        this.filtrerInterventionsPourAujourdhui;
        e.component.hideAppointmentPopup();
      },
      (error) => {
        console.error('Error deleting prestation', error);
      }
    );
  }

  onNewButtonClicked(e: any): void {
    console.log('Nouveau Bouton cliqué !');
  }

  onNewButtonClickedFacturation(e: any): void {
    console.log('Nouveau Bouton cliqué facturation !');
  
    const updatedData = {
      etat_intervention: 'facturé',
      date_facturation: new Date().toISOString(),
    };
  
    const firstIntervention = this.prestationsFiltrees[0];
  
    if (firstIntervention) {
      const updatedIntervention = {
        ...firstIntervention,
        ...updatedData,
      };
  
      this.nurscareService.updateIntervention(updatedIntervention).subscribe(
        (response) => {
          console.log('Intervention mise à jour avec succès', response);
        },
        (error) => {
          console.error(
            "Erreur lors de la mise à jour de l'intervention",
            error
          );
        }
      ); 
  
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;
  
      const pdf = new jsPDF();
  
      // Ajoutez le titre avec retour à la ligne
      const titleText = `Facture des Prestations de ${firstIntervention.prenom_patient} ${firstIntervention.nom_patient} du ${firstIntervention.date_intervention_debut} au ${firstIntervention.date_intervention_fin}`;
      const titleLines = pdf.splitTextToSize(titleText, pdf.internal.pageSize.width - 20);
  
      titleLines.forEach((line:any, index:any) => {
        pdf.text(line, 10, 10 + index * 10);
      });
  
      // Calculez la hauteur totale du texte du titre
      const titleHeight = titleLines.length * 10;
  
      // Tableau de données
      const data = this.prestationsFiltrees.map(intervention => [intervention.libelle_prestation, `${intervention.prix_prestation} €`]);
  
      // Ajoutez le total dans le tableau
      const totalPrix = this.prestationsFiltrees.reduce((acc, intervention) => acc + intervention.prix_prestation, 0);
      data.push(['Total', `${totalPrix} €`]);
  
      // Ajoutez le tableau à partir des données avec jsPDF-AutoTable
      (pdf as any).autoTable({
        head: [['Libellé de Prestation', 'Prix de Prestation']],
        body: data,
        startY: 20 + titleHeight, // Ajustez la position de départ du tableau en ajoutant la hauteur du texte du titre
      });
  
      // Spécifiez un nom de fichier lors de la sauvegarde du PDF
      const pdfFileName = 'fake_invoice.pdf';
      pdf.save(pdfFileName);
  
      // Utilisez 'output' pour obtenir les données Base64 après la sauvegarde
      const fakePdfBase64 = pdf.output('datauristring');
  
      const contenudumail = {
        to: firstIntervention.email_patient,
        subject: `Intervention du ${formattedDate}`,
        text: `Bonjour Madame ${firstIntervention.prenom_patient}, voici la facture de votre intervention ci-joint. Total: ${totalPrix} €`,
        attachments: [
          {
            filename: pdfFileName,
            content: fakePdfBase64.split(',')[1],
            encoding: 'base64',
          },
        ],
      };
  
      this.nurscareService.sendInvoice(contenudumail).subscribe(
        (response) => {
          console.log('Envoi du mail au client', response);
        },
        (error) => {
          console.error("Erreur lors de l'envoi du mail", error);
        }
      );
    }
  }
  
  onAppointmentDeleted(e: any) {
    const deletedAppointment = e.appointmentData;
    console.log('EFFACER', e.appointmentData);

    const id_intervention = deletedAppointment.id_intervention;

    this.nurscareService.deleteIntervention(id_intervention).subscribe(
      (response) => {
        console.log('Suppression réussie', response);
      },
      (error) => {
        console.error('Erreur lors de la suppression', error);
      }
    );
  }

  showPopupIntervention(e: any) {
    this.popupVisibleIntervention = true;
  }

  showPopupEditIntervention(e: any) {
    this.popupVisibleEditIntervention = true;
    this.fetchInterventions(this.user.id_personnel);
    this.AgendaPrestations;
    this.AgendaPrestationsAll;
    this.filtrerInterventionsPourAujourdhui();
  }

  showPopupEditInterventionall(e: any) {
    this.popupVisibleEditInterventionAll = true;
  }

  showPopupPrestation(e: any) {
    this.popupVisiblePrestation = true;
  }

  showPopupItineraire(e: any) {
    this.popupVisibleitineraire = true;
  }

  CalculItineraire(e: any) {
    let interventionpatientconcerne = this.interventionfiltrer;
    console.log('InterventionAdresse', interventionpatientconcerne);

    const today = new Date().toLocaleDateString();
    console.log('Date now', today);

    let filteredInterventions = interventionpatientconcerne.filter(
      (intervention) => {
        const interventionDate = new Date(
          intervention.date_intervention_fin
        ).toLocaleDateString();
        return interventionDate === today;
      }
    );

    console.log('Filtered Interventions for Today', filteredInterventions);

    if (filteredInterventions.length < 2) {
      notify('Il faut minimum 2 interventions dans la journée');
      return;
    }

    let patientsadresse = filteredInterventions.map(
      (intervention) => intervention.id_patient
    );

    this.nurscareService.getPatient().subscribe(
      (result) => {
        console.log('Patients to map', result, 'Intervention', patientsadresse);
        this.filteredUsers = result.filter((user: any) =>
          patientsadresse.includes(user.id_patient)
        );
        console.log('Info Patients', this.filteredUsers);

        let adresseInfo = this.filteredUsers.map(
          (user: any) => user.adresse_patient
        );
        console.log('Info Patients adresse', adresseInfo);

        let randomStartingPoint = this.generateRandomParisAddress();

        this.nurscareService
          .getItineraire({
            adresseInfo: adresseInfo,
            startingPoint: randomStartingPoint,
          })
          .subscribe(
            (itineraireResult) => {
              console.log(
                'Itineraire Result:',
                itineraireResult.orderedAddresses
              );
              this.itinerairemap = itineraireResult.orderedAddresses;
              console.log('itineraire map', this.itinerairemap)
              this.onGeocode();
            },
            (error) => {
              console.error('Erreur côté client:', error);
            }
          );
      },
      (error) => {
        console.error('Erreur côté client:', error);
      }
    );
  }

  generateRandomParisAddress(): string {
    const parisAddresses = [
      '1 Rue de Rivoli, 75001 Paris',
      '15 Avenue des Champs-Élysées, 75008 Paris',
      '10 Rue du Faubourg Saint-Honoré, 75008 Paris',
    ];

    const randomIndex = Math.floor(Math.random() * parisAddresses.length);
    return parisAddresses[randomIndex];
  }

  markers = [
    {
      location: { lat: 0, lng: 0 },
    },
    {
      location: { lat: 0, lng: 0 },
    },
  ];

  route = {
    weight: 6,
    color: 'blue',
    opacity: 0.5,
    mode: 'driving',
    locations: [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0 },
    ],
  };

  address: string = '';

  onGeocode() {
    const geocodeObservables = this.itinerairemap.map((address) =>
      this.nurscareService.geocodeAddress(address)
    );

    forkJoin(geocodeObservables).subscribe(
      (results: any[]) => {
        this.geocodeResult = results
          .filter((result) => result.results && result.results.length > 0)
          .map((result) => result.results[0].geometry.location);

        this.markers = this.geocodeResult.map((coordinates) => ({
          location: coordinates,
        }));

        const formattedLocations = this.geocodeResult.map((coordinates) => ({
          lat: coordinates.lat,
          lng: coordinates.lng,
        }));

        this.route.locations = formattedLocations;

        const routeColor = this.route.color;

        this.route = {
          weight: 6,
          color: routeColor,
          opacity: 0.5,
          mode: '',
          locations: formattedLocations,
        };

        console.log('COORD', this.geocodeResult);
        console.log('Markers', this.markers);
        console.log('Route', this.route);
      },
      (error) => {
        console.error('Erreur lors de la géocodification :', error);
      }
    );
  }

  onRowUpdating(e: any) {
    const oldData = e.oldData;
    const newData = e.newData;
    const updatedData = { ...oldData, ...newData };
    console.log('old data', oldData);
    console.log('newData data update', newData);
    console.log('Données mises à jour', updatedData);

    this.nurscareService.updateIntervention(updatedData).subscribe(
      (response) => {
        console.log('Intervention mise à jour avec succès', response);
      },
      (error) => {
        console.error("Erreur lors de la mise à jour de l'intervention", error);
      }
    );
  }

  onRowRemoving(e: any) {
    const DeletePatient = e.data;
    console.log('data remove', DeletePatient.id_patient);
  }

  onRowUpdating2(e: any) {
    const oldData = e.oldData;
    const newData = e.newData;
    const updatedData = { ...oldData, ...newData };
  
    if (newData.etat_intervention === 'terminé') {
      const currentDate = new Date();
      
      // Formater la date avec l'heure et les minutes
      const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
  
      updatedData.date_integration = formattedDate;
    }
  
    this.nurscareService.updateIntervention(updatedData).subscribe(
      (response) => {
        console.log('Intervention mise à jour avec succès', response);
  
        this.popupVisibleEditInterventionAll = false;
      },
      (error) => {
        console.error("Erreur lors de la mise à jour de l'intervention", error);
      }
    );
  }
  

  filtrerInterventionsPourAujourdhui() {
    const dateAujourdhui = new Date();

    this.interventionfiltrermapday = this.interventionfiltrermap.filter(
      (intervention) => {
        const dateDebut = new Date(intervention.startDate);

        return (
          dateDebut.getDate() === dateAujourdhui.getDate() &&
          dateDebut.getMonth() === dateAujourdhui.getMonth() &&
          dateDebut.getFullYear() === dateAujourdhui.getFullYear()
        );
      }
    );

    this.idsIntervention = this.interventionfiltrermapday.map(
      (intervention) => intervention.id_intervention
    );
    this.idsInterventionArray = this.idsIntervention.map((id: any) => ({
      id_intervention: id,
    }));

    this.prestationsFiltrees = this.prestations.filter((item: any) =>
      this.idsIntervention.includes(item.id_intervention)
    );

    console.log('MAP DAY', this.interventionfiltrermapday);
    console.log("IDs des interventions pour aujourd'hui", this.idsIntervention);
    console.log('prest', this.prestationsFiltrees);
  }

  openAddPrestationPopup() {
    this.popupVisibleAddPrestation = true;
  }

  openAddPrestationAllPopup() {
    this.popupVisibleAddPrestationAll = true;
  }

  resetForm() {
    this.interventionForm = {
      libelle_intervention: null,
      startDate: null,
      endDate: null,
      id_patient: null,
    };
  }

  resetForm2() {
    this.addPrest = {
      id_intervention: null,
      id_personnel: null,
      id_prestation: null,
    };
  }
}
