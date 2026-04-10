import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { log } from 'console';
import * as Highcharts from 'highcharts';
import { ChartConfigService } from 'src/app/CommoUtils/common-chart/chart-config.service';
import { Pagination } from 'src/app/CommoUtils/model/pagination';
import { CustomizeColumnsPopupComponent } from 'src/app/Popup/customize-columns-popup/customize-columns-popup.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';
import {CommonService} from '../../../../CommoUtils/common-services/common.service';
import {Constants} from '../../../../CommoUtils/constants';
import { CreateCampaignPopupComponent } from 'src/app/Popup/create-campaign-popup/create-campaign-popup.component';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-product-level-chart',
  templateUrl: './product-level-chart.component.html',
  styleUrl: './product-level-chart.component.scss'
})
export class ProductLevelChartComponent {
  showChart: boolean = true;
   optionList = ['Customer Level', 'Product Level'];
  mySelectedValue: string = 'Customer Level';
  productlevelChartOptions : any;
  customerlevelChartOptions;any;
  collapseStates: { [key: number]: boolean } = {};
  innerTableData: { [key: string]: any[] } = {};
  collapseStatesCustomerL: { [key: string]: boolean } = {};
  innerTableDataCustomerL: { [key: string]: any[] } = {};
  ppageSize = 5;
  ppage = 1;
  
  // Track selected product label for highlighting
  selectedProductIndex: number | null = null;
  private productLevelChartInstance: any = null;
  pageSize = 10;
  page = 1;
  productLevelCustPageOffset: number = 0;
  productLevelCustPageSize: number = 5;
  productId: number = 0;
  customerName : any;
  isLoading:boolean = true
  isLoadingProdChart:boolean = true
  isLoadingCustChart:boolean = true
  selectedLegendItem: string | null = null;
  selectedOtherItems: Set<string> = new Set();
  /** When true, legend list items are not clickable (set on chart slice click, cleared on reset). */
  legendClicksDisabled: boolean = false;

  // Product Level Parent Table Pagination
  productPageSize = 10;
  productPage = 1;

  // Customer Level Child Table Pagination
  customerProductPageSize = 5;
  customerProductPage = 1;
  moneyFormatTableHeader: string = '(₹M)';

  // Search functionality - separate for Product Level and Customer Level
  productLevelParentSearchFilters: any = {};
  productLevelChildSearchFilters: any = {};
  customerLevelParentSearchFilters: any = {};
  customerLevelChildSearchFilters: any = {};
  private parentSearchSubject = new Subject<string>();
  private childSearchSubject = new Subject<any>();
  childTableSortOrderObj = { order_by_column: '', order_by_type: 'ASC' }
  parentTableSortOrderObj = { order_by_column: '', order_by_type: 'ASC' }
  noDataFoundCusChart: any;
  noDataFoundProdChart: any;
  filtersffReq : any;

  // ============ Customer Level Selection Logic ============
  selectedCustomers: Set<string> = new Set();
  deselectedCustomers: Set<string> = new Set(); // Track explicitly deselected customers
  selectAllAcrossPages: boolean = false; // Flag to select all across all pages
  selectedCustomerDetails: Map<number, { customerName: string, customerId: string, pan: string, rmId: string, customerType: number, }> = new Map();

  // productLevelChartDataF : any;
  // customerLevelChartDataF : any;
  // productLevelOppDataF : any;
  // customerLevelOppDataF : any;

    @Input() productLevelOppData: any;
    @Input() productLevelChartData: any;
    @Input() customerLevelOppData : any;
    @Input() customerLevelChartData : any;
    @Input() customerWiseProductsData : any;
    @Input() selectedUnit: string = 'Million';
    @Input() totalRecordsCustomer: any;
    @Output() customerNameChange = new EventEmitter<string>();
    @Output() pageChangeCustomerLevel = new EventEmitter<any>();
    // @Output() fetchProductLevelCustomers = new EventEmitter<any>();
    @Input() totalRecordsProduct: any;
    @Input() latestDateOfReportShow: any;
    @Input() totalRecordsProductParent: any;
    @Input() totalRecordsCustomerProducts: any;
    // @Output() productNameChange = new EventEmitter<string>();
    @Output() pageChangeProductLevel = new EventEmitter<any>();
    @Output() pageChangeProductParent = new EventEmitter<any>();
    @Output() pageChangeCustomerProducts = new EventEmitter<any>();
    @Input() productWiseCustomerData: any;
    @Output() searchSortEvent = new EventEmitter<any>();
    @Output() emitExcelDownloadProductLevel = new EventEmitter<any>();
    @Output() productClicked = new EventEmitter<{productId: any, productName: string, productData: any}>();
    @Output() resetProductChart = new EventEmitter<void>();
    @Output() tableLevelRestored = new EventEmitter<void>();
    @Output() customerLevelChartClicked = new EventEmitter<{utilizationWalletPct: string | null, displayName: string | null}>();
    @Input() isLoadingFromParent: boolean = false;
    @Input() isLoadingProductLevelChart: boolean = false;
    @Input() isLoadingCustomerLevelChart: boolean = false;
    @Input() filtersApplied: any = null;
    @Input() hasFiltersApplied: boolean = false;
    @Input() filterOptions: any[] = [];
    @Input() dataSetIdSCT : any;
    @Input() filtersff: any;
    @Input() filtersffNavigateFinale: any;
    @Input() restoredTableLevel: string = null; // Restored table level selection (Product Level / Customer Level)

  protected readonly consValue = Constants;
  pageData: any;
  constructor(private chartConfigService: ChartConfigService, public dialog: MatDialog,private decimalPipe: DecimalPipe , protected commonService: CommonService, private router: Router, public msmeService: MsmeService) {
    // Setup debounced search for parent table
    this.parentSearchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.emitParentSearch();
    });

    // Setup debounced search for child table
   this.childSearchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) =>
        prev.value === curr.value && prev.customerName === curr.customerName
      )
    ).subscribe(({ value, customerName }) => {
      this.emitChildSearch(customerName);
    });

  }

 
  ngOnInit(): void {
    this.updateColumnArrays();
    this.pageData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_ANALYSIS, this.consValue.pageMaster.PR_DASHBOARD);
    // this.productlevelChartOptions = this.chartConfigService.getProductLevelOpportunityChar();
    // this.customerlevelChartOptions = this.chartConfigService.getCustomerLevelOpportunity();
    // this.setupcustomerlevelChartOptions();
    // this.productLevelOppData.forEach(row => {
    //   this.collapseStates[row.product_name] = true;
    // });
    // this.customerLevelOppData.forEach(row => {
    //   this.collapseStatesCustomerL[row.cust_name] = true;
    // });
  }

    setCusstomerNameChange(customerNameChange: string) {
    this.customerNameChange.emit(customerNameChange);
    // this.setupLendingAnalysis();
  }

  // Navigate to Commercial Bureau History page when customer name is clicked
  onCustomerBureauClick(customer: any) {
    const req = {
      pan : customer.pan_no
    }
   
    this.msmeService.getDecPan(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data) {
            let pageData = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS2, this.consValue.pageMaster.COMMERCIAL_BUREAU2);
              this.commonService.setStorage("pr_commercial_pan", response.data);
              this.commonService.setStorage("from_pr_dashboard", "true");
              this.commonService.setStorage("pr_dashboard_show_summary", "true");
              // Save the table level selection (Product Level / Customer Level)
              this.commonService.setStorage("pr_dashboard_table_level", this.mySelectedValue);
              if (this.filtersffNavigateFinale) {
                this.commonService.setStorageAesEncryption("pr_dashboard_filters_summary", JSON.stringify(this.filtersffNavigateFinale));
                // Save bureau_type and customer_type for restoration
                if (this.filtersffNavigateFinale.bureau_type !== undefined) {
                  this.commonService.setStorage("pr_dashboard_bureau_type", this.filtersffNavigateFinale.bureau_type.toString());
                }
                if (this.filtersffNavigateFinale.customer_type !== undefined) {
                  this.commonService.setStorage("pr_dashboard_customer_type", this.filtersffNavigateFinale.customer_type.toString());
                }
              }
              this.router.navigate(['/hsbc/rmCommercialBureau'], { state: { data: pageData} });
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR getDecPan');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR getDecPan');
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    // Restore table level selection if provided (only once on redirect)
    if (changes['restoredTableLevel'] && this.restoredTableLevel) {
      this.mySelectedValue = this.restoredTableLevel;
      // Show Table view on first redirect restore
      this.showChart = false;
      // Notify parent to clear restoredTableLevel so tab switches don't reset view
      this.tableLevelRestored.emit();
    }
    
    if (changes['isLoadingFromParent']) {
      this.isLoading = this.isLoadingFromParent;
    }
    if (changes['isLoadingProductLevelChart']) {
      this.isLoadingProdChart = this.isLoadingProductLevelChart;
    }
    if (changes['filtersApplied']) {
      this.clearSelectedCheckBoxForCampaign();
      this.resetSortingSearching();
      this.resetPaginationToDefault();
      if (this.selectedProductIndex !== null) {
        this.selectedProductIndex = null;
      }
      if (this.selectedLegendItem !== null) {
        this.selectedLegendItem = null;
        this.selectedOtherItems.clear();
        this.legendClicksDisabled = false;
      }
    }
    if (changes['hasFiltersApplied']) {
      this.clearSelectedCheckBoxForCampaign();
      this.updateSearchFilterFlag();
    }

    if (changes['productLevelOppData'] && this.productLevelOppData) {
      this.productLevelOppData.forEach(row => {
        this.collapseStates[row.product_id] = true;
      });

      this.isLoading = false;
    }
    if(changes['totalRecordsProduct']) {
      console.log('total products changed: ', this.totalRecordsProduct);
    }
    if (changes['customerLevelOppData'] && this.customerLevelOppData) {
      this.setupcustomerlevelTableData(this.customerLevelOppData);
      this.customerLevelOppData.forEach(row => {
        this.collapseStatesCustomerL[row.cust_name] = true;
      });
      this.isLoadingCustChart = this.isLoadingCustomerLevelChart;
    }

    if(changes['productWiseCustomerData']) {
      this.isLoading = false;
    }
    if (changes['customerLevelChartData'] && this.customerLevelChartData) {
      if (!this.customerLevelChartData || this.customerLevelChartData.length === 0) {
        this.noDataFoundCusChart = true;
      } else {
        this.noDataFoundCusChart = false;
        this.setupcustomerlevelChartOptions(this.customerLevelChartData);
      }
    }
    if (changes['productLevelChartData'] && this.productLevelChartData) {
      if (!this.productLevelChartData || this.productLevelChartData.length === 0) {
        this.noDataFoundProdChart = true;
      } else {
        this.noDataFoundProdChart = false;
        this.setupProductLevelChartOptions(this.productLevelChartData);
      }
    }
    if(changes['selectedUnit'] && this.selectedUnit) {
      this.resetSortingSearching();
        this.setupProductLevelChartOptions(this.productLevelChartData);
        this.setupcustomerlevelChartOptions(this.customerLevelChartData);
        this.updateColumnArraysWithCustomization();
        this.resetPaginationToDefault();
    }
    if (changes['customerWiseProductsData'] && this.customerWiseProductsData) {
      this.isLoading = false;
    }
  }

  get numberFormat(): string {
    if (this.selectedUnit === 'Million') return '1.1-1';
    if (this.selectedUnit === 'Billion') return '1.2-2';
    return '1.0-0';
  }

  clearSelectedCheckBoxForCampaign(){
      this.selectedCustomers.clear();
      this.selectedCustomerDetails.clear();
      this.deselectedCustomers.clear();
      this.selectAllAcrossPages = false;
  }

  getColumnFormat(columnName: string): string {
    const percentageColumns = ['Bank Utilization %', 'Bank Utilization Wallet %', 'Bank Sanction Wallet %'];
    if (this.selectedUnit === 'Absolute' && percentageColumns.includes(columnName)) {
      return '1.2-2';
    }
    return this.numberFormat;
  }

  formatValue(num: any): number {
    if (num === null || num === undefined) return 0;
    const formatted = this.decimalPipe.transform(num, this.numberFormat, 'en-US');
    return Number(formatted?.replace(/,/g, '')) || 0;
  }

  // Apply highlight state to chart (used after click and when chart is recreated e.g. after tab switch)
  private applyChartHighlight(chart: any): void {
    if (!chart || !chart.series || this.selectedProductIndex === null) return;
    const hasSelection = true;
    chart.series.forEach((series: any) => {
      if (series.points) {
        series.points.forEach((point: any, pointIndex: number) => {
          const isSelected = this.selectedProductIndex === pointIndex;
          const opacity = hasSelection && !isSelected ? 0.3 : 1;
          if (point.graphic) {
            point.graphic.css({ opacity: opacity });
            const el = point.graphic.element;
            if (el && el.classList) {
              if (isSelected) {
                el.classList.add('highlight');
              } else {
                el.classList.remove('highlight');
              }
            }
          }
          if (point.dataLabel) {
            point.dataLabel.css({ opacity: opacity });
          }
        });
      }
    });
    const xAxis = chart.xAxis[0];
    if (xAxis && xAxis.ticks) {
      Object.keys(xAxis.ticks).forEach((tickKey: string) => {
        const tick = xAxis.ticks[tickKey];
        if (tick && tick.label && tick.label.element) {
          const tickIndex = parseInt(tickKey, 10);
          const isSelected = this.selectedProductIndex === tickIndex;
          const opacity = hasSelection && !isSelected ? 0.3 : 1;
          const labelSpan = tick.label.element.querySelector('.product-label');
          if (labelSpan) {
            labelSpan.style.opacity = String(opacity);
            labelSpan.style.fontWeight = '700';
            labelSpan.style.color = isSelected ? '#32327F' : '#333333';
          }
        }
      });
    }
  }

  // Handle product label click for chart highlighting
  onProductLabelClick(index: number, chart: any): void {
    
    this.clearSelectedCheckBoxForCampaign();
    // Toggle selection: if same index clicked, deselect; otherwise select
    if (this.selectedProductIndex === index) {
      this.selectedProductIndex = null;
      // Emit reset event to call default APIs when same product is clicked again
      this.resetProductChart.emit();
    } else {
      this.selectedProductIndex = index;
      const productData = this.productLevelChartData?.[index];

      // Emit the product click event with product ID and sub product ID
      if (productData) {
        this.productClicked.emit({
          productId: productData.parent_product_id,
          productName: productData.product_name,
          productData: productData
        });
      }
    }
    
    // Update chart points and labels opacity
    if (chart && chart.series) {
      const hasSelection = this.selectedProductIndex !== null;
      
      // Update bar opacity
      chart.series.forEach((series: any) => {
        if (series.points) {
          series.points.forEach((point: any, pointIndex: number) => {
            const isSelected = this.selectedProductIndex === pointIndex;
            const opacity = hasSelection && !isSelected ? 0.3 : 1;
            
            if (point.graphic) {
              point.graphic.css({ opacity: opacity });
              const el = point.graphic.element;
              if (el && el.classList) {
                if (isSelected) {
                  el.classList.add('highlight');
                } else {
                  el.classList.remove('highlight');
                }
              }
            }
            
            // Update data labels opacity
            if (point.dataLabel) {
              point.dataLabel.css({ opacity: opacity });
            }
          });
        }
      });
      
      // Update xAxis labels opacity through Highcharts ticks
      const xAxis = chart.xAxis[0];
      if (xAxis && xAxis.ticks) {
        Object.keys(xAxis.ticks).forEach((tickKey: string) => {
          const tick = xAxis.ticks[tickKey];
          if (tick && tick.label && tick.label.element) {
            const tickIndex = parseInt(tickKey, 10);
            const isSelected = this.selectedProductIndex === tickIndex;
            const opacity = hasSelection && !isSelected ? 0.3 : 1;
            
            // Find the span inside the label
            const labelSpan = tick.label.element.querySelector('.product-label');
            if (labelSpan) {
              labelSpan.style.opacity = String(opacity);
              labelSpan.style.fontWeight = isSelected ? '700' : '700';
              labelSpan.style.color = isSelected ? '#32327F' : '#333333';
            }
          }
        });
      }
    }
  }

  // Reset chart selection - restore all labels and bars to full opacity
  resetChartSelection(): void {
    this.clearSelectedCheckBoxForCampaign();
    this.selectedProductIndex = null;
    
    const chart = this.productLevelChartInstance;
    if (chart && chart.series) {
      // Reset all bar and data label opacities to 1
      chart.series.forEach((series: any) => {
        if (series.points) {
          series.points.forEach((point: any) => {
            if (point.graphic) {
              point.graphic.css({ opacity: 1 });
              const el = point.graphic.element;
              if (el && el.classList) {
                el.classList.remove('highlight');
              }
            }
            if (point.dataLabel) {
              point.dataLabel.css({ opacity: 1 });
            }
          });
        }
      });
      
      // Reset all xAxis labels to default styling
      const xAxis = chart.xAxis[0];
      if (xAxis && xAxis.ticks) {
        Object.keys(xAxis.ticks).forEach((tickKey: string) => {
          const tick = xAxis.ticks[tickKey];
          if (tick && tick.label && tick.label.element) {
            const labelSpan = tick.label.element.querySelector('.product-label');
            if (labelSpan) {
              labelSpan.style.opacity = '1';
              labelSpan.style.fontWeight = '700';
              labelSpan.style.color = '#333333';
            }
          }
        });
      }
    }
    this.resetProductChart.emit();
  }

  // Reset pie chart (Customer Level) selection
  resetPieChartSelection(): void {
    this.clearSelectedCheckBoxForCampaign();
    this.selectedLegendItem = null;
    this.selectedOtherItems.clear();
    this.legendClicksDisabled = false;
    this.setupcustomerlevelChartOptions(this.customerLevelChartData);
    // Emit null to reset the filter and call default APIs
    this.customerLevelChartClicked.emit({
      utilizationWalletPct: null,
      displayName: null
    });
  }

  resetSortingSearching() {
    // Clear all search filters
    this.productLevelParentSearchFilters = {};
    this.productLevelChildSearchFilters = {};
    this.customerLevelParentSearchFilters = {};
    this.customerLevelChildSearchFilters = {};

    // Reset sorting
    this.childTableSortOrderObj = {order_by_column: '', order_by_type: 'ASC'};
    this.parentTableSortOrderObj = {order_by_column: '', order_by_type: 'ASC'};

    // Update search filter flag
    this.updateSearchFilterFlag();
  }

  resetPaginationToDefault() {
  this.productPageSize = 10;
  this.productPage = 1;
  this.pageSize = 10;
  this.page = 1;
  }

  onLevelChange() {
    this.resetSortingSearching();
  }


  // Manual reset method for user-triggered resets
  resetSearchAndSort() {
    this.resetSortingSearching();

    // Trigger search with empty filters
    if (this.mySelectedValue === 'Product Level') {
      this.emitParentSearch();
    } else {
      this.emitParentSearch(); // For customer level parent table
    }
  }

  setupcustomerlevelTableData(customerLevelOppData: any) {

  }

  setupProductLevelChartOptions(productLevelChartData: any) {

    console.log('sdsds',productLevelChartData)
  const baseConfig = this.chartConfigService.getProductLevelOpportunityChar();

  const categories = productLevelChartData.map((item: any) =>
    item.product_name
  );

  const categoryCount = categories.length;
  const minHeight = 300;
  const maxHeight = 800;
  const heightPerCategory = 70;
  const calculatedHeight = Math.min(maxHeight, Math.max(minHeight, categoryCount * heightPerCategory));

  const competitionData = productLevelChartData.map(
    (item: any) =>  this.formatValue(item.competition_utilization || 0)
  );
  const hsbcData = productLevelChartData.map(
    (item: any) =>  this.formatValue(item.hsbc_competition_utilization || 0)
  );

    const hsbc_wallet_utilisation_pct = productLevelChartData.map(
    (item: any) => parseFloat(item.hsbc_wallet_utilization_pct || 0)
  );

   const totalData = competitionData.map((val, i) => val + hsbcData[i]);

  const component = this;
  this.productlevelChartOptions = {
    ...baseConfig,

    xAxis: {
      ...baseConfig.xAxis,
      categories,
      labels: {
        ...baseConfig.xAxis.labels,
        useHTML: true,
        formatter: function() {
          const index = this.pos;
          return `<span class="product-label" data-index="${index}" style="cursor: pointer; font-weight: 700; color: #333333;">${this.value}</span>`;
        }
      }
    },
    chart: {
      ...baseConfig.chart,
      height: calculatedHeight,
      events: {
        load: function() {
          const chart = this;

          // Store original data for recalculation
          chart.competitionData = competitionData;
          chart.hsbcData = hsbcData;
          chart.hsbc_wallet_utilisation_pct = hsbc_wallet_utilisation_pct;

          // Function to recalculate percentage series position
          const recalculatePercentageSeries = () => {
            if (chart.series && chart.series.length >= 3) {
              const competitionSeries = chart.series[0];
              const hsbcSeries = chart.series[1];
              const percentageSeries = chart.series[2];

              // Check which series are visible (visible is true when shown, false when hidden)
              const competitionVisible = competitionSeries.visible !== false;
              const hsbcVisible = hsbcSeries.visible !== false;

              // If all legend items are hidden, hide percentage data labels
              if (!competitionVisible && !hsbcVisible) {
                percentageSeries.update({
                  dataLabels: {
                    enabled: false
                  }
                }, false);
                return;
              }

              // Show percentage data labels if at least one series is visible
              if (percentageSeries.options.dataLabels && !percentageSeries.options.dataLabels.enabled) {
                percentageSeries.update({
                  dataLabels: {
                    enabled: true,
                    inside: false,
                    align: 'left',
                    color: '#333333',
                    overflow: 'allow',
                    crop: false,
                    y: 0,
                    x: 4,
                    formatter: function() {
                      const chart = this.series.chart;
                      const percentages = hsbc_wallet_utilisation_pct;
                      return percentages && percentages[this.point.index]
                        ? percentages[this.point.index] + '%'
                        : null;
                    },
                    style: {
                      fontWeight: 'bold',
                      textOutline: 'none',
                      fontSize: '12px'
                    }
                  }
                }, false);
              }

              // Calculate new total data based on visible series
              const newTotalData = chart.competitionData.map((val: number, i: number) => {
                let total = 0;
                if (competitionVisible) {
                  total += val;
                }
                if (hsbcVisible) {
                  total += chart.hsbcData[i];
                }
                return total;
              });

              // Update percentage series data
              percentageSeries.setData(newTotalData, false);
            }
          };

          // Store the function for later use
          chart.recalculatePercentageSeries = recalculatePercentageSeries;
          
          // Store chart instance for reset functionality
          component.productLevelChartInstance = chart;
          
          // Add click event listeners to product labels
          setTimeout(() => {
            const labelElements = chart.container.querySelectorAll('.product-label');
            labelElements.forEach((labelEl: HTMLElement) => {
              labelEl.addEventListener('click', function(e: Event) {
                e.stopPropagation();
                const index = parseInt(labelEl.getAttribute('data-index') || '0', 10);
                component.onProductLabelClick(index, chart);
              });
            });
            // Same click handling for highcharts-point (bars) - delegated listener
            chart.container.addEventListener('click', function(e: Event) {
              let el = (e.target as HTMLElement);
              while (el && el !== chart.container) {
                for (const series of chart.series) {
                  if (!series.points) { continue; }
                  for (let i = 0; i < series.points.length; i++) {
                    const pt = series.points[i];
                    if (pt.graphic && pt.graphic.element && (pt.graphic.element === el || (pt.graphic.element as HTMLElement).contains(el))) {
                      component.onProductLabelClick(i, chart);
                      e.stopPropagation();
                      return;
                    }
                  }
                }
                el = el.parentNode as HTMLElement;
              }
            });
            // Re-apply highlight when chart is recreated (e.g. after switching tab and back)
            if (component.selectedProductIndex !== null) {
              component.applyChartHighlight(chart);
            }
          }, 100);
        }
      }
    },
    plotOptions: {
      ...baseConfig.plotOptions,
      series: {
        ...baseConfig.plotOptions?.series,
        cursor: 'pointer',
        point: {
          events: {
            click: function() {
              const chart = this.series.chart;
              const index = this.index;
              component.onProductLabelClick(index, chart);
            }
          }
        },
        events: {
          legendItemClick: function() {
            // Prevent show/hide on legend click
            return false;
          }
        }
      }
    },
    series: [
      {
        name: `Competition Utilization ${this.moneyFormatTableHeader}`,
        color: '#AAB6C6',
        data: competitionData,
        dataLabels: {
          enabled: true,
          formatter: function() {
            return '₹' + ' ' +this.y.toLocaleString();
          }
        }
      },
      {
        name: `Bank Utilization ${this.moneyFormatTableHeader}`,
        color: '#32327F',
        data: hsbcData,
        dataLabels: {
          enabled: true,
          formatter: function() {
            return '₹' + ' ' +this.y.toLocaleString();
          }
        }
      },
      {
          // Invisible series to show percentages outside stacked red bars
          name: 'Bank Utilization %',
          color: 'transparent',
          enableMouseTracking: false,
          showInLegend: false,
          stacking: undefined,
          dataLabels: {
            enabled: true,
            inside: false,
            align: 'left',
            color: '#333333',
            overflow: 'allow',
            crop: false,
            allowOverlap: true,
            y: 0,
            x: 8,
            formatter: function() {
              const chart = this.series.chart;
              const percentages = hsbc_wallet_utilisation_pct;
              return percentages && percentages[this.point.index]
              ? 'Wallet : ' +percentages[this.point.index].toFixed(2) + '%'
              : 'Wallet : 0.0%';
            },
            style: {
              fontWeight: '500',
              textOutline: 'none',
              fontSize: '12px',
              whiteSpace: 'nowrap'
            }
          },
          data: totalData // sum of both series values to position percentages correctly
        }
    ],
  };

    // productLevelChartData.forEach(row => {
    //   this.collapseStates[row.product_name] = true;
    // });
}

getHsbcLabel(displayName: string): string {
  const map: Record<string, string> = {
    'Only Competition (0%)': 'Only (Bank 0%)',
    'Low (>0 % - 25%)': 'Bank (1–25%)',
    'Competitive (25.01% - 50%)': 'Bank (26–50%)',
    'Strong (50.01% - 75%)': 'Bank (51–75%)',
    'Dominant (75.01% - <100%)': 'Bank (76–99%)',
    'Sole (100%)': 'Bank (100%)',
  };
  return map[displayName] || '';
}


  /** Colors for chart and legend: Competition, Low, Competitive, Strong, Dominant, Sole */
  readonly legendSegmentColors: Record<string, string> = {
    'Only Competition (0%)': '#FA4F5C',
    'Low (>0 % - 25%)': '#DEE4E8',
    'Competitive (25.01% - 50%)': '#94A3B8',
    'Strong (50.01% - 75%)': '#8DB1FF',
    'Dominant (75.01% - <100%)': '#FFDB89',
    'Sole (100%)': '#3FCEBD',
  };
  private readonly customerLevelSegmentOrder = [
    'Only Competition (0%)',
    'Low (>0 % - 25%)',
    'Competitive (25.01% - 50%)',
    'Strong (50.01% - 75%)',
    'Dominant (75.01% - <100%)',
    'Sole (100%)',
  ] as const;
  private readonly segmentShortName: Record<string, string> = {
    'Only Competition (0%)': 'Competition',
    'Low (>0 % - 25%)': 'Low',
    'Competitive (25.01% - 50%)': 'Competitive',
    'Strong (50.01% - 75%)': 'Strong',
    'Dominant (75.01% - <100%)': 'Dominant',
    'Sole (100%)': 'Sole',
  };
  private readonly shortNameToDisplayName: Record<string, string> = {
    'Competition': 'Only Competition (0%)',
    'Low': 'Low (>0 % - 25%)',
    'Competitive': 'Competitive (25.01% - 50%)',
    'Strong': 'Strong (50.01% - 75%)',
    'Dominant': 'Dominant (75.01% - <100%)',
    'Sole': 'Sole (100%)',
  };

  private readonly displayNameToBackendValue: Record<string, string> = {
    'Only Competition (0%)': 'only_competition',
    'Low (>0 % - 25%)': 'low',
    'Competitive (25.01% - 50%)': 'competition',
    'Strong (50.01% - 75%)': 'strong',
    'Dominant (75.01% - <100%)': 'dominant',
    'Sole (100%)': 'sole',
  };

  getLegendItemColor(item: any): string {
    return this.legendSegmentColors[item?.display_name] ?? '#94A3B8';
  }

  setupcustomerlevelChartOptions(customerLevelChartData : any){

    const lowToDominant = [
    "Low (>0 % - 25%)",
    "Competitive (25.01% - 50%)",
    "Strong (50.01% - 75%)",
    "Dominant (75.01% - <100%)",
  ];

  // Six segments with user colors; each segment single-click selectable
  const chartData = this.customerLevelSegmentOrder.map((displayName) => {
    const item = this.customerLevelChartData?.find((d: any) => d.display_name === displayName);
    const shortName = this.segmentShortName[displayName];
    const isSelected = this.selectedLegendItem === displayName;
    return {
      name: shortName,
      y: item?.unique_cust_count ?? 0,
      value: parseFloat(item?.total_utilization) || 0,
      color: this.legendSegmentColors[displayName] ?? '#94A3B8',
      selected: isSelected,
      sliced: isSelected,
    };
  });

    const totalCustomers = chartData.reduce((sum, d) => sum + d.y, 0);
    const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

    const baseConfig = this.chartConfigService.getCustomerLevelOpportunity();
    this.customerlevelChartOptions = {
      ...baseConfig,
      chart: {
        type: 'pie',
        height: 300,
        custom: {
          totalCustomers,
          totalValue,
          formatValue: (num: any) => this.formatValue(num),
          selectedPoint: this.selectedLegendItem ? (this.segmentShortName[this.selectedLegendItem] ?? null) : null,
        },
        events: {
          render() {
            const chart = this,
              series = chart.series[0];
            let customLabel = chart.options.chart.custom.label;
            const totalCustomers = chart.options.chart.custom.totalCustomers;
            const totalValue = chart.options.chart.custom.totalValue;

            const selectedPointName = chart.options.chart.custom.selectedPoint;
            let labelHtml = '';

            // If a slice is selected, show that slice's data
            // Otherwise show total
            if (selectedPointName) {
              const selectedData = series.data.find(p => p.name === selectedPointName);
              if (selectedData) {
                labelHtml = `
      <div class="pie_chart_center_text">
        <span class="title_text">${selectedData.name}</span><br/>
        <span class="title_desc">${selectedData.y} Customers</span><br/>
        <span class="number_text">₹ ${chart.options.chart.custom.formatValue(selectedData.value).toLocaleString()}</span><br/>
        <span class="text_msg">Total Utilization</span>
      </div>`;
              }
            } else {
              labelHtml = `
    <div class="pie_chart_center_text">
      <span class="title_text">Total </span><br/>
      <span class="title_desc">${chart.options.chart.custom.totalCustomers} Customers</span><br/>
      <span class="number_text">₹ ${chart.options.chart.custom.formatValue(totalValue).toLocaleString()}</span><br/>
        <span class="text_msg">Total Utilization</span>

    </div>`;
            }


            if (!customLabel) {
              customLabel = chart.options.chart.custom.label =
                chart.renderer.label(labelHtml)
                  .css({
                    color: 'var(--highcharts-neutral-color-100, #000)',
                    textAnchor: 'middle'
                  })
                  .add();
            } else {
              customLabel.attr({ text: labelHtml });
            }

            const x = series.center[0] + chart.plotLeft,
              y = series.center[1] + chart.plotTop - (customLabel.attr('height') / 2);

            customLabel.attr({
              x,
              y
            });

            customLabel.css({
              fontSize: `${series.center[2] / 12}px`
            });
          }
        }
      },

          plotOptions: {
      pie: {
        cursor: 'pointer',
        allowPointSelect: true,
        dataLabels: { enabled: false },
        point: {
          events: {
            click: (function(component) {
              return function() {
                const pointName = this.name;
                const displayName = component.shortNameToDisplayName[pointName];
                if (displayName) {
                  component.clearSelectedCheckBoxForCampaign();
                  // Disable legend li clicks when user selects via chart
                  component.legendClicksDisabled = true;
                  // Toggle selection: if same item clicked, deselect
                  if (component.selectedLegendItem === displayName) {
                    component.selectedLegendItem = null;
                    component.selectedOtherItems.clear();
                    component.legendClicksDisabled = false;
                    // Emit null to reset the filter and call default APIs
                    component.customerLevelChartClicked.emit({
                      utilizationWalletPct: null,
                      displayName: null
                    });
                  } else {
                    component.selectedLegendItem = displayName;
                    component.selectedOtherItems.clear();
                    // Emit the backend value for the selected segment
                    const backendValue = component.displayNameToBackendValue[displayName] || null;
                    component.customerLevelChartClicked.emit({
                      utilizationWalletPct: backendValue,
                      displayName: displayName
                    });
                  }
                  component.setupcustomerlevelChartOptions(component.customerLevelChartData);
                }
              };
            })(this),
          },
        },
      },
    },
        series: [
        {
          name: 'Competition',
          colorByPoint: true,
          innerSize: '70%',
          data: chartData,
        },
    ],
 };
  }

  getPieGradientColor(index: number) {
  const colors = [
    '#DAE1E6E6', // Competition (index 0)
    '#94A3B8', // Multiple/Other (index 1)
    '#32327F',   // Sole (index 2)
  ];
  return colors[index % colors.length];
}

  onLegendItemClick(item: any) {
     if (this.selectedLegendItem === item.display_name) {
      this.selectedLegendItem = null;
      this.selectedOtherItems.clear();
    } else {
      this.selectedLegendItem = item.display_name;
      this.selectedOtherItems.clear();
    }
    this.setupcustomerlevelChartOptions(this.customerLevelChartData);
  }

  isLegendItemActive(item: any): boolean {
    return this.selectedLegendItem === item.display_name;
  }

  isMultipleItem(item: any): boolean {
    const lowToDominant = [
      "Low (>0 % - 25%)",
      "Competitive (25.01% - 50%)",
      "Strong (50.01% - 75%)",
      "Dominant (75.01% - <100%)",
    ];
    return lowToDominant.includes(item.display_name);
  }

  isCompetitionItem(item: any): boolean {
    return item.display_name === 'Only Competition (0%)';
  }

  // Dynamic child table columns based on parent customization
  get dynamicCustomerColumns(): string[] {
    const filtered = this.selectedColumns.filter(col => col !== 'Product' && col !== 'Unique customers');
    // Always include Classification if it's not already present
    // if (!filtered.includes('Classification')) {
    //   filtered.push('Classification');
    // }
    return filtered;
  }

  get dynamicProductsColumns(): string[] {
    // Exclude customer-specific columns that don't apply to products
    const customerSpecificColumns = ['Customer Name', 'Classification', 'CMR Score', 'Segment', 'City', 'RM Name','Agri PSL','Start-up PSL','MSME PSL'];
    return this.selectedColumnsForCustomerLevel.filter(col => !customerSpecificColumns.includes(col));
  }

  get filteredColumns2() {
    return this.selectedColumns2.filter(x => x !== 'Classification');
  }


  updateLegendFromChart(chartSegmentName: string | null) {
    const lowToDominant = [
      "Low (>0 % - 25%)",
      "Competitive (25.01% - 50%)",
      "Strong (50.01% - 75%)",
      "Dominant (75.01% - <100%)",
    ];

    if (!chartSegmentName) {
      // Deselect all
      this.selectedLegendItem = null;
      this.selectedOtherItems.clear();
    } else if (chartSegmentName === 'Competition') {
      // Select Competition
      this.selectedLegendItem = 'Only Competition (0%)';
      this.selectedOtherItems.clear();
    } else if (chartSegmentName === 'Sole') {
      // Select Sole
      this.selectedLegendItem = 'Sole (100%)';
      this.selectedOtherItems.clear();
    } else if (chartSegmentName === 'Multiple') {
      // Select all Multiple/Other items
      this.selectedLegendItem = 'Multiple';
      this.selectedOtherItems.clear();
      if (this.customerLevelChartData) {
        this.customerLevelChartData.forEach((dataItem: any) => {
          if (lowToDominant.includes(dataItem.display_name)) {
            this.selectedOtherItems.add(dataItem.display_name);
          }
        });
      }
    }
  }
  columnMap: Record<string, string> = {};
  // Override map: when sorting, use a different column than what's displayed
  orderByOverrideMap: Record<string, string> = {
    'cmr_score': 'cmr_value'
  };

  /** Returns sort obj with order_by_column overridden for backend */
  private getOverriddenSortObj(sortObj: any): any {
    return {
      ...sortObj,
      order_by_column: this.orderByOverrideMap[sortObj.order_by_column] || sortObj.order_by_column
    };
  }
  allColumns: string[] = [];
  allColumnsCustExcel : string[] = [];
  selectedColumns: string[] = [];
  selectedColumns2: string[] = [];
  defaultColumns: string[] = [];
  customerColumns: string[] = [];
  selectedColumnsForCustomerLevel: string[] = [];
  productsColumns: string[] = [];
  allColumnsForCustomerLevel: string[] = [];
  defaultColumnsForCustomerLevel: string[] = [];
  allColumnsProductExcel: string[] = [];

        numericFields = [
        'total_sanction',
        'competetion_sanction',
        'hsbc_sanction',
        'total_utilization',
        'competition_utilization',
        'hsbc_competition_utilization',
        'hsbc_utilization',
        'hsbc_utilization_pct',
        'hsbc_wallet_utilization_pct',
        'hsbc_wallet_sanction_pct',
        'hsbc_sanction_wallet_percent'
      ];

  updateColumnArrays() {
    this.columnMap = {
      'Product': 'product_name',
      'Customer Name': 'cust_name',
      'Unique customers': 'unique_cust_count',
      'Classification': 'classification',
      [`Total Sanction${this.moneyFormatTableHeader}`]: 'total_sanction',
      [`Competition Sanction${this.moneyFormatTableHeader}`]: 'competetion_sanction',
      [`Bank Sanction${this.moneyFormatTableHeader}`]: 'hsbc_sanction',
      [`Total Utilization${this.moneyFormatTableHeader}`]: 'total_utilization',
      [`Competition Utilization${this.moneyFormatTableHeader}`]: 'competition_utilization',
      [`Bank Utilization${this.moneyFormatTableHeader}`]: 'hsbc_competition_utilization',
      'Bank Utilization %': 'hsbc_utilization_pct',
      'Bank Utilization Wallet %': 'hsbc_wallet_utilization_pct',
      'Bank Sanction Wallet %': 'hsbc_sanction_wallet_percent',

      'CMR Score':'cmr_score',
      'Segment': 'seg_name',
      'City': 'city_name',
      'RM Name': 'employee_name',
      'Agri PSL':'agri_psl_status',
      'Start-up PSL':'start_up_psl_status',
      'MSME PSL':'msme_psl_status'
    };

    this.allColumns = [
      'Product',
      'Unique customers',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Competition Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Competition Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %',
      'Bank Sanction Wallet %',
      'CMR Score',
      'Segment',
      'City',
      'RM Name',
      'Classification',
      'Agri PSL',
      'Start-up PSL',
      'MSME PSL'
    ];

    this.allColumnsProductExcel = [
      'Sr No',
      'Product',
      'Unique customers',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Competition Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Competition Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %',
      'Bank Sanction Wallet %'
    ];

    this.allColumnsCustExcel = [
      'Sr No',
      'Customer Name',
      'Customer Level Classification',
      'Cust ID',
      'PAN',
      'CIN',
      'RM Name',
      'RM PS ID',
      'Segment',
      'City',
      'CRR',
      'CMR Score',
      'Product',
      'Product Level Classification',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Competition Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Competition Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %',
      'Bank Sanction Wallet %',
      'Agri PSL',
      'Start-up PSL',
      'MSME PSL'
    ];


    this.selectedColumns = [
      'Product',
      'Unique customers',
      'Classification',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %'
    ];

    this.selectedColumns2 = this.selectedColumns;

    this.defaultColumns = [
      'Product',
      'Unique customers',
      'Classification',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %'
    ];

    this.customerColumns = [
      'Customer Name',
      'Classification',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %'
    ];

    this.selectedColumnsForCustomerLevel = [
      'Customer Name',
      'Classification',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %'
    ];

    this.productsColumns = [
      'Product',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %'
    ];

    this.allColumnsForCustomerLevel = [
      'Customer Name',
      'Classification',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Competition Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Competition Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %',
      'Bank Sanction Wallet %',
      'CMR Score',
      'Segment',
      'City',
      'RM Name',
      'Agri PSL',
      'Start-up PSL',
      'MSME PSL'
    ];

    this.defaultColumnsForCustomerLevel = [
      'Customer Name',
      'Classification',
      `Total Sanction${this.moneyFormatTableHeader}`,
      `Bank Sanction${this.moneyFormatTableHeader}`,
      `Total Utilization${this.moneyFormatTableHeader}`,
      `Bank Utilization${this.moneyFormatTableHeader}`,
      'Bank Utilization %',
      'Bank Utilization Wallet %'
    ];
  }

  updateColumnArraysWithCustomization() {
    // Store current customized columns before updating
    const previousSelectedColumns = [...this.selectedColumns];
    const previousSelectedColumnsForCustomerLevel = [...this.selectedColumnsForCustomerLevel];

    // Store the old money format before updating
    const oldMoneyFormat = this.moneyFormatTableHeader;

    // Update money format based on selected unit
    this.moneyFormatTableHeader = this.selectedUnit === 'Million' ? '(₹M)' : this.selectedUnit === 'Billion' ? '(₹B)' : '(₹)';

    // Update all column arrays with new money format
    this.updateColumnArrays();

    // Preserve user customization by mapping old format to new format
    this.selectedColumns = this.mapColumnsToNewFormat(previousSelectedColumns, oldMoneyFormat, this.moneyFormatTableHeader);
    this.selectedColumnsForCustomerLevel = this.mapColumnsToNewFormat(previousSelectedColumnsForCustomerLevel, oldMoneyFormat, this.moneyFormatTableHeader);
  }

  private mapColumnsToNewFormat(customizedColumns: string[], oldFormat: string, newFormat: string): string[] {
    return customizedColumns.map(column => {
      // Replace old money format with new format in column names
      if (column.includes(oldFormat)) {
        return column.replace(oldFormat, newFormat);
      }
      return column;
    }).filter(column => {
      // Check if column exists in current available columns
      const isProductLevel = this.allColumns.includes(column);
      const isCustomerLevel = this.allColumnsForCustomerLevel.includes(column);
      return isProductLevel || isCustomerLevel;
    });
  }

  CustomizeColumn_popup() {
    if (this.mySelectedValue == 'Product Level') {
      const dialogRef = this.dialog.open(CustomizeColumnsPopupComponent, {
        panelClass: ['popupMain_design', 'popupMain_design2'],
        data: {
          allColumns: this.allColumns,
          selectedColumns: this.selectedColumns,
          defaultColumns: this.defaultColumns
        },
        autoFocus: false,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.selectedColumns = result;
          const customerSpecificColumns = ['Customer Name', 'Classification', 'CMR Score', 'Segment', 'City', 'RM Name','Agri PSL','Start-up PSL','MSME PSL'];
          this.selectedColumns2 =  this.selectedColumns.filter(col => !customerSpecificColumns.includes(col));
        }
      });
    } else {
      const dialogRef = this.dialog.open(CustomizeColumnsPopupComponent, {
        panelClass: ['popupMain_design', 'popupMain_design2'],
        data: {
          allColumns: this.allColumnsForCustomerLevel,
          selectedColumns: this.selectedColumnsForCustomerLevel,
          defaultColumns: this.defaultColumnsForCustomerLevel
        },
        autoFocus: false,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.selectedColumnsForCustomerLevel = result;
        }
      });
    }



  }

  onCollapseToggle(row: any) {
    const productId = row.product_id;
    const isCurrentlyCollapsed = this.collapseStates[productId];

    this.childTableSortOrderObj = {order_by_column: '', order_by_type: 'ASC'}
    this.productLevelChildSearchFilters = {};

    if (isCurrentlyCollapsed) {
      // Clear old data immediately and show loading
      this.productWiseCustomerData = null;
      this.isLoading = true;

      // Opening: First close others, then open current
      Object.keys(this.collapseStates).forEach(key => {
        this.collapseStates[+key] = true;
      });

      setTimeout(() => {
        this.collapseStates[productId] = false;
        const searchReq = this.prepareSearchRequest(this.productLevelChildSearchFilters);
        this.pageChangeProductLevel.emit({productId: productId, pageSize: this.ppageSize, offset: this.productLevelCustPageOffset, sortSearchReq: {sortReq:this.childTableSortOrderObj, searchReq}});
      }, 300);
    } else {
      // Closing: Just close current
      this.collapseStates[productId] = true;
    }

    this.productId = productId;
  }

  onCollapseToggleForCustomerL(row: any) {
    const customerName = row.cust_name;
    const isCurrentlyCollapsedCustomerL = this.collapseStatesCustomerL[customerName];

    this.childTableSortOrderObj = {order_by_column: '', order_by_type: 'ASC'}
    this.customerLevelChildSearchFilters = {};

    if (isCurrentlyCollapsedCustomerL) {
      // Clear old data immediately and show loading
      this.customerWiseProductsData = null;
      this.isLoading = true;

      // Opening: First close others, then open current
      Object.keys(this.collapseStatesCustomerL).forEach(key => {
        this.collapseStatesCustomerL[key] = true;
      });

      setTimeout(() => {
        this.collapseStatesCustomerL[customerName] = false;
        let offset = 0;
        // this.customerNameChange.emit(customerName);
        this.pageChangeCustomerProducts.emit({ customerName, pageSize: this.customerProductPageSize, offset, ...this.childTableSortOrderObj });
      }, 300);
    } else {
      // Closing: Just close current
      this.collapseStatesCustomerL[customerName] = true;
    }
    this.customerName = customerName;
  }

  onChnageOrder(columnName: string, apiType: string, customerName: string = null) {
    const childOrderByCol = this.childTableSortOrderObj.order_by_column;
    const childOrderByType = this.childTableSortOrderObj.order_by_type;
    const parentOrderByCol = this.parentTableSortOrderObj.order_by_column;
    const parentOrderByType = this.parentTableSortOrderObj.order_by_type;
    const mappedCol = this.columnMap[columnName];
    const newCol = mappedCol;

    const parentFilters = this.mySelectedValue === 'Product Level' ? this.productLevelParentSearchFilters : this.customerLevelParentSearchFilters;
    const childFilters = this.mySelectedValue === 'Product Level' ? this.productLevelChildSearchFilters : this.customerLevelChildSearchFilters;
    const parentSearchReq = this.prepareSearchRequest(parentFilters);
    const childSearchReq = this.prepareSearchRequest(childFilters);

    if(apiType !== 'productWiseCustomerData'){
        this.resetProductChildPagination();
    }else{
       this.resetCustomerChildPagination();
    }

    if (apiType === 'productWiseCustomerData' || apiType === 'customerWiseProductsData') {
      this.prepareChildReq(childOrderByCol, newCol, childOrderByType);
    } else {
      this.prepareParentReq(parentOrderByCol, newCol, parentOrderByType);
    }

    const sortSearchReqParent = { ...this.getOverriddenSortObj(this.parentTableSortOrderObj), ...parentSearchReq };
    const sortSearchReqChild = { ...this.getOverriddenSortObj(this.childTableSortOrderObj), ...childSearchReq };

    switch (apiType) {
      case 'productWiseCustomerData':
        this.productWiseCustomerData = null;
        this.isLoading = true;
        this.pageChangeProductLevel.emit({ productId: this.productId, pageSize: this.ppageSize, offset: (this.ppage - 1) * this.ppageSize, ...sortSearchReqChild });
        break;

      case 'productLevelOppData':
        this.productLevelOppData = null;
        this.isLoading = true;
        this.pageChangeProductParent.emit({ pageSize: this.productPageSize, offset: (this.productPage - 1) * this.productPageSize, ...sortSearchReqParent });
        break;

      case 'customerWiseProductsData':
        this.customerWiseProductsData = null;
        this.isLoading = true;
        this.pageChangeCustomerProducts.emit({ customerName, pageSize: this.customerProductPageSize, offset: (this.customerProductPage - 1) * this.customerProductPageSize, ...sortSearchReqChild });
        break;

      case 'customerLevelOppData':
        this.customerLevelOppData = null;
        this.isLoading = true;
        this.pageChangeCustomerLevel.emit({ pageSize: this.pageSize, offset: (this.page - 1) * this.pageSize, ...sortSearchReqParent });
        break;

      default:
        console.log('inside default...');
    }

   }

   toggleSort(sortField: string, direction: 'ASC' | 'DESC', apiType: string, customerName: string = null) {
    const parentFilters = this.mySelectedValue === 'Product Level' ? this.productLevelParentSearchFilters : this.customerLevelParentSearchFilters;
    const childFilters = this.mySelectedValue === 'Product Level' ? this.productLevelChildSearchFilters : this.customerLevelChildSearchFilters;
    const parentSearchReq = this.prepareSearchRequest(parentFilters);
    const childSearchReq = this.prepareSearchRequest(childFilters);

    if(apiType !== 'productWiseCustomerData'){
        this.resetProductChildPagination();
    }else{
       this.resetCustomerChildPagination();
    }

    if (apiType === 'productWiseCustomerData' || apiType === 'customerWiseProductsData') {
      this.childTableSortOrderObj.order_by_column = sortField;
      this.childTableSortOrderObj.order_by_type = direction;
    } else {
      this.parentTableSortOrderObj.order_by_column = sortField;
      this.parentTableSortOrderObj.order_by_type = direction;
    }

    const sortSearchReqParent = { ...this.getOverriddenSortObj(this.parentTableSortOrderObj), ...parentSearchReq };
    const sortSearchReqChild = { ...this.getOverriddenSortObj(this.childTableSortOrderObj), ...childSearchReq };

    switch (apiType) {
      case 'productWiseCustomerData':
        this.productWiseCustomerData = null;
        this.isLoading = true;
        this.pageChangeProductLevel.emit({ productId: this.productId, pageSize: this.ppageSize, offset: (this.ppage - 1) * this.ppageSize, ...sortSearchReqChild });
        break;

      case 'productLevelOppData':
        this.productLevelOppData = null;
        this.isLoading = true;
        this.pageChangeProductParent.emit({ pageSize: this.productPageSize, offset: (this.productPage - 1) * this.productPageSize, ...sortSearchReqParent });
        break;

      case 'customerWiseProductsData':
        this.customerWiseProductsData = null;
        this.isLoading = true;
        this.pageChangeCustomerProducts.emit({ customerName, pageSize: this.customerProductPageSize, offset: (this.customerProductPage - 1) * this.customerProductPageSize, ...sortSearchReqChild });
        break;

      case 'customerLevelOppData':
        this.customerLevelOppData = null;
        this.isLoading = true;
        this.pageChangeCustomerLevel.emit({ pageSize: this.pageSize, offset: (this.page - 1) * this.pageSize, ...sortSearchReqParent });
        break;

      default:
        console.log('inside default...');
    }
   }

   prepareChildReq(currCol, newCol, type): any {
      if(currCol !== newCol) {
        this.childTableSortOrderObj.order_by_column = newCol;
        this.childTableSortOrderObj.order_by_type = 'ASC';
      } else {
        this.childTableSortOrderObj.order_by_type = type === 'ASC' ? 'DESC' : 'ASC'
      }
      const filters = this.mySelectedValue === 'Product Level' ? this.productLevelChildSearchFilters : this.customerLevelChildSearchFilters;
      const searchReq = this.prepareSearchRequest(filters);
      return { ...this.childTableSortOrderObj, ...searchReq };
   }

   prepareParentReq(currCol, newCol, type): any {
      if(currCol !== newCol) {
        this.parentTableSortOrderObj.order_by_column = newCol;
        this.parentTableSortOrderObj.order_by_type = 'ASC';
      } else {
        this.parentTableSortOrderObj.order_by_type = type === 'ASC' ? 'DESC' : 'ASC'
      }
      const filters = this.mySelectedValue === 'Product Level' ? this.productLevelParentSearchFilters : this.customerLevelParentSearchFilters;
      const searchReq = this.prepareSearchRequest(filters);
      return { ...this.parentTableSortOrderObj, ...searchReq };
   }

onParentSearch(column: string, event: any) {
  const cleanedValue = event.target.value.replace(/\./g, '');
  event.target.value = cleanedValue;

  if (this.mySelectedValue === 'Product Level') {
    this.productLevelParentSearchFilters[column] = cleanedValue;
  } else {
    this.customerLevelParentSearchFilters[column] = cleanedValue;
  }

  // Update search filter flag
  this.updateSearchFilterFlag();

  const isNumeric = /^[0-9]+$/.test(cleanedValue);
  if (cleanedValue === '') {
    this.parentSearchSubject.next(cleanedValue);
    return;
  }
  if (isNumeric) {
    this.parentSearchSubject.next(cleanedValue);
  } else {
    if (cleanedValue.length >= 2) {
      this.parentSearchSubject.next(cleanedValue);
    }
  }
}

onChildSearch(column: string, event: any, customerName: string = null) {
  const cleanedValue = event.target.value.replace(/\./g, '');
  event.target.value = cleanedValue;

  if (this.mySelectedValue === 'Product Level') {
    this.productLevelChildSearchFilters[column] = cleanedValue;
  } else {
    this.customerLevelChildSearchFilters[column] = cleanedValue;
  }

  // Update search filter flag
  this.updateSearchFilterFlag();

  const isNumeric = /^[0-9]+$/.test(cleanedValue);
  if (cleanedValue === '') {
    this.childSearchSubject.next({value : cleanedValue, customerName});
    return;
  }
  if (isNumeric) {
    this.childSearchSubject.next({value : cleanedValue, customerName});
  } else {
    if (cleanedValue.length >= 2) {
      this.childSearchSubject.next({value : cleanedValue, customerName});
    }
  }

}

prepareSearchRequest(filters: any): any {
  const columnSearchFilter = Object.keys(filters)
    .filter(key => filters[key] && filters[key].trim())
    .map(key => ({ key: this.columnMap[key] || key, value: filters[key] }));

  return { column_search_filter: columnSearchFilter };
}

emitParentSearch() {
  const filters = this.mySelectedValue === 'Product Level' ? this.productLevelParentSearchFilters : this.customerLevelParentSearchFilters;
  const searchReq = this.prepareSearchRequest(filters);
  this.parentTableSortOrderObj = { ...this.parentTableSortOrderObj, ...searchReq };

  if (this.mySelectedValue === 'Product Level') {
    const offset = (this.productPage - 1) * this.productPageSize;
    this.productLevelOppData = null;
    this.isLoading = true;
    this.pageChangeProductParent.emit({ pageSize: this.productPageSize, offset, ...this.getOverriddenSortObj(this.parentTableSortOrderObj) });
  } else {
    const offset = (this.page - 1) * this.pageSize;
    this.customerLevelOppData = null;
    this.isLoading = true;
    this.pageChangeCustomerLevel.emit({ pageSize: this.pageSize, offset, ...this.getOverriddenSortObj(this.parentTableSortOrderObj) });
  }
}

emitChildSearch(customerName: string = null) {
  console.log('gettting the customer name: {}{}{}', customerName);

  const filters = this.mySelectedValue === 'Product Level' ? this.productLevelChildSearchFilters : this.customerLevelChildSearchFilters;
  const searchReq = this.prepareSearchRequest(filters);
  this.childTableSortOrderObj = { ...this.childTableSortOrderObj, ...searchReq };

  if (this.mySelectedValue === 'Product Level') {
    const offset = (this.ppage - 1) * this.ppageSize;
    this.productWiseCustomerData = null;
    this.isLoading = true;
    this.pageChangeProductLevel.emit({ productId: this.productId, pageSize: this.ppageSize, offset, ...this.getOverriddenSortObj(this.childTableSortOrderObj) });
  } else {
    const offset = (this.customerProductPage - 1) * this.customerProductPageSize;
    this.customerWiseProductsData = null;
    this.isLoading = true;
    this.pageChangeCustomerProducts.emit({ customerName, pageSize: this.customerProductPageSize, offset, ...this.getOverriddenSortObj(this.childTableSortOrderObj) });
  }
}

excelDownloadProductLevel(){
  this.emitExcelDownloadProductLevel.emit({prodOrCustlevel : this.mySelectedValue,prodExcelColumn : this.allColumnsProductExcel,  custExcelColumn : this.allColumnsCustExcel});
}

onPageChange(pageNumber: number) {
  this.customerLevelOppData = null;
  this.isLoading = true;
  this.page = pageNumber;
  const offset = (this.page - 1) * this.pageSize;
  const searchReq = this.prepareSearchRequest(this.customerLevelParentSearchFilters);
  const sortSearchReq = { ...this.getOverriddenSortObj(this.parentTableSortOrderObj), ...searchReq };
  this.pageChangeCustomerLevel.emit({ pageSize: this.pageSize, offset, ...sortSearchReq });
  this.resetCustomerChildPagination();
}

onPageSizeChange(size: number) {
  this.customerLevelOppData = null;
  this.isLoading = true;
  this.pageSize = size;
  this.page = 1;
  const offset = 0;
  const searchReq = this.prepareSearchRequest(this.customerLevelParentSearchFilters);
  const sortSearchReq = { ...this.getOverriddenSortObj(this.parentTableSortOrderObj), ...searchReq };
  this.pageChangeCustomerLevel.emit({ pageSize: this.pageSize, offset, ...sortSearchReq });
  this.resetCustomerChildPagination();
}

onProductPageChange(pageNumber: number) {
  this.productWiseCustomerData = null;
  this.isLoading = true;
  this.ppage = pageNumber;
  const offset = (this.ppage - 1) * this.ppageSize;
  const searchReq = this.prepareSearchRequest(this.productLevelChildSearchFilters);
  const sortSearchReq = { ...this.getOverriddenSortObj(this.childTableSortOrderObj), ...searchReq };
  this.pageChangeProductLevel.emit({ productId: this.productId, pageSize: this.ppageSize, offset, ...sortSearchReq });
}

onProductPageSizeChange(size: number) {
  this.productWiseCustomerData = null;
  this.isLoading = true;
  this.ppageSize = size;
  this.ppage = 1;
  const offset = 0;
  const searchReq = this.prepareSearchRequest(this.productLevelChildSearchFilters);
  const sortSearchReq = { ...this.getOverriddenSortObj(this.childTableSortOrderObj), ...searchReq };
  this.pageChangeProductLevel.emit({ productId: this.productId, pageSize: this.ppageSize, offset, ...sortSearchReq });
}

get startRow(): number {
  return (this.page - 1) * this.pageSize + 1;
}

get endRow(): number {
  return Math.min(this.page * this.pageSize, this.totalRecordsCustomer);
}

get pstartRow(): number {
  return (this.ppage - 1) * this.ppageSize + 1;
}

get pendRow(): number {
  return Math.min(this.ppage * this.ppageSize, this.totalRecordsProduct);
}

// Product Level Parent Table Getters
get productStartRow(): number {
  return (this.productPage - 1) * this.productPageSize + 1;
}

get productEndRow(): number {
  // console.log('console log product end row totla records:{} ', this.totalRecordsProductParent);

  return Math.min(this.productPage * this.productPageSize, this.totalRecordsProductParent);
}

// Customer Level Child Table Getters
get customerProductStartRow(): number {
  return (this.customerProductPage - 1) * this.customerProductPageSize + 1;
}

get customerProductEndRow(): number {
  return Math.min(this.customerProductPage * this.customerProductPageSize, this.totalRecordsCustomerProducts);
}

// Product Level Parent Table Pagination Methods
onProductParentPageChange(pageNumber: number) {
  this.productLevelOppData = null;
  this.isLoading = true;
  this.productPage = pageNumber;
  const offset = (this.productPage - 1) * this.productPageSize;
  const searchReq = this.prepareSearchRequest(this.productLevelParentSearchFilters);
  const sortSearchReq = { ...this.getOverriddenSortObj(this.parentTableSortOrderObj), ...searchReq };
  this.pageChangeProductParent.emit({ pageSize: this.productPageSize, offset, ...sortSearchReq });
  this.resetProductChildPagination();
}

onProductParentPageSizeChange(size: number) {
  this.productLevelOppData = null;
  this.isLoading = true;
  this.productPageSize = size;
  this.productPage = 1;
  const offset = 0;
  const searchReq = this.prepareSearchRequest(this.productLevelParentSearchFilters);
  const sortSearchReq = { ...this.getOverriddenSortObj(this.parentTableSortOrderObj), ...searchReq };
  this.pageChangeProductParent.emit({ pageSize: this.productPageSize, offset, ...sortSearchReq });
  this.resetProductChildPagination();
}

// Customer Level Child Table Pagination Methods
onCustomerProductPageChange(pageNumber: number) {
  this.customerWiseProductsData = null;
  this.isLoading = true;
  this.customerProductPage = pageNumber;
  const offset = (this.customerProductPage - 1) * this.customerProductPageSize;
  const searchReq = this.prepareSearchRequest(this.customerLevelChildSearchFilters);
  const sortSearchReq = { ...this.getOverriddenSortObj(this.childTableSortOrderObj), ...searchReq };
  this.pageChangeCustomerProducts.emit({customerName: this.customerName,pageSize: this.customerProductPageSize, offset, ...sortSearchReq });
}

onCustomerProductPageSizeChange(size: number) {
  this.customerWiseProductsData = null;
  this.isLoading = true;
  this.customerProductPageSize = size;
  this.customerProductPage = 1;
  const offset = 0;
  const searchReq = this.prepareSearchRequest(this.customerLevelChildSearchFilters);
  const sortSearchReq = { ...this.getOverriddenSortObj(this.childTableSortOrderObj), ...searchReq };
  this.pageChangeCustomerProducts.emit({customerName: this.customerName, pageSize: this.customerProductPageSize, offset, ...sortSearchReq });
}

resetProductChildPagination() {
  this.ppage = 1;
  this.ppageSize = 5;
}

resetCustomerChildPagination() {
  this.customerProductPageSize = 5;
  this.customerProductPage = 1;
}

// Getter methods for search input values
getParentSearchValue(column: string): string {
  const filters = this.mySelectedValue === 'Product Level' ? this.productLevelParentSearchFilters : this.customerLevelParentSearchFilters;
  return filters[column] || '';
}

getChildSearchValue(column: string): string {
  const filters = this.mySelectedValue === 'Product Level' ? this.productLevelChildSearchFilters : this.customerLevelChildSearchFilters;
  return filters[column] || '';
}

private updateSearchFilterFlag() {
  const parentFilters = this.mySelectedValue === 'Product Level' ? this.productLevelParentSearchFilters : this.customerLevelParentSearchFilters;
  const childFilters = this.mySelectedValue === 'Product Level' ? this.productLevelChildSearchFilters : this.customerLevelChildSearchFilters;

  const hasParentSearchFilters = Object.keys(parentFilters).some(key => parentFilters[key] && parentFilters[key].trim());
  const hasChildSearchFilters = Object.keys(childFilters).some(key => childFilters[key] && childFilters[key].trim());

  // Update flag based on search filters or parent filters
  const hasSearchFilters = hasParentSearchFilters || hasChildSearchFilters;

  // Only update if we have search filters, don't override parent's hasFiltersApplied
  if (hasSearchFilters) {
    this.hasFiltersApplied = true;
  } else {
    // Reset to original parent value if no search filters
    // This will be handled by the parent component's flag
  }
}

// Check if all customers are selected (header checkbox state)
isAllCustomersSelected(): boolean {
  if (this.selectAllAcrossPages && this.deselectedCustomers.size === 0) {
    return true;
  }
  
  if (this.customerLevelOppData && this.customerLevelOppData.length > 0) {
    const allCurrentPageSelected = this.customerLevelOppData.every(row => 
      this.selectedCustomers.has(row.cust_name)
    );
    if (allCurrentPageSelected && this.customerLevelOppData.length === this.totalRecordsCustomer) {
      return true;
    }
  }
  
  return false;
}

// Check if some (but not all) customers are selected - for indeterminate state
isSomeCustomersSelected(): boolean {
  return false;
}

// Toggle all customers selection (header checkbox) - selects ALL across ALL pages
toggleAllCustomers(): void {
  if (this.isAllCustomersSelected()) {
    // All are selected, so deselect all
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.deselectedCustomers.clear();
    this.selectAllAcrossPages = false;
  } else {
    // Not all selected (either none or some deselected), so select ALL
    this.selectAllAcrossPages = true;
    this.deselectedCustomers.clear(); // Clear deselected list to select all again
    // Also add current page customers to the set with details
    this.customerLevelOppData?.forEach(row => {
      this.selectedCustomers.add(row.cust_name);
      this.selectedCustomerDetails.set(row.cust_name, {
        customerName: row.cust_name,
        customerId: row.cust_id,
        pan: row.pan_no,
        rmId: row.rm_id,
        customerType: this.consValue.CustomerType.ETB,
      });
    });

    console.log("selectedCustomerDetails",this.selectedCustomerDetails);
    
  }
}

// Toggle individual customer selection
toggleCustomerSelection(row: any): void {
    console.log("selectedCustomerDetails",this.selectedCustomerDetails);
  if (this.isCustomerSelected(row)) {
    // Unselect this customer
    if (this.selectAllAcrossPages) {
      // When selectAll was active, we need to:
      // 1. Add all current page customers to selectedCustomers (except this one)
      // 2. Turn off selectAllAcrossPages
      this.customerLevelOppData?.forEach(r => {
        if (r.cust_name !== row.cust_name) {
          this.selectedCustomers.add(r.cust_name);
          // Store customer details
          this.selectedCustomerDetails.set(r.cust_name, {
            customerName: r.cust_name,
            customerId: row.cust_id,
            pan: row.pan_no,
            rmId: row.rm_id,
            customerType: this.consValue.CustomerType.ETB,
          });
        }
      });
      this.selectAllAcrossPages = false;
      this.deselectedCustomers.clear();
    }
    this.selectedCustomers.delete(row.cust_name);
    this.selectedCustomerDetails.delete(row.cust_name);
  } else {
    // Select this customer
    this.selectedCustomers.add(row.cust_name);
    // Store customer details
    this.selectedCustomerDetails.set(row.cust_name, {
      customerName: row.cust_name,
      customerId: row.cust_id,
      pan: row.pan_no,
      rmId: row.rm_id,
      customerType: this.consValue.CustomerType.ETB,
    });
    this.deselectedCustomers.delete(row.cust_name);
  }
}

// Check if a specific customer is selected
isCustomerSelected(row: any): boolean {
  // If selectAllAcrossPages is true, customer is selected unless explicitly deselected
  if (this.selectAllAcrossPages) {
    return !this.deselectedCustomers.has(row.cust_name);
  }
  return this.selectedCustomers.has(row.cust_name);
}

// Get count of selected customers
getSelectedCustomersCount(): number {
  if (this.selectAllAcrossPages) {
    return (this.totalRecordsCustomer || 0) - this.deselectedCustomers.size;
  }
  return this.selectedCustomers.size;
}

// Get array of selected customer names
getSelectedCustomerNames(): string[] {
  return Array.from(this.selectedCustomers);
}

  CreateCampaignPopup(): void {
    if (this.selectedCustomers && this.selectedCustomers?.size > 0) {

    // Build the dashboard request with filters
    const req = {
      dataset_id: this.dataSetIdSCT,
      dashboard_id: 2,
      filters: this.filtersff // Use filtersff passed from parent (contains full filter object)
    }

      const selectedCustomerDetailsArray = Array.from(this.selectedCustomerDetails.values());
      
      // Build filter data list when Create Campaign is clicked
      const filterDataList = this.buildAppliedFilterDataList();

      this.dialog.open(CreateCampaignPopupComponent, {
        panelClass: ['popupMain_design', 'popupMain_design2', 'right_side_popup'],
        data: {
          // customerCount: this.selectedCustomers?.size,
          sourceName: 'PR',
          customerCount: this.selectAllAcrossPages ? this.totalRecordsCustomer : this.selectedCustomers?.size,
          // customerCount: this.isManualAllPagesSelected ? this.totalSize : this.selectedCustomers?.size,
          selectedCustomers: selectedCustomerDetailsArray,
          filterDataList: filterDataList,
          // getCustomerPayload: request,
          // isAssignedAllCustomer: this.isManualAllPagesSelected,
          isAssignedAllCustomer: this.selectAllAcrossPages,
          dashboardRequest: req
          // filteredKeyValueList: this.filteredKeyValueList,
        }
      });
    } else {
      this.commonService.warningSnackBar('Please select at least one customer to create campaign.');
    }
  }

  // Build flattened filter data list for Create Campaign
  buildAppliedFilterDataList(): any[] {
    const flattenedData: any[] = [];
    const selectedFilters = this.filtersApplied;
    
    if (!selectedFilters) {
      return flattenedData;
    }
    
    let utilizationWalletPct: string | null = null;

    // Map filter keys to display names
    const filterDisplayNames: { [key: string]: string } = {
      'date_of_report': 'Date of Report',
      'product_type': 'Product Type',
      'product_sub_type': 'Product Sub Type',
      'cmr': 'CMR',
      'psl_status': 'PSL Status',
      'which_level': 'Wallet %',
      'segment': 'Segment',
      'city': 'City',
      'rm_name': 'RM Name',
      'customer_name': 'Customer Name'
    };

    // Iterate through selected filters and build flattened list
    Object.keys(selectedFilters).forEach(key => {
      const value = selectedFilters[key];
      
      // Skip internal/system filters
      if (['role_id', 'role_type', 'latest_6_report_date', 'division_value', 'page_size', 'page_offset', 'order_by_type', 'global_primary_rm_id'].includes(key)) {
        return;
      }

      if (key === 'utilization_wallet_pct') {
        if (value && value !== -1 && value !== 'all') {
          utilizationWalletPct = value;
        }
        return;
      }

      const displayName = filterDisplayNames[key] || key;

      // Find the filter options for this filter key to map IDs to names
      const filterConfig = this.filterOptions?.find(f => f.filter_name === key);

      if (Array.isArray(value) && value.length > 0) {
        // For array values, add each item with its label
        value.forEach(item => {
          if (item !== -1 && item !== '-1' && item !== 'all') {
            // Get the label/name for this value
            const itemLabel = this.getFilterLabel(filterConfig, item, key);
            flattenedData.push({
              subFilterName: displayName,
              subFilterValue: itemLabel,
              type: key
            });
          }
        });
      } else if (value !== null && value !== undefined && value !== '' && value !== -1) {
        // For single values, get the label
        const itemLabel = this.getFilterLabel(filterConfig, value, key);
        flattenedData.push({
          subFilterName: displayName,
          subFilterValue: itemLabel,
          type: key
        });
      }
    });

    if (utilizationWalletPct) {
      const levelFilter = flattenedData.find(f => f.type === 'which_level');
      if (levelFilter) {
        levelFilter.subFilterValue =
          `${levelFilter.subFilterValue} (${utilizationWalletPct})`;
      }
    }

    console.log('Applied Filter Data List:', flattenedData);
    return flattenedData;
  }

  // Helper method to get label for a filter value
  private getFilterLabel(filterConfig: any, value: any, filterKey: string): string {
    if (!filterConfig) {
      return String(value);
    }

    // Special handling for product_sub_type - raw options have nested structure
    if (filterKey === 'product_sub_type' && filterConfig.options) {
      for (const group of filterConfig.options || []) {
        // Check if group has nested options array (raw structure from API)
        if (group.options) {
          const option = group.options.find((opt: any) => opt.value === value);
          if (option) {
            return option.label || option.key || String(value);
          }
        }
      }
    }

    // Check if filter has grouped options (processed structure)
    if (filterConfig.groupedOptions || filterConfig.originalGroupedOptions) {
      const groupedOptions = filterConfig.originalGroupedOptions || filterConfig.groupedOptions;
      for (const group of groupedOptions || []) {
        const option = group.options?.find((opt: any) => opt.value === value);
        if (option) {
          return option.label || option.key || String(value);
        }
      }
    }

    // Check regular options array
    if (filterConfig.options) {
      const option = filterConfig.options.find((opt: any) => opt.value === value);
      if (option) {
        return option.label || option.key || String(value);
      }
    }

    // For date_of_report, format the date
    if (filterKey === 'date_of_report' && value) {
      const dateStr = String(value);
      if (dateStr.length === 6) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[parseInt(month, 10) - 1] || month;
        return `${monthName} ${year}`;
      }
    }

    return String(value);
  }
  
}
