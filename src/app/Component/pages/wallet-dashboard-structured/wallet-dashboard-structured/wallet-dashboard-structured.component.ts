import { Component, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Console } from 'console';
import * as Highcharts from 'highcharts';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
 import { Constants } from 'src/app/CommoUtils/constants';
import { PrTopFilterStructuredComponent } from '../pr-top-filter-structured/pr-top-filter.component';

@Component({
  selector: 'app-wallet-dashboard-structured',
  templateUrl: './wallet-dashboard-structured.component.html',
  styleUrl: './wallet-dashboard-structured.component.scss'
})

export class WalletDashboardStructuredComponent implements OnInit, AfterViewInit {

  @ViewChildren('childMenu') childMenus!: QueryList<MatMenu>;
  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;
  
  private activeChildMenuIndex: number | null = null;
  private isClosingFromClick: boolean = false;

  toppingsControl = new FormControl([]);
  filters: any[] = [];
  filtersC: any[] = [];
  dependantFilters: any[] = [];
  datasets: any[] = [];
  datasetsC: any[] = [];
  dataSetIdCRQ : any;
  dataSetIdCTRQ : any;
  searchByOptionsTopBar: any[] = [];
  productOptions: any[] = [];
  selectedProducts: any[] = [];
  selectedCities: number[] = [];
  selectedSegments: number[] = [];
  selectedRms: number[] = [];
  selectedComapnyNames: number[] = [];
  selectedCity: string = '';
  searchField: string = '';
  selectDatasetName: string = '';
  page_size = 10;
  searchByOptPageSize = 50;
  page_offset = 0;
  radioValue : any;
  isLoading: boolean;
  isLoadingLendingAnalysis: boolean = false;
  isLoadingLendingAnalysisC: boolean = false;
  isLoadingTrendsLending: boolean = false;
  isLoadingSegmentLevel: boolean = false;
  isLoadingProductLevel: boolean = false;
  isLoadingProductLevelChart: boolean = false;
  isLoadingComparisionFL: boolean = false;
  isFilterApplied: boolean = false;
  hasFiltersApplied: boolean = false;

  selectedItemsMap: { [key: string]: any[] } = {};
  selectedItemsMapC: { [key: string]: any[] } = {};
  appliedFilters: any = {};
  appliedFiltersC: any = {};
  latestDateOfReport : any;
  selectedDateOfReport : any;
  latestDateOfReportShowMap : any;
  latestDateOfReportShow : any;
  latestDateOfReportShowCom : any;
  selectedDateOfReportShowCom : any;
  latestSixDateOfReport : any;
  dateOfReportMap : any;
  lendingAnalysis: any[] =[];
  previousLendingAnalysis: any = null;
  lendingAnalysisC: any[] =[];
  segmentLevelOppData: any[] =[];
  productLevelOppData: any[] =[];
  productLevelChartData: any[] =[];
  customerLevelOppData: any[] =[];
  customerLevelChartData: any[] =[];
  customerWiseProductsData: any[] =[];
  firstLevelDataC: any[] =[];
  totalRecordsCustomer : 0;
  selectedUnit : any = 'Million';
  selectedUnitC : string = 'Million'; 
  selectedViewBy : any;
  topbarProductType :any;

  selectedViewByShow : any;
  trendsLendingChartsData: any;
  totalRecordsProduct: number = 0;
  productWiseCustomerData: any[];
  filtersff: any;
  filtersffP: any;
  filtersffCP: any;
  filtersffC: any;  
  division_value : any;
  division_valueC : any;
  roleId : any;
  roleType : any;
  showComparison: boolean = false;
  clickOnApply: boolean = false;
  firstTimeChamgeComparison: boolean = true;
  isLoadingSearchBy : boolean = true;
  totalRecordsFirstLevel : 0;
  totalRecordsSecondLevel : 0;
  secendLevelViewData: any[];
  firstLevelgroupByColumnName : any; 
  calculationOn: any;
  totalRecordsProductLevel: number;
  totalRecordsCustomerWiseProducts: number;

  searchByDataHistory: { [key: number]: {
    'searchValue': string,
    'isCalled':boolean,
    'dataset_name': string,
    'data': any[],
    'page_size': number,
    'page_offset': number
  }} = {};

  viewHierarchyConfig = {
  Segment: ['seg_name', 'cmca.name', 'employee_name', 'c.name'],
  City: ['cmca.name', 'employee_name', 'c.name'],
  RM: ['employee_name', 'c.name'],
  'Customer': ['c.name'],
  Product: ['cpm.display_name']
  };

  activeLevels : any;

  @ViewChild('prTopFilter') prTopFilterRef!: PrTopFilterStructuredComponent;

  constructor(private renderer: Renderer2, public msmeService: MsmeService, public commonService: CommonService) { }

  searchSubject = new Subject<{ searchText: string, datasetId: number, datasetName: string }>();

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'pr-dashboard-bg');
    
    const divisionMap: any = {
      'Million': 1000000,
      'Billion': 1000000000,
      'Absolute': 1
    };
    this.division_value = divisionMap[this.selectedUnit] || 1000000;
    
    this.getGlobalFilters();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => prev.searchText === curr.searchText)
    ).subscribe(({ searchText, datasetId, datasetName }) => {
      if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        this.page_offset = 0;
        this.callDashboardApi(datasetId, datasetName, false);
        
      }
    });

     this.roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
     this.roleType = this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true);
     console.log('Role Id',this.roleId);
     console.log('Role Type',this.roleType);
     
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const allTriggers = this.menuTriggers.toArray();
      allTriggers.forEach((trigger, triggerIndex) => {
        if (triggerIndex > 0) {
          const menuIndex = triggerIndex - 1;
          
          const originalCloseMenu = trigger.closeMenu.bind(trigger);
          const originalOpenMenu = trigger.openMenu.bind(trigger);
          (trigger as any)._originalCloseMenu = originalCloseMenu;
          (trigger as any)._originalOpenMenu = originalOpenMenu;
          
          Object.defineProperty(trigger, 'closeMenu', {
            value: () => {
              if (this.activeChildMenuIndex !== null && !this.isClosingFromClick) {
                return;
              }
              originalCloseMenu();
            },
            writable: true,
            configurable: true
          });
          
          Object.defineProperty(trigger, 'openMenu', {
            value: () => {
              if (this.activeChildMenuIndex !== null && 
                  this.activeChildMenuIndex !== menuIndex && 
                  !this.isClosingFromClick) {
                return;
              }
              originalOpenMenu();
            },
            writable: true,
            configurable: true
          });
        }
      });
      
      const globalMouseHandler = (e: MouseEvent) => {
        if (this.activeChildMenuIndex !== null && !this.isClosingFromClick) {
          const target = e.target;
          if (target && target instanceof HTMLElement && target.closest('.filter_option_menu_new button[mat-menu-item]')) {
            const allTriggers = this.menuTriggers.toArray();
            allTriggers.forEach((trigger) => {
              if (trigger.menuOpen) {
                e.stopPropagation();
                e.stopImmediatePropagation();
              }
            });
          }
        }
      };
      
      document.addEventListener('mouseenter', globalMouseHandler, true);
      document.addEventListener('mouseover', globalMouseHandler, true);
      document.addEventListener('mouseleave', (e: MouseEvent) => {
        if (this.activeChildMenuIndex !== null && !this.isClosingFromClick) {
          const target = e.target;
          if (target && target instanceof HTMLElement && target.closest('.filter_option_menu_new')) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }
      }, true);
      
      this.childMenus.forEach((menu, index) => {
        menu.closed.subscribe(() => {
          if (this.activeChildMenuIndex === index && !this.isClosingFromClick) {
            const reopen = () => {
              if (this.activeChildMenuIndex === index && !this.isClosingFromClick) {
                const triggers = this.menuTriggers.toArray();
                const childTrigger = triggers[index + 1];
                if (childTrigger && !childTrigger.menuOpen) {
                  const originalOpenMenu = (childTrigger as any)._originalOpenMenu;
                  if (originalOpenMenu) {
                    originalOpenMenu();
                  }
                }
              }
            };
            
            requestAnimationFrame(reopen);
            setTimeout(reopen, 5);
            setTimeout(reopen, 15);
            setTimeout(reopen, 30);
          } else if (this.activeChildMenuIndex === index && this.isClosingFromClick) {
            this.activeChildMenuIndex = null;
          }
        });
      });
    }, 100);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'pr-dashboard-bg');
  }

  onMenuItemHover(event: Event, index: number) {
    if (this.activeChildMenuIndex !== null) {
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  onMenuItemLeave(event: Event, index: number) {
    if (this.activeChildMenuIndex !== null) {
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  onParentMenuItemClick(event: Event, index: number, datasetId: number, datasetName: string) {
    event.stopPropagation();
    event.preventDefault();
    
    this.isClosingFromClick = true;
    setTimeout(() => {
      this.isClosingFromClick = false;
    }, 300);
    
    if (this.activeChildMenuIndex === index) {
      const openChildMenu = document.querySelector('.cdk-overlay-pane .filter_menuBar');
      if (openChildMenu) {
        return;
      }
    }
    
    if (this.activeChildMenuIndex !== null && this.activeChildMenuIndex !== index) {
      this.closeCurrentChildMenu();
      
      setTimeout(() => {
        this.openChildMenu(index, datasetId, datasetName);
      }, 150);
    } else {
      this.openChildMenu(index, datasetId, datasetName);
    }
  }
  
  private closeCurrentChildMenu() {
    if (this.activeChildMenuIndex !== null) {
      const allTriggers = this.menuTriggers.toArray();
      const currentTrigger = allTriggers[this.activeChildMenuIndex + 1];
      
      if (currentTrigger && currentTrigger.menuOpen) {
        const originalCloseMenu = (currentTrigger as any)._originalCloseMenu;
        if (originalCloseMenu) {
          originalCloseMenu();
        } else {
          this.isClosingFromClick = true;
          currentTrigger.closeMenu();
          setTimeout(() => {
            this.isClosingFromClick = false;
          }, 50);
        }
      }
    }
  }
  
  private openChildMenu(index: number, datasetId: number, datasetName: string) {
    this.activeChildMenuIndex = index;
    
    this.callDashboardApi(datasetId, datasetName, false);
    
    setTimeout(() => {
      const allTriggers = this.menuTriggers.toArray();
      const childTrigger = allTriggers[index + 1];
      
      if (childTrigger && !childTrigger.menuOpen) {
        const originalOpenMenu = (childTrigger as any)._originalOpenMenu;
        if (originalOpenMenu) {
          originalOpenMenu();
        } else {
          const tempActiveIndex = this.activeChildMenuIndex;
          this.activeChildMenuIndex = null;
          childTrigger.openMenu();
          this.activeChildMenuIndex = tempActiveIndex;
        }
      }
    }, 100);
  }

  onUnitChanged(selectedUnit: string) {
    console.log('Selected Unit from Child:', selectedUnit);
    const filtersFromChild = this.prTopFilterRef.getAppliedFilterList();
    this.selectedUnit = selectedUnit;

    const divisionMap: any = {
      'Million': 1000000,
      'Billion': 1000000000,
      'Absolute':1
    };

     this.division_value = divisionMap[selectedUnit] || 1;

    this.filtersff = {
      ...this.filtersff,
      product_type: filtersFromChild?.product_type || null,
      "division_value":  this.division_value,
    };

    this.setAllLoadersTrue();

    if(selectedUnit == 'Absolute'){
      this.AllDefaulApiCall(true);
    }else{
      this.AllDefaulApiCall();
    }
  }

  onUnitChangedC(selectedUnit: string) {
    console.log('Selected Unit from Child:', selectedUnit);
    this.selectedUnitC = selectedUnit;

    const divisionMap: any = {
      'Million': 1000000,
      'Billion': 1000000000,
      'Absolute':1
    };

     this.division_valueC = divisionMap[selectedUnit] || 1;

    this.filtersffC = {
      ...this.filtersffC,
      "division_value":  this.division_valueC,
    };

      this.AllDefaulApiCallC();
  }

  onViewByChanged(selectedViewBy: string){
    this.selectedViewBy = selectedViewBy;
    console.log('View By',selectedViewBy);
    this.activeLevels = this.viewHierarchyConfig[selectedViewBy] || [];
    
  }

  onPageChangeCustomerLevel(event: any) {
  console.log('Pagination event from child:', event);
  const sortSearchReq = {
    order_by_column: event.order_by_column,
    order_by_type: event.order_by_type,
    column_search_filter: event.column_search_filter
  }
  this.getCustomerLeveltableData(event.pageSize, event.offset, sortSearchReq);
}

  getGlobalFilters() {
    const req = {
      dashboard_id:2 
    }
    this.msmeService.getPRDashboardFilter(req).subscribe(
      (response) => {
        console.log('Filter', response?.data)
        if (response) {
          if (response && response.data?.filters) {
            this.filters = response.data.filters;
            this.datasets = response.data.datasets;
            this.setupSearchByMenu();
            this.searchByOptionsTopBar.forEach(opt => this.searchByDataHistory[opt.dataset_id] = {
              searchValue: '',
              isCalled: false,
              page_offset: -1,
              page_size: 10,
              data: [],
              dataset_name: opt.dataset_name
            });
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

    getComparisonGlobalFilters() {
    const req = {
      dashboard_id:3 
    }
    this.msmeService.getPRDashboardFilter(req).subscribe(
      (response) => {
        console.log('Filter', response?.data)
        if (response) {
          if (response && response.data?.filters) {
            this.filtersC = response.data.filters;
            this.datasetsC = response.data.datasets;
            console.log("Comparison",this.filtersC);
            
            // this.setupSearchByMenu();
            // this.searchByOptionsTopBar.forEach(opt => this.searchByDataHistory[opt.dataset_id] = {
            //   searchValue: '',
            //   isCalled: false,
            //   page_offset: -1,
            //   page_size: 10,
            //   data: [],
            //   dataset_name: opt.dataset_name
            // });
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

    getLendingAnalysis() {
    this.isLoadingLendingAnalysis = true;
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'lending_analysis')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersff
    }
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingLendingAnalysis = false;
        if (response) {
          if (response && response.data?.data) {
            this.lendingAnalysis = response.data.data[0];
            console.log('lending',this.lendingAnalysis);
            this.getPreviousLendingAnalysis();
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingLendingAnalysis = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

  getPreviousLendingAnalysis() {
    const currentDateIndex = this.latestSixDateOfReport.indexOf(this.filtersff.date_of_report);
    if (currentDateIndex === -1 || currentDateIndex >= this.latestSixDateOfReport.length - 1) {
      this.previousLendingAnalysis = null;
      return;
    }
    
    const previousDate = this.latestSixDateOfReport[currentDateIndex + 1];

    console.log('current date: ', currentDateIndex, 'previous date: ', previousDate);

    const previousFilters = {
      ...this.filtersff,
      date_of_report: previousDate
    };
    
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'lending_analysis')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters: previousFilters
    };
    
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response && response.data?.data) {
          this.previousLendingAnalysis = response.data.data[0];
        }
      },
      (error) => {
        console.error('Error fetching previous lending analysis:', error);
        this.previousLendingAnalysis = null;
      }
    );
  }

    getInsightsAnalysisC() {
    this.isLoadingLendingAnalysisC = true;
    const req = {
      dataset_id: this.datasetsC.find(d => d.dataset_name === 'insights_analysis')?.dataset_id || null,
      dashboard_id: 3,
             source_id:3,
      filters : this.filtersffC
    }
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingLendingAnalysisC = false;
        if (response) {
          if (response && response.data?.data) {
            this.lendingAnalysisC = response.data.data[0];      
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingLendingAnalysisC = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

  getTrendsLendingCharts() {
    this.isLoadingTrendsLending = true;
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'trends_of_lending')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersff
    }
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingTrendsLending = false;
        if (response) {
          if (response && response.data?.data) {
            this.trendsLendingChartsData = response.data.data;
            console.log('trendsLendingChartsData',this.trendsLendingChartsData);
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingTrendsLending = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

    getSegmentLevelOppCharts() {
    this.isLoadingSegmentLevel = true;
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'segment_level_opportunity')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersff
    }
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingSegmentLevel = false;
        if (response) {
          if (response && response.data?.data) {
            this.segmentLevelOppData = response.data.data;
            console.log('segment_level_opportunity',this.segmentLevelOppData);
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingSegmentLevel = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

    getProductLevelChartData(sortSearchReq: any = null) {
    this.isLoadingProductLevelChart = true;
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'product_level_chart')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : {
        ...this.filtersff,
      }
    }
  
    console.log('req getProductLevelOppCharts:: ', req);
    
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingProductLevelChart = false;
        if (response) {
          if (response && response.data?.data) {
            this.productLevelChartData = response.data.data;
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingProductLevelChart = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );
  }

  getProductLevelOppCharts(sortSearchReq: any = null) {
    this.isLoadingProductLevel = true;
    const filtersFromChild = this.prTopFilterRef.getAppliedFilterList();

    let orderByCol = sortSearchReq?.order_by_column;
    let orderByType = sortSearchReq?.order_by_type;
      
    orderByCol = orderByCol === "" ? null : orderByCol;
    orderByType = orderByCol ? orderByType : null;

    console.log('getProductLevelOppCharts {}{}{}', sortSearchReq);

    this.filtersffP = {
        ...this.filtersff,
        product_type: filtersFromChild?.product_type || null,
        page_size: sortSearchReq?.pageSize || 10,
        page_offset: sortSearchReq?.offset || 0,
        order_by_column: orderByCol,
        order_by_type: orderByType,
        column_search_filter: sortSearchReq?.column_search_filter
      }

    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'product_level_opportunity')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersffP
    }
  
    console.log('req getProductLevelOppCharts:: ', req);
    
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingProductLevel = false;
        if (response) {
          if (response && response.data?.data) {
            this.productLevelOppData = response.data.data;
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingProductLevel = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

    this.setTotalRecords('product_level_opportunity_total_rows');
  }

   getCustomerLeveltableData(pageSize?: number, offset?: number, sortSearchReq: any = null) {
      this.isLoadingProductLevel = true;

      let orderByCol = sortSearchReq?.order_by_column;
      let orderByType = sortSearchReq?.order_by_type;
      
      orderByCol = orderByCol === "" ? null : orderByCol;
      orderByType = orderByCol ? orderByType : null;
      
      this.filtersff = {
      ...this.filtersff,
      product_type: this.topbarProductType,
      page_size: pageSize,
      page_offset: offset,
      order_by_column: orderByCol,
      order_by_type: orderByType,
      column_search_filter: sortSearchReq?.column_search_filter
    };

    console.log('Pagination event from chil', this.filtersff);
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'customer_level_opportunity')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersff
    }
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingProductLevel = false;
        if (response) {
          if (response && response.data?.data) {
            this.customerLevelOppData = response.data.data;
            
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingProductLevel = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

    this.getCustomerLeveltableTotalRecord();

  }

  
    getCustomerLeveltableTotalRecord() {
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'customer_level_opportunity_total_rows')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersff
    }
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data?.data) {
            this.totalRecordsCustomer = response.data.data[0]?.total_rows; 
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

   getProductLeveltableTotalRecord() {
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'particular_product_wise_customer_level_total_rows')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersff
    }
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data?.data) {
            this.totalRecordsProduct = response.data.data[0].total_rows; 
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

  setTotalRecords(dataset_name: string) {

    const filterMap: any = {
      particular_customer_wise_product_level_total_rows: this.filtersffCP,
      product_level_opportunity_total_rows: this.filtersffP
    };

    const selectedFilters = filterMap[dataset_name] || this.filtersff;

    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === dataset_name)?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters: selectedFilters
    }
    
    console.log('setTotalRecords req:::: ', req);
    
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data?.data) {
            const totalRecords = response.data.data[0]?.total_rows;
            switch(dataset_name) {
              case 'particular_customer_wise_product_level_total_rows':
                this.totalRecordsCustomerWiseProducts = totalRecords; 
                break;
              case 'product_level_opportunity_total_rows':
                this.totalRecordsProductLevel = totalRecords; 
                break;
              default:
                console.log('insdie default setTotalRecords');
                break;
            }
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );
  }

      getCustomerLevelChartData() {
    this.isLoadingProductLevel = true;
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'customer_level_wallet_chart')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersff
    }
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingProductLevel = false;
        if (response) {
          if (response && response.data?.data) {
            this.customerLevelChartData = response.data.data;
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingProductLevel = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

  getCustomerLevelWiseProduct(customerReq: any) {
    
    let orderByCol = customerReq?.order_by_column;
    let orderByType = customerReq?.order_by_type;

    orderByCol = orderByCol == '' ? null : orderByCol;
    orderByType = orderByCol ? orderByType : null;

    this.filtersffCP = {
      ...this.filtersff,
      product_type: this.topbarProductType,
      cust_name: [customerReq.customerName],
      order_by_column: orderByCol,
      order_by_type: orderByType,
      page_size: customerReq?.pageSize || 5,
      page_offset: customerReq?.offset || 0,
      column_search_filter: customerReq?.column_search_filter,
    };

    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'particular_customer_wise_product_level')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersffCP,
    }
    console.log('req getCustomerLevelWiseProduct:: ', req);
   
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data?.data) {
            this.customerWiseProductsData = response.data.data;
            console.log('customerWiseProductsData',this.customerWiseProductsData);         
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

    this.setTotalRecords('particular_customer_wise_product_level_total_rows');
  }

  setupSearchByMenu() {
    const searchByFilter = this.filters.find(f => f.filter_name === 'search_by');

    if (searchByFilter) {
      this.searchByOptionsTopBar = searchByFilter.options.map(opt => {
        const matchedDataset = this.datasets.find(d => d.dataset_name === opt.value);
        const filterName = this.filters.find(f => f.filter_label === opt.key)?.filter_name;
        return {
          ...opt,
          dataset_id: matchedDataset ? matchedDataset.dataset_id : null,
          dataset_name: matchedDataset ? matchedDataset.dataset_name : null,
          filter_name: filterName
        };
      });
    }

    const latestDateOfReport = this.filters.find(f => f.filter_name === 'date_of_report');
    if (latestDateOfReport && latestDateOfReport.options?.length) {
      const dateOfReportOptions = latestDateOfReport.options.filter(o => o.value);
       this.latestDateOfReport = dateOfReportOptions[0]?.value;
       this.latestSixDateOfReport = dateOfReportOptions.map(o => o.value);
       this.dateOfReportMap = new Map(latestDateOfReport.options.map(opt => [opt.value, opt.key]));
       console.log('this.dateOfReportMap ',this.dateOfReportMap);
       

      console.log("Latest",this.latestDateOfReport)
      this.filtersff = {
      ...this.filtersff,
      "role_id":this.roleId,
      "role_type":this.roleType,
      "which_level":1,
      "date_of_report": this.latestDateOfReport,
      "latest_6_report_date":this.latestSixDateOfReport,
      "division_value": this.division_value || 1000000,
    };
    this.latestDateOfReportShow= this.dateOfReportMap.get(this.latestDateOfReport);
    console.log('this.latestDateOfReportShow',this.latestDateOfReportShow);
    
    }
  }

  AllDefaulApiCall(skipForChart : boolean = false){
    console.log('skipForChart',skipForChart);
    
    this.getLendingAnalysis();
    this.getTrendsLendingCharts();
    this.getSegmentLevelOppCharts();
      this.getProductLevelOppCharts();
      this.getProductLevelChartData();
      this.getCustomerLeveltableData(10,0);
      this.getCustomerLevelChartData();
  }

  AllDefaulApiCallC(){
      this.getInsightsAnalysisC();
      this.onFetchFirstLevelView();
  }

  onSelectField(event: any, filterName: string, selectId: number, datasetId: number) {
    if (!this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];
    }
    if (event.checked) {
      if (!this.selectedItemsMap[filterName].includes(selectId)) {
        if(selectId == -1) {
          this.dependantFilters.forEach(filter => {
            this.selectedItemsMap[filterName].push(filter.value);
          });
        } else {
          this.selectedItemsMap[filterName].push(selectId);
        }
      }
    } else {
      if(selectId === -1) {
        this.selectedItemsMap[filterName] = [];
      } else {
        this.selectedItemsMap[filterName] = this.selectedItemsMap[filterName].filter(id => id != selectId && id != -1);
      }
    }
    const searchValue = this.searchByDataHistory[datasetId]?.searchValue || '';
    if(this.dependantFilters.length - this.selectedItemsMap[filterName].length === 1 && searchValue.trim().length === 0) {
      this.selectedItemsMap[filterName].push(-1);
    }
  }

  onCustomerSelected(customerName: string) {
  console.log('Expanded customer:', customerName);
  this.getCustomerLevelWiseProduct({customerName: customerName});
}

  callDashboardApi(dataSetid: number, dataSetName: any, append: boolean = false, filterName: string = null) {
    if (!append) {
      this.page_offset = 0;
    }

    const searchValue = this.searchByDataHistory[dataSetid].searchValue;

    if(this.searchByDataHistory[dataSetid].isCalled) {
      this.dependantFilters = this.searchByDataHistory[dataSetid].data;
      console.log('not calling api');
      return;
    }

    const payload = {
    dashboard_id: 2,
      dataset_id: dataSetid,
      [dataSetName]: searchValue.trim().length > 2 ? searchValue.trim() : null,
      page_size: this.searchByOptPageSize,
      page_offset: this.page_offset
    };
    console.log("payload", payload);
    this.msmeService.getPrDashboardDependentFilterData(payload).subscribe({
      next: (res) => {
        if (res && res.data?.data) {
          let newData = res.data.data;
          if (searchValue.trim().length > 0) {
            newData = newData.filter(item => item.value !== -1);
          }
          if (append) {
            const existingValues = new Set(this.dependantFilters.map(item => item.value));
            const uniqueNewData = newData.filter(item => !existingValues.has(item.value));
            this.dependantFilters = [...this.dependantFilters, ...uniqueNewData];
          } else {
            this.dependantFilters = newData;
          } 
          this.searchByDataHistory[dataSetid].data = this.dependantFilters;
          this.searchByDataHistory[dataSetid].page_offset = this.page_offset;
          this.searchByDataHistory[dataSetid].page_size = this.page_size;
          this.searchByDataHistory[dataSetid].isCalled = true;

          if(this.selectedItemsMap[filterName] && this.selectedItemsMap[filterName].includes(-1)) {
            this.dependantFilters.forEach(filter => {
              if(!this.selectedItemsMap[filterName].includes(filter.value)) {
                this.selectedItemsMap[filterName].push(filter.value);
              }
            });
          }
        }
        this.isLoading = false;
        this.isLoadingSearchBy = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
        this.isLoadingSearchBy = false;
      }
    });
  }

  handleAppliedFilters(selectedFilters: any) {
  
    this.latestDateOfReportShow= this.dateOfReportMap.get(selectedFilters?.date_of_report);

    this.appliedFilters = selectedFilters;
    if(selectedFilters) {
      this.setAllFilters(selectedFilters);
      this.topbarProductType = selectedFilters.product_type;
    }
    this.radioValue = selectedFilters.which_level ?? this.radioValue;
    this.filtersff = {
      ...this.selectedItemsMap,
      "global_primary_rm_id": [
      ],
      "role_id":this.roleId,
      "which_level": this.radioValue,
      "role_type":this.roleType,
      "latest_6_report_date":this.latestSixDateOfReport,
      "division_value": this.division_value || 1000000,
      "page_size": this.page_size,
      "page_offset": this.page_offset
    };

     console.log(this.filtersff);

    this.setAllLoadersTrue();
    this.AllDefaulApiCall();
  }

  onFiltersStateChanged(hasFilters: boolean) {
    this.hasFiltersApplied = hasFilters;
  }

    handleAppliedFiltersC(selectedFilters: any) {
    this.isFilterApplied = true;
    this.clickOnApply = true;
    this.selectedViewByShow= this.selectedViewBy;
    this.appliedFiltersC = selectedFilters;
    if(selectedFilters) {
      this.setAllFiltersC(selectedFilters);
    }
    this.selectedDateOfReport = selectedFilters?.date_of_report;
    this.latestDateOfReportShowCom= this.dateOfReportMap.get(this.latestDateOfReport);
    this.selectedDateOfReportShowCom= this.dateOfReportMap.get(this.selectedDateOfReport);
    this.filtersffC = {
      ...this.selectedItemsMapC,
      "global_primary_rm_id": [
      ],
      "role_id":this.roleId,
      "role_type":this.roleType,
      "latest_date_of_report": this.latestDateOfReport,
      "selected_date_of_report": this.selectedDateOfReport,
      "division_value": this.division_valueC || 1000000,
      "page_size": this.page_size,
      "page_offset": this.page_offset
    };

     console.log(this.filtersffC);
     this.firstLevelgroupByColumnName = selectedFilters?.group_by_column;
     this.calculationOn =selectedFilters?.calculation_on;

    this.AllDefaulApiCallC();
    setTimeout(() => this.isFilterApplied = false, 0);
  }

  handleAppliedResetC(selectedFilters: any) {
    this.clickOnApply = false;
  }

  onSearchChange(searchValue: string, datasetId: number, datasetName: string) {
    this.searchByDataHistory[datasetId].searchValue = searchValue;
    this.searchByDataHistory[datasetId].isCalled = false;
    this.searchSubject.next({ searchText: searchValue, datasetId, datasetName });
  }

  getSelectedCount(filter_name: string): number {
    return this.selectedItemsMap[filter_name]?.length || 0;
  }

  getSearchByIcon(key: string): string {
    if (!key) return 'fas fa-map-marker-alt';
    
    const iconMap: { [key: string]: string } = {
      'City': 'fas fa-map-marker-alt',
      'Customer': 'fas fa-layer-group',
      'Company Name': 'fas fa-layer-group',
      'RM': 'fas fa-user',
      'Segment': 'fas fa-cube'
    };
    
    const trimmedKey = key.trim();
    const iconClass = iconMap[key] || iconMap[trimmedKey] || 'fas fa-map-marker-alt';
    
    return iconClass;
  }

  setAllFilters(childFilters: any) {
    for(const key of Object.keys(childFilters)) {
      this.selectedItemsMap[key] = childFilters[key];
    }
  }

  setAllFiltersC(childFilters: any) {
    for(const key of Object.keys(childFilters)) {
      this.selectedItemsMapC[key] = childFilters[key];
    }
  }

  applyFilters() {
    this.isFilterApplied = true;
    const appliedFilters = [];

    console.log('selected items map: ', this.selectedItemsMap);

    const filtersFromChild = this.prTopFilterRef.getAppliedFilterList();
    console.log('Applied Filters:', filtersFromChild);

    // Check if any search by filters are applied
    const hasSearchByFilters = Object.keys(this.selectedItemsMap).some(key => 
      this.selectedItemsMap[key] && this.selectedItemsMap[key].length > 0
    );
    this.hasFiltersApplied = hasSearchByFilters;

    if(filtersFromChild) {
      this.setAllLoadersTrue();
      this.handleAppliedFilters(filtersFromChild);
    }

    console.log('selected items map => ', this.selectedItemsMap);
    console.log('payload from parent: ',this.getFilterPayload());

    setTimeout(() => this.isFilterApplied = false, 0);
  }

  getFilterPayload() {
    return {
      dashboard_id: 2,
      source_id:3,
      filters: this.selectedItemsMap
    }
  }

  resetAllFilters() {
  this.isFilterApplied = true;
  this.hasFiltersApplied = false;
  this.selectedItemsMap = {};
  this.dependantFilters = this.dependantFilters.map(item => ({
    ...item,
    checked: false
  }));
  Object.keys(this.searchByDataHistory).forEach(key => {
    this.searchByDataHistory[key].searchValue = '';
    this.searchByDataHistory[key].isCalled = false;
  });
  this.setAllLoadersTrue();
  const filters = this.prTopFilterRef?.getAppliedFilterList();
  this.handleAppliedFilters(filters);

  setTimeout(() => this.isFilterApplied = false, 0);
  this.searchByOptionsTopBar.forEach(opt => {
    this.callDashboardApi(opt.dataset_id, opt.dataset_name, false, opt.filter_name);
  });
}

  resetFilters(datasetId: number,dataSetName : any, filterName: string) {
  this.isFilterApplied = true;
  if (this.selectedItemsMap[filterName]) {
    this.selectedItemsMap[filterName] = [];
  }

  this.dependantFilters = this.dependantFilters.map(item => {
    if (item.dataset_id === datasetId) {
      return { ...item, checked: false };
    }
    return item;
  });

  this.searchByDataHistory[datasetId].searchValue = '';
  this.searchByDataHistory[datasetId].isCalled = false;
  
  // Check if any filters are still applied
  const hasAnyFilters = Object.keys(this.selectedItemsMap).some(key => 
    this.selectedItemsMap[key] && this.selectedItemsMap[key].length > 0
  );
  this.hasFiltersApplied = hasAnyFilters;
  
  this.setAllLoadersTrue();
  const filtersFromChild = this.prTopFilterRef.getAppliedFilterList();
  this.handleAppliedFilters(filtersFromChild);
  setTimeout(() => this.isFilterApplied = false, 0);
  this.callDashboardApi(datasetId, dataSetName, false, filterName);
  }

  onScroll(event: Event, dataSetid: number, dataSetName: any, filterName: string) {
    const element = event.target as HTMLElement;
    const threshold = 1;
    const scrollPercentage = (element.scrollTop + element.clientHeight) / element.scrollHeight;
    const atMiddle = scrollPercentage >= 0.5;
    
    if (atMiddle && !this.isLoading && this.searchByDataHistory[dataSetid].searchValue.trim().length < 3) {
      this.isLoading = true;

      this.page_offset = this.searchByDataHistory[dataSetid].page_offset;
      this.page_offset += this.page_size;

      this.searchByDataHistory[dataSetid].isCalled = false;
      console.log('offset: ', this.page_offset)

      this.callDashboardApi(dataSetid, dataSetName, true, filterName);
    }
  }


onFetchProductLevelCustomers(productLevelReq: any) {
    console.log('productLevelReq::: ', productLevelReq);
    const sortSearchReqObj = productLevelReq?.sortSearchReq;

    let orderByCol = productLevelReq?.order_by_column;
    let orderByType = productLevelReq?.order_by_type;

    orderByCol = orderByCol === "" ? null : orderByCol;
    orderByType = orderByCol ? orderByType : null;

    this.filtersff = {
      ...this.filtersff,
      product_type: [productLevelReq.productId],
      page_offset: productLevelReq.offset,
      page_size: productLevelReq.pageSize,
      order_by_column: orderByCol,
      order_by_type: orderByType,
      column_search_filter: productLevelReq?.column_search_filter,
      cust_name: null
    }

    console.log('consolgesdgs filters', this.filtersff);
    
    const req = {
      dataset_id: this.datasets.find(d => d.dataset_name === 'particular_product_wise_customer_level')?.dataset_id || null,
      dashboard_id: 2,
      source_id:3,
      filters : this.filtersff
    }

    console.log('datasets: ', this.datasets);
    console.log('requesting product level customers ', req);
    
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe((response) => {
      console.log('response => ', response);
      this.productWiseCustomerData = response.data.data;
      console.log('product wise customer data::: ', this.productWiseCustomerData);
    })

    this.getProductLeveltableTotalRecord();
  }

    onFetchFirstLevelView(firstLevelReq?: any) {
    
    this.firstLevelgroupByColumnName = this.activeLevels[0];

    const sortSearchReqObj = firstLevelReq?.sortSearchReq;
    const currentLevelKey = this.firstLevelgroupByColumnName;
      
      this.filtersffC = {
      ...this.filtersffC,
      ...(currentLevelKey !== 'c.name'  && currentLevelKey !== 'cpm.display_name' ? { [currentLevelKey]: null } : {}),
      group_by_column : this.firstLevelgroupByColumnName,

      page_offset: firstLevelReq?.offset || 0,
      page_size: firstLevelReq?.pageSize || 10,
      ...sortSearchReqObj
    }

    this.dataSetIdCRQ = this.datasetsC.find(d => d.dataset_name === 'report_query')?.dataset_id || null;

    const req = {
      dataset_id: this.datasetsC.find(d => d.dataset_name === 'report_query')?.dataset_id || null,
      dashboard_id: 3,
             source_id:3,
      filters: this.filtersffC
    }
   
    this.isLoadingComparisionFL = true;
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        this.isLoadingComparisionFL = false;
        if (response) {
          if (response && response.data?.data) {
            this.firstLevelDataC = response.data.data;      
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        this.isLoadingComparisionFL = false;
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

    this.getFirstLevelViewTotalRecord();
  }

  onFetchSecendLevelView(secondLevelReq: any) {

  const currentLevelIndex = this.activeLevels.findIndex(
    level => level === this.firstLevelgroupByColumnName
  );

    let nextLevelColumn = this.activeLevels[currentLevelIndex + 1];
    if (this.firstLevelgroupByColumnName === 'cpm.display_name') {
      nextLevelColumn = 'c.name';
    }

    if (!nextLevelColumn) return;

   const sortSearchReq = secondLevelReq?.sortSearchReq;

  const currentLevelKey = this.firstLevelgroupByColumnName;

    this.filtersffC = {
      ...this.filtersffC,
      [currentLevelKey] : secondLevelReq.parentSelectName,
      group_by_column: nextLevelColumn,
      gain_or_loss : 3,
      wallet_min: null,
      wallet_max:null,
      page_offset: secondLevelReq.offset,
      page_size: secondLevelReq.pageSize,
      ...sortSearchReq
    }

    const req = {
      dataset_id: this.datasetsC.find(d => d.dataset_name === 'report_query')?.dataset_id || null,
      dashboard_id: 3,
             source_id:3,
      filters: this.filtersffC
    }

    console.log('requesting onFetchSecendLevelView ', req);
    
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe((response) => {
      console.log('response => ', response);
      this.secendLevelViewData = response.data.data;
      console.log('secendLevelViewData data::: ', this.secendLevelViewData);
    })

    this.getSecondLevelViewTotalRecord();
  }

    getFirstLevelViewTotalRecord() {
    
    this.dataSetIdCTRQ = this.datasetsC.find(d => d.dataset_name === 'report_total_rows_query')?.dataset_id || null;

    const req = {
      dataset_id: this.datasetsC.find(d => d.dataset_name === 'report_total_rows_query')?.dataset_id || null,
      dashboard_id: 3,
             source_id:3,
      filters : this.filtersffC
    }

    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data?.data) {
            this.totalRecordsFirstLevel = response?.data?.data[0]?.total_rows;
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );
  }

  getSecondLevelViewTotalRecord() {
    const req = {
      dataset_id: this.datasetsC.find(d => d.dataset_name === 'report_total_rows_query')?.dataset_id || null,
      dashboard_id: 3,
             source_id:3,
      filters : this.filtersffC
    }

    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data?.data) {
            this.totalRecordsSecondLevel = response.data.data[0].total_rows; 
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );
  }


  onSummaryChange(value: boolean) {
  console.log('Summary toggle changed:', value);
  this.showComparison = value;
  if(value && this.firstTimeChamgeComparison){
    this.getComparisonGlobalFilters();
    this.firstTimeChamgeComparison = false;
  }
  }

    onProductOrCusomerLvlSortSearch(req: any) {
    switch(req?.apiType) {
      case 'productWiseCustomerData':
        req['offset'] = 0,
        req['pageSize'] = 5
        console.log('productWiseCustomerData consolgew: ', req);
        this.onFetchProductLevelCustomers(req);
        break;

      case 'productLevelOppData':
        console.log('productLevelOppData consolgew: ', req);
        this.isLoadingProductLevel = true;
        this.getProductLevelOppCharts(req?.sortSearchReq);
        break;

      case 'customerWiseProductsData':
        console.log('customerWiseProductsData consolgew: ', req);
        req['customerName'] = req.cust_name;
        this.getCustomerLevelWiseProduct(req);
        break;

      case 'customerLevelOppData':
        console.log('customerLevelOppData consolgew: ', req);
        this.getCustomerLeveltableData(10, 0, req);
        break;

      default:
        console.log('inside default...');
    }
  }

  emitExcelDownloadProductLevel(downReq: any) {
    this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…')
    let dataset_id = null;
    let excel_columns = null;

    if (downReq.prodOrCustlevel === 'Product Level') {
      dataset_id = this.datasets.find(
        d => d.dataset_name === 'product_level_opportunity_fetch_excel'
      )?.dataset_id || null;
      excel_columns= downReq.prodExcelColumn;
    } else {
      dataset_id = this.datasets.find(
        d => d.dataset_name === 'customer_level_opportunity_fetch_excel'
      )?.dataset_id || null;
      excel_columns= downReq.custExcelColumn;
    }

    const cleanExcelColumns = excel_columns.map(col =>
      col.replace(/[^\x20-\x7E]/g, '')
    );

    const latestDateOfReportShow = this.latestDateOfReportShow;
    const selectedUnit = this.selectedUnit;
    const excelConfigReq = {
        filename: "my_report.xlsx",
        excel_columns: cleanExcelColumns,
        data_summary: [
          {
            report_month: `Date Of Report - ${latestDateOfReportShow}`,
            currency: "Currency - INR",
            unit: `Unit - ${selectedUnit}`
          }
        ]
    };

    // Ensure we use all selected filter IDs for export, not just the opened product
    const filtersFromChild = this.prTopFilterRef.getAppliedFilterList();
    const exportFilters = {
      ...this.filtersff,
      product_type: filtersFromChild?.product_type || this.selectedItemsMap?.product_type || this.filtersff.product_type
    };

    const req = {
      dataset_id: dataset_id,
      dashboard_id: 2,
      source_id:3,
      filters: exportFilters,
      export_excel: 1,
      excel_configs : excelConfigReq,
    }
   
      this.msmeService.downloadExcelPR(req).subscribe(
        (res) => {
          if (res.status === 200 && res.contentInBytes) {
            const downloadDate = this.getDownloadDate();
            const fileName =`PR Dashboard_${downReq.prodOrCustlevel}_${downloadDate}.xlsx`;
            this.downloadExcel(res.contentInBytes, fileName);
          } else {
            this.commonService.warningSnackBar(res.message);
          }
        },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

    emitComaprisonExcelDownload(downReq: any) {
    this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…')
    let dataset_id = 69;
    let excel_columns= downReq.comaprisonExcelColumn;

    const cleanExcelColumns = excel_columns.map(col =>
      col.replace(/[^\x20-\x7E]/g, '')
    );

    const selectedDateOfReportShowCom = this.selectedDateOfReportShowCom;
    const selectedUnit = this.selectedUnitC;
    const excelConfigReq = {
        filename: "my_report.xlsx",
        excel_columns: cleanExcelColumns,
        data_summary: [
          {
            report_month: `Date Of Report - ${selectedDateOfReportShowCom}`,
            currency: "Currency - INR",
            unit: `Unit - ${selectedUnit}`
          }
        ]
    };


    const req = {
      dataset_id: dataset_id,
      dashboard_id: 3,
      source_id:3,
      filters: this.filtersffC,
      export_excel: 1,
      excel_configs : excelConfigReq,
    }
   
      this.msmeService.downloadExcelPR(req).subscribe(
        (res) => {
          if (res.status === 200 && res.contentInBytes) {
            const downloadDate = this.getDownloadDate();
            const fileName =`PR Dashboard_${downReq.prodOrCustlevel}_${downloadDate}.xlsx`;
            this.downloadExcel(res.contentInBytes, fileName);
          } else {
            this.commonService.warningSnackBar(res.message);
          }
        },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );

  }

  getDownloadDate(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(',', '');
}

    downloadExcel(byteData: string, fileName: string) {
    const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = fileName;

    a.click();

    window.URL.revokeObjectURL(url);

    a.remove();
  }

  base64toBlob(base64Data: string, contentType: string) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  setAllLoadersTrue() {
    this.isLoadingLendingAnalysis = true;
    this.isLoadingTrendsLending = true;
    this.isLoadingSegmentLevel = true;
    this.isLoadingProductLevel = true;
    this.isLoadingProductLevelChart = true;
  }
}

