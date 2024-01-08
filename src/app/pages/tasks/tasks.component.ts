import { Component, OnDestroy, OnInit } from '@angular/core';
import { NurscareService } from '../../shared/services/nuscare.service';
import { CommonModule } from '@angular/common';
import { EMPTY, Subscription, catchError } from 'rxjs';

@Component({
  templateUrl: 'tasks.component.html',
})
export class TasksComponent implements OnInit, OnDestroy {
  
  test: any;
  private subscription!: Subscription;
  constructor(private NurscareService: NurscareService) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos() {
    this.subscription = this.NurscareService.getUser().pipe(
      catchError(error => {
        // do something
        console.error('something happened',error);
        return EMPTY;
      })
    ).subscribe(
      (res: any) => {
        this.test = res;
        console.log('Résultat de la requête :', JSON.stringify(res));
      }
    );
  }

}
