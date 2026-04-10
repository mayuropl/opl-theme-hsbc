import { DecimalPipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { ChartConfigService } from 'src/app/CommoUtils/common-chart/chart-config.service';
 
@Component({
  selector: 'app-trends-lending-chart', 
  templateUrl: './trends-lending-chart.component.html',
  styleUrl: './trends-lending-chart.component.scss'
})
export class TrendsLendingChartComponent implements OnInit, OnChanges {
    isLoading:boolean =true;
    @Input() trendsLendingChartsData: any;
    @Input() dateOfReportMap: any;
    @Input() selectedUnit: any;
    @Input() isLoadingFromParent: boolean = false;

    sanctionTrendsLendingChartOptions : any;
    // trendsLendingChartsDataF : any;
    utilizationTrendsLendingChartOptions : any;
    showSanction: boolean = true;
    noDataFoundLen : any;
    dataPrepare: boolean = false;
    chartRef!: Highcharts.Chart;
    moneyFormatTableHeader: string = '(₹M)';
    constructor(private chartConfigService: ChartConfigService,private decimalPipe: DecimalPipe) {}


    ngOnInit(): void {
    }

  ngOnChanges(changes: SimpleChanges) {
    console.log('selectedUnit',this.selectedUnit);
    
    if (changes['isLoadingFromParent']) {
      this.isLoading = this.isLoadingFromParent;
    }
    if (changes['trendsLendingChartsData'] && this.trendsLendingChartsData) {
      if (!this.trendsLendingChartsData || this.trendsLendingChartsData.length === 0) {
        this.noDataFoundLen = true;
      } else {
        this.noDataFoundLen = false;
        this.setupSanctionTrendsLendingChartsData();
        this.dataPrepare = true;
        this.isLoading = false;
        this.setupUtilizationTrendsLendingChartsData();
      }
    }
    if (changes['selectedUnit'] && this.selectedUnit) {
      this.moneyFormatTableHeader = this.selectedUnit === 'Million' ? '(₹M)' : this.selectedUnit === 'Billion' ? '(₹B)' : '(₹)'
      this.setupSanctionTrendsLendingChartsData();
      this.setupUtilizationTrendsLendingChartsData();
    }
  }

  get numberFormat(): string {
    if (this.selectedUnit === 'Million') return '1.1-1';
    if (this.selectedUnit === 'Billion') return '1.2-2';
    return '1.0-0'; // Absolute
  }

  formatValue(num: any): number {

    if (num === null || num === undefined) return 0;
    // const formatted = this.decimalPipe.transform(num, this.numberFormat, 'en-US');
    // return Number(formatted?.replace(/,/g, '')) || 0;
    let value = Number(num.toString().replace(/,/g, ''));
    if (this.selectedUnit === 'Billion') {
      return Number(value.toFixed(2));
    }
    return Number(value.toFixed(1));
  }

  setupSanctionTrendsLendingChartsData() {

    if (!this.trendsLendingChartsData){
      return
    }

    const isAbsolute = this.selectedUnit === 'Absolute';
    
    // const categories = this.trendsLendingChartsData.map((item: any) => item.report_month);
    const categories = this.trendsLendingChartsData.map((item: any) => {
    const match = this.dateOfReportMap.get(item.report_month);
      return match ? match : item.report_month; // fallback to number if not found
    });
    const dateOfReportMap = this.dateOfReportMap;
    const hsbcSanctionData = this.trendsLendingChartsData.map((item: any) =>  this.formatValue(item.hsbc_sanction));
    const competitionSanctionData = this.trendsLendingChartsData.map((item: any) => this.formatValue(item.competition_sanction));
    
    const maxValue = Math.max(
      ...hsbcSanctionData,
      ...competitionSanctionData
    );

    // Use helper methods to calculate rounded max and tick interval
    const maxRounded = this.chartConfigService.calculateRoundedMax(maxValue);
    const tickIntervalRounded = this.chartConfigService.calculateTickInterval(maxRounded);

    const baseConfig = this.chartConfigService.getTrendsLendingChart();
    const component = this;
    this.sanctionTrendsLendingChartOptions = {
      ...baseConfig,
      chart: {
        ...baseConfig.chart,
        events: {
          load: function() {
          }
        }
      },
      plotOptions: {
        series: {
          ...baseConfig.plotOptions?.series,
          dataLabels: {
            enabled: !isAbsolute,
            formatter: function () {
              return Highcharts.numberFormat(this.y, 1, ".", ",");
            }
          }
        }
      },
      chartData: this.trendsLendingChartsData,
      xAxis: {
        ...baseConfig.xAxis,
        categories
      },
      yAxis: {
        ...baseConfig.yAxis,
        max: maxRounded,
        tickInterval: tickIntervalRounded  
      },
      tooltip: {
        enabled: true,
        useHTML: true,
        shared: true,
        stickOnContact: true,
        positioner: function(labelWidth, labelHeight, point) {
          // Position tooltip above the mouse pointer
          const chart = this.chart;
          const plotLeft = chart.plotLeft;
          
          // Center horizontally over the point
          let x = point.plotX + plotLeft - (labelWidth / 2);
          
          // Position above the pointer (subtract tooltip height + offset)
          let y = point.plotY + chart.plotTop - labelHeight - 15;
          
          // Ensure tooltip doesn't go above chart
          if (y < 5) {
            y = 5;
          }
          
          // Ensure tooltip stays within horizontal bounds
          if (x < 5) {
            x = 5;
          }
          if (x + labelWidth > chart.chartWidth - 5) {
            x = chart.chartWidth - labelWidth - 5;
          }
          
          return { x: x, y: y };
        },
        formatter: function () {
          let tooltipHTML = `<div class="op_chart_tooltip">`;
          // tooltipHTML += `<div><b>${this.x}</b></div>`;

          this.points?.forEach(point => {
            tooltipHTML += `
        <div class="tooltip-row">
          <span class="label darkgreen_label">${point.series.name}</span>
          <span class="value">: ${point.y?.toLocaleString()}</span>
        </div>
        `;
          });

        const chartData = this.points?.[0]?.series?.chart?.options?.chartData || [];
        
        const monthData = chartData.find((item: any) => (dateOfReportMap.get(item.report_month)) === this.x);
        if (monthData) {
          const walletPct =
            monthData.hsbc_wallet_sanction_pct ??
            0;

          tooltipHTML += `
            <div class="tooltip-row">
              <span class="label darkgreen_label">Bank Sanction Wallet %</span>
              <span class="value">${walletPct.toFixed(2)}%</span>
            </div>
          `;
        }

          tooltipHTML += `</div>`;
          return tooltipHTML;
        }
      },
      series: [
        {
          // name: `Bank Sanction (₹${UnitValue})`,
          name: `Bank Sanction ${this.moneyFormatTableHeader}`,
          data: hsbcSanctionData,
          color: '#32327F',
          marker: {
            fillColor: '#E5E5F5',
            lineColor: '#FFFFFF',
            lineWidth: 2,
            radius: 5
          }
        },
        {
          name: `Competition Sanction ${this.moneyFormatTableHeader}`,
          data: competitionSanctionData,
          color: '#ABB8C7',
          marker: {
            fillColor: '#D9E0E8',
            lineColor: '#FFFFFF',
            lineWidth: 2,
            radius: 5
          }
        }
      ]
    };
  }

    setupUtilizationTrendsLendingChartsData() {

    if (!this.trendsLendingChartsData){
      return
    }

    const isAbsolute = this.selectedUnit === 'Absolute';

    const categories = this.trendsLendingChartsData.map((item: any) => {
    const match = this.dateOfReportMap.get(item.report_month);
      return match ? match : item.report_month; // fallback to number if not found
    });
    const dateOfReportMap = this.dateOfReportMap;
    const hsbcUtilizationData = this.trendsLendingChartsData.map((item: any) =>  this.formatValue(item.hsbc_utilization));
    const competitionUtilizationData = this.trendsLendingChartsData.map((item: any) =>  this.formatValue(item.competition_utilization));

    const maxValue = Math.max(
      ...hsbcUtilizationData,
      ...competitionUtilizationData
    );

    // Use helper methods to calculate rounded max and tick interval
    const maxRounded = this.chartConfigService.calculateRoundedMax(maxValue);
    const tickIntervalRounded = this.chartConfigService.calculateTickInterval(maxRounded);

    const baseConfig = this.chartConfigService.getTrendsLendingChart();
    const component = this;
    this.utilizationTrendsLendingChartOptions = {
      ...baseConfig,
      chart: {
        ...baseConfig.chart,
        events: {
          load: function() {
          }
        }
      },
      plotOptions: {
        series: {
          ...baseConfig.plotOptions?.series,
          dataLabels: {
            enabled: !isAbsolute,
            formatter: function () {
              return Highcharts.numberFormat(this.y, 1, ".", ",");
            }
          }
        }
      },
      chartData: this.trendsLendingChartsData,
      xAxis: {
        ...baseConfig.xAxis,
        categories
      },
      yAxis: {
        ...baseConfig.yAxis,
        max: maxRounded,
        tickInterval: tickIntervalRounded  
      },
       tooltip: {
        enabled: true,
        useHTML: true,
        shared: true,
        stickOnContact: true,
        positioner: function(labelWidth, labelHeight, point) {
          // Position tooltip above the mouse pointer
          const chart = this.chart;
          const plotLeft = chart.plotLeft;
          
          // Center horizontally over the point
          let x = point.plotX + plotLeft - (labelWidth / 2);
          
          // Position above the pointer (subtract tooltip height + offset)
          let y = point.plotY + chart.plotTop - labelHeight - 15;
          
          // Ensure tooltip doesn't go above chart
          if (y < 5) {
            y = 5;
          }
          
          // Ensure tooltip stays within horizontal bounds
          if (x < 5) {
            x = 5;
          }
          if (x + labelWidth > chart.chartWidth - 5) {
            x = chart.chartWidth - labelWidth - 5;
          }
          
          return { x: x, y: y };
        },
        formatter: function () {
          let tooltipHTML = `<div class="op_chart_tooltip">`;
          // tooltipHTML += `<div><b>${this.x}</b></div>`;

          this.points?.forEach(point => {
            tooltipHTML += `
        <div class="tooltip-row">
          <span class="label darkgreen_label">${point.series.name}</span>
          <span class="value">: ${point.y?.toLocaleString()}</span>
        </div>
        `;
          });
          

        const chartData = this.points?.[0]?.series?.chart?.options?.chartData || [];
        const monthData = chartData.find((item: any) => (dateOfReportMap.get(item.report_month)) === this.x);
        if (monthData) {
          const walletPct =
            monthData.hsbc_wallet_utilization_pct ??
            0;

          tooltipHTML += `
            <div class="tooltip-row">
              <span class="label darkgreen_label">Bank Utilization Wallet %</span>
              <span class="value">${walletPct.toFixed(2)}%</span>
            </div>
          `;
        }

          tooltipHTML += `</div>`;
          return tooltipHTML;
        }
      },
      series: [
        {
          name: `Bank Utilization ${this.moneyFormatTableHeader}`,
          data: hsbcUtilizationData,
          color: '#32327F',
          marker: {
            fillColor: '#E5E5F5',
            lineColor: '#FFFFFF',
            lineWidth: 2,
            radius: 5
          }
        },
        {
          name: `Competition Utilization ${this.moneyFormatTableHeader}`,
          data: competitionUtilizationData,
          color: '#ABB8C7',
          marker: {
            fillColor: '#D9E0E8',
            lineColor: '#FFFFFF',
            lineWidth: 2,
            radius: 5
          }
        }
      ]
    };
  }
  
}

