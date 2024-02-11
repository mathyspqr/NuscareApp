import { Component } from '@angular/core';

export class Data {
  name!: string;
  mean!: number;
  min!: number;
  max!: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {


  value: Data;

  
  data: Data[] = [{
    name: 'Summer',
    mean: 35,
    min: 28,
    max: 38,
  }, {
    name: 'Autumn',
    mean: 24,
    min: 20,
    max: 32,
  }, {
    name: 'Winter',
    mean: 18,
    min: 16,
    max: 23,
  }, {
    name: 'Spring',
    mean: 27,
    min: 18,
    max: 31,
  }];

  constructor() { 
    this.data = this.getData();
    this.value = this.data[0];
  }
  
  getData(): Data[] {
    return this.data;
}
}
