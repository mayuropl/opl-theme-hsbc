import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { Constants } from 'src/app/CommoUtils/constants';
import { BureauReportRefreshPopupComponent } from 'src/app/Popup/HSBC/bureau-report-refresh-popup/bureau-report-refresh-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import { environment } from 'src/environments/environment';
import {
  clearCookie,
  GlobalHeaders,
  resetGlobalHeaders,
  saveActivity
} from "../../../../../../CommoUtils/global-headers";
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-commercial-bureau',
  // standalone: true,
  // imports: [],
  templateUrl: './commercial-bureau.component.html',
  styleUrl: './commercial-bureau.component.scss'
})
export class CommercialBureauComponent {
  private readonly demoPan = 'AAGFV5271N';
  today: string;
  submitted: boolean = false;
  companyForm: FormGroup;
  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  // tab: number =1;
  customerList: any = [];
  totalCount;
  userId: any;
  companyId: any;
  panNumber: string = '';
  basicDetails: any;
  borrowerForm: UntypedFormGroup;
  isDetailFetched: Boolean = false;
  isHistoryDataFetched: Boolean = false;
  isPopUpInClickYes: Boolean = false;
  isCallCibilHitted: Boolean = false;
  private intervalSubscription: Subscription;

  nameOfCompany: any;
  bureauType : any;
  cibilId: any;
  rmName: any;
  dateOfReport: any;
  createdDate: any;
  XdaysForCibilPing: any;
  formattedDateReportFirst: any;

  isAnyReportWithinXDays: Boolean = true;
  hideForm: Boolean = false;

  isFromPRDashboard: boolean = false;

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

  proposalStatus = [
    { value: '2', viewValue: 'someData', tab: '1' },
    { value: '3', viewValue: 'someData', tab: '1' },
    { value: '4', viewValue: 'someData', tab: '1' },
    { value: '5', viewValue: 'someData', tab: '2' },
    { value: '6', viewValue: 'someData', tab: '2' },
  ];
  bureueHistoryDataList: any = [];
  constants: any;
  pageData: any;
  constructor(
    public dialog: MatDialog, private msmeService: MsmeService, private commonService: CommonService, private router: Router, private loaderService: LoaderService
    , public commonMethod: CommonMethods, private datepipe: DatePipe, private fb: UntypedFormBuilder,
  ) {
    this.getXdaysForCibilPings();
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  isExistingPanFound: boolean = false;
  protected readonly consValue = Constants;
  ngOnInit(): void {
    this.getNotes();
    this.constants = Constants;
    this.pageData = history.state.data;
      if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS2,this.consValue.pageMaster.CREDIT_AND_BUREAU,this.consValue.pageMaster.COMMERCIAL_BUREAU)
    }
    console.log('pagedata --- ',this.pageData);
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmCommercialBureau';
    GlobalHeaders['x-main-page'] = 'Commercial Bureau';

    this.isFromPRDashboard = this.commonService.getStorage("from_pr_dashboard", true) === "true";
    if (environment.staticDemo) {
      this.panNumber = this.demoPan;
      this.isHistoryDataFetched = true;
      this.hideForm = true;
      this.restoreFilterState();
      this.getBuearueHistoryDataAPI();
    }
    if (!this.isFromPRDashboard) {
      if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("existing_pan", true))) {
        this.panNumber = this.commonService.getStorage("existing_pan", true);
        this.getBuearueHistoryDataAPI();
        this.isExistingPanFound = true;
      } else if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("commrcial_pan", true))) {
        this.panNumber = this.commonService.getStorage("commrcial_pan", true);
        this.getBuearueHistoryDataAPI();
      }
    }

    if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("pr_commercial_pan", true))) {
      this.panNumber = this.commonService.getStorage("pr_commercial_pan", true);
      this.isFromPRDashboard = true;
      this.getBuearueHistoryDataAPI();
    }
    
    // Restore filter state if available
    const hasRestoredFilters = this.restoreFilterState();
    
    // If filters were restored, trigger data load with filters
    if (hasRestoredFilters && this.panNumber) {
      setTimeout(() => {
        this.getBuearueHistoryDataAPI();
      }, 100);
    }
    
    // for Specific Class on Page
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('with_pageTitle_searchForm');

    this.intervalSubscription = interval(5000).subscribe(() => {
      if (this.bureueHistoryDataList?.length > 0) {
          const firstEntry = this.bureueHistoryDataList[0];
  
          if (firstEntry && firstEntry.isCibilProcessCompleted !== 1) {
              this.getBuearueHistoryDataAPI();
          }
      }
  });
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('with_pageTitle_searchForm');
    this.intervalSubscription?.unsubscribe();
    
    // Save filter state before component destruction
    this.saveFilterState();
  }
  onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getBuearueHistoryDataAPI(this.panNumber);
  }

  createCompanyForm(companyDetails?) {
    this.companyForm = this.fb.group({
      companyName: [companyDetails?.name || '', Validators.compose([Validators.required, this.companyNameValidator])],
      pan: [companyDetails?.panNumber?.toUpperCase() || '', Validators.compose([Validators.required, this.panValidator])],
      dateOfIncorporation: [companyDetails?.dateOfBirth || '', Validators.compose([Validators.required, this.dobValidator])],
      address1: [companyDetails?.address?.addressLineOne || '', Validators.compose([Validators.required, this.addressValidator])],
      address2: [companyDetails?.address?.addressLineTwo || '', Validators.compose([this.addressValidator])],
      pincode: [companyDetails?.address?.pincode || '', Validators.compose([Validators.required, this.pincodeValidator])],
      state: [companyDetails?.address?.state || '', Validators.required],
      city: [companyDetails?.address?.city || '', Validators.required],
      stateList: [[] || '', Validators.required],
      cityList: [[] || '', Validators.required],
    });
    if (!this.commonService.isObjectNullOrEmpty(companyDetails?.address?.pincode)) {
      this.getStateCityFromPincode(companyDetails?.address?.pincode, this.companyForm)
    }
    // if (!this.commonService.isObjectNullOrEmpty(companyDetails?.dateOfBirth)) {
    //   this.companyForm.controls.dateOfIncorporation.patchValue((new Date(companyDetails?.dateOfBirth?.toString().split("/").reverse().join("-"))));
    // }
    if (!this.commonService.isObjectNullOrEmpty(companyDetails?.dateOfBirth)) {
      let transformedDate = this.parseDate(companyDetails?.dateOfBirth);
      this.companyForm.controls.dateOfIncorporation.patchValue(transformedDate);
      console.log("this.individualForm.controls.dateOfIncorporation.", this.companyForm.controls.dateOfIncorporation.value)
    }
    this.hideForm = false;

  }

  parseDate(inputDate: string): Date {
    const dateParts = inputDate.split('-');
    return new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
  }

  saveCompanyDetails(isProcced) {

    if (isProcced && !this.companyForm.valid) {
      this.companyForm.markAllAsTouched();
      return this.commonService.errorSnackBar("Please fill details");
    }

    this.isCallCibilHitted = true;

    const customerDetails: any = {};
    customerDetails.nameOfFirm = this.companyForm.value.companyName;
    customerDetails.fullAddress = this.companyForm.value.address1 + this.companyForm.value.address2;
    customerDetails.pan = this.companyForm.value.pan?.toUpperCase();
    customerDetails.businessCity = this.companyForm.value.cityList[0]?.cityName
    customerDetails.businessPincode = this.companyForm.value.pincode

        // call bureau api
        const cibilReq = {
          pan: this.companyForm.value.pan.toUpperCase(),
          orgId: 80,
          individual: false,
          userId: this.userId,
          customerDetails: customerDetails,
          isPopUpInClickYes: this.isPopUpInClickYes
        };

        this.msmeService.callBureau(cibilReq).subscribe(response => {
          if (response?.status == 200 || response?.status == 208) {
            console.log(response.message);

            if(!this.commonService.isObjectNullOrEmpty(response?.id)){ // If cibilId fetched then it will go to save cibilId
              this.commonService.setStorage(Constants.httpAndCookies.CIBIL_ID, response?.id);
              this.commonService.setStorage("commrcial_pan", this.companyForm.value.pan);
            }
  
                  this.getBuearueHistoryDataAPI();

                  this.hideForm = true;
                  this.isDetailFetched = false;
                  this.isCallCibilHitted = false;
                  // this.viewCommercialDetailPage(response?.id);
                  // this.router.navigate(['/hsbc/rmCommercialBureauDetails'], { state: { data: this.pageData } });
          } else {
            this.isCallCibilHitted = false;
            this.commonService.errorSnackBar(response.message);
          }
        })
  }

  onInputChange(event: any) {
    event.target.value = event?.target?.value?.toUpperCase();
    this.isHistoryDataFetched = false;
  }
  // getCompanyDetails() {
  //   this.loaderService.show();
  //   let data = {};
  //   data['applicationId'] = this.applicationId;
  //   data['pan'] = this.pan;

  //   this.msmeService.getCompanyDetails(data).subscribe(response => {
  //     if (response.status == 200) {
  //       this.isCompanyCICfetch = response.data.data.isCICfetch;
  //       this.createCompanyForm(response.data.data)
  //       // this.isCompanyCICfetch = true;
  //       if(this.isCompanyCICfetch){
  //         this.companyForm.disable();
  //       }
  //     }
  //     else {
  //       this.commonService.errorSnackBar(response.message);
  //     }
  //   })
  // }

    onAddressInput(event: any, controlName: string, formGroup: FormGroup) {
    let value = event.target.value;
    
    // Prevent input beyond 200 characters
    if (value.length > 200) {
      value = value.substring(0, 200);
      event.target.value = value;
      formGroup.get(controlName).setValue(value, { emitEvent: false });
    }
  }

  onAddressBlur(controlName: string, formGroup: FormGroup) {
    const control = formGroup.get(controlName);
    if (control && control.value) {
      // Normalize address on blur
      const normalizedValue = this.normalizeAddress(control.value);
      
      if (normalizedValue !== control.value) {
        control.setValue(normalizedValue, { emitEvent: false });
      }
      
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  normalizeAddress(address: string): string {
    if (!address) return address;
    
    // Remove leading/trailing spaces and reduce multiple consecutive spaces to single space
    // Retain all special characters
    address = address.trim().replace(/\s+/g, ' ');
    const finalValue = address.length > 200 ? address.substring(0, 200) : address;
    return finalValue;
  }

  getCharacterCount(controlName: string, formGroup: FormGroup): string {
    const control = formGroup.get(controlName);
    if (!control || !control.value) return '0/200';
    
    const count = control.value.length;
    return `${count}/200`;
  }

  getTooltipText(controlName: string, formGroup: FormGroup): string {
    const control = formGroup.get(controlName);
    if (!control || !control.value) return '';
    
    const normalizedValue = this.normalizeAddress(control.value);
    return normalizedValue || control.value;
  }
  
  getStateCityFromPincode(pincode: number, formGroup?: FormGroup) {
    if (pincode?.toString().length !== 6) {
      // Assuming you want to validate pincode length
      console.log('Invalid pincode');
      return;
    }

    // this.loaderService.show();

    this.msmeService.getStateCityFromPincode(pincode).subscribe(response => {
      if (response.status == 200) {
        const data = response.data;

        // Check if city and state data is received
        if (!data || !data.cityId || !data.cityName || !data.state || !data.state.stateId || !data.state.stateName) {
          // Clear city and state fields
          formGroup.controls["cityList"]?.setValue([]);
          formGroup.controls["city"]?.setValue(null);
          formGroup.controls["stateList"]?.setValue([]);
          formGroup.controls["state"]?.setValue(null);
          
          this.commonService.warningSnackBar("Mentioned Pincode is not available in the dictionary, kindly try again by entering nearest pincode");
          return;
        }

        formGroup.controls["cityList"]?.setValue([{ "cityId": data["cityId"], "cityName": data["cityName"] }]);
        formGroup.controls["city"]?.setValue(data["cityId"]);
        formGroup.controls["stateList"]?.setValue([{ "stateId": data["state"]["stateId"], "stateName": data["state"]["stateName"] }]);
        formGroup.controls["state"]?.setValue(data["state"]["stateId"]);
        console.log(formGroup);

      }
      else {
        // Clear city and state fields on error
        formGroup.controls["cityList"]?.setValue([]);
        formGroup.controls["city"]?.setValue(null);
        formGroup.controls["stateList"]?.setValue([]);
        formGroup.controls["state"]?.setValue(null);
        
        this.commonService.errorSnackBar(response.message);
      }
    }, (error) => {
      // Clear city and state fields on API failure
      formGroup.controls["cityList"]?.setValue([]);
      formGroup.controls["city"]?.setValue(null);
      formGroup.controls["stateList"]?.setValue([]);
      formGroup.controls["state"]?.setValue(null);
      
      this.commonService.errorSnackBar("This Pincode is not in master");
    })
  }

  submit() {
    console.log("this.companyForm", this.companyForm.value)
    this.saveCompanyDetails(false);
    return false;
  }

  companyNameValidator(control: FormControl): { [key: string]: boolean } | null {
    const name: string = control.value;

    if (!name) {
      return null; // If name is not provided, return null
    }

    // ✅ Allow letters, numbers, spaces, and special characters: / . - & ( )
    if (!/^(?! )[a-zA-Z0-9/.\-&() ]{3,125}$/.test(name)) {
      return { 'invalidCharacters': true };
    }

    // Check if name starts with a space
    if (name.startsWith(' ')) {
      return { 'startsWithSpace': true };
    }

    if (name.endsWith(' ')) {
      return { 'endsWithSpace': true };
    }

    return null; // Validation passed
  }

  addressValidator(control: FormControl): { [key: string]: boolean } | null {

  let address: string = control.value;

  if (!address) {
    return null;
  }

  // // 🔹 Remove all unwanted special characters (keep only . / \ - letters numbers space)
  // address = address.replace(/[^a-zA-Z0-9.\/\\\- ]+/g, '');

  // // 🔹 Update cleaned value back into field (optional but recommended)
  // if (address !== control.value) {
  //   control.setValue(address, { emitEvent: false });
  // }

  // 🔹 Length + allowed characters check
  if (!/^(?! )[a-zA-Z0-9,.\/\\\- ]{3,200}$/.test(address)) {
    return { invalidAddressFormat: true };
  }

  // 🔹 Starts with space
  if (address.startsWith(' ')) {
    return { startsWithSpace: true };
  }

  // 🔹 Ends with space
  if (address.endsWith(' ')) {
    return { endsWithSpace: true };
  }

  return null;
}


  pincodeValidator(control: FormControl): { [key: string]: boolean } | null {
    const pincode: string = control.value;

    if (!pincode) {
      return null; // If PIN code is not provided, return null
    }
    // Check if PIN code starts with a digit from 1 to 9
    if (pincode.charAt(0) === '0') {
      return { 'startsWithZero': true };
    }
    // Check if PIN code is numeric
    if (!/^\d{6}$/.test(pincode)) {
      return { 'invalidPincodeFormat': true };
    }

    return null; // Validation passed
  }

  dobValidator(control: FormControl): { [key: string]: boolean } | null {
    const dob = control.value;
    if (!dob) {
      return null; // If DOB is not provided, return null
    }

    // // Calculate age from DOB
    // const today = new Date();
    // const birthDate = new Date(dob);
    // let age = today.getFullYear() - birthDate.getFullYear();
    // const month = today.getMonth() - birthDate.getMonth();
    // if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    //   age--;
    // }

    // // Check if age is within the valid range (18 to 80 years)
    // if (age < 18 || age > 80) {
    //   return { 'invalidAge': true };
    // }

    // Check if DOB is in the future
    if (dob > new Date()) {
      return { 'futureDate': true };
    }

    return null; // Validation passed
  }
  panValidator(control: FormControl): { [key: string]: boolean } | null {
    const pan: string = control.value;

    if (!pan) {
      return null; // If PAN is not provided, return null
    }

    // Check if PAN matches the pattern
    if (!/^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/.test(pan)) {
      return { 'invalidPanFormat': true };
    }

    return null; // Validation passed
  }


  // OtpVerifyPopup() {
  //   const dialog = this.dialog.open(HSBCGSTOTPVerifyComponent, {
  //     panelClass: ['w-500px'],
  //     autoFocus: false,
  //   });
  //   dialog.afterClosed().subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }

  // rmprovideSeles() {
  //   const dialog = this.dialog.open(HSBCProvideSelesComponent, {
  //     panelClass: ['w-500px'],
  //     autoFocus: false,
  //   });
  //   dialog.afterClosed().subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }
  filterDateFormat(date) {
    var date1 = date.toLocaleDateString().split('/');
    let day = date1[1];
    date1[1] = date1[0];
    date1[0] = day;
    date1[2] = date1[2];
    return date1.join('-');
  }
  formatDate1(val) {
    if (val.toString().length < 2) {
      return "0" + val;
    } else {
      return val;
    }
  }

  callRefresh() {
    GlobalHeaders['x-page-action'] = 'Commercial New';
      const xDaysAgo = new Date();
      xDaysAgo.setDate(xDaysAgo.getDate() - this.XdaysForCibilPing);
      console.log(this.bureueHistoryDataList)
      // Check if bureueHistoryDataList is not empty or null
      if (this.bureueHistoryDataList && this.bureueHistoryDataList.length > 0) {

        // Check If is it isCibilProcessCompleted or not
        const isCibilProcessCompleted = this.bureueHistoryDataList[0]?.isCibilProcessCompleted;
        if(isCibilProcessCompleted == null){
          return this.commonService.warningSnackBar("Bureau Analysis is In-process. You can not refresh Bureau now")
        }

        // X Days check logic
        this.isAnyReportWithinXDays = this.bureueHistoryDataList
          .filter(bureueHstry => bureueHstry.dateOfReport) // Filter out null or undefined createdDate
          .every(bureueHstry => new Date(bureueHstry.dateOfReport) <= xDaysAgo);
        console.log('Is any report within ' + this.XdaysForCibilPing + ' days?', this.isAnyReportWithinXDays);

        if (!this.isAnyReportWithinXDays) {
          const dateString = this.bureueHistoryDataList[0]?.createdDate;
          const date = new Date(dateString);

          // Formatting the date
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          this.formattedDateReportFirst = formattedDate;
          this.BureauReportRefresh_Popup();
          // return this.commonService.warningSnackBar("It seems that a bureau report for this customer has already been fetched on " + formattedDate + ", so you can fetch a new report after" + " " + this.XdaysForCibilPing + " " + "days.");
        }
        else{
          this.callSignzyApiOnPopUp();
        }


      }
      else{
        this.formattedDateReportFirst = '';
        this.callSignzyApiOnPopUp();
      }

    // let panNumber = event?.target?.value?.toUpperCase();
  }

  callSignzyApiOnPopUp(){
    let panNumber = this.panNumber?.toUpperCase();
    if (this.commonService.isObjectNullOrEmpty(panNumber)) {
      panNumber = this.panNumber?.toUpperCase();
    }
    const signzyReq = {
      //applicationId: this.userId,
      pan: panNumber

    };
    console.log("signzy api req :", signzyReq)

    this.msmeService.getCallDataFromSignzy(signzyReq).subscribe(response => {
      console.log("Signzy api response", response)
      if (response?.status == 1001 || response?.status == 1000 || response?.status == 1002) {
        this.isDetailFetched = true;
        if(response?.data?.result?.statusCode != 204){
          this.basicDetails = response?.data;
        }else{
          this.basicDetails = null;
        }
        this.createCompanyForm(this.basicDetails);
      } else {
        // this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
        this.commonService.errorSnackBar("We are currently facing a technical issue from the vendor’s side. Request you to please try again after some time.")
      }
    })
  }

  getXdaysForCibilPings() {
    this.msmeService.getXdaysForCibilPing(1).subscribe(response => {
      console.log("XdaysForCibilPing", response)
      if (response?.status == 200) {
        this.XdaysForCibilPing = response?.data?.data;
      } else {
        this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
      }
    });
  }

  notesData: any = {};
  getNotes() {
    this.msmeService.getNotes().subscribe(response => {
      console.log("getNotes() response : ", response)
       this.notesData = response;
    });
  }

  navigateToViewComponent(panNo: string) {
    // Tab id 1 for existing tab, 2 for targer prospect
    const routerData = { pan: panNo, tabId: 1, selectedTabIndex: 5 };
    console.log(this.pageData);
    // Data to pass
    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: this.pageData } });
  }

  getBuearueHistoryDataAPI(event?: any) {
    GlobalHeaders['x-page-action'] = 'Check Buearue';
    let panNumber = event?.target?.value?.toUpperCase();
    if (this.commonService.isObjectNullOrEmpty(panNumber)) {
      panNumber = this.panNumber;
    }

    if (environment.staticDemo) {
      if (this.commonService.isObjectNullOrEmpty(panNumber)) {
        panNumber = this.demoPan;
      }
      this.panNumber = panNumber;
      const rows = this.getStaticDemoCommercialHistoryRows();
      this.bureueHistoryDataList = rows;
      this.totalSize = rows.length;
      this.isHistoryDataFetched = true;
      this.hideForm = true;
      return;
    }

    let filterJson: any = {};
    filterJson.paginationFROM = this.page - 1
    filterJson.paginationTO = this.pageSize

    const bureauHistryReq = {
      bureauType: 1, // for commercial
      pan: panNumber.toUpperCase(),
      filterJSON: this.getFilterJson(filterJson, false)
    };
    console.log("getBuearueHistoryDataAPI req :", bureauHistryReq)

    this.msmeService.getBuearueHistoryData(bureauHistryReq).subscribe(response => {
      console.log("getBuearueHistoryDataAPI response", response)
      if (response?.status == 200 && response?.data?.status == 200) {
        this.isHistoryDataFetched = true;
        this.bureueHistoryDataList = response?.data?.listData;
        this.totalSize = response?.data?.data;
      } else {
        this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
      }
    })
  }

  viewCommercialDetailPage(cibilId,status,bureayType) {
    this.commonService.setStorage(Constants.httpAndCookies.CIBIL_ID, cibilId);
    this.commonService.setStorage("commrcial_pan", this.panNumber);
    console.log(status);
    console.log(bureayType);
    this.pageData.status =status;
    this.pageData.bureayType =bureayType;
    this.router.navigate(['/hsbc/rmCommercialBureauDetails'], { state: { data: this.pageData} });
  }

  onNameInput(event?: KeyboardEvent, type?, events?) {

    // Check if the key pressed was the backspace key
    let filterJson: any = {};
    // this.data.filterJson=filterJson;
    // this.dateOfReport = this.selectedDate;
    if (type == 3) {
      // this.selectedDate = events.value
      // this.selectedDate = event
    }
    
    // Save filter state when text changes
    this.saveFilterState();
    
    if (event?.keyCode === 8) {
      this.getBuearueHistoryDataAPI(this.panNumber);
    } else {
      // Perform your usual logic for other key presses
      if ((this.nameOfCompany && this.nameOfCompany.length > 3) ||
        (this.rmName && this.rmName.length > 3) ||
        (this.cibilId && this.cibilId.length > 3) ||
        (this.bureauType && this.bureauType.length > 1)) {

        this.getBuearueHistoryDataAPI(this.panNumber);
      } else if (this.dateOfReport) {
        this.getBuearueHistoryDataAPI(this.panNumber);
      } else if (this.createdDate) {
        this.getBuearueHistoryDataAPI(this.panNumber);
      }
    }
  }

  getFilterJson(req, forDownload?) {
    let filterJson: any = req
    if (!forDownload) {
      filterJson.paginationFROM = this.startIndex
      filterJson.paginationTO = this.pageSize
    }

    if (this.nameOfCompany) {
      filterJson.nameOfCompany = this.nameOfCompany;
    }
    if (this.bureauType) {
      filterJson.bureauType = this.bureauType;
    }
    if (this.rmName) {
      filterJson.rmName = this.rmName;
    }
    if (this.cibilId) {
      filterJson.cibilId = this.cibilId;
    }
    // if(this.selectedOption){
    //   filterJson.selectedOption=this.selectedOption;
    // }
    if (this.dateOfReport) {
      filterJson.dateOfReport = this.formatDateISO(this.dateOfReport);
    }

    if (this.createdDate) {
      filterJson.createdDate = this.formatDateISO(this.createdDate);
    }
    // req.filterJson=filterJson;
    return JSON.stringify(filterJson);
  }

  formatDateISO(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

  formateDate(date) {
    var date1 = date?.split("/");
    date1 = date1[2] + '-' + date1[0] + '-' + date1[1];
    return date1;
  }
  viewAuditPage(cibilId: any) {
    GlobalHeaders['x-page-action'] = 'Audit for Commercial Bureau';
    saveActivity(() => {});
    clearCookie();
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "CIBIL_AUDIT");
    this.commonService.setStorage(Constants.httpAndCookies.REF_ID_FOR_AUDIT, cibilId);
    this.commonService.setStorage(Constants.httpAndCookies.IS_INDIVIDUAL, "false");
    this.router.navigate(["/hsbc/rmApiAuditLogs"], { state: { data:this.pageData} });
  }

  isActionAvail(actionId: string): boolean {
    if (
      this.pageData?.subpageId == Constants.pageMaster.COMMERCIAL_BUREAU2 ||
      this.pageData?.subpageId == Constants.pageMaster.COMMERCIAL_BUREAU
    ) {
      const actions = Array.isArray(this.pageData?.actions) ? this.pageData.actions : [];
      return actions.some((page) => page?.actionId === actionId);
    }

    const masterPages = Array.isArray(this.pageData?.subSubpages) ? this.pageData.subSubpages : [];
    for (const masterPage of masterPages) {
      if (masterPage?.subpageId != Constants.pageMaster.ANALYTICS) {
        continue;
      }
      const analyticsPages = Array.isArray(masterPage?.subSubpages) ? masterPage.subSubpages : [];
      for (const page of analyticsPages) {
        if (page?.subpageId != Constants.pageMaster.COMMERCIAL_BUREAU) {
          continue;
        }
        const actions = Array.isArray(page?.actions) ? page.actions : [];
        if (actions.some((subpage) => subpage?.actionId === actionId)) {
          return true;
        }
      }
    }
    return false;
  }

  // BureauReportRefresh popup
  BureauReportRefresh_Popup(): void {
    const dialogRef = this.dialog.open(BureauReportRefreshPopupComponent, {
      panelClass: ['popupMain_design'],
      data: {
        lastReportFetchDate: this.formattedDateReportFirst,
        XdaysForCibilPing: this.XdaysForCibilPing
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'Yes') {
        this.onRefreshConfirmed();
      } else {
        this.onRefreshCancelled();
      }
     });
  }

  onRefreshConfirmed(): void {
    console.log('Refresh confirmed');
    this.isPopUpInClickYes= true;
    this.callSignzyApiOnPopUp();
  }

  onRefreshCancelled(): void {
    console.log('Refresh cancelled');
  }

  resetFilter() {
    this.nameOfCompany = null;
    this.bureauType = null;
    this.rmName = null;
    this.cibilId = null;
    this.dateOfReport = null;
    this.createdDate = null;
    this.page = 1;
    this.pageSize = 10;
    this.startIndex = 0;
    this.endIndex = 10;
    
    // Clear saved filter state
    localStorage.removeItem('commercial_bureau_filters');
    
    // Reload data with cleared filters
    if (this.panNumber) {
      this.getBuearueHistoryDataAPI();
    }
  }

  saveFilterState(): void {
    if (environment.staticDemo) {
      return;
    }
    const filterState = {
      nameOfCompany: this.nameOfCompany,
      bureauType: this.bureauType,
      rmName: this.rmName,
      cibilId: this.cibilId,
      dateOfReport: this.dateOfReport,
      createdDate: this.createdDate,
      page: this.page,
      pageSize: this.pageSize
    };
    
    localStorage.setItem('commercial_bureau_filters', JSON.stringify(filterState));
  }

  restoreFilterState(): boolean {
    if (environment.staticDemo) {
      this.nameOfCompany = null;
      this.bureauType = null;
      this.rmName = null;
      this.cibilId = null;
      this.dateOfReport = null;
      this.createdDate = null;
      this.page = 1;
      this.pageSize = 10;
      this.startIndex = 0;
      this.endIndex = 10;
      localStorage.removeItem('commercial_bureau_filters');
      return false;
    }
    try {
      const savedState = localStorage.getItem('commercial_bureau_filters');
      
      if (savedState) {
        const filterState = JSON.parse(savedState);
        
        this.nameOfCompany = filterState.nameOfCompany || null;
        this.bureauType = filterState.bureauType || null;
        this.rmName = filterState.rmName || null;
        this.cibilId = filterState.cibilId || null;
        this.dateOfReport = filterState.dateOfReport ? new Date(filterState.dateOfReport) : null;
        this.createdDate = filterState.createdDate ? new Date(filterState.createdDate) : null;
        this.page = filterState.page || 1;
        this.pageSize = filterState.pageSize || 10;
        
        this.startIndex = (this.page - 1) * this.pageSize;
        this.endIndex = this.startIndex + this.pageSize;
        
        console.log('Commercial bureau filter state restored');
        return true;
      }
    } catch (error) {
      console.error('Error restoring commercial bureau filter state:', error);
    }
    return false;
  }

  navigateToPRDashboard() {
		this.commonService.removeStorage("pr_commercial_pan");
		this.commonService.removeStorage("from_pr_dashboard");
		this.router.navigate(['/hsbc/walllet-dashboard'], { state: { data: this.pageData } });
	}

  private getStaticDemoCommercialHistoryRows(): any[] {
    return [
      { nameOfCompany: 'Acme Manufacturing Pvt Ltd', cibilId: 510001, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-16T10:15:00', dateOfReport: '2026-04-16T10:15:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Zenith Textiles Pvt Ltd', cibilId: 510002, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-15T11:10:00', dateOfReport: '2026-04-15T11:10:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Bluepeak Logistics LLP', cibilId: 510003, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-14T09:20:00', dateOfReport: '2026-04-14T09:20:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Nova Agro Industries', cibilId: 510004, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-13T12:00:00', dateOfReport: '2026-04-13T12:00:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Aster Components Ltd', cibilId: 510005, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-12T14:45:00', dateOfReport: '2026-04-12T14:45:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Orion Plastics Private Limited', cibilId: 510006, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-11T16:30:00', dateOfReport: '2026-04-11T16:30:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Silverline Foods LLP', cibilId: 510007, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-10T13:40:00', dateOfReport: '2026-04-10T13:40:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Vertex Auto Parts', cibilId: 510008, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-09T15:05:00', dateOfReport: '2026-04-09T15:05:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Prime Cables & Wires', cibilId: 510009, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-08T10:50:00', dateOfReport: '2026-04-08T10:50:00', isCibilProcessCompleted: 1 },
      { nameOfCompany: 'Northstar Chemicals', cibilId: 510010, rmName: 'Demo Banker', bureauType: 'Commercial Bureau', createdDate: '2026-04-07T09:05:00', dateOfReport: '2026-04-07T09:05:00', isCibilProcessCompleted: 1 },
    ];
  }

}
