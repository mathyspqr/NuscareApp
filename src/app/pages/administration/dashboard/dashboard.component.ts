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
  prestations: any[] = [];
  percentageData: any[] = [];

  constructor(private NurscareService: NurscareService) {}

  ngOnInit(): void {
    this.AgendaInterventions();
    this.AgendaPrestations();
  }

  AgendaInterventions(): void {
    this.NurscareService.getInterventions().subscribe(
      (result) => {
        console.log('Résultat de la requête côté client:', result);

        if (result && result.agendasInterventions) {
          this.agendasPrevisionnels = result.agendasInterventions;
          this.updateChartData();
          this.calculatePercentageData();
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

  AgendaPrestations(): void {
    this.NurscareService.getPrestations().subscribe(
      (result) => {
        this.prestations = result.agendasPrestations.map(
          (prestation: any) => prestation.libelle_categorie
        );
        console.log(
          'Résultat de la requête côté client pour les prestations:',
          this.prestations
        );
        this.calculatePercentageData();
      },
      (error) => {
        console.error('Erreur côté client:', error);
      }
    );
  }

  calculatePercentageData(): void {
    const domainCount = this.prestations.length;
    const percentageMap = new Map();
  
    this.prestations.forEach((domain) => {
      const count = this.prestations.filter((d) => d === domain).length;
      const percentage = (count / domainCount) * 100;
      percentageMap.set(domain, percentage.toFixed(2) + '%');
    });
  
    this.percentageData = Array.from(percentageMap.entries()).map(([domain, percentage]) => ({
      domain,
      percentage,
      totalPrestations: this.prestations.length,
    }));
  }
  
}
