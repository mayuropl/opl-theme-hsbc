import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
  
@Component({
  selector: 'app-common-chart', 
  templateUrl: './common-chart.component.html',
  styleUrl: './common-chart.component.scss'
})
export class CommonChartComponent {
  Highcharts: typeof Highcharts = Highcharts;
  @Input() chartOptions: any;


}
