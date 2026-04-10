import { DecimalPipe } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { ChartConfigService } from 'src/app/CommoUtils/common-chart/chart-config.service';

@Component({
  selector: 'app-segment-level-chart-structured',
  templateUrl: './segment-level-chart.component.html',
  styleUrl: './segment-level-chart.component.scss'
})
export class SegmentLevelChartStructuredComponent {
  showChart: boolean = true;

   @Input() trendsLendingChartsData: any;
   @Input() segmentLevelOppData: any;
   @Input() dateOfReportMap: any;
   @Input() latestDateOfReportShow: any;
   @Input() selectedUnit: string = 'Million';
   @Input() isLoadingFromParent: boolean = false;
   @Input() hasFiltersApplied: boolean = false;

  segmentLevelChart: any;
  trendWalletChart : any;
  noDataFoundSeg : any;
  noDataFoundLen : any;
  segmentLevelOppChartData : any;
  moneyFormatTableHeader: string = '(₹M)';
  // trendsLendingChartsDataF : any;
  // segmentLevelOppDataF : any;
  segmentLevelOppDataFWithTotal : any;
  isLoading:boolean =true;
  dataPrepare: boolean = false;
  cardsVisibility = {
    segmentLevel: false,
    trendWallet: true
  };

  constructor(private chartConfigService: ChartConfigService,private decimalPipe: DecimalPipe) {}

  ngOnInit(): void {
  }

    ngOnChanges(changes: SimpleChanges) {
      if (changes['isLoadingFromParent']) {
        this.isLoading = this.isLoadingFromParent;
      }
      if (changes['trendsLendingChartsData'] && this.trendsLendingChartsData) {
        if (!this.trendsLendingChartsData || this.trendsLendingChartsData.length === 0) {
          this.noDataFoundLen = true;
        } else {
        this.noDataFoundLen = false;
        this.setupTrendsOfWalletChartsData();
        }
      }
      if (changes['segmentLevelOppData'] && this.segmentLevelOppData) {
        if (!this.segmentLevelOppData || this.segmentLevelOppData.length === 0) {
          this.noDataFoundSeg = true;
        } else {
        this.noDataFoundSeg = false;
        this.setupSegmentLevelOppChartsData();
        this.dataPrepare = true;
        this.isLoading= false;
        }
      }
      if (changes['selectedUnit'] && this.selectedUnit) {
        this.moneyFormatTableHeader = this.selectedUnit === 'Million' ? '(₹M)' : this.selectedUnit === 'Billion' ? '(₹B)' : '(₹)';
        this.setupTrendsOfWalletChartsData();
        this.setupSegmentLevelOppChartsData();
      }
  }

  get numberFormat(): string {
    if (this.selectedUnit === 'Million') return '1.1-1';
    if (this.selectedUnit === 'Billion') return '1.2-2';
    return '1.0-0';
  }

    get numberFormatForPer(): string {
    if (this.selectedUnit === 'Million') return '1.1-1';
    if (this.selectedUnit === 'Billion') return '1.2-2';
    return '1.2-2';
  }

  formatValue(num: any): number {
    if (num === null || num === undefined) return 0;
    const formatted = this.decimalPipe.transform(num, this.numberFormat, 'en-US');
    return Number(formatted?.replace(/,/g, '')) || 0;
  }

  setupSegmentLevelOppChartsData() {
    const filteredData = this.segmentLevelOppData.filter(
      (item: any) => item.segment_name && item?.segment_name.toLowerCase() !== 'total'
    );

    const categories = filteredData.map((item: any) => item.segment_name);
    const hsbcUtilizationData = filteredData.map((item: any) =>  this.formatValue((item.hsbc_utilization)));
    const competetionUtilizationData = filteredData.map((item: any) =>  this.formatValue((item.competition_utilization)));

    const maxValue = Math.max(
      ...hsbcUtilizationData,
      ...competetionUtilizationData
    );

    // Use helper methods to calculate rounded max and tick interval
    const maxRounded = this.chartConfigService.calculateRoundedMax(maxValue);
    const tickIntervalRounded = this.chartConfigService.calculateTickInterval(maxRounded);

    const baseConfig = this.chartConfigService.getSegmentLevelOpportunityChart();
    const component = this;
    this.segmentLevelChart = {
      ...baseConfig,
      chart: {
        ...baseConfig.chart
      },
      chartData: filteredData,
      xAxis: {
        ...baseConfig.xAxis,
        categories
      },
      yAxis: {
        ...baseConfig.yAxis,
        max: maxRounded,
        tickInterval: tickIntervalRounded,
        min: 0 // Ensure starts from 0
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

        const monthData = chartData.find((item: any) => (item.segment_name) === this.x);
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
          name: `Bank Utilization Amt ${this.moneyFormatTableHeader}`,
          data: hsbcUtilizationData,
          color: {
            linearGradient: [0, 0, 0, 300],
            stops: [
              [0, '#E01F26E6'],
              [1, '#E53E3EB3']
            ]
          }
        },
        {
          name: `Competition Utilization Amt ${this.moneyFormatTableHeader}`,
          data: competetionUtilizationData,
          color: {
            linearGradient: [0, 0, 0, 300],
            stops: [
              [0, '#A0AEC0E6'],
              [1, '#CBD5E0B3']
            ]
          }
        }
      ]
    };
  }

  // convertToMillion(data: any[]): any[] {
  //   if (!data || !Array.isArray(data)) return [];
  //   if (!(this.selectedUnit == 'Million' || this.selectedUnit == 'Billion')) {
  //     this.isLoading = false;
  //     this.dataPrepare = true;
  //     return data.map(item => ({
  //       ...item,
  //       hsbc_utilization: item.hsbc_utilization ? item.hsbc_utilization / 1_000_000 : 0,
  //       competition_utilization: item.competition_utilization ? item.competition_utilization / 1_000_000 : 0,
  //       hsbc_wallet_utilization_pct: item.hsbc_wallet_utilization_pct || 0, // keep percentage as-is
  //     }));
  //   }
  //   else {
  //     return data;
  //   }

  // }

  getReportMonthLabel(reportMonth: number): string {
    return this.dateOfReportMap?.get(reportMonth) || reportMonth;
  }


    setupTrendsOfWalletChartsData() {

    if (!this.trendsLendingChartsData){
      return
    }

    const categories = this.trendsLendingChartsData.map((item: any) => {
    const match = this.dateOfReportMap.get(item.report_month);
      return match ? match : item.report_month; // fallback to number if not found
    });
    const hsbcWalletUtilizationPctData = this.trendsLendingChartsData.map((item: any) => parseFloat(item.hsbc_wallet_utilization_pct));
    const hsbcWalletSanctionPctData = this.trendsLendingChartsData.map((item: any) => parseFloat(item.hsbc_wallet_sanction_pct));
    let maxValue = Math.max(
      ...hsbcWalletUtilizationPctData,
      ...hsbcWalletSanctionPctData
    );
    if (maxValue === 0) {
      maxValue = 5;
    }

    // Use helper methods to calculate rounded max and tick interval
    const maxRounded = this.chartConfigService.calculateRoundedMax(maxValue);
    const tickIntervalRounded = this.chartConfigService.calculateTickInterval(maxRounded);

    const baseConfig = this.chartConfigService.getTrendsLendingChart();
    const component = this;
    this.trendWalletChart = {
      ...baseConfig,
      chart: {
        ...baseConfig.chart,
        events: {
          load: function() {
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

          tooltipHTML += `</div>`;
          return tooltipHTML;
        }
      },
      series: [
        {
          name: 'Bank Sanction Wallet %',
          data: hsbcWalletSanctionPctData,
          color: '#32327F',
          marker: {
            fillColor: '#E5E5F5',
            lineColor: '#FFFFFF',
            lineWidth: 2,
            radius: 5
          },
          dataLabels: {
            enabled: true,
            formatter: function() {
              return this.y.toLocaleString() + '%';
            }
          }
        },
        {
          name: ' Bank Utilization Wallet %',
          data: hsbcWalletUtilizationPctData,
          color: '#ABB8C7',
          marker: {
            fillColor: '#D9E0E8',
            lineColor: '#FFFFFF',
            lineWidth: 2,
            radius: 5
          },
          dataLabels: {
            enabled: true,
            formatter: function() {
              return this.y.toLocaleString() + '%';
            }
          }
        }
      ]
    };
  }

  closeCard(card: 'segmentLevel' | 'trendWallet') {
    if (card === 'segmentLevel') {
      this.cardsVisibility.segmentLevel = false;
      this.cardsVisibility.trendWallet = true;
    } else if (card === 'trendWallet') {
      this.cardsVisibility.trendWallet = false;
      this.cardsVisibility.segmentLevel = true;
    }
  }


}
