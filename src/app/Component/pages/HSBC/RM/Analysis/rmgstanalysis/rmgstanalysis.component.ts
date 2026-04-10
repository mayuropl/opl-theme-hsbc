import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, UntypedFormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { AuditAPIType, Constants } from 'src/app/CommoUtils/constants';
import { Pagination } from 'src/app/CommoUtils/model/pagination';
import { HSBCGSTOTPVerifyComponent } from 'src/app/Popup/HSBC/hsbcgstotpverify/hsbcgstotpverify.component';
import { HSBCProvideSelesComponent } from 'src/app/Popup/HSBC/hsbcprovide-seles/hsbcprovide-seles.component';
import { MsmeService } from 'src/app/services/msme.service';
import {
  clearCookie,
  GlobalHeaders,
  resetGlobalHeaders,
  saveActivity
} from "../../../../../../CommoUtils/global-headers";
import { ReadInstructionsPopupComponent } from 'src/app/Popup/read-instructions-popup/read-instructions-popup.component';

@Component({
  selector: 'app-rmgstanalysis',
  templateUrl: './rmgstanalysis.component.html',
  styleUrl: './rmgstanalysis.component.scss'
})
export class RMGSTAnalysisComponent implements OnInit, OnDestroy {

  panForm: FormGroup;
  gstinListSearchForm: FormGroup;
  gstHistorySearchForm: FormGroup;
  pageOfItems: Array<any>;
  gstinPagination: Pagination;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  maxDate: Date = new Date(); // Prevent future date selection
  // tab: number =1;
  customerList: any = [];
  totalCount;
  userId: any;
  panVerified: boolean = false;
  pan:any;

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
  ]

  gsinList: any = [];

  isAnyVerified = false;
  psgeGstList: any = [];
  gstHistoryDataList: any = [];
  isHistoryDataFetched: Boolean = false;

  // Store filter state
  private filterState: any = null;

  // proposalStatus = [
  //   { value: '2', viewValue: 'someData', tab: '1' },
  //   { value: '3', viewValue: 'someData', tab: '1' },
  //   { value: '4', viewValue: 'someData', tab: '1' },
  //   { value: '5', viewValue: 'someData', tab: '2' },
  //   { value: '6', viewValue: 'someData', tab: '2' },
  // ];

  stateList = [];

  subscriptions: Subscription[] = [];
  id: number | undefined;
  pageData: any;
  constants:any;
  constructor(
    public dialog: MatDialog, private msmeService: MsmeService, private commonService: CommonService, private router: Router, private http: HttpClient,
    public commonMethod: CommonMethods, private loaderService: LoaderService, private formBuilder: UntypedFormBuilder, private datepipe: DatePipe, private fb: FormBuilder
  ) {
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
  }

  onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getGstHistoryDataAPI();
  }

  onGstinPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.gstinPagination.startIndex = (page - 1) * this.gstinPagination.pageSize;
    this.gstinPagination.endIndex = (page - 1) * this.gstinPagination.pageSize + this.gstinPagination.pageSize;
    this.gstinPagination.page = page;
    this.getGstinData();
  }

  OtpVerifyPopup(gst: any) {
    const dialog = this.dialog.open(HSBCGSTOTPVerifyComponent, {
      panelClass: ['w-500px'],
      autoFocus: false,
    });
    dialog.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }



  rmprovideSeles() {

    let data = [];
    if (this.gsinList) {
      for (let list of this.gsinList) {
        if (list?.isOtpVerified == true) {
          data.push(list);
        }
      }
      if (data.length > 0) {
        console.log("Data ==>", data)
        const dialog = this.dialog.open(HSBCProvideSelesComponent, {
          panelClass: ['w-500px'],
          autoFocus: false,
        });
        dialog.afterClosed().subscribe(result => {
          console.log(`Dialog result: ${result}`);
        });
      } else {
        this.commonService.warningSnackBar("At least one gstin otp should be verified");
        // console.log("At least one gstin otp should be verified")
      }
    }

    const dialog = this.dialog.open(HSBCProvideSelesComponent, {
      panelClass: ['w-500px'],
      autoFocus: false,
    });
    dialog.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });

  }

  isExistingPanFound : boolean = false;
  protected readonly consValue = Constants;
  ngOnInit() {
    this.constants = Constants;
    this.pageData = history.state.data;
      if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS2,this.consValue.pageMaster.FINANCIALS_ANALYSIS,this.consValue.pageMaster.GST_ANALYSIS)
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmGSTAnalysis';
    GlobalHeaders['x-main-page'] = 'GST Analysis';
    console.log('Received data:', this.pageData);

    // Clear any existing subscriptions before re-initializing
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];

    if(!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("existing_pan", true))) {
      this.isExistingPanFound = true;
      this.initForm(this.commonService.getStorage("existing_pan", true));
    }else if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("gst_pan", true))) {
      this.initForm(this.commonService.getStorage("gst_pan", true));
    } else {
      this.initForm();
    }
    // for Specific Class on Page
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('with_pageTitle_searchForm');
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('with_pageTitle_searchForm');
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    // Note: We intentionally keep gst_history_filters in storage for navigation back
  }
  initForm(value?: any) {

    this.gstinPagination = new Pagination();
    this.panForm = this.fb.group({
      pan: new FormControl(value || '', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')])
    })
    this.pan = value;
    // this.getStateList();
    // Initialize controls outside the main form

    this.gstinListSearchForm = this.fb.group({
      nameOfCompany: [''],
      gstin: [''],
      constitution: [''],
      // gstUsername: [''],
      state: ['All']
    });


    // Subscribe to value changes in searchForm
    this.subscriptions.push(
      this.gstinListSearchForm.valueChanges.pipe(
        debounceTime(300),// Wait for 300ms pause in events
        distinctUntilChanged() // Only emit when the value has changed
      ).subscribe(value => {
        // Call API method on form value change
        this.getGstinData();
      })
    )

    // Initialize history search form - always create fresh form
    this.gstHistorySearchForm = this.fb.group({
      nameOfCompany: ['', [Validators.maxLength(30)]],
      rmName: ['', [Validators.maxLength(15)]],
      rmEmailId: [''],
      gstId: ['', [Validators.pattern('^[0-9]*$'), Validators.maxLength(15)]],
      dateOfReport: ['']
    });

    // Restore filter state if available
    const savedFilters = this.commonService.getStorage("gst_history_filters", true);
    if (savedFilters && !this.commonService.isObjectNullOrEmpty(savedFilters)) {
      try {
        const filterValues = JSON.parse(savedFilters);
        this.gstHistorySearchForm.patchValue(filterValues, { emitEvent: false });
        this.filterState = filterValues;
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }

    // Subscribe to value changes in history search form
    this.subscriptions.push(
      this.gstHistorySearchForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        // Filter to only trigger search if at least one meaningful filter is provided
        filter(value => {
          const nameOfCompany = value.nameOfCompany ? value.nameOfCompany.trim() : '';
          const rmName = value.rmName ? value.rmName.trim() : '';
          const rmEmailId = value.rmEmailId ? value.rmEmailId.trim() : '';
          const gstId = value.gstId ? value.gstId.trim() : '';
          const dateOfReport = value.dateOfReport;

          // Allow search if ANY of these conditions are true:
          // - nameOfCompany has 3+ characters OR
          // - rmName has 3+ characters OR
          // - rmEmailId has any value OR
          // - gstId has any value OR
          // - dateOfReport has any value OR
          // - ALL filters are empty (to show all results when filters are cleared)
          const hasNameFilter = nameOfCompany.length >= 3;
          const hasRmNameFilter = rmName.length >= 3;
          const hasEmailFilter = rmEmailId.length > 0;
          const hasGstIdFilter = gstId.length > 0;
          const hasDateFilter = dateOfReport;
          const allFiltersEmpty = !nameOfCompany && !rmName && !rmEmailId && !gstId && !dateOfReport;

          return hasNameFilter || hasRmNameFilter || hasEmailFilter || hasGstIdFilter || hasDateFilter || allFiltersEmpty;
        })
      ).subscribe(value => {
        this.page = 1; // Reset to first page on filter change
        this.getGstHistoryDataAPI();
      })
    )

    // Reset pagination and fetch history data when PAN is provided
    if (!this.commonService.isObjectNullOrEmpty(value)) {
      this.page = 1;
      this.startIndex = 0;
      this.endIndex = this.pageSize;
      this.getGstHistoryDataAPI();
    }
  }

  // Method to get value of a specific control
  getControlValue(controlName: string) {
    return this.panForm.getRawValue().pan
  }

  // Date filter to prevent future date selection
  dateFilter = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  }

  // Method to clear all filters
  clearFilters(): void {
    this.gstHistorySearchForm.reset({
      nameOfCompany: '',
      rmName: '',
      rmEmailId: '',
      gstId: '',
      dateOfReport: ''
    });
    this.page = 1;
    // Clear saved filter state
    this.filterState = null;
    this.commonService.removeStorage("gst_history_filters");
    this.getGstHistoryDataAPI();
  }

  // Method to clear GSTIN list filters
  clearGstinFilters(): void {
    this.gstinListSearchForm.reset({
      nameOfCompany: '',
      gstin: '',
      constitution: '',
      state: 'All'
    });
    this.gstinPagination.page = 1;
    this.getGstinData();
  }

  // Method to limit Name of Company to 30 characters
  onNameOfCompanyInput(event: any): void {
    const input = event.target.value;
    if (input.length > 30) {
      event.target.value = input.slice(0, 30);
      this.gstHistorySearchForm.get('nameOfCompany').setValue(event.target.value, { emitEvent: false });
    }
  }

  // Method to limit RM Name to 15 characters
  onRmNameInput(event: any): void {
    const input = event.target.value;
    if (input.length > 15) {
      event.target.value = input.slice(0, 15);
      this.gstHistorySearchForm.get('rmName').setValue(event.target.value, { emitEvent: false });
    }
  }

  // Method to filter Reference ID input - only numeric digits up to 15
  onReferenceIdInput(event: any): void {
    const input = event.target.value;
    // Remove non-numeric characters and limit to 15 digits
    event.target.value = input.replace(/[^0-9]/g, '').slice(0, 15);
    // Update form control value
    this.gstHistorySearchForm.get('gstId').setValue(event.target.value, { emitEvent: false });
  }

  verifyPan() {
    GlobalHeaders['x-page-action'] = 'calling tp-by-Pan';
    if (this.panForm.valid) {
      var json = {};
      json["pan"] = this.getControlValue('pan');
      json["userId"] = this.userId;
      console.log(this.panForm.value);
      this.msmeService.gstAnalysisTpByPan(json).subscribe((response: any) => {
        if (response.isDisplayStatus === 1) {
          this.id = response?.data;
          this.panVerified = true;
          this.getGstinData();
          // } else {
          this.commonService.setStorage(Constants.httpAndCookies.ANALYSIS_MASTER_ID, '' + this.id);
          console.log(response);
        } else {
          console.log(response.message);
          this.commonService.warningSnackBar(response.message)
        }
      }, error => {
        this.commonService.errorSnackBar('Something Went Wrong')
        console.error('Upload failed', error);
      })
    }

  }

  getGstinData() {
    var json = {};
    json["id"] = this.id;
    // json["id"] = 33;
    console.log(this.panForm.value);
    if (this.gstinListSearchForm.valid) {
      json["filterJSON"] = this.getFilteredFormValue();
      if (json["filterJSON"] != null) {
        json["filterJSON"] = JSON.stringify(json["filterJSON"]);
      }
    };
    this.stateList = [];
    GlobalHeaders['x-page-action'] = 'Search from GST Analysis History';
    this.msmeService.gstAnalysisTpByPanData(json,false).subscribe((response: any) => {

      if (response.status === 200) {
        this.gstinPagination.totalSize = response?.data;
        this.gsinList = response?.listData;
        let pendingCount = 0;
        this.gsinList.forEach(element => {
          if(element.otpVerificationStatus == 'Success'){
            this.isAnyVerified = true;
          } else if(element.otpVerificationStatus == "Pending"){
            pendingCount = pendingCount+1;
          }
        });
        if (pendingCount > 0) {
          this.callGetStatusApiInInterval();
        }
        this.stateList.push("All");
        if(response?.dataList){
          response?.dataList.forEach(element => {
            this.stateList.push(element);
          });
        }
        this.updatePage(this.gsinList);
        console.log(response);
      } if(response.status === 404){
        console.log(response);
        this.commonService.warningSnackBar(response.message)
      }else {
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    })
  }

  isInterValAlreadyCalled = false;
  private progressInterval: any;
  callGetStatusApiInInterval(){
    if(this.isInterValAlreadyCalled) {
      return;
    }
    setTimeout(() => {
      this.progressInterval = setInterval(() => {
        this.isInterValAlreadyCalled = true;
        let pendingCount = 0;
        this.gsinList.forEach(element => {
          if(element.otpVerificationStatus == 'Success'){
            this.isAnyVerified = true;
          } else if(element.otpVerificationStatus == "Pending"){
            pendingCount = pendingCount+1;
          }
        });
        if (pendingCount == 0) {
          clearInterval(this.progressInterval);
          this.isInterValAlreadyCalled = false;
        } else {
          this.getGstInOtpStatusAndUpdate()
        }
      }, 10000);
    }, 10000);
  }

  getGstInOtpStatusAndUpdate(){
      var json = {};
      json["id"] = this.id;
      // json["id"] = 33;
      console.log(this.panForm.value);
      if (this.gstinListSearchForm.valid) {
        json["filterJSON"] = this.getFilteredFormValue();
        if (json["filterJSON"] != null) {
          json["filterJSON"] = JSON.stringify(json["filterJSON"]);
        }
      };

      this.msmeService.gstAnalysisTpByPanData(json,true).subscribe((response: any) => {
        if (response.status === 200) {
          this.gstinPagination.totalSize = response?.data;
          response?.listData.forEach(element => {
            this.gsinList.forEach(existing => {
              if(existing.gstin == element.gstin){
                existing.otpVerificationStatus = element.otpVerificationStatus;
              }
              if(element.otpVerificationStatus == 'Success') {
                  this.isAnyVerified = true;
                }
            });

          });
          this.gsinList = response?.listData;
          this.stateList = response?.dataList ?? [];
          console.log(response);
        } else {
          console.log(response.message);
        }
      }, error => {
        this.commonService.errorSnackBar('Something Went Wrong')
        console.error('Upload failed', error);
      })
  }


  // Method to get filtered form value
  getFilteredFormValue() {
    const formValue = this.gstinListSearchForm.value;
    const filteredFormValue: any = {};

    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if(key=="state" && value=="All"){

      } else if (value !== '' && value !== undefined) {
        filteredFormValue[key] = value;
      }
    });

    filteredFormValue.paginationFROM = (this.gstinPagination.page - 1) * this.gstinPagination.pageSize
    filteredFormValue.paginationTO = this.gstinPagination.pageSize;
    return filteredFormValue;
  }


  updatePage(gstl: any) {
    if (gstl.length <= 10) {
      this.totalSize = 1;
    } else {
      this.totalSize = gstl.length / 10;
    }

  }
  updateGstingPage(gstl: any) {
    if (gstl.length <= 10) {
      this.gstinPagination.totalSize = 1;
    } else {
      this.gstinPagination.totalSize = gstl.length / 10;
    }

  }


  submitPage() {
    GlobalHeaders['x-page-action'] = 'Submitting after success Otp verification for gstIn';
    let data = [];
    if(this.pageData){
       data.push(this.pageData);
    }
    let pendingData = [];
    if (this.gsinList) {
      console.log('Gst Data ===>', this.gsinList);
      for (let list of this.gsinList) {
        if (list?.otpVerificationStatus == 'Success') {
          data.push(list);
        } else if (list?.otpVerificationStatus == 'Pending') {
          pendingData.push(list);
        }
      }
      if(pendingData.length > 0){
        this.commonService.warningSnackBar("We are awaiting data from GST. Please Submit after Success full status against each GSTN");
        return;
      }
      console.log('Gst Data ===>', data);
      if (data.length > 0) {
        console.log(data);
        this.loaderService.show();
        this.commonService.openDialogue(HSBCProvideSelesComponent,
          {
            width: '', backdropClass: '',
            panelClass: 'popupMain_design', disableClose: true,
            data
          }).subscribe(popResponse => {
            this.loaderService.show();
            console.log('popResponse :: ', popResponse);
            if(popResponse == 0){
              return;
            }
            if (popResponse != null && popResponse?.status == 200) {
              this.loaderService.show();
              this.router.navigate(['/hsbc/' + Constants.ROUTE_URL.VIEW_GST_ANALYSIS],{state: { data: this.pageData }});
              this.loaderService.show();
            } else {
              this.commonService.errorSnackBar(popResponse?.isDisplayMessage);
            }
          });
      } else {
        this.commonService.errorSnackBar("At least one gstin otp should be verified");
        console.log("At least one gstin otp should be verified")
      }
    }

  }

  updateGstObj(obj: any) {
    console.log('index == ' + obj.username);
  }

  generateOtp(gst: any) {
    GlobalHeaders['x-page-action'] = 'Generating Otp';
    let formData = {}
    formData['id'] = gst.gstin;
    formData['userId'] = this.userId;
    formData['refId'] = gst.mstId;
    formData['userName'] = gst.username;
    formData['detailId'] = gst.detailId;
    console.log(formData);
    if (gst.username != null && gst.username != "" && gst.username != undefined) {
      this.msmeService.gstAnalysisGenOtp(formData).subscribe((response: any) => {
        if (response != null && response?.status == 1000 && response?.isDisplayStatus == 1) {
          console.log('in open dia');
          formData['sessionId'] = response?.data?.headers["session-id"];
          formData['sessionKey'] = response?.data?.sessionKey;
          console.log(formData);
          let data = formData;
          this.commonService.openDialogue(HSBCGSTOTPVerifyComponent,
            {
              panelClass: ['popupMain_design'],
              autoFocus: false, disableClose: true,
              data
            }).subscribe(popResponse => {
              console.log('popResponse :: ', popResponse);
              if (popResponse != null && popResponse.isDisplayStatus == 1) {
                for (let ngst of this.gsinList) {
                  if (ngst.gstin == gst.gstin) {
                    ngst['otpVerificationStatus'] = popResponse.data;
                  }
                }
                this.callGetStatusApiInInterval();
              } else {
                if (popResponse?.isDisplayMessage) {
                  this.commonService.errorSnackBar(popResponse?.isDisplayMessage);
                }
              }
            });
        } else {
          this.commonService.warningSnackBar(response?.isDisplayMessage);
        }
      }, error => {
        this.commonService.errorSnackBar('Something Went Wrong')
        console.error('Upload failed', error);
      })
    } else {
      this.commonService.warningSnackBar("Please Enter Username")
    }


  }

  getGstHistoryDataAPI() {
    GlobalHeaders['x-page-action'] = 'Getting Search History';
    if (this.panForm.valid) {
      // Build request object matching GstHistoryRequestDto
      const gstHistryReq: any = {
        pan: this.panForm?.value?.pan,
        page: this.page - 1,
        size: this.pageSize,
        nameOfCompany: null,
        rmName: null,
        rmEmailId: null,
        gstId: null,
        dateOfReport: null
      };

      // Add filter values from history search form
      if (this.gstHistorySearchForm) {
        const formValue = this.gstHistorySearchForm.value;

        if (formValue.nameOfCompany && formValue.nameOfCompany.trim() !== '') {
          gstHistryReq.nameOfCompany = formValue.nameOfCompany;
        }
        if (formValue.rmName && formValue.rmName.trim() !== '') {
          gstHistryReq.rmName = formValue.rmName;
        }
        if (formValue.rmEmailId && formValue.rmEmailId.trim() !== '') {
          gstHistryReq.rmEmailId = formValue.rmEmailId;
        }
        if (formValue.gstId && formValue.gstId.trim() !== '') {
          gstHistryReq.gstId = formValue.gstId;
        }
        if (formValue.dateOfReport && formValue.dateOfReport !== '') {
          // Format date as YYYY-MM-DD without any adjustment
          const selectedDate = new Date(formValue.dateOfReport);
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          gstHistryReq.dateOfReport = `${year}-${month}-${day}`;
        }
      }

      this.commonService.setStorage("gst_pan", this.panForm?.value?.pan);

      console.log("getGstHistoryData req :", gstHistryReq)

      this.msmeService.getGstHistoryData(gstHistryReq).subscribe(response => {
        console.log("getGstHistoryData response", response)
        if (response?.status == 200) {
          // Handle nested LoansResponse structure
          // response.data contains another LoansResponse with listData
          const innerResponse = response?.data;

          if (innerResponse?.listData && Array.isArray(innerResponse.listData)) {
            this.gstHistoryDataList = innerResponse.listData;
            this.totalSize = innerResponse.data || innerResponse.listData.length || 0;
          } else if (response?.data?.content) {
            // Fallback for Page object with content property
            this.gstHistoryDataList = response?.data?.content || [];
            this.totalSize = response?.data?.totalElements || 0;
          } else if (Array.isArray(response?.data)) {
            // Fallback for direct array
            this.gstHistoryDataList = response?.data;
            this.totalSize = response?.data?.length || 0;
          } else {
            this.gstHistoryDataList = [];
            this.totalSize = 0;
          }
          this.isHistoryDataFetched = true;
        } else if (response?.status == 404) {
          // Handle 404 - No GST History found
          // Still show the filter section but with empty results
          this.gstHistoryDataList = [];
          this.totalSize = 0;
          this.isHistoryDataFetched = true;
          this.commonService.warningSnackBar(response?.message || "No GST History found for this PAN");
        } else {
          this.gstHistoryDataList = [];
          this.totalSize = 0;
          this.isHistoryDataFetched = true;
          this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
        }
      })
    } else {
      this.commonService.errorSnackBar("Please fill details")
    }
  }

  viewGstAnalysisPage(gstMstId) {
    console.log(gstMstId);

    // Save current filter state before navigation
    if (this.gstHistorySearchForm) {
      this.filterState = this.gstHistorySearchForm.value;
      this.commonService.setStorage("gst_history_filters", JSON.stringify(this.filterState));
    }

	 this.commonService.setStorage(Constants.httpAndCookies.ANALYSIS_MASTER_ID, gstMstId?.gstId);
    if(gstMstId?.projectedSale!=null){
      this.router.navigate(['/hsbc/' + Constants.ROUTE_URL.VIEW_GST_ANALYSIS],{state: { data: this.pageData }});
     }else{
      this.loaderService.show();
        this.commonService.openDialogue(HSBCProvideSelesComponent,
          {
            width: '', backdropClass: '',
            panelClass: 'popupMain_design', disableClose: true,
            gstMstId
          }).subscribe(popResponse => {
            this.loaderService.show();
            console.log('popResponse :: ', popResponse);
            if(popResponse == 0){
              return;
            }
            if(popResponse != null){
              if (popResponse?.status == 200) {
                this.loaderService.show();
                this.router.navigate(['/hsbc/' + Constants.ROUTE_URL.VIEW_GST_ANALYSIS],{state: { data: this.pageData }});
                this.loaderService.show();
              } else {
                this.commonService.errorSnackBar(popResponse?.isDisplayMessage);
              }
            }
          });
    }

  }

  viewAuditPage(refId: any) {
    GlobalHeaders['x-page-action'] = 'Audit for GST Analysis';
    saveActivity(() => {});
    clearCookie();
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "GST");
    this.commonService.setStorage(Constants.httpAndCookies.REF_ID_FOR_AUDIT, refId);
    const routerData = {apiType : AuditAPIType.API_AUDIT};
    this.router.navigate(["/hsbc/apiAuditLog"], { state: { routerData } });
  }

  navigateToViewComponent(panNo:string){
    // Tab id 1 for existing tab, 2 for targer prospect
    const routerData = { pan: panNo,tabId:1,selectedTabIndex:5,pageDetails:this.pageData}; // Data to pass
    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData,data:this.pageData } });
  }

  isActionAvail(actionId: string): boolean {
    let res = false;
    // console.log("******Permission*****");
    // console.log(actionId);
    // console.log(this.pageData);
    if (this.pageData?.subpageId == Constants.pageMaster.GST_ANALYSIS2 || this.pageData?.subpageId == Constants.pageMaster.GST_ANALYSIS) {
      for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
          res = true; // Return true if found
        }
      }
    } else {
      if (!res) {
        this.pageData?.subSubpages.forEach(masterPage => {
          if (masterPage?.subpageId == Constants.pageMaster.ANALYTICS) {
            masterPage?.subSubpages.forEach(page => {
              if (page?.subpageId == Constants.pageMaster.GST_ANALYSIS) {
                for (let subpage of page?.actions) {
                  if (subpage?.actionId === actionId) {
                    res = true; // Return true if found
                  }
                }
              }
            });
          }
        })
      }
    }
    return res; // Return false if not found
  }
  openReadInstructions() {
    this.commonService.openDialogue(ReadInstructionsPopupComponent, {
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
  }

  backToHistory() {
    this.panVerified = false;
    this.gsinList = [];
    this.isAnyVerified = false;
    this.stateList = [];
    // Reset GSTIN list search form
    this.gstinListSearchForm.reset({
      nameOfCompany: '',
      gstin: '',
      constitution: '',
      state: 'All'
    });
  }
}
