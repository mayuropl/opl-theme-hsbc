
// import { HttpClient } from '@angular/common/http';
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, UntypedFormBuilder } from '@angular/forms';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { CommonMethods } from 'src/app/CommoUtils/common-methods';
// import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
// import { MsmeService } from 'src/app/services/msme.service';
// import { MatDialog } from '@angular/material/dialog';
// import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { UseridPopupComponent } from 'src/app/Popup/HSBC/userid-popup/userid-popup.component';
// import { DashboardResponse } from '../targets-prospects/targets-prospects-find/targets-prospects-find.component';
// import { AuditAPIType, Constants } from 'src/app/CommoUtils/constants';
// import { GlobalHeaders, resetGlobalHeaders, saveActivity } from 'src/app/CommoUtils/global-headers';
// import { Router } from '@angular/router';
// import { DropdownOption } from 'src/app/CommoUtils/model/drop-down-option';
// import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
// @Component({
//   selector: 'app-rejected-portfolio',
//   templateUrl: './rejected-portfolio.component.html',
//   styleUrl: './rejected-portfolio.component.scss'
// })
// export class RejectedPortfolioComponent implements OnInit{

  // pageOfItems: Array<any>;
  // pageSize = 10;
  // startIndex = 0;
  // endIndex = 10;
  // totalSize = 0;
  // page = 1;
  // tempPage = 0;
  // count: 0;
  // totalCount;
  // pages = 10;
  // searchForm: any;
  // rejectedCustomer:FormGroup;
  // PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 },]
  // id;
  // batchId;
  // forExportPayLoad:any ={};
  // pageData:any;
  // rejectedPorfolioDataHistory= [] ;
  // constants:any
  // disableAssignButton = true;
  //   sortDirection: 'ASC' | 'DESC' = 'ASC';
  //   currentSortField: string = '';
  //   toggleHide: boolean = false;

  //   personaAllOptions: DropdownOption[];

  // constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
  //   private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient, private excelService: ExcelDownloadService,
  //   private fb: FormBuilder, private service: MsmeService, private router: Router, private existingProspectsDropDownService: ExistingProspectsDropDownService) { }

  // ngOnInit(): void {
    // this.constants = Constants;
    // this.initForm();
    // this.personaAllOptions = this.existingProspectsDropDownService.getPersonaAllOptions();
    // this.pageData = history.state.data;
    // this.pageData = renameKey(this.pageData, 'subSubpages', 'subpages');
    // resetGlobalHeaders();
    // GlobalHeaders['x-path-url'] = '/hsbc/rmExisitingPortfolio';
    // GlobalHeaders['x-main-page'] = this.pageData.pageName;
    // this.getRejectedPortfolio();
    // below code select persona label should be set in displayPersona in  value
    // this.rejectedCustomer.get('persona')?.valueChanges.subscribe((selectedValue) => {
    //   const selectedOption = this.existingProspectsDropDownService.getPersonaAllOptions().find(option => option.value === selectedValue);
    //   if (selectedOption) {
    //     this.rejectedCustomer.get('displayPersona')?.setValue(selectedOption.label);
    //   } else {
    //     this.rejectedCustomer.get('displayPersona')?.setValue('');
    //   }
    // });
  // }

//   pageSizeChange(size: any, page: any) {
//     this.pageSize = size;
//     this.startIndex = (page - 1) * this.pageSize;
//     this.endIndex = (page - 1) * this.pageSize + this.pageSize;
//     // this.fetchBulkUploadHistory(page, true);
//   }
//   onChangePage(page: any): void {

//     this.startIndex = (page - 1) * this.pageSize;
//     this.endIndex = (page - 1) * this.pageSize + this.pageSize;
//    }

//   getRejectedPortfolio(filterForm?): void {
//     const data: any = {};
//     data.size = this.pageSize;
//     data.pageIndex = this.page - 1;
//     data.customerName = this.rejectedCustomer.get('customerName')?.value;
//     data.primaryRmPsId = this.rejectedCustomer.get('primaryRmPsId')?.value;
//     data.primaryRmEmailId = this.rejectedCustomer.get('primaryRmEmailId')?.value;
//     data.portfolio = this.rejectedCustomer.get('portfolio')?.value;
//     data.remarks = this.rejectedCustomer.get('remarks')?.value;
//     data.persona =  this.rejectedCustomer.get('persona')?.value;
//     console.log(data);

//     this.msmeService.getRejectedPortfolio(data).subscribe((res)=>{
//       if (res && res.status == 200) {
//         if (!this.commonService.isObjectNullOrEmpty(res.data) && res.data.length >0) {
//           this.rejectedPorfolioDataHistory = res.data;
//         }else{
//           this.rejectedPorfolioDataHistory =[];
//         }
//       } else {
//         this.commonService.warningSnackBar(res.message);
//       }
//     }, err => {
//       this.commonService.errorSnackBar(err);
//     });

//   }
//  navigateToViewComponent(pan:string, cin:string){
//   console.log(cin);
  
//     GlobalHeaders['x-page-data'] = pan;
//     GlobalHeaders['x-page-action'] = 'View Portfolio';
//     saveActivity(() => {});
//     // Tab id 1 for existing tab, 2 for targer prospect
//     // const routerData = { pan: panNo,tabId:2 , pageDetails:this.pageData }; // Data to pass
//     const routerData = { pan: pan,tabId:2,cin:cin, pageDetails:this.pageData,customerTypeTempId:Constants.CustomerType.TARGET};// Data to pass
//     // const routerData = { pan: pan,tabId:1 };// Data to pass

//     this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData,data:this.pageData } });
//   }

//   downloadRejectedPorfolioData(): void {
//     this.msmeService.downloadExportReportForRejectedCustomer(this.forExportPayLoad).subscribe((res)=>{
//       if (res && res.status == 200) {
//         this.excelService.downloadExcel(res.data, 'Rejected_Portfolio_Data')
//       } else {
//         this.commonService.warningSnackBar(res.message);
//       }
//     }, err => {
//       this.commonService.errorSnackBar(err);
//     });

//   }

//   dashboardResponse: DashboardResponseForRejcted;

//   assignCustomerToRm(customer?:any): void {
//     let dialogRef;
//       if(!this.disableAssignButton ){
//          dialogRef = this.dialog.open(UseridPopupComponent, {data:"Bulk Assign" ,panelClass: ['popupMain_design'], });
//       }
//       else{
//          dialogRef = this.dialog.open(UseridPopupComponent, {panelClass: ['popupMain_design'], });
//       }
//       dialogRef.afterClosed().subscribe(result => {
//         if(result.isAssign && result.userId) {
//           this.dashboardResponse = {
//             aggregateTurnoverFromGst: '',
//             companyName: customer?.customerName,
//             address: '',
//             lendingBankersCount: undefined,
//             cmr: '',
//             pan: customer?.pan,
//             cin: customer?.cin,
//             charges: '',
//             creditRating: undefined,
//             city: '',
//             pinCode: undefined,
//             fullBureauConsent: undefined,
//             partialBureauConsent: undefined,
//             downloadFinancialConsent: undefined,
//             contactNo: '',
//             personal: '',
//             turnOver: '',
//             prioritySectorLendind: '',
//             employeeCode: '',
//             customerType: this.constants.CustomerType.PROSPECTS,
//             rmId: result.userId,
//             rmUserName: result.userName,
//             previousRmId: customer?.rmId,
//             // list : '',
//           };
//           this.deleteRejectedCustomer(customer?.id);
//         }
//       });

//     }
//     deleteRejectedCustomer(id: number): void {
//       this.msmeService.deleteRejectCustomerById(id).subscribe({
//         next: (res) => {
//           if (res.status == 200) {
//             this.commonService.successSnackBar(res.message);
//             this.addToTarget();
//           }
//           else if(res.status == 400 || res.status == 404){
//             this.commonService.successSnackBar(res.message);
//             return;
//           }
//         },
//         error: (err) => {
//           this.commonService.errorSnackBar(err.message);
//           return;
//         }
//       });
//     }

//     addToTarget() {
//       if (this.dashboardResponse.rmId === this.dashboardResponse.previousRmId) {
//         this.commonService.errorSnackBar('cannot assign customer at yourself');
//         return;
//       }
//       if(this.dashboardResponse.customerType && this.dashboardResponse.customerType == this.constants.CustomerType.PROSPECTS) {
//         if (this.commonService.isObjectIsEmpty(this.dashboardResponse.pan) || this.commonService.isObjectIsEmpty(this.dashboardResponse.cin)) {
//           this.commonService.warningSnackBar('Pan Or cin not found from  customer');
//           return;
//         }
//       }
//       else if (!this.dashboardResponse.pan) {
//         this.commonService.warningSnackBar('Pan number not found from  customer');
//         return;
//       }

//       GlobalHeaders['x-page-action'] = 'Add To Target';
//       const empCode = this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true);
//       if (empCode){
//         this.dashboardResponse.employeeCode = empCode;
//       }
//       this.service.addToTargetIndvidualCustomer(this.dashboardResponse).subscribe((res: any) => {
//         if (res.status == 200) {

//           if(this.dashboardResponse.customerType == this.constants.CustomerType.PROSPECTS){
//             this.commonService.successSnackBar('given RM assign successfully');
//             this.getRejectedPortfolio();
//           }

//         //  if(this.disableAssignButton){
//         //   let pageDatas:any = [];
//         //   let userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
//         //   let roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
//         //   const routerData = { pan: this.dashboardResponse.pan, tabId: 2 }; // Data to pass
//         //   this.commonMethod.getUserPermissionData(
//         //     userId, roleId, Constants.pageMaster.TARGETS_AND_PROSPECTS,
//         //     (pageData: any) => {
//         //       pageDatas = pageData?.[0];
//         //       this.router.navigate([`/hsbc/rmExisitingPortfolioView`], {state: {routerData, data: pageDatas ,dataFrom : this.pageData}});
//         //     }
//         //   );
//         //  }
//         //  this.selectedCustomers.clear();
//         //  this.updateAssignButtonState();
//         }
//         else if (res.status == 208) {
//           this.commonService.warningSnackBar('Customer is already available in '+ res?.data?.type+ ' dashboard');
//                 } else {
//           this.commonService.warningSnackBar('Something went Wrong')
//         }
//       });
//     }

//     clearFilter(){
//       this.rejectedCustomer.reset({
//         customerName:'',
//         primaryRmPsId: '',
//         portfolio:'',
//         totalOpportunity:'',
//         remarks: '',
//         primaryRmEmailId:'',
//         persona:''
//       })
//       this.currentSortField ='';
//       this.getRejectedPortfolio();
//     }
//     getControlValue(controlName: string) {
//       return this.searchForm.get(controlName)?.value;
//     }
//     initForm(value?:any) {
//     this.rejectedCustomer = this.fb.group({
//       customerName: [''],
//       primaryRmPsId: [''],
//       primaryRmEmailId: [''],
//       portfolio: [''],
//       remarks: [''],
//       persona: ['ALL']
//     });
//     console.log(this.rejectedCustomer);

//     this.rejectedCustomer.valueChanges.pipe(   debounceTime(300),
//     distinctUntilChanged() )
//     .subscribe(values => {
//       console.log("Filter values changed: ", values);

//       const formattedValues = Object.keys(values).reduce((acc, key) => {
//         acc[key] = values[key] === '' ? null : values[key];
//         return acc;
//       }, {} as any);
//       this.forExportPayLoad = formattedValues;
//       // Make API call with form values
//       this.msmeService.getRejectedPortfolio(formattedValues).subscribe((res) => {
//         this.rejectedPorfolioDataHistory = res.data;

//       });

//     });
//   }

//     viewAuditPage(customer:any,type : any){
//       this.commonService.setStorage('auditType', type);
//       this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "EXISTING_TARGET");
//       const routerData = { pan: customer.panNo, tabId : 2, apiType : AuditAPIType.API_AUDIT};
//       this.router.navigate(["/hsbc/apiAuditLog"], { state: { routerData } });
//     }

//     getSortedData(): void {
//       const sortField = this.currentSortField;
//       const sortDirection = this.sortDirection;

//       this.rejectedPorfolioDataHistory = [...this.rejectedPorfolioDataHistory.sort((a, b) => {
//         let valueA = a[sortField];
//         let valueB = b[sortField];

//         // Handle undefined/null values safely
//         if (valueA == null) valueA = '';
//         if (valueB == null) valueB = '';

//         // If values are strings, convert to lowercase
//         if (typeof valueA === 'string') valueA = valueA.toLowerCase();
//         if (typeof valueB === 'string') valueB = valueB.toLowerCase();

//         if (valueA < valueB) return sortDirection === 'ASC' ? -1 : 1;
//         if (valueA > valueB) return sortDirection === 'ASC' ? 1 : -1;
//         return 0;
//       })];
//     }


//     toggleSort(column: string, dontCallApi?: boolean){
//       if (this.currentSortField === column) {
//         this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
//       } else {
//         this.currentSortField = column;
//         this.sortDirection = 'ASC';
//       }
//       if(dontCallApi && this.currentSortField==("customerName")){
//         console.log(this.currentSortField);
//         this.getSortedData();
//       }
//       if(dontCallApi && this.currentSortField==("remarks")){
//         this.getSortedData();
//       }
//       if(dontCallApi && this.currentSortField==("portfolio")){
//         this.getSortedData();
//       }
//       if(dontCallApi && this.currentSortField==("primaryRmEmailId")){
//         this.getSortedData();
//       }
//       if(dontCallApi && this.currentSortField==("primaryRmPsId")){
//         this.getSortedData();
//       }

//     }

//     isActionAvail(actionId: string): boolean {
//       for (let page of this.pageData?.actions) {
//           if (page?.actionId === actionId) {
//               return true; // Return true if found
//           }
//       }
//       return false; // Return false if not found
//     }

// }

// function renameKey(obj: any, oldKey: string, newKey: string): any {
//   if (obj.hasOwnProperty(oldKey)) {
//     obj[newKey] = obj[oldKey];
//     delete obj[oldKey];
//   }
//   return obj;
// }



// export interface DashboardResponseForRejcted {
//   aggregateTurnoverFromGst: string;
//   companyName: string,
//   address: string,
//   lendingBankersCount: Number,
//   cmr: string,
//   pan: string,
//   cin: string,
//   charges: string,
//   creditRating: Number,
//   city: string,
//   pinCode: Number,
//   fullBureauConsent: Boolean,
//   partialBureauConsent: Boolean,
//   downloadFinancialConsent: Boolean,
//   contactNo: string,
//   personal: string,
//   turnOver: string,
//   prioritySectorLendind: string,
//   employeeCode:string;
//   customerType:any;
//   rmId:string;
//   rmUserName:string;
//   // list : any
//   previousRmId:String;

//}


