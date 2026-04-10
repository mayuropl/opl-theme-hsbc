import { Component, Inject, Optional } from '@angular/core';
import { HSBCBusinessPANComponent } from '../hsbc-business-pan/hsbc-business-pan.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Pagination } from 'src/app/CommoUtils/model/pagination';
import { PaginationService } from 'src/app/services/pagination.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { UntypedFormBuilder } from '@angular/forms';
import { ValidationsService } from 'src/app/CommoUtils/common-services/validations.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { MainTypeWiseLatestSixMonthProductDetail } from 'src/app/CommoUtils/model/CommercialBureau';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';

@Component({
  selector: 'app-facilities-from-lenders',
  templateUrl: './facilities-from-lenders.component.html',
  styleUrl: './facilities-from-lenders.component.scss'
})
export class FacilitiesFromLendersComponent {

  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  selectedTabIndex: number;
  tabValue: number;

  userId: any;
  applicationId: any;
  cibilId: any;
  pan: any;

  commercialData: any;

  cmrScore: any;
  bureauVintage: any;
  totalLenders: any;

  defaultData: any;
  dpdDetail: any = [];

  borrowerInformation: any;
  additionalDetails: any;
  numberOfInquiriesOutsideInstitution: any;
  outStandingBalanceBasedOnAssetsClassification: any;
  outStandingBalanceBasedOnAssetsClassificationNew: any;
  // productWiseDetailsNew6: any;
  productWiseDetailsOld6: any;
  mainTypeWiseBelowSixMonthProductDetails: MainTypeWiseLatestSixMonthProductDetail[] = [];

  totalYourInstitution = 0;
  totalOtherInstitution = 0;
  totalHSBCPercentage = 0;

  totalnoOfCreditFacility = 0;
  totalsanctionedAmountOther = 0;
  totalutilizationOther = 0;
  totalsanctionedAmountHsbc = 0;
  totalutilizationHsbc = 0;
  totalOtherUtiPercentage = 0;
  totalHsbcUtiPercentage = 0;
  totaloutStandingAmountHsbc = 0;
  totaloutStandingAmountOther = 0;
  currentSortField: string = null;
  currentSortField1: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';

  PageSelectNumber: any[] = [
    {
      name: '10',
      value: 10
    },
    {
      name: '20',
      value: 20
    },
    {
      name: '50',
      value: 50
    },
    {
      name: '100',
      value: 100
    },
  ];

  //  transaction pagination
  productWisePagination:Pagination;
  productWisePaginationData:  MainTypeWiseLatestSixMonthProductDetail[] = [];
  constants: any;
  pageData: any; // This will hold the current page data

  constructor(
    public dialogRef: MatDialogRef<HSBCBusinessPANComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    public dialog: MatDialog, private formBuilder: UntypedFormBuilder, private validationsService: ValidationsService,
    public msmeService: MsmeService, public commonService: CommonService, private loaderService: LoaderService, public commonMethod: CommonMethods,
    private paginationService: PaginationService
  ) {}

  ngOnInit(): void {
    this.constants = Constants;
    this.pageData = history.state.data;
    this.productWisePagination = new Pagination();
    if (!this.commonService.isObjectNullOrEmpty(this.data)) {
      this.mainTypeWiseBelowSixMonthProductDetails = this.data
      if (this.mainTypeWiseBelowSixMonthProductDetails) {
        this.calculateTotalForProductWiseDetails()
      }
      if (this.mainTypeWiseBelowSixMonthProductDetails) {
        this.mainTypeWiseBelowSixMonthProductDetails.forEach(element => {
          element.internalPagination = new PaginationSignal();
          element.internalPagination.totalSize = element.subTypeOfProductDetails.length;
        });
      }
      this.updatePaginatedData();
    }
    console.log(this.data);
  }
  // reload(): void {
  //   window.location.reload();
  //   this.data.this.fetchBulkUploadHistory(null, true);
  // }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  updatePaginatedData(): void {
    this.productWisePagination.totalSize = this.mainTypeWiseBelowSixMonthProductDetails?.length;
    this.productWisePaginationData = this.paginationService.paginate(this.mainTypeWiseBelowSixMonthProductDetails, this.productWisePagination?.pageSize, this.productWisePagination?.page);
  }

   producWiseChangePage(page: number): void {
    this.productWisePagination.startIndex = (page - 1) * this.productWisePagination.pageSize;
    this.productWisePagination.endIndex = (page - 1) * this.productWisePagination.pageSize + this.productWisePagination.pageSize;
    this.productWisePagination.page = page;
    this.updatePaginatedData();
    this.toggleSort(this.currentSortField1,true,'value');
  }
  toggleSort(column: string, dontCallApi?: boolean, pagination?:any){
     this.currentSortField1 = column;
    if (this.currentSortField === column ) {
      if(!pagination){
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
      }
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    if (dontCallApi && this.currentSortField === 'product') {
    this.getSortedProduct();
    }
    if(dontCallApi && this.currentSortField==("noOfCreditFacility")){
      this.getSortednoOfCreditFacility();
    }
    if(dontCallApi && this.currentSortField==("utilizationOther")){
      this.getSortedutilizationOther();
    }
    if(dontCallApi && this.currentSortField==("utilizationHsbc")){
      this.getSortedutilizationHsbc();
    }
    if(dontCallApi && this.currentSortField==("sanctionedAmountHsbc")){
      this.getSortedsanctionedAmountHsbc();
    }
    if(dontCallApi && this.currentSortField==("sanctionedAmountOther")){
      this.getSortedsanctionedAmountOther();
    }
    if (dontCallApi && this.currentSortField === 'sanctionBy') {
    this.getSortedSanctionBy();
    }
    if (dontCallApi && this.currentSortField === 'utilizationBy') {
    this.getSortedUtilizationBy();
    }
  }

  getSortedProduct(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;

    this.productWisePaginationData.sort((a, b) => {
      const valueA = (a[sortField] || '').toLowerCase();
      const valueB = (b[sortField] || '').toLowerCase();
      return sortDirection === 'ASC' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }

   getSortednoOfCreditFacility():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedutilizationOther():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedutilizationHsbc():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedsanctionedAmountHsbc():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedsanctionedAmountOther():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

    getSortedSanctionBy(): void {
  const sortField = this.currentSortField;
  const sortDirection = this.sortDirection;

  this.productWisePaginationData.sort((a, b) => {
    const valueA = (a[sortField] || '').toLowerCase();
    const valueB = (b[sortField] || '').toLowerCase();
    return sortDirection === 'ASC' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
  }

  getSortedUtilizationBy(): void {
  const sortField = this.currentSortField;
  const sortDirection = this.sortDirection;

  this.productWisePaginationData.sort((a, b) => {
    const valueA = (a[sortField] || '').toLowerCase();
    const valueB = (b[sortField] || '').toLowerCase();
    return sortDirection === 'ASC' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
  }


  calculateTotalForProductWiseDetails(): any {

    for (let item of this.mainTypeWiseBelowSixMonthProductDetails) {
      if (!this.commonService.isObjectNullOrEmpty(item.noOfCreditFacility)) {
        this.totalnoOfCreditFacility += item.noOfCreditFacility;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.sanctionedAmountOther)) {
        this.totalsanctionedAmountOther += item.sanctionedAmountOther;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.sanctionedAmountHsbc)) {
        this.totalsanctionedAmountHsbc += item.sanctionedAmountHsbc;
      }

      if (!this.commonService.isObjectNullOrEmpty(item.utilizationOther)) {
        this.totalutilizationOther += item.utilizationOther;
      }

      if (!this.commonService.isObjectNullOrEmpty(item.utilizationHsbc)) {
        this.totalutilizationHsbc += item.utilizationHsbc;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.outStandingAmountHsbc)) {
        this.totaloutStandingAmountHsbc += item.outStandingAmountHsbc;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.outStandingAmountOther)) {
        this.totaloutStandingAmountOther += item.outStandingAmountOther;
      }
    }
    if ((!this.commonService.isObjectNullOrEmpty(this.totaloutStandingAmountOther) && this.totaloutStandingAmountOther > 0)
      && (!this.commonService.isObjectNullOrEmpty(this.totalsanctionedAmountOther) && this.totalsanctionedAmountOther > 0)) {
      this.totalOtherUtiPercentage = this.totaloutStandingAmountOther / this.totalsanctionedAmountOther * 100;
    }
    if ((!this.commonService.isObjectNullOrEmpty(this.totaloutStandingAmountHsbc) && this.totaloutStandingAmountHsbc > 0)
      && (!this.commonService.isObjectNullOrEmpty(this.totalsanctionedAmountHsbc) && this.totalsanctionedAmountHsbc > 0)) {
      this.totalHsbcUtiPercentage = this.totaloutStandingAmountHsbc / this.totalsanctionedAmountHsbc * 100;
    }
  }
  // procced(){
  //   if(this.data.successfullEntry && this.data.successfullEntry >0){
  //   const dataset: any = {};
  //   dataset.batchId = this.data.batchId;
  //   dataset.userId = parseInt(atob(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, false)));
  //   this.msmeService.proccedData(dataset).subscribe((res:any) => {
  //     console.log("res=========",res.data);
  //     if (res.status==200) {
  //       this.commonService.successSnackBar("File uploaded successfully");
  //       this.closePopup();
  //       this.router.navigate(['/hsbc/rmDashboard']);
  //     }
  //   }, error => {
  //       this.commonService.errorSnackBar("Error in Proccessing data");
  //     });
  // }else{
  //   this.commonService.warningSnackBar("PAN data is not uploaded. Please check the failed entries to know the reason.");
  //   this.closePopup();
  //   window.location.reload();
  // }}
}
