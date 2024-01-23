import { Component, EventEmitter, OnInit } from '@angular/core';
import { NurscareService } from '../../shared/services/nuscare.service';
import { AuthGuardService, AuthService } from '../../shared/services/auth.service';
import { EMPTY, Subscription, catchError, forkJoin } from 'rxjs';
import notify from 'devextreme/ui/notify';

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


  private subscription!: Subscription;

  id_prestationsupp! : number

  prestationTokenDeleted: EventEmitter<void> = new EventEmitter<void>();
  
  adresseInfo: any[]=[];


  constructor(private nurscareService: NurscareService, private authservice: AuthService) {
  }

  interventionfiltrer: any[] = [];
  interventionfiltrermap: any[] = [];
  patients: any[] = [];
  soignants: any[] = [];
  

   categories = [
    { id_categorie: 1, libelle_categorie: 'Actes de soin' },
    { id_categorie: 2, libelle_categorie: 'Actes d’analyse' },
    { id_categorie: 3, libelle_categorie: 'Actes préventifs' }
  ];
  
  interventionbool! : boolean

  popupVisibleIntervention = false;
  popupVisiblePrestation = false;
  popupVisibleitineraire = false;

  currentDate: Date = new Date;
  user : any;

  itinerairemap : any[] = []
  geocodeResult: any[]=[];

  interventionForm: any = {
    text: '',
    startDate: null,
    endDate: null,
    id_personnel: '',
  };

  prestationfrom: any = {
    libelle_prestation: '',
    date_prestation: null,
    id_personnel: '',
    id_categorie:'',
    etat_prestation : 'a traiter',
    prix_prestation:'',
  };

  ngOnInit(): void {
    this.user = this.authservice._user;
  
    if (this.user && this.user.role_personnel === 3 || this.user.role_personnel === 2) {
      this.interventionbool = true;
    }
  
    if (this.user && this.user.role_personnel === 4) {
      this.interventionbool = false;
    }  

    console.log('USER ICI', this.user)

    this.AgendaInterventions();
    this.AgendaPrestations();
    this.fetchInterventions(this.user.id_personnel);
    this.LoadPatient();
    this.LoadUser();
  }

  onSubmit(event: any): void {
    const formData = this.interventionForm;
  
    if (typeof formData.startDate === 'string') {
      formData.startDate = new Date(formData.startDate);
    }
  
    if (typeof formData.endDate === 'string') {
      formData.endDate = new Date(formData.endDate);
    }
  
      formData.startDate = formData.startDate.toISOString().slice(0, 19).replace('T', ' ');
      formData.endDate = formData.endDate.toISOString().slice(0, 19).replace('T', ' ');
  
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
          this.interventionForm = []
        },
        (error) => {
          console.error('Error adding intervention', error);
        }
      );
  }  

  onSubmitPrestation(prestationinfo: any): void {
    const prestationinf = { ...prestationinfo };
    prestationinf.date_prestation = prestationinf.date_prestation.toISOString().slice(0, 19).replace('T', ' ');
    prestationinf.id_personnel = this.user.id_personnel;
    console.log('Prestation à ajouter:', prestationinf);
    
  
    this.nurscareService.addPrestation(prestationinf).subscribe(
      (response) => {
        console.log('Prestation added successfully', response);
      },
      (error) => {
        console.error('Error adding prestation', error);
      }
    );
    this.popupVisiblePrestation = false;
    this.AgendaInterventions();
    this.AgendaPrestations();
    this.fetchInterventions(this.user.id_personnel);
    this.prestationfrom = []
  }
  
  

  LoadPatient() {
    this.subscription = this.nurscareService.getPatient().pipe(
      catchError((error: any) => {
        console.error('Something happened', error);
        return EMPTY;
      }),
    ).subscribe(
      (res: any) => {
        this.patients = res.map((patient: any) => ({
          id_patient: patient.id_patient,
          nom: patient.nom_patient,
          prenom: patient.prenom_patient,
          nomPrenom: `${patient.nom_patient} ${patient.prenom_patient}`
        }));
        console.log('LoadPatient :', this.patients);
      }
    );
  }

  LoadUser() {
    this.subscription = this.nurscareService.getUser().pipe(
      catchError((error: any) => {
        console.error('Something happened', error);
        return EMPTY;
      }),
    ).subscribe(
      (res: any) => {
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
      data => {
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
      error => {
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
    console.log('PRESTATION ICI', this.prestations);
    const prestationsFiltrees = this.prestations.filter(
        (item: any) => item.id_intervention === idInterventionSelectionnee
    );
    console.log('Prestations filtrées:', prestationsFiltrees);

    if (prestationsFiltrees.length === 0) {
        e.form.option('items', [
            {
                itemType: 'group',
                caption: 'Information Supplémentaire',
                colSpan: 2,
                items: [
                    {
                        template: '<div style="color: red;">Pas de prestation associée.</div>',
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
                        texts: {
                            searchPlaceholder: 'Rechercher',
                            noDataText: 'Aucune donnée disponible',
                            saveRowChanges: 'Enregistrer',
                            cancelRowChanges: 'Annuler'
                        },
                        onSelectionChanged: (innerE: any) => {
                            const selectedRowData = innerE.selectedRowsData[0];
                            this.id_prestationsupp = innerE.selectedRowsData[0].id_prestation
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
                  itemType: 'button',
                  horizontalAlignment: 'left',
                  buttonOptions: {
                      text: 'Supprimer Prestation',
                      onClick: () => this.onDeleteButtonClick(e),
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

onDeleteButtonClick(e: any): void {
  const idPrestationToDelete = this.id_prestationsupp;
  console.log('prestation a supprimer', idPrestationToDelete);

  this.nurscareService.deletePrestation(idPrestationToDelete).subscribe(
      (response) => {
          console.log('Prestation deleted successfully', response);
          this.AgendaInterventions();
          this.AgendaPrestations();
          this.fetchInterventions(this.user.id_personnel);
          e.component.hideAppointmentPopup();
        },
      (error) => {
          console.error('Error deleting prestation', error);
      }
  );
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

showPopupIntervention(e:any) {
  this.popupVisibleIntervention = true;
}

showPopupPrestation(e:any) {
  this.popupVisiblePrestation = true;
}

showPopupItineraire(e:any) {
  this.popupVisibleitineraire = true;
}


CalculItineraire(e: any) {
  let interventionpatientconcerne = this.interventionfiltrer;
  console.log('InterventionAdresse', interventionpatientconcerne);

  const today = new Date().toLocaleDateString();
  console.log('Date now', today);

  let filteredInterventions = interventionpatientconcerne.filter((intervention) => {
    const interventionDate = new Date(intervention.date_intervention_fin).toLocaleDateString();
    return interventionDate === today;
  });

  console.log('Filtered Interventions for Today', filteredInterventions);

  if (filteredInterventions.length < 2) {
    notify('Il faut minimum 2 interventions')
    return;
  }

  let patientsadresse = filteredInterventions.map((intervention) => intervention.id_patient);

  this.nurscareService.getPatient().subscribe(
    (result) => {
      console.log('Patients to map', result, 'Intervention', patientsadresse);
      let filteredUsers = result.filter((user: any) => patientsadresse.includes(user.id_patient));
      console.log('Info Patients', filteredUsers);

      let adresseInfo = filteredUsers.map((user: any) => user.adresse_patient);
      console.log('Info Patients adresse', adresseInfo);

      let randomStartingPoint = this.generateRandomParisAddress();

      this.nurscareService.getItineraire({ adresseInfo: adresseInfo, startingPoint: randomStartingPoint })
        .subscribe(
          (itineraireResult) => {
            console.log('Itineraire Result:', itineraireResult.orderedAddresses);
            this.itinerairemap = itineraireResult.orderedAddresses
            this.onGeocode()
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
  const geocodeObservables = this.itinerairemap.map(address =>
    this.nurscareService.geocodeAddress(address)
  );

  forkJoin(geocodeObservables).subscribe(
    (results: any[]) => {
      this.geocodeResult = results
        .filter(result => result.results && result.results.length > 0)
        .map(result => result.results[0].geometry.location);

      this.markers = this.geocodeResult.map(coordinates => ({ location: coordinates }));

      const formattedLocations = this.geocodeResult.map(coordinates => ({
        lat: coordinates.lat,
        lng: coordinates.lng
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
    error => {
      console.error('Erreur lors de la géocodification :', error);
    }
  );
}

}
