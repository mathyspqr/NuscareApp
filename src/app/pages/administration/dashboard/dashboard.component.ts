import { Component, OnInit } from '@angular/core';
import { NurscareService } from 'src/app/shared/services/nuscare.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  agendasPrevisionnels: any = [];
  dataSource: any[] = [];
  barChartData: any[] = []; 

  constructor(private NurscareService: NurscareService) {}

  ngOnInit(): void {
    this.AgendaInterventions();
  }

  AgendaInterventions(): void {
    this.NurscareService.getInterventions().subscribe(
      (result) => {
        console.log('Résultat de la requête côté client:', result);

        if (result && result.agendasInterventions) {
          this.agendasPrevisionnels = result.agendasInterventions;
          this.updateChartData();
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des interventions:', error);
      }
    );
  }

  updateChartData(): void {
    let facturees = 0;
    let nonFacturees = 0;
    let integrees = 0;

    this.agendasPrevisionnels.forEach((intervention: any) => {
      if (intervention.date_facturation) {
        facturees++;
      } else {
        nonFacturees++;
      }

      if (intervention.date_integration) {
        integrees++;
      }
    });

    this.dataSource = [
      { country: 'Facturées', area: facturees },
      { country: 'Non Facturées', area: nonFacturees },
      { country: 'Intégrées', area: integrees },
    ];

    this.barChartData = [
      { category: 'Facturées', value: facturees },
      { category: 'Non Facturées', value: nonFacturees },
      { category: 'Intégrées', value: integrees },
    ];
  }
}
