import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ScrollButtonsDirective } from 'src/app/Directives/scroll-buttons.directive';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-pr-reconcilation-dashboard',
  templateUrl: './pr-reconcilation-dashboard.component.html',
  styleUrl: './pr-reconcilation-dashboard.component.scss'
})
export class PrReconcilationDashboardComponent {
  @ViewChild('scroll') scroll!: ScrollButtonsDirective;
  modelDate = new Date();
  maxDate = new Date();
  
  // Filter properties
  selectedComparisonType: boolean = false;
  commercialReconsilationSummary: any;
  reconsilationListData: any[] = [];
  commercialReconsilationData: any[] = [];
  
  // Pagination properties
  totalElements: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;  // 0-based for API
  page: number = 1;         // 1-based for ngb-pagination UI
  pageSize: number = 10;
  
  // Search properties
  searchCustomerId: string = '';
  searchPan: string = '';
  sortBy: string = 'pan';
  isLoading : any;
  currentSortField: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  fileId: any;
  pageData: any;
  prdataBoolean: number;
  reconsilationStatus : any;
  activeCard: string = '';
  // Table columns configuration
  // field: API response key for UI display
  // sortField: DB column name for backend sorting
  // searchField: API payload key for search (optional)
  tableColumns = [
    { field: 'customerId', sortField: 'cust_id', label: 'Customer Id', sortable: true, searchField: 'customerId' },
    { field: 'pan', sortField: 'pan', label: 'PAN', sortable: true, searchField: 'pan' },
    { field: 'accountStatus', sortField: 'hsbc_account_status', label: 'Account Status (Bank)', sortable: true },
    { field: 'sanctionAmountHsbc', sortField: 'hsbc_sanctioned_amount', label: 'Sanction Amount (Bank)', sortable: true },
    { field: 'sanctionAmountBureau', sortField: 'bureau_sanctioned_amount', label: 'Sanction Amount (Bureau)', sortable: true },
    { field: 'sanctionVariance', sortField: 'sanction_variance_amount', label: 'Sanction Variance', sortable: true },
    { field: 'outstandingAmountHsbc', sortField: 'hsbc_outstanding_amount', label: 'Outstanding Amount (Bank)', sortable: true },
    { field: 'outstandingAmountBureau', sortField: 'bureau_outstanding_amount', label: 'Outstanding Amount (Bureau)', sortable: true },
    { field: 'outstandingVariance', sortField: 'outstanding_variance_amount', label: 'Outstanding Variance', sortable: true },
    { field: 'productTypeHsbc', sortField: 'hsbc_credit_type', label: 'Product Type (Bank)', sortable: true },
    { field: 'productTypeBureau', sortField: 'bureau_credit_type', label: 'Product Type (Bureau)', sortable: true },
    { field: 'productVariance', sortField: 'credit_type_varince', label: 'Product Variance', sortable: true },
    { field: 'reconsilationStatus', sortField: 'facility_level_status', label: 'Reconciliation Status', sortable: true }
  ];

  ngOnInit(): void {
    this.fileId = history.state?.routerData?.fileId;
    this.pageData = history.state?.data;
    this.prdataBoolean = history.state?.prdataBoolean;
    this.getCommercialReconsilationSummary();
    this.getCommercialReconsilationData('all',true);
  }

  onOpenCalendar(container: any): void {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('month');
  }

  getAlertsSubTabData(_index: number): void {
    // Optional: load data for selected month when needed
  }

    constructor(private msmeService: MsmeService, private commonService: CommonService, private router: Router){
      
    }

    goBack(): void {
      this.router.navigate(['/hsbc/Commercial-Cibil-Bulk-Upload'], { state: { data: this.pageData, prdataBoolean: this.prdataBoolean } });
    }
  
    getCommercialReconsilationSummary(): void {
      // Optional: load data for selected month when needed

      const payload = {
        "fileId": this.fileId,
        "withInSixMonth": this.selectedComparisonType
      };
  
      console.log(payload);
      this.msmeService.getCommercialReconsilationSummaryData(payload).subscribe(res=>{
        console.log("res=========",res);
        if(res?.data){
          this.commercialReconsilationSummary = res.data;
        }else{
            this.commonService.warningSnackBar(res?.message);
        }
      })
  
    }

    getCommercialReconsilationData(reconsilationStatus : any,changeStatus : boolean): void {
      // this.activeCard = reconsilationStatus;
      if(changeStatus){
      if (this.activeCard === reconsilationStatus) {
        this.activeCard = '';
        this.reconsilationStatus = 'all';
      } else {
        this.activeCard = reconsilationStatus;
        this.reconsilationStatus = reconsilationStatus;
      }
      }
      this.isLoading= true;
      const payload: any = {
        "fileId": this.fileId,
        "withInSixMonth": this.selectedComparisonType,
        "reconsilationStatus": this.reconsilationStatus,
        "sortBy": this.currentSortField || this.sortBy,
        "sortDirection": this.sortDirection,
        "page": this.currentPage,
        "size": this.pageSize
      };

      // Add customerId to payload if 3+ characters
      if (this.searchCustomerId && this.searchCustomerId.length >= 3) {
        payload.customerId = this.searchCustomerId;
      }

      // Add pan to payload if 3+ characters
      if (this.searchPan && this.searchPan.length >= 3) {
        payload.pan = this.searchPan;
      }
  
      console.log(payload);
      this.msmeService.getCommercialReconsilationData(payload).subscribe(res=>{
        console.log("res=========",res);
        this.isLoading= false;
        if(res?.listData){
          this.commercialReconsilationData = res.listData;
          this.totalElements = res.totalElements || 0;
          this.totalPages = res.totalPages || 0;
          this.currentPage = res.currentPage || 0;
          this.page = this.currentPage + 1; // Convert 0-based to 1-based for UI
        }else{
            this.commonService.warningSnackBar(res?.message);
        }
      })
  
    }

    onPageChange(pageNumber: number): void {
      this.page = pageNumber;
      this.currentPage = pageNumber - 1; // Convert 1-based UI to 0-based API
      this.getCommercialReconsilationData(this.reconsilationStatus,false);
    }

    onPageSizeChange(): void {
      this.currentPage = 0;
      this.page = 1;
      this.getCommercialReconsilationData(this.reconsilationStatus,false);
    }

    onSearchCustomerId(event: any): void {
      const value = event.target.value;
      this.searchCustomerId = value;
      if (value.length >= 3 || value.length === 0) {
        this.currentPage = 0;
        this.page = 1;
        this.getCommercialReconsilationData(this.reconsilationStatus,false);
      }
    }

    onSearchPan(event: any): void {
      const value = event.target.value.toUpperCase();
      this.searchPan = value;
      event.target.value = value;
      if (value.length >= 3 || value.length === 0) {
        this.currentPage = 0;
        this.page = 1;
        this.getCommercialReconsilationData(this.reconsilationStatus,false);
      }
    }

    applyFilter(): void {
      this.getCommercialReconsilationSummary();
      this.getCommercialReconsilationData(this.reconsilationStatus,false);
    }

    resetFilter(): void {
      this.selectedComparisonType = false;
      this.searchCustomerId = '';
      this.searchPan = '';
      this.currentPage = 0;
      this.page = 1;
      this.getCommercialReconsilationSummary();
      this.getCommercialReconsilationData(this.reconsilationStatus,true);
    }
  
    downloadCommercialReconsilationData(optional : any): void {
    const payload = {
      "fileId": this.fileId,
      "withInSixMonth": optional.withInSixMonth,
      "whichLevelReconsilation": optional.level
    };
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadExcelCommercialReconsilationData(payload).subscribe(
          (res) => {
            if (res?.contentInBytes) {
              const downloadDate = this.getDownloadDate();
               const fileName =`PR Reconciled_${optional.level}_${downloadDate}.xlsx`;
              this.downloadExcel(res.contentInBytes, fileName);
            } else {
              this.commonService.warningSnackBar(res?.message);
            }
          },
        (error) => {
          console.error('Error:', error);
          this.commonService.errorSnackBar('Error while getting Download Reconciled Excel');
        }
      );
      
  }

  downloadOptions = [
    { label: 'Product Level Total', level: 'Product Level', withInSixMonth: false },
    { label: 'Product Level Within 6 Months', level: 'Product Level', withInSixMonth: true },
    { label: 'Customer Level Total', level: 'Customer Level', withInSixMonth: false },
    { label: 'Customer Level Within 6 Months', level: 'Customer Level', withInSixMonth: true }
  ];

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
  
    private formatToYYYYMM(date: Date): number {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JS month starts from 0
      return Number(`${year}${month.toString().padStart(2, '0')}`);
    }

  toggleSort(sortField: string, direction: 'ASC' | 'DESC') {
    this.currentSortField = sortField;
    this.sortDirection = direction;
    this.currentPage = 0;
    this.page = 1;
    this.getCommercialReconsilationData(this.reconsilationStatus,false);
  }

}