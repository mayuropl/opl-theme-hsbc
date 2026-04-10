import { Component, OnInit } from '@angular/core';
import { ChartConfigService } from 'src/app/CommoUtils/common-chart/chart-config.service';

@Component({
  selector: 'app-balance-liability-walllet', 
  templateUrl: './balance-liability-walllet.component.html',
  styleUrl: './balance-liability-walllet.component.scss'
})
export class BalanceLiabilityWallletComponent implements OnInit {
  chartOptions: any;
  activeTab: string = 'TMD';
  chartHeight: number = 500; // Chart height in pixels

  constructor(private chartConfigService: ChartConfigService) {}

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  ngOnInit(): void {
     this.chartOptions = this.chartConfigService.getTrendsLendingChart();
    
     // Set chart height
     this.chartOptions.chart.height = this.chartHeight;
    
     this.chartOptions.xAxis.categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
     // Calculate dynamic y-axis max and tick interval based on data
     const allData = [
      ...this.chartOptions.series?.[0]?.data || [],
      ...this.chartOptions.series?.[1]?.data || []
    ];
    
    this.chartOptions.series = [
      {
        name: '2025',
        data: [18000, 19000, 18500, 20000, 21000, 22000, 23000, 25000, 24000, 26000, 27000, 28000],
        color: '#ABB8C7',
        marker: {
          fillColor: '#D9E0E8',
          lineColor: '#FFFFFF',
          lineWidth: 2,
          radius: 5
        }
      },
      {
        name: '2024',
        data: [20000, 21000, 20500, 22500, 24000, 24500, 25500, 27500, 26500, 28500, 29500, 31000],
        color: '#32327F',
        marker: {
          fillColor: '#E5E5F5',
          lineColor: '#FFFFFF',
          lineWidth: 2,
          radius: 5
        }
      }
    ];
    
    // Calculate max value from all series data
    const maxValue = Math.max(
      ...this.chartOptions.series[0].data,
      ...this.chartOptions.series[1].data
    );
    
    // Use helper methods to calculate rounded max and tick interval
    const maxRounded = this.chartConfigService.calculateRoundedMax(maxValue);
    const tickIntervalRounded = this.chartConfigService.calculateTickInterval(maxRounded);
    
    this.chartOptions.yAxis.max = maxRounded;
    this.chartOptions.yAxis.tickInterval = tickIntervalRounded;
  }
}
