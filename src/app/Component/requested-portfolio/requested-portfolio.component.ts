import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RequestStatusPopupComponent } from 'src/app/Popup/request-status-popup/request-status-popup.component';
import { Company } from '../pages/HSBC/targets-prospects/targets-prospects-find/targets-prospects-find.component';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { CustomerList } from 'src/app/CommoUtils/model/CustomerList';
import { MsmeService } from 'src/app/services/msme.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { GlobalHeaders, resetGlobalHeaders, saveActivity } from 'src/app/CommoUtils/global-headers';
import { ActivatedRoute, Router } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { data, event } from 'jquery';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { HttpStatusCode } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DropdownOption } from 'src/app/CommoUtils/model/drop-down-option';
import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
import { ListofCustomerPopupComponent } from 'src/app/Popup/HSBC/listof-customer-popup/listof-customer-popup.component';
import { PortfolioRemarkPopupComponent } from 'src/app/Popup/HSBC/portfolio-remark-popup/portfolio-remark-popup.component';
import { RequestedPortfolioLimitPopupComponent } from 'src/app/Popup/HSBC/requested-portfolio-limit-popup/requested-portfolio-limit-popup.component';
import { Subject } from 'rxjs/internal/Subject';


@Component({
  selector: 'app-requested-portfolio',
  templateUrl: './requested-portfolio.component.html',
  styleUrl: './requested-portfolio.component.scss'
})
export class RequestedPortfolioComponent implements OnInit {
  companySearch:string = '';
  requestedTimeDuration:number;
  searchForm: FormGroup;
  requestSender:FormGroup;
  // pendingRequestRecevier:FormGroup;
  approveRejectRequestRecevier:FormGroup // pending approve or reject recevier request
  pendingRecevierRequestFilter:FormGroup;  // pending recevier request filter
  companyNameList: Company[];
  searchCompanyFound: boolean = false;
  customerList: CustomerList[] = [];
  selectSearchType:string = 'COMPANY';
  rmUserId:any;
  empCode:any;
  historyCompanyListForSender:any;
  pending_companylist:any;
  approve_reject_companaylist:any;
  searchAbleCustomerData: any[] = [];
  allSearchCustomerData: any[] = [];
  isChecked: boolean = true;
  debounceEventForFilter = _.debounce((event) => this.getSearchCustomerDetails(event), 300, {});
  receivedStatus: string = '';
  receivedRemarks: string = '';
  pageData: any;
  item = { requestedTimeDuration: null };
  isChecked1: boolean = true;
  selectedCustomers: Set<number> = new Set(); // To store selected customer IDs
  disableAssignButton = true; // Initially, button is disabled
  transformedCustomer
  snackBar: any;
  selectedIds: number[] = []; // It will be used for Select All checkboxes functionality
  isMasterChecked = false; // Master checkbox state
  isIndeterminate = false;
  //sortField: string = 'customerName'; // Default sort field
  //sortDirection: string = 'asc';     // Default sort direction
  sortField: string;
  sortDirection: string;
  currentSortField: string = null;
  isSender = false;
  isReceiver = false;
  isTotalCompanies = false;
  roleMasterList: any = [];
  userRoleId;
  roleType:any;
  isTimeDurationSort = false;
  totalOpportunities: DropdownOption[];
  allPersona: DropdownOption[];
  personaMap: {}
  isFindETB: boolean = false;
  externalRoutData:any = null;
  hidden:false;
  selectedOption: string = '1';
  isCollapsed1: boolean = false;
  isCollapsed2: boolean = false;
  rmName: string = '';
  rmSearchRmName:string='';
  searchResults: any[] = [];
  rmDataList:any[] = [];
  rmSearchInitiated: boolean = false;
  searching: boolean = false;
  rmId: string = '';
  masterTimeDuration: string = '15';
  masterSelected: boolean = false;
  isApproverRemarkForSender:boolean = false;
  isRequesterRemarkForRecevier:boolean = false;
  searchText: string = '';
  filteredResults: any[] = [];
  portfolioResults: any[] = [];
  userNameAndEmailidList: any;
  rmHistoryData :any[]= [];
  receverRmHistory:any=[];
  portfolioSearchInitiated: boolean = false;
  debounceRmSearch = _.debounce((event: KeyboardEvent) => this.getSearchRmDetails(event), 300, {});
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  cmpDetailsInRecevier:boolean = false
  page = 1;
  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 }, ];
  filters = {
    rmName: '',
    noOfCompany: '',
    status: '',
    pendingTime: ''
  };
  sortFieldForHistory = '';
  sortDirectionForHistory = 'asc';
  filteredDataRmHistoryData = [];
  filteredRmHistoryDataForReceiver = [];
  expandedRowIndex: number | null = null;
  requestSenderForApprovedStatus:FormGroup;
  approvedStatusListForSender:any;
  isApprovedStatusSortingApplied = false;
  isSelectAllcheckedForRecevier: boolean = false;
  requestedRmEmailId:any;
  private destroy$ = new Subject<void>();
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  constructor(public dialog: MatDialog, public commonService: CommonService,
      private msmeService: MsmeService, private fb: FormBuilder, private cdRef: ChangeDetectorRef , private router:Router,
      private existingProspectsDropDownService: ExistingProspectsDropDownService, private activatedRoute: ActivatedRoute) {
    this.getUserDetails();
    this.getEmpCode();
    this.recentCompanyHistoryData();

   }

  protected readonly consValue = Constants;
  ngOnInit(): void {
    this.initForm();
    // this.filteredResults = [...this.portfolioResults];
    const storedData = this.commonService.getStorage(Constants.httpAndCookies.CMP_SEARCH_DATA, true);
    this.roleType = this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true);
    this.userRoleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
    console.log(this.roleType);

    this.allSearchCustomerData = storedData ? JSON.parse(storedData) : [];
    this.pageData = history.state.data;
    if(!this.pageData || this.pageData === 'undefined'){
        this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW,this.consValue.pageMaster.REQUESTED_PORTFOLIO)
      }    
    this.pageData = renameKey(this.pageData, 'subSubpages', 'subpages');
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmExisitingPortfolio';
    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    this.isSender = true;
    this.totalOpportunities = this.existingProspectsDropDownService.getTotalOpportunityDropdownOptionsEtb();
    this.allPersona = this.existingProspectsDropDownService.getPersonaAllOptions();
    this.personaMap = this.existingProspectsDropDownService.getPersonaMap();
    this.requestSenderFilter();
    this.pendingRequestFiler();
    this.pendingRecevierReqFilter();
    this.requestSenderApprovedStatusFilter();
    this.activatedRoute.queryParams.subscribe(params => {
      if(params?.externalRoutData) {
        this.externalRoutData = params?.externalRoutData;
        const externalRoutData = JSON.parse(this.commonService.toATOB(params.externalRoutData));
        this.isFindETB  = externalRoutData?.isFindETB?? this.isFindETB;
        if(this.isFindETB){
          // this.isFindSameRm = externalRoutData?.isFindSameRm?? this.isFindSameRm;
          this.companySearch = externalRoutData?.companyName?? this.companySearch;
          if(!this.commonService.isObjectNullOrEmpty(this.companySearch)){
            this.searchCompany();
          }
        }
      }
    });
    this.onMasterChange(this.masterTimeDuration);
    
    // Handle dynamic routing based on tabId
    const routerData = history.state?.routerData;
    if(routerData?.tabId !== undefined) {
      console.log('handle tab rounting: ', routerData?.tabId);
      this.handleTabRouting(routerData.tabId);
    } else {
      console.log('history state router data not found!!');
      this.onTabChange({ tab: { textLabel: "Total Companies" } } as MatTabChangeEvent)
    }
  }

  handleTabRouting(tabId: number): void {
    if (tabId < 0 || tabId > 2) {
      console.warn('Invalid tabId:', tabId);
      return;
    }

    setTimeout(() => {
      if (this.tabGroup) {
        this.tabGroup.selectedIndex = tabId;
      }
    });

    switch(tabId) {
      case 0:
        this.isTotalCompanies = true;
        this.isSender = false;
        this.isReceiver = false;
        this.onTabChange({ tab: { textLabel: "Total Companies" } } as MatTabChangeEvent);
        break;
      case 1:
        this.isSender = true;
        this.isTotalCompanies = false;
        this.isReceiver = false;
        this.onTabChange({ tab: { textLabel: "Request Sent" } } as MatTabChangeEvent);
        break;
      case 2:
        this.isReceiver = true;
        this.isTotalCompanies = false;
        this.isSender = false;
        this.onTabChange({ tab: { textLabel: "Request Received" } } as MatTabChangeEvent);
        break;
    }
  }

  getTotalOpportunityForApprovedStatus(event: any): void {

    const data = {
      "senderUserId": this.rmUserId,
      "totalOpportunityType": event.value,
      "status": "Approved"
    }

    this.msmeService.getTotalOpportunity(data).subscribe((res)=>{
     this.approvedStatusListForSender = res.data;
    });
  }

  isHsbcWalletAndShareShow(searchForm: FormGroup | undefined | null): boolean {
    if (!searchForm) return false;
    const value = searchForm.get('totalOpportunity')?.value;
    return ['CUACY', 'CUAPY'].includes(value);
  }

  // request sender for approved status filer
  requestSenderApprovedStatusFilter(value?:any) {
    this.requestSenderForApprovedStatus = this.fb.group({
      companyType: [''],
      customerName: [''],
      persona: [this.allPersona[0]?.value || ''],
      minHsbcWallet: [''],
      maxHsbcWallet: [''],
      totalOpportunity: [this.totalOpportunities[0]?.value || ''],
      minShare: [''],
      maxShare: [''],
      preApproved: [''],
      //status: [''],
      status: ['Approved'],
      senderRmId: [''],
      pendingTime: [''],
      requestedRmName: [''],
      senderUserId: this.rmUserId
    });

    this.syncMinMaxControls(this.requestSenderForApprovedStatus, 'minHsbcWallet', 'maxHsbcWallet');
    this.syncMinMaxControls(this.requestSenderForApprovedStatus, 'minShare', 'maxShare');

    this.requestSenderForApprovedStatus.valueChanges.pipe(   debounceTime(300),
    distinctUntilChanged() )

    .subscribe(values => {
      console.log("Filter values changed: ", values);
      const formattedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] = values[key] === '' ? null : values[key];
        return acc;
      }, {} as any);
      if(this.isTotalCompanies===true){
      // formattedValues["mainPersona"] = this.personaMap[this.requestSenderForApprovedStatus.get("persona")?.value].group
      // formattedValues["subPersona"] = this.personaMap[this.requestSenderForApprovedStatus.get("persona")?.value].option
      this.msmeService.getTotalCompaniesList(formattedValues).subscribe((res) => {
        this.approvedStatusListForSender = res.data;
        this.sortDataForApprovedStatusPortfolios(this.sortField, false);
      });
    }
    });
  }

  onSearchClick() {
  if (this.selectedOption === '1') {
   if (!this.companySearch.trim()) {
      this.commonService.warningSnackBar('Please company name here');
      return;
    }
    this.searchCompany();
  } else if (this.selectedOption === '2') {
    if (!this.rmName.trim()) {
      this.commonService.warningSnackBar('Please enter rm name here');
      return;
    }
    this.searchByRmId();
  }
}

  onRmNameChange() {
    if (this.rmName.length >= 3) {
      this.searchRmData();
    }
  }

  clearRmFilterFormValue() {
    this.getControl('rmId')?.patchValue(null);
    this.getControl('rmName')?.patchValue(null);
  }

  getSearchRmDetails(event: KeyboardEvent) {
    if (event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (typeof this.rmName !== 'string' || this.rmName.length <= 3) {
      this.searchResults = [];
      this.clearRmFilterFormValue();
      return;
    }
    this.getControl('rmId')?.patchValue(null);
    this.getControl('rmName')?.patchValue(this.rmName);
    this.searchRmData();
  }

  searchRmData() {
    const requestPayload = { rmName: this.rmName };
    this.searching = true;

    this.msmeService.getSearchRmData(requestPayload).subscribe({
      next: (res: any) => {
        this.searching = false;
        this.rmSearchInitiated = true;
        this.rmDataList=res?.data;
        if (res.status === 200 && !this.commonService.isObjectNullOrEmpty(res.data) && res.data.length > 0) {
          this.searchResults = res.data.map((item: any) =>
          `${item.employeeName}-${item.rmId}`
        );
          this.requestedRmEmailId=res?.data[0]?.rmEmailId;
          this.rmName=res?.data[0]?.employeeName;
        } else {
          this.searchResults = [];
          this.commonService.warningSnackBar('No matching RM data found.');
        }
      },
      error: () => {
        this.searching = false;
        this.searchResults = [];
        this.commonService.warningSnackBar('Failed to fetch RM data.');
      }
    });
  }

  // searchByRmId() {
  //   const rightSide = this.rmName.split("_")[1];
  //   const requestPayload = {
  //     rmId: rightSide
  //   };

  //   this.msmeService.getSearchRmId(requestPayload).subscribe({
  //     next: (res) => {
  //       console.log("res: ", res)
  //       this.portfolioSearchInitiated = true;
  //       if (res.status == 200 && res.message == 'Success') {
  //         this.portfolioResults = res.data;
  //       } else {
  //         this.portfolioResults = [];
  //         this.commonService.successSnackBar(res.message);
  //       }
  //     },
  //     error: () => {
  //       this.commonService.warningSnackBar('Something went wrong while searching RM portfolio');
  //     }
  //   });
  // }

  searchByRmId() {
    const rightSide = this.rmName.split("-")[1]
    this.requestedRmEmailId = this.rmDataList.find(item => item.employeeName === this.rmName.split("-")[0])?.rmEmailId;
    const requestPayload = { rmId: rightSide , userRoleId: this.userRoleId, senderPsId:this.empCode, roleType:this.roleType, requestedRmEmailId:this.requestedRmEmailId, rmName:this.rmName.split("-")[0]};

    this.msmeService.getSearchRmId(requestPayload).subscribe({
      next: (res) => {
        this.portfolioSearchInitiated = true;
        if (res.status == 200) {
          this.userNameAndEmailidList = res.data;
          this.portfolioResults = res.data.responseDtos.map((item: any) => ({
            ...item,
            selected: false, // default unchecked
            timeFrame: null  // default no selection
          }));
          this.masterSelected=false;
          this.filteredResults = [...this.portfolioResults];
          this.totalSize = this.filteredResults?.length;
          // this.page = 1;
          // this.pageSizeChange(this.pageSize, this.page);
          this.masterTimeDuration = '15';
          this.onMasterChange(this.masterTimeDuration);
          this.commonService.successSnackBar(res.message);
        } else {
          this.portfolioResults = [];
          this.commonService.warningSnackBar(res.message);
        }

        this.searchResults =[];
        this.rmName ='';
      },
      error: () => {
        this.commonService.warningSnackBar('Something went wrong while searching RM portfolio');
      }
    });
  }





  ListCustomer_popup(listofCustomer:any): void {
    const dialogRef = this.dialog.open(ListofCustomerPopupComponent, {
        data: { customer: listofCustomer, isRequesterRemarkForRecevier: this.isRequesterRemarkForRecevier,
          isApproverRemarkForSender: this.isApproverRemarkForSender
          },
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      // if(this.isSender)
      //   this.searchRmHistoryByRmId();

      // else if(this.isReceiver)
      //   this.searchRecevierRmHistoryByRmId();
    });
  }

Remarks_popup(showFields: boolean, i?:any): void {
  const selectedCustomers = !this.isReceiver ? this.filteredResults.filter(c => c.selected) : this.portfolioResults[i]?.responseDtos?.filter(c => c?.selected);

  if (selectedCustomers.length === 0) {
    this.commonService.warningSnackBar('Please select at least one RM portfolio detail');
    return;
  }

  const dialogRef = this.dialog.open(RequestStatusPopupComponent, {
  data: { showFields: showFields, cmpDetailsInRecevier:true, isSelectAllcheckedForRecevier:this.isSelectAllcheckedForRecevier},
      panelClass: ['popupMain_design'],
      autoFocus: false
  });

  dialogRef.afterClosed().subscribe((remarkData: { status: string; remarks: string } | undefined) => {
    if (!remarkData) {
      return; // user closed popup without submitting
    }

    const payload = this.buildPayload(selectedCustomers, remarkData, i);

    if(this.isReceiver === true){
      const data={
        "requestCustomerPortfolioSaveRequestDto":payload,
      }
      this.msmeService.saveRequestByRmDataForReceiver(data).subscribe({
      next: (res) => {
        if (res.status === 200) {
          // const removedItem = this.portfolioResults.splice(i, 1)[0];
          // this.filteredRmHistoryDataForReceiver.push(removedItem);
          this.expandedRowIndex = null;
          this.searchRecevierRmHistoryByRmId();
          this.commonService.successSnackBar(res.message);
        } else {
          this.commonService.warningSnackBar(res.message);
        }
      },
      error: (err) => {
        console.error('Save request failed from receiver side:', err);
        this.commonService.errorSnackBar('Failed to save request from receiver side. Please try again.');
      }
    });
    }
    else{
    this.msmeService.saveRequestByRmData(payload).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.filteredResults = [];
          this.portfolioResults = [];
          this.isCollapsed1 = false;
          this.page = 1;
          this.pageSizeChange(this.pageSize, this.page);
          this.searchRmHistoryByRmId();
          // this.searchByRmId();
          this.commonService.successSnackBar(res.message );
        } else {
          this.commonService.warningSnackBar(res.message);
        }
      },
      error: (err) => {
        console.error('Save request failed:', err);
        this.commonService.errorSnackBar('Failed to save request. Please try again.');
      }
    });
    }
  });
}

private buildPayload(selectedCustomers: any[], remarkData: any, i?:any) {

  if (this.isReceiver) {
    if (remarkData.status === 'Rejected') {
      return selectedCustomers.map(item => ({
        status: 'Rejected',
        approverRemarks: remarkData.remarks,
        approvedTimeDuration: parseInt(item.timeDuration),
        id: item.id
      }));
    }
    return this.portfolioResults[i].responseDtos.map(item => {
      const isSelected = selectedCustomers.find(sc => sc.id === item.id);
      return {
        status: isSelected ?  'Approved' : 'Rejected',
        approverRemarks: remarkData.remarks,
        approvedTimeDuration: parseInt(isSelected?.timeDuration || item.timeDuration),
        id: item.id
      };
    });
  }
  else{
  return {
    requestedRmPsId: this.userNameAndEmailidList?.requestedRmPsId,
    // rmTimeDuration: this.masterTimeDuration,
    combineDuration: this.masterTimeDuration,
    senderPsId: this.empCode,
    requestorRemarks:  remarkData.remarks,
    requestedRmEmailId: this.userNameAndEmailidList?.requestedRmEmailId,
    requestedRmName: this.userNameAndEmailidList?.requestedRmName,

    rmData: selectedCustomers.map(c => ({
      timeFrame: c.timeDuration,
      customerId: this.isReceiver ? c.id : c.customerId,
      pan: c.pan,
      companyName: c.customerName,
      cust_id:c.cust_id
    }))
  };
  }
}


   RequestStatus_popup(showFields: boolean, cmpData?:any): void {
    if(cmpData.requestedTimeDuration==null){
      this.commonService.warningSnackBar('Please select time duration!');
      return;
    }

    const dialogRef = this.dialog.open(RequestStatusPopupComponent, {
      data: { showFields: showFields},
      panelClass: ['popupMain_design'],
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {

      this.receivedStatus = result.status;
      this.receivedRemarks = result.remarks;

      // if(this.commonService.isObjectNullOrEmpty(this.receivedRemarks)){
      //   this.commonService.warningSnackBar("Please select remarks !..");
      //   return;
      // }
        // ________________________________  S A V A E   A N D  U P D A T E   ________________________________


        if(cmpData.id > 0) {
          const update_company_details ={
            "status":this.receivedStatus,
            "approverRemarks":this.receivedRemarks,
            "approvedTimeDuration":cmpData.requestedTimeDuration,
            "id":cmpData.id,
          }
          this.msmeService.saveRequestPortFolio(update_company_details).subscribe(
            (res) => {
              this.onTabChange({  tab: { textLabel: "Request Received" }  } as MatTabChangeEvent);
            },
            (err) => {
              console.error("Error saving request portfolio", err);

            }
          );

        }else{
          const save_company_details ={
            "companyName":cmpData.customerName,
            "companyType": cmpData.companyType ,
            "requestedRmPsId":cmpData.rmId,
            "requestedRmName":cmpData.rmName,
            "requestedRmEmailId":cmpData.rmEmailId,
            "requestorRemarks":this.receivedRemarks,
            "requestedTimeDuration":cmpData.requestedTimeDuration,
            "empCode":this.empCode,
            "userRoleId": this.userRoleId
          }

          // if (!this.receivedRemarks?.trim()) {
          //   this.commonService.errorSnackBar("Remarks is required.");
          //   return;
          // }

          this.msmeService.saveRequestPortFolio(save_company_details).subscribe((response)=>{
            if(response.status == 201) {
              this.commonService.successSnackBar(response.message);
            } else if(response.status == 400) {
              this.commonService.warningSnackBar(response.message, {"duration": 4000});
            } else if(response.status == 500) {
              this.commonService.errorSnackBar(response.message);
            }

            this.recentCompanyHistoryData();
            this.commonService.removeStorage(Constants.httpAndCookies.CMP_SEARCH_DATA);

            // Find and remove the item from the list
            const index = this.allSearchCustomerData.findIndex(i =>
              i.customerName?.trim().toLowerCase() === cmpData.customerName?.trim().toLowerCase() &&
              i.companyType === cmpData.companyType &&
              i.rmId === cmpData.rmId &&
              i.rmName === cmpData.rmName &&
              i.rmEmailId === cmpData.rmEmailId &&
              i.requestedTimeDuration === cmpData.requestedTimeDuration
            );

            if (index !== -1) {
              this.allSearchCustomerData.splice(index, 1);
            }

          })
        }

    });
  }

  getTotalOpportunity(event: any): void {

    const data = {
      "senderUserId": this.rmUserId,
      "totalOpportunityType": event.value,
      "isRmPortfolio":false
    }

    this.msmeService.getTotalOpportunity(data).subscribe((res)=>{
     this.historyCompanyListForSender = res.data;
    });
  }

  // initForm(value?:any) {
  //   this.searchForm = this.fb.group({
  //     applicationCode: [''],
  //     name: [''],
  //     opportunity: [''],

  //   });
  // }

    initForm(value?: any) {
      this.searchForm = this.fb.group({
        applicationCode: [value?.applicationCode || ''],
        name: [value?.name || ''],
        opportunity: [value?.opportunity || ''],
      });
    }

  // request sender for filer
  requestSenderFilter(value?:any) {
    this.requestSender = this.fb.group({
      companyType: [''],
      customerName: [''],
      persona: [this.allPersona[0]?.value || ''],
      minHsbcWallet: [''],
      maxHsbcWallet: [''],
      totalOpportunity: [this.totalOpportunities[0]?.value || ''],
      opportunity: [''],
      minShare: [''],
      maxShare: [''],
      preApproved: [''],
      status: [''],
      senderRmId: [''],
      pendingTime: [''],
      senderUserId: this.rmUserId
    });

    this.syncMinMaxControls(this.requestSender, 'minHsbcWallet', 'maxHsbcWallet');
    this.syncMinMaxControls(this.requestSender, 'minShare', 'maxShare');

    this.requestSender.valueChanges.pipe(   debounceTime(300),
    distinctUntilChanged() )

    .subscribe(values => {
      console.log("Filter values changed: ", values);
      const formattedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] = values[key] === '' ? null : values[key];
        return acc;
      }, {} as any);
      formattedValues.isRmPortfolio = false;
      // formattedValues["mainPersona"] = this.personaMap[this.requestSenderForApprovedStatus.get("persona")?.value].group
      // formattedValues["subPersona"] = this.personaMap[this.requestSenderForApprovedStatus.get("persona")?.value].option
      // Make API call with form values

      this.msmeService.getRequestPortFolio(formattedValues).subscribe((res) => {
        this.historyCompanyListForSender = res.data;
        this.sortData(this.sortField, false);
      });

    });
  }

  // for recevier (approve or reject request)
  pendingRequestFiler(value?:any) {
    this.approveRejectRequestRecevier = this.fb.group({
      customerName: [''],
      companyType: [''],
      requestedRmPsId: [''],
      requestedRmName: [''],
      requestedRmEmailId: [''],
      timeDuration: [''],
      status:[''],
      pendingTime:[''],
      approverRemarks:[''],
      opportunity: [''],
      receiverUserId: this.rmUserId,
    });

    this.approveRejectRequestRecevier.valueChanges.pipe(   debounceTime(300),
    distinctUntilChanged() )

    .subscribe(values => {
      console.log("Filter values changed: ", values);

      const formattedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] = values[key] === '' ? null : values[key];
        return acc;
      }, {} as any);
      // Make API call with form values
      this.msmeService.getRequestPortFolio(formattedValues).subscribe((res) => {
        this.approve_reject_companaylist = res?.data?.filter(company => company.status !== 'Pending');
      });

    });
  }

  // for recevier (pending request )
  pendingRecevierReqFilter(value?:any) {
    this.pendingRecevierRequestFilter = this.fb.group({
      customerName: [''],
      companyType: [''],
      requestedRmPsId: [''],
      requestedRmName: [''],
      requestedRmEmailId: [''],
      timeDuration: [''],
      status:[''],
      pendingTime:[''],
      approverRemarks:[''] ,
      opportunity: [''],
      receiverUserId: this.rmUserId,
    });

    this.pendingRecevierRequestFilter.valueChanges.pipe(   debounceTime(300),
    distinctUntilChanged() )

    .subscribe(values => {
      const formattedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] = values[key] === '' ? null : values[key];
        return acc;
      }, {} as any);
      // Make API call with form values
      this.msmeService.getRequestPortFolio(formattedValues).subscribe((res) => {
        this.pending_companylist = res.data.filter(company => company.status === 'Pending');
      });

    });
  }
  cmpDataForSave:any;
  saveCompanyDetails(cmpData:any){
    this.cmpDataForSave  = cmpData;
  }

  isCompanyAlreadyExist(companyName: string): Observable<boolean> {
    const data = {
      senderUserId: this.rmUserId
    };

    return this.msmeService.getRequestPortFolio(data).pipe(
      map((res: any) => {
        if (Array.isArray(res.data)) {
          this.historyCompanyListForSender = res.data;
          const matchedCompany = this.historyCompanyListForSender.find(company =>
            company.customerName.toLowerCase() === companyName.toLowerCase()
          );

          if(matchedCompany) {
            return matchedCompany.isCompleted;
          }
          return true;
        }
        return true;
      })
    );
  }

  searchCompany(){
    const companySearch = this.companySearch;
    const cusotmerSearchData = {
      "customerName": this.companySearch
  }

  this.msmeService.searchCustomerRequestPortFolio(cusotmerSearchData).subscribe((res) => {
    if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
      this.commonService.warningSnackBar('Company details not found');
      return;
    }

    // Check existing company while search and after that save
    // this.isCompanyAlreadyExist(companySearch).subscribe((isExist: boolean) => {
      // if(!isExist) {
      //   this.commonService.warningSnackBar('Customer request already exist!!');
      //   return;
      // }

      this.searchAbleCustomerData = Array.isArray(res.data) ? res.data : [res.data];

      const newUniqueCustomers = this.searchAbleCustomerData.filter(newItem => {
        return !this.allSearchCustomerData.some(existingItem =>
          existingItem.customerName?.toLowerCase().trim() === newItem.customerName?.toLowerCase().trim()
        );
      });

      if (newUniqueCustomers.length === 0) {
        this.commonService.warningSnackBar('Customer request already exist in Company Detils.');
        return;
      }

      this.allSearchCustomerData = [...this.allSearchCustomerData, ...newUniqueCustomers];
      this.commonService.setStorage(Constants.httpAndCookies.CMP_SEARCH_DATA, JSON.stringify(this.allSearchCustomerData));
    // });
  });

    // this.msmeService.searchCustomerRequestPortFolio(cusotmerSearchData).subscribe((res)=>{
    //   if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
    //     this.commonService.warningSnackBar('Company details not found');
    //     return;
    // }
    //  this.searchAbleCustomerData = Array.isArray(res.data) ? res.data : [res.data];
    //  this.allSearchCustomerData = [...this.allSearchCustomerData, ...this.searchAbleCustomerData];

    //  this.commonService.setStorage('allSearchCustomerData', JSON.stringify(this.allSearchCustomerData));
    // });
    // after getting response clear the input

    if(!this.isFindETB) {
      this.companySearch = '';
    }

    this.companyNameList = [];
    this.clearFilterFormValue();
  }

  getControl(controlName: string) {
    return this.searchForm.get(controlName);
  }

  getControlValue(controlName: string) {
    return this.searchForm.get(controlName)?.value;
  }
  clearFilterFormValue() {
    this.getControl('applicationCode').patchValue(null);
    this.getControl('name').patchValue(null);

  }

  getSearchCustomerDetails(event: KeyboardEvent) {
    if (event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (typeof this.companySearch != 'string' || this.companySearch.length <= 3) {
      this.companyNameList = [];
      this.clearFilterFormValue();
      return;
    }
      this.getControl('applicationCode').patchValue(null);
      this.getControl('name').patchValue(this.companySearch);
      this.getSearchCustomerData();
  }

  getSearchCustomerData() {
    const data = {
      "customerName": this.companySearch
    }
    this.searchCompanyFound = true;
    this.msmeService.searchCompanyDetails(data).subscribe((res: any) => {
      this.searchCompanyFound = false;
      if (res.status == 200 && !this.commonService.isObjectNullOrEmpty(res.data) && res.data.length > 0) {
        this.companyNameList = res.data;
      }
      else {
        this.companyNameList = [];
        if(this.commonService.isObjectNullOrEmpty(this.customerList)){
          this.commonService.warningSnackBar('Its seems we have not found any Company.')
        }
      };
    });
  }

  // ________________________________ R E Q U E S T   S E N D E R   ________________________________

  recentCompanyHistoryData(){
    const data = {
      "senderUserId": this.rmUserId,
      "isRmPortfolio":false
  }
    this.msmeService.getRequestPortFolio(data).subscribe((res)=>{
     this.historyCompanyListForSender = res.data;
    })
  }

  onTabChange(event: MatTabChangeEvent): void {
    const isReceiverTab = event.tab.textLabel === "Request Received";
    const isSenderTab = event.tab.textLabel === "Request Sent";
    const isTotalCompanies = event.tab.textLabel == "Total Companies";

    this.isReceiver = isReceiverTab;
    this.isSender = isSenderTab;
    this.isTotalCompanies = isTotalCompanies;

    this.sortFieldForHistory = '';
    this.sortDirectionForHistory = 'asc';

    if(!this.commonService.isObjectNullOrEmpty(this.rmHistoryData))
    this.filteredDataRmHistoryData = [...this.rmHistoryData];

    if(!this.commonService.isObjectNullOrEmpty(this.receverRmHistory))
    this.filteredRmHistoryDataForReceiver = this.receverRmHistory.filter(item=>item.status!=='Pending');
    this.clearFilters();
    this.selectedOption = '1';
    this.rmName = '';
    this.companySearch = '';
    this.masterSelected = false;
    this.portfolioResults = [];
    this.isCollapsed1 = false;
    this.isCollapsed2 = false;
    this.masterTimeDuration = '15';
    this.searchResults = [];
    this.searchText = '';

    if(this.isReceiver === true || this.isSender === true) {
      // this.requestSenderForApprovedStatus.reset();
      this.isTotalCompanies = false;
      if(this.requestSenderForApprovedStatus) {
        this.requestSenderForApprovedStatus.patchValue({
          customerName: '',
          // persona: '',
          totalOpportunity: this.totalOpportunities[0]?.value || '',
          share: '',
          pendingTime: '',
          requestedRmName: '',
          hsbcWallet: ''
        });
      }

      const data = isReceiverTab
      ? { receiverUserId: this.rmUserId,isRmPortfolio:false}
      : { senderUserId: this.rmUserId, isRmPortfolio:false}
    this.msmeService.getRequestPortFolio(data).subscribe(
      (res) => {
        if (!res.data || !Array.isArray(res.data)) {
          console.log("Invalid response data");
          return;
        }

        if (isReceiverTab) {
          this.pending_companylist = res.data.filter(
            (company) => company.status === 'Pending'
          );
          this.approve_reject_companaylist = res.data.filter(
            (company) => company.status !== 'Pending' && company.status !== 'Revoked'
          );
        }

        if (isSenderTab) {
          this.historyCompanyListForSender = res.data;
        }
      },
      (error) => {
        console.error("Error fetching portfolio data:", error);
      }
    );
  }
  else if(isTotalCompanies === true){
    console.log("Inside else if::::> ")
    const data = { senderUserId: this.rmUserId}
      this.msmeService.getTotalCompaniesList(data).subscribe(
        (res) => {
          if (!res.data || !Array.isArray(res.data)) {
            console.log("Invalid response data");
            return;
          }

          this.approvedStatusListForSender = res.data;
        },
        (error) => {
          console.error("Error fetching portfolio data:", error);
        }
      );
    }
  }


  // Individual Checkbox Click Event
 toggleSelection(customerId: number) {
    // if (this.selectedCustomers.has(customerId)) {
    //   this.selectedCustomers.delete(customerId);
    // } else {
    //   this.selectedCustomers.add(customerId);
    //   console.log("selectedCustomers ", this.selectedCustomers);
    // }

    // Below 3 lines were used for selected checkboxes
    // this.selectedIds.includes(customerId)
    // ? this.selectedIds = this.selectedIds.filter(item => item !== customerId)
    // : this.selectedIds.push(customerId);

    const index = this.selectedIds.indexOf(customerId);

  if (index === -1) {
    this.selectedIds.push(customerId);
  } else {
    this.selectedIds.splice(index, 1);
  }

  this.updateMasterCheckboxState();
  }

  navigateToView(pan:String) {
    let panData:any = pan.toString();
    GlobalHeaders['x-page-data'] = panData;
    GlobalHeaders['x-page-action'] = 'View Exisiting Portfolio';
    const routerData = { pan: pan,tabId:1 };// Data to pass
    saveActivity(() => {});
    const exisitngPortfolioPageData = this.commonService.getPageData(Constants.pageMaster.PORTFOLIO_NEW, Constants.pageMaster.EXISTING_PORTFOLIO);
    this.router.navigate([`/hsbc/rmExisitingPortfolioView`] , { state: { routerData , data:exisitngPortfolioPageData, dataFrom: this.pageData, isFromParentPage: true } });
}

  getPendingTime(value: any): string {
    return value === null || value === undefined || value === '' ? '-' : value;
  }
  private getDisplayPendingTimeRank(item: any): number {
    const value = item?.pendingTime;
    const status = item?.status;
    // Mirror the template display logic: show '-' for falsy pendingTime, 'null' string, Pending or Rejected status
    if (!value || value === 'null' || status === 'Pending' || status === 'Rejected') {
      return -1; // displayed as '-'
    }
    const num = Number(value);
    if (isNaN(num)) return -1;
    if (num === -1) return Infinity; // displayed as 'Unlimited'
    return num;
  }

  getUserDetails() {
    this.rmUserId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
  }
  getEmpCode() {
    this.empCode = this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true);
  }
  RequestStatus_popup_for_checkbox(showFields: boolean): void {

    if(this.selectedIds.length==0 ){
      this.commonService.errorSnackBar("Please select at least one company.");
      return;
    }

    const dialogRef = this.dialog.open(RequestStatusPopupComponent, {
      data: { showFields: showFields,cmpDetailsInRecevier:this.cmpDetailsInRecevier},
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.receivedStatus = result?.status;
      this.receivedRemarks = result?.remarks;

      if (!result) return;
      if (this.commonService.isObjectNullOrEmpty(this.receivedStatus)) {
        this.commonService.errorSnackBar("Please select a status.");
        return;
      }

      if (this.commonService.isObjectNullOrEmpty(this.receivedRemarks)) {

        this.commonService.errorSnackBar("Please enter remarks.");
        return;
      }
       // ________________________________C H E C K B O X       T H R O U H          S A V E           AND         U P D A T E        R E Q U E S T ________________________________

      if(this.selectedIds.length > 0) {
        const selectcheckBoxAndPassData = {
          "status":this.receivedStatus,
          "approverRemarks":this.receivedRemarks,
          "ids":this.selectedIds
          //"ids":this.selectedCustomers
        }


        this.msmeService.saveRequestPortFolio(selectcheckBoxAndPassData).subscribe((res)=>{
          // Calling Get API After Select All
          const data = {
            "receiverUserId": this.rmUserId,
            "isRmPortfolio":false
          }
          this.msmeService.getRequestPortFolio(data).subscribe((res)=>{
            if (res.data && Array.isArray(res.data)) {
              this.selectedIds=[];
              this.pending_companylist = res.data.filter(company => company.status === 'Pending');
              this.approve_reject_companaylist = res.data.filter(company => company.status !== 'Pending');

            } else {
              console.error("Invalid response data");
            }
          })

          this.isMasterChecked = false;
        })
      }
    });
  }
  revokeRequestCustomerPortfolio(id: any) {
    const revokeRequestPayload = {
      "id": id,
      "status": "Revoked",
      "isRevoked": true
    }

    this.msmeService.revokeRequestPortFolio(revokeRequestPayload).subscribe((res)=>{
      this.commonService.successSnackBar(res.message);

      if(this.isTotalCompanies == true) {
        const data = {
          "senderUserId": this.rmUserId,
        }

        this.msmeService.getTotalCompaniesList(data).subscribe((res)=>{
          this.approvedStatusListForSender = res.data;
         })
      }
       else if(this.isSender == true) {
        const data = {
          "senderUserId": this.rmUserId,
          "isRmPortfolio":false
        }

        this.msmeService.getRequestPortFolio(data).subscribe((res)=>{
          this.historyCompanyListForSender = res.data;
         })
      } else {
        const data = {
          "receiverUserId": this.rmUserId,
          "isRmPortfolio":false
        }

        this.msmeService.getRequestPortFolio(data).subscribe((res)=>{
          if (res.data && Array.isArray(res.data)) {
            this.pending_companylist = res.data.filter(company => company.status === 'Pending');
            this.approve_reject_companaylist = res.data.filter(company => company.status !== 'Pending');
            this.approve_reject_companaylist = res.data.filter(company => company.status !== 'Revoked');

          } else {
            console.error("Invalid response data");
          }
        })
      }

    })
  }

  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
            return true; // Return true if found
        }
    }
    return false; // Return false if not found
  }

  // Method is for Multiple checked checkboxes
  toggleSelectAll(event: any) {
    this.isMasterChecked = event.checked;
    this.selectedIds = event.checked
      ? this.pending_companylist.map(item => item.id)
      : [];
  }

  revokeToRequestedRm(rmData:any){
  const revokeRequestPayload = {
    uuid: rmData.uuid,
    status:"Revoked",
    isRevoked:true,
  };

  this.msmeService.revokeForRequested(revokeRequestPayload).subscribe((res) => {
    if (res && res.status === 200) {
      this.commonService.successSnackBar(res.message);
      if(this.isReceiver === true)
      this.searchRecevierRmHistoryByRmId();

      else
      this.searchRmHistoryByRmId();
    }
    else{
       this.commonService.warningSnackBar(res.message);
    }
  });

  }

  updateMasterCheckboxState() {
    const total = this.pending_companylist.length;
    const selected = this.selectedIds.length;

    this.isMasterChecked = selected === total;
    this.isIndeterminate = selected > 0 && selected < total;
  }
  // onSearchClickbyRm() {
  //   if (!this.rmSearchRmName || this.rmSearchRmName.trim() === '') {
  //     return;
  //   }

  //   const results = this.displayPortfolioResults;
  //   if (results.length === 0) {
  //     this.commonService.warningSnackBar('No matching RM Name found!');
  //   }
  // }

  // API Call to Fetch Sorted Data
  getSortedData() {
    if(this.isApprovedStatusSortingApplied == true) {
      const sortRequestPayload = {
        sortField: this.sortField,
        sortDirection: this.sortDirection,
        senderUserId: null,
        receiverUserId: null,
        status: "Approved"
      }

      if(this.sortField.match("pendingTime")) {
        sortRequestPayload.sortField = 'approvedTimeDuration';
        this.isTimeDurationSort = true;
      }

      if(this.isSender == true) {
        sortRequestPayload.senderUserId = this.rmUserId;

        this.msmeService.sortRequestPortFolio(sortRequestPayload).subscribe((res)=>{
          this.approvedStatusListForSender = res.data;
        })
      }
    } else {
      const sortRequestPayload = {
        sortField: this.sortField,
        sortDirection: this.sortDirection,
        senderUserId: null,
        receiverUserId: null
      }

      if(this.sortField.match("pendingTime")) {
        sortRequestPayload.sortField = 'approvedTimeDuration';
        this.isTimeDurationSort = true;
      }

      if(this.isSender == true) {
        sortRequestPayload.senderUserId = this.rmUserId;

        this.msmeService.sortRequestPortFolio(sortRequestPayload).subscribe((res)=>{
          this.historyCompanyListForSender = res.data;
        })
      }

      if(this.isReceiver == true) {
        sortRequestPayload.receiverUserId = this.rmUserId;

        this.msmeService.sortRequestPortFolio(sortRequestPayload).subscribe((res)=>{
          this.approve_reject_companaylist = res.data?.filter(
            (company) => company.status !== 'Pending' && company.status !== 'Revoked'
          );
        })
      }
    }
  }

  sortDataForApprovedStatusPortfolios(field: string, shouldToggle = true) {
    if (shouldToggle) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    } else {
      // Preserve existing sortField and sortDirection
      this.sortField = field;
    }

    this.approvedStatusListForSender.sort((a: any, b: any) => {
      // For pendingTime: sort based on display value (accounts for status-based '-' display)
      if (field === 'pendingTime') {
        const aRank = this.getDisplayPendingTimeRank(a);
        const bRank = this.getDisplayPendingTimeRank(b);
        const result = aRank - bRank;
        return this.sortDirection === 'asc' ? result : -result;
      }

      let valueA = this.normalizeSortValue(a[field]);
      let valueB = this.normalizeSortValue(b[field]);

      // Null values (displayed as '-') should come first in asc, last in desc
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueB == null) return this.sortDirection === 'asc' ? 1 : -1;

      // For pendingTime: treat -1 (Unlimited) as the largest value
      if (field === 'pendingTime') {
        if (valueA === -1) valueA = Infinity;
        if (valueB === -1) valueB = Infinity;
      }

      const isNumeric = typeof valueA === 'number' && typeof valueB === 'number';

      if (isNumeric) {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      return this.sortDirection === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }

  private normalizeSortValue(value: any): any {
      if (value == null || value === '' || value === 'null' || value === '-') return null;

      if (typeof value === 'string') {
        const numericString = value.replace(/,/g, '').trim();
        const parsed = parseFloat(numericString);
        if (!isNaN(parsed)) return parsed;
      }

      return value;
    }


  getApprovedStatusPortfolios() {
    const approvedRequestPayload = {
      senderUserId: this.rmUserId,
      status: "Approved"
    }

    this.msmeService.getRequestPortFolio(approvedRequestPayload).subscribe((res)=>{
      this.approvedStatusListForSender = res.data;
    })

  }

  // Dynamic Sort Based on Column Click
  sortData(field: string, shouldToggle = true) {
    // if (this.sortField === field) {
    //   this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    // } else {
    //   this.sortField = field;
    //   this.sortDirection = 'asc';
    // }
    // this.getSortedData();

    if (shouldToggle) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    } else {
      // Preserve existing sortField and sortDirection
      this.sortField = field;
    }

    if(this.isSender===true){
      this.historyCompanyListForSender.sort((a: any, b: any) => {
        // For pendingTime: sort based on display value (accounts for status-based '-' display)
        if (field === 'pendingTime') {
          const aRank = this.getDisplayPendingTimeRank(a);
          const bRank = this.getDisplayPendingTimeRank(b);
          const result = aRank - bRank;
          return this.sortDirection === 'asc' ? result : -result;
        }

        let valueA = this.normalizeSortValue(a[field]);
        let valueB = this.normalizeSortValue(b[field]);

        // Null values (displayed as '-') should come first in asc, last in desc
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueB == null) return this.sortDirection === 'asc' ? 1 : -1;

        const isNumeric = typeof valueA === 'number' && typeof valueB === 'number';

        if (isNumeric) {
          return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }

        return this.sortDirection === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      });
    }
    else{
      this.approve_reject_companaylist.sort((a: any, b: any) => {
        // For pendingTime: sort based on display value (accounts for status-based '-' display)
        if (field === 'pendingTime') {
          const aRank = this.getDisplayPendingTimeRank(a);
          const bRank = this.getDisplayPendingTimeRank(b);
          const result = aRank - bRank;
          return this.sortDirection === 'asc' ? result : -result;
        }

        let valueA = this.normalizeSortValue(a[field]);
        let valueB = this.normalizeSortValue(b[field]);

        // Null values (displayed as '-') should come first in asc, last in desc
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueB == null) return this.sortDirection === 'asc' ? 1 : -1;

        const isNumeric = typeof valueA === 'number' && typeof valueB === 'number';

        if (isNumeric) {
          return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }

        return this.sortDirection === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      });
    }
  }

  sortBy(field: string, targetList: 'allSearchCustomerData' | 'pending_companylist'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    let dataToSort = targetList === 'allSearchCustomerData'
      ? this.allSearchCustomerData
      : this.pending_companylist;

    dataToSort.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];

      const isNullA = valueA == null || valueA === '' || valueA === 'null' || valueA === '-';
      const isNullB = valueB == null || valueB === '' || valueB === 'null' || valueB === '-';

      // Null values (displayed as '-') should come first in asc, last in desc
      if (isNullA && isNullB) return 0;
      if (isNullA) return this.sortDirection === 'asc' ? -1 : 1;
      if (isNullB) return this.sortDirection === 'asc' ? 1 : -1;

      // For pendingTime: treat -1 (Unlimited) as the largest value
      if (field === 'pendingTime') {
        if (valueA === -1 || valueA === '-1') valueA = Infinity;
        if (valueB === -1 || valueB === '-1') valueB = Infinity;
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      return this.sortDirection === 'asc'
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    });
  }

  onMasterChange(value: string, i?:any) {
    this.masterTimeDuration = value;

    if(this.isReceiver === true && i !== undefined && this.portfolioResults[i]){
      this.portfolioResults[i].timeDuration = value;

      if (this.portfolioResults[i].responseDtos) {
        this.portfolioResults[i].responseDtos.forEach(item => {item.timeDuration = value;});
      }
    }
    else{
      this.filteredResults.forEach(item => {
        item.timeDuration = value;
      });
    }
  }
    onChildChanges() {
      if (!this.filteredResults || this.filteredResults.length === 0) {
        this.masterTimeDuration = null;
        return;
      }

      const firstValue = this.filteredResults[0].timeDuration;
      const allSame = this.filteredResults.every(item => item.timeDuration === firstValue);

      this.masterTimeDuration = allSame ? firstValue : '-';

    }


//    onChildChangesForRecevier(list: any[]) {
//   //   console.log(list)
//   if (!list || list.length === 0) {
//     this.masterTimeDuration = null;
//     return;
//   }

//   const firstValue = list[0].timeDuration;
//   const allSame = list.every(item => item.timeDuration === firstValue);

//   this.masterTimeDuration = allSame ? firstValue : '-';
//   console.log('Master updated:', this.masterTimeDuration);
// }

checkUncheckAll(i?:any) {
  if (this.isReceiver === true) {
      this.getFilteredResponseDtos(this.portfolioResults[i]?.responseDtos).forEach(item => {
        item.selected = this.portfolioResults[i].selected;
      });
    if (this.portfolioResults[i]?.selected) {
      this.isSelectAllcheckedForRecevier = false;
    } else {
      this.isSelectAllcheckedForRecevier = true;
    }
  }

  else{
  this.filteredResults.forEach(item => item.selected = this.masterSelected);
  if(this.userNameAndEmailidList?.count>500 && this.masterSelected===true){
      const confirmDialog = this.dialog.open(RequestedPortfolioLimitPopupComponent, {
      width: '400px',
    });
    confirmDialog.afterClosed().subscribe(result => {
    });
  }
}

}
  isAllSelected(i?:any) {
    if (this.isReceiver === true) {
      const responseDtos = this.getFilteredResponseDtos(this.portfolioResults[i]?.responseDtos) || [];
      // if(!this.commonService.isObjectIsEmpty(this.portfolioResults[i]?.selected) && this.portfolioResults[i]?.selected!==undefined){
      this.portfolioResults[i].selected = responseDtos?.length > 0 && responseDtos?.every(item => item?.selected);
      // }
      if (this.portfolioResults[i]?.selected) {
      this.isSelectAllcheckedForRecevier = false;
    } else {
      this.isSelectAllcheckedForRecevier = true;
    }
    }
    else
    this.masterSelected = this.filteredResults.every(item => item.selected);
  }

onSearchChange(i?:any) {
  const search = this.searchText?.toLowerCase().trim();

   if (this.isReceiver === true) {
    if (i !== undefined) {
      if(this.commonService.isObjectIsEmpty(this.getFilteredResponseDtos(this.portfolioResults[i]?.responseDtos)))
      this.portfolioResults[i].selected = false;

      else
      this.isAllSelected(i);

      this.totalSize = this.getFilteredResponseDtos(this.portfolioResults[i]?.responseDtos)?.length;
      this.page = 1;
      this.pageSizeChange(this.pageSize, this.page);
    }
  }
  else{
  if (!search) {
    this.filteredResults = [...this.portfolioResults];
  } else {
    this.filteredResults = this.portfolioResults.filter(item =>
      item.customerName?.toLowerCase().includes(search)
    );
  }

  if(this.commonService.isObjectIsEmpty(this.filteredResults))
  this.masterSelected=false;

  else
  this.isAllSelected();

  this.totalSize = this.filteredResults.length;
  this.page = 1;

  this.pageSizeChange(this.pageSize, this.page);
}
}
  searchRmHistoryByRmId(){
    // sender
    this.isApproverRemarkForSender = true;
    this.isRequesterRemarkForRecevier = false;
    const data= {
    "senderPsId": this.empCode
  }
this.msmeService.searchHistoryByRm(data).subscribe((historyResponse) => {
  this.rmHistoryData = historyResponse?.data;

  if(!this.commonService.isObjectNullOrEmpty(this.rmHistoryData))
  this.filteredDataRmHistoryData = [...this.rmHistoryData];
  });
  }

searchRecevierRmHistoryByRmId(){
  // recevier
  this.isRequesterRemarkForRecevier = true;
  this.isApproverRemarkForSender = false;
    const data= {
    "receiverPsId": this.empCode
  }

this.msmeService.searchHistoryByRm(data).subscribe((recevierRmHistoryResponse) => {
  this.receverRmHistory = recevierRmHistoryResponse?.data;

  if(!this.commonService.isObjectNullOrEmpty(this.receverRmHistory)) {
  this.filteredRmHistoryDataForReceiver = this.receverRmHistory.filter(item => item.status !== 'Pending');
  this.portfolioResults = this.receverRmHistory.filter(item => item.status === 'Pending');

  this.portfolioResults.forEach(portfolio => {
    portfolio.timeDuration = portfolio.combineDuration || '15';
    portfolio.selected = false;
    portfolio.responseDtos?.forEach(item => {
      item.timeDuration = item.requestedTimeDuration.toString() || '15';
      item.selected = false;
    });
  });
  }
  });

  }

updatePagination() {
  this.startIndex = (this.page - 1) * this.pageSize;
  this.endIndex = this.startIndex + this.pageSize;
  if (this.endIndex > this.totalSize) this.endIndex = this.totalSize;
}
  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  }

  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  }

  sort(field: string) {
    if (this.sortFieldForHistory === field) {
      this.sortDirectionForHistory = this.sortDirectionForHistory === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortFieldForHistory = field;
      this.sortDirectionForHistory = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortFieldForHistory !== field) return 'unfold_more';
    return this.sortDirectionForHistory === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  applyFilters() {
    let filtered = this.isSender ? [...(this.rmHistoryData || [])] : (this.receverRmHistory || []).filter(item=>item.status!=='Pending');

    Object.keys(this.filters).forEach(key => {
      const filterValue = this.filters[key];
      if (filterValue !== null && filterValue !== '' && filterValue !== undefined) {
        filtered = filtered.filter(item => {
          const itemValue = item[key];

          if (itemValue == null) return false;

          return typeof itemValue === 'number'
            ? itemValue === filterValue || itemValue.toString().includes(filterValue.toString())
            : itemValue.toString().toLowerCase().trim().includes(filterValue.toString().toLowerCase().trim());
        });
      }
    });

    if (this.sortFieldForHistory) {
      filtered.sort((a, b) => {
        let aVal = a[this.sortFieldForHistory];
        let bVal = b[this.sortFieldForHistory];

        // For pendingTime: special sort order: null/dash first, then 0+, then Unlimited(-1) last
        if (this.sortFieldForHistory === 'pendingTime') {
          const aRank = this.getDisplayPendingTimeRank(a);
          const bRank = this.getDisplayPendingTimeRank(b);
          const result = aRank - bRank;
          return this.sortDirectionForHistory === 'asc' ? result : -result;
        }

        const isNullA = aVal == null || aVal === '' || aVal === 'null' || aVal === '-';
        const isNullB = bVal == null || bVal === '' || bVal === 'null' || bVal === '-';

        // Null/dash values always come first in asc, last in desc
        if (isNullA && isNullB) return 0;
        if (isNullA) return this.sortDirectionForHistory === 'asc' ? -1 : 1;
        if (isNullB) return this.sortDirectionForHistory === 'asc' ? 1 : -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          const result = aVal - bVal;
          return this.sortDirectionForHistory === 'asc' ? result : -result;
        }

        const result = aVal.toString().trim().localeCompare(bVal.toString().trim(), undefined, { numeric: true });
        return this.sortDirectionForHistory === 'asc' ? result : -result;
      });
    }

    this.isSender ? this.filteredDataRmHistoryData = filtered : this.filteredRmHistoryDataForReceiver = filtered;
  }

  clearFilters() {
    Object.keys(this.filters).forEach(key => this.filters[key] = '');
  }

  toggleRow(index: number) {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
    this.searchText = '';

    this.totalSize = this.getFilteredResponseDtos(this.portfolioResults[index].responseDtos)?.length;
  }

  getFilteredResponseDtos(responseDtos: any[]) {
    if (!this.searchText || !responseDtos) return responseDtos;

    const result = responseDtos.filter(item => item.customerName?.toLowerCase().trim().includes(this.searchText.toLowerCase().trim()));
    this.totalSize = result?.length;
    return result;
  }

  onNumberInput(controlName: string, searchForm:FormGroup) {
    const value = searchForm.get(controlName)?.value || '';
    let cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');

    if (cleaned.startsWith('.')) {
      cleaned = '0' + cleaned;
    }

    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    searchForm.get(controlName)?.setValue(cleaned, { emitEvent: false });
  }

  syncMinMaxControls(group: FormGroup, minKey: string, maxKey: string) {
    const minControl = group.get(minKey);
    const maxControl = group.get(maxKey);

    if (!minControl || !maxControl) return;

    minControl.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.destroy$)
    ).subscribe(minVal => {
      const minNum = parseFloat(minVal);
      const maxNum = parseFloat(maxControl.value);

      if (!isNaN(minNum) && !isNaN(maxNum) && maxNum < minNum) {
        minControl.setValue(maxNum.toString());
      }
    });

    maxControl.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.destroy$)
    ).subscribe(maxVal => {
      const maxNum = parseFloat(maxVal);
      const minNum = parseFloat(minControl.value);

      if (!isNaN(maxNum) ) {
        if(!isNaN(minNum) && maxNum < minNum){
          minControl.setValue(maxNum.toString());
        }
      }

    });
  }

  sanitizeAndConvertToNumber(value: any): number {
  if (value == null || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const cleanedValue = value.replace(/,/g, '').trim();
    const parsed = parseFloat(cleanedValue);

    if (isNaN(parsed)) {
      return 0;
    }

    return parsed;
  }

  return 0;
}

  // Consolidated sorting method - handles all sorting scenarios
  toggleSort(
    sortField: string, 
    direction: 'ASC' | 'DESC', 
    options?: {
      targetArray?: 'filteredResults' | 'portfolioResults' | 'allSearchCustomerData' | 'pending_companylist' | 'approvedStatusListForSender' | 'default',
      nestedIndex?: number,
      nestedPath?: string,
      useApplyFilters?: boolean
    }
  ) {
    this.currentSortField = sortField;
    this.sortDirection = direction.toLowerCase();

    // Handle history sorting (uses applyFilters)
    if (options?.useApplyFilters) {
      this.sortFieldForHistory = sortField;
      this.sortDirectionForHistory = direction.toLowerCase();
      this.applyFilters();
      return;
    }

    // Handle default sorting (uses sortData method)
    if (!options || options.targetArray === 'default') {
      this.sortData(sortField, false);
      return;
    }

    // Get the array to sort
    let dataToSort: any[] = [];
    
    if (options.nestedIndex !== undefined && options.nestedPath) {
      // Handle nested array sorting (like portfolioReceiver)
      dataToSort = this.portfolioResults[options.nestedIndex][options.nestedPath];
    } else {
      // Handle direct array sorting
      switch (options.targetArray) {
        case 'filteredResults':
          dataToSort = this.filteredResults;
          break;
        case 'portfolioResults':
          dataToSort = this.portfolioResults;
          break;
        case 'allSearchCustomerData':
          dataToSort = this.allSearchCustomerData;
          break;
        case 'pending_companylist':
          dataToSort = this.pending_companylist;
          break;
        case 'approvedStatusListForSender':
          dataToSort = this.approvedStatusListForSender;
          break;
      }
    }

    // Perform the sort
    if (dataToSort && dataToSort.length > 0) {
      dataToSort.sort((a: any, b: any) => {
        // For pendingTime: sort based on display value (accounts for status-based '-' display)
        if (sortField === 'pendingTime') {
          const aRank = this.getDisplayPendingTimeRank(a);
          const bRank = this.getDisplayPendingTimeRank(b);
          const result = aRank - bRank;
          return this.sortDirection === 'asc' ? result : -result;
        }

        let valueA = this.normalizeSortValue(a[sortField]);
        let valueB = this.normalizeSortValue(b[sortField]);

        // Null values (displayed as '-') should come first in asc, last in desc
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueB == null) return this.sortDirection === 'asc' ? 1 : -1;

        const isNumeric = typeof valueA === 'number' && typeof valueB === 'number';

        if (isNumeric) {
          return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }

        return this.sortDirection === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      });
    }
  }

  // get displayPortfolioResults() {
  //   if (!this.rmSearchRmName || this.rmSearchRmName.trim() === '') {
  //     return this.portfolioResults;
  //   }

  //   return this.portfolioResults.filter(item =>
  //     item.rmName?.toLowerCase().includes(this.rmSearchRmName.toLowerCase())
  //   );
  // }

  // sortBy(field: string): void {
  //   if (this.sortField === field) {
  //     this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  //   } else {
  //     this.sortField = field;
  //     this.sortDirection = 'asc';
  //   }

  //   this.allSearchCustomerData.sort((a, b) => {
  //     let valueA = a[field];
  //     let valueB = b[field];

  //     valueA = valueA !== null && valueA !== undefined ? valueA : '';
  //     valueB = valueB !== null && valueB !== undefined ? valueB : '';

  //     if (typeof valueA === 'number' && typeof valueB === 'number') {
  //       return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  //     }

  //     return this.sortDirection === 'asc'
  //       ? valueA.toString().localeCompare(valueB.toString())
  //       : valueB.toString().localeCompare(valueA.toString());
  //   });
  // }
}

function renameKey(obj: any, oldKey: string, newKey: string): any {
  if (obj.hasOwnProperty(oldKey)) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }
  return obj;
}

// // Master Checkbox Click Event
// selectAllProspect() {
//   this.isChecked = !this.isChecked;
//   this.selectedCustomers.clear();

//   if (this.isChecked) {
//     this.customerList.forEach(customer => this.selectedCustomers.add(customer.id));
//   }
//   console.log(this.customerList);


//   this.updateTransformedCustomer();
//   this.updateAssignButtonState(); // Update button disable state
//   }


//   // Update Master Checkbox State
//   this.isChecked = this.selectedCustomers.size === this.customerList.length;
//   this.updateTransformedCustomer();
//   this.updateAssignButtonState();
//   }


//   updateTransformedCustomer() {
//     this.transformedCustomer = this.customerList
//       .filter(customer => this.selectedCustomers.has(customer.id))
//       .map(customer => ({ pan: customer.panNo, cin: customer.cin }));
//     }

//     updateAssignButtonState() {
//       this.disableAssignButton = this.selectedCustomers.size === 0; // Button enabled only when at least one checkbox is selected
//     }


