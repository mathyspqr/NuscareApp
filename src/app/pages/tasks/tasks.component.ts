import { Component, OnInit } from '@angular/core';
import { NurscareService } from '../../shared/services/nuscare.service';
import 'devextreme/data/odata/store';

@Component({
  templateUrl: 'tasks.component.html'
})
export class TasksComponent implements OnInit {
  test: any;

  constructor(private NurscareService: NurscareService) {
  }

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos() {
    this.NurscareService.getTodos().subscribe(
      (res: any) => {
        this.test = res;
        console.log('Résultat de la requête :', JSON.stringify(res));
      },
      (error) => {
        console.error('Erreur lors de la requête :', error);
      }
    );
  }  
}
