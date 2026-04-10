import { Component } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MsmeService } from 'src/app/services/msme.service';
import { DatePipe } from '@angular/common';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { BureauReportRefreshPopupComponent } from 'src/app/Popup/HSBC/bureau-report-refresh-popup/bureau-report-refresh-popup.component';
import {
  clearCookie,
  GlobalHeaders,
  resetGlobalHeaders,
  saveActivity
} from "../../../../../../CommoUtils/global-headers";
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-consumer-bureau',
  templateUrl: './consumer-bureau.component.html',
  styleUrl: './consumer-bureau.component.scss'
})
export class ConsumerBureauComponent {
  today: string;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
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

  GenderList = [
    { value: '1', viewValue: "Male", tab: '1' },
    { value: '2', viewValue: "Female", tab: '1' },
    { value: '3', viewValue: "Third Gender", tab: '1' },
  ];
  individualForm: FormGroup;
  userId: any;
  applicationId: any;
  consumerId: any;
  // cibilId: any;
  panNumber: string = '';
  basicDetails: any;
  dinNo: any;

  nameOfCompany: any;
  rmName: any;
  cibilId: any;
  dateOfReport: any;
  createdDate: any;
  XdaysForCibilPing: any;
  formattedDateReportFirst: any;
  panNumberDisplay: string = '';
  isDetailFetched: Boolean = false;
  isHistoryDataFetched: Boolean = false;

  bureueHistoryDataList: any = [];
  isAnyReportWithinXDays: Boolean = true;
  isPopUpInClickYes: Boolean = false;
  isCallCibilHitted: Boolean = false;
  constants: any;
  pageData: any;
  routerData: any;
  cin: string;
  pan: string;
  private intervalSubscription: Subscription;

  constructor(
    public dialog: MatDialog, private msmeService: MsmeService, private commonService: CommonService, private router: Router,
    public commonMethod: CommonMethods, private fb: UntypedFormBuilder, private datePipe: DatePipe) {
    this.getXdaysForCibilPings();
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.applicationId = this.commonService.getStorage(Constants.httpAndCookies.APPLICATION_ID, true);
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  isExistingPanFound: boolean = false;
  hideForm: Boolean = false;
  protected readonly consValue = Constants;
  ngOnInit(): void {
    this.getNotes();
    this.constants = Constants;
    this.pageData = history.state.data;
    if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS2,this.consValue.pageMaster.CREDIT_AND_BUREAU,this.consValue.pageMaster.CONSUMER_BUREAU)
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmConsumerBureau';
    GlobalHeaders['x-main-page'] = 'Consumer Bureau';
    // this.commonService.removeStorage("consumer_pan");

  	if (history?.state?.routerData) {
      this.routerData = history?.state?.routerData;
      this.pan = this.routerData?.pan;
      if(!this.commonService.isObjectNullOrEmpty(this.pan)){
          this.commonService.setStorage("consumer_pan", this.pan);
      }
      this.cin = this.routerData?.cin;
    }


    if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("existing_pan", true))) {
      this.panNumber = this.commonService.getStorage("existing_pan", true);
     // this.panNumberDisplay = this.maskPanForDisplay(this.commonService.getStorage("existing_pan", true));
     // console.log("masking pan number "+ this.panNumberDisplay);
      this.isExistingPanFound = true;
      this.getBuearueHistoryDataAPI();

    } else if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("consumer_pan", true))) {
      this.panNumber = this.commonService.getStorage("consumer_pan", true);
       this.panNumberDisplay = this.commonService.getStorage("consumer_pan", true);
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
          if (this.bureueHistoryDataList?.length > 0) { // Ensures list is not null or empty
              const firstEntry = this.bureueHistoryDataList[0];

              if (firstEntry && firstEntry.isCibilProcessCompleted !== 1) { // Ensure first entry is not null
                  this.getBuearueHistoryDataAPI(); // Call method every 10 seconds
              }
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

  // maskPanForDisplay(panNumber: string): string {
  //   if (panNumber[3] === 'P' && ! this.isActionAvail(this.constants.PageActions.MASK_PAN)) {
  //     return panNumber.slice(0, panNumber.length - 4) + 'XXXX';
  //   }
  //   return panNumber;
  // }

  isValidPan(panNumber: string): boolean {
    const panPattern = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
    return panPattern.test(panNumber);
  }


  navigateToViewComponent(panNo: string) {
    const routerData = {
      ...this.routerData,
      tabId: 1, selectedTabIndex: 0, pan: this.commonService.getStorage('borrower_pan', true),
    };
    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], {state: {routerData, data: this.pageData}});
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('with_pageTitle_searchForm');
     this.intervalSubscription.unsubscribe();

    // Save filter state before component destruction
    this.saveFilterState();
  }
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
  onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getBuearueHistoryDataAPI(this.panNumber);
  }

  createIndividualForm(basicDetails?) {

    this.individualForm = this.fb.group({
      firstName: [basicDetails?.firstName || '', Validators.compose([Validators.required, this.nameValidator])],
      lastName: [basicDetails?.lastName || '', Validators.compose([Validators.required, this.nameValidator])],
      dateOfBirth: [basicDetails?.dateOfBirth || '', Validators.compose([Validators.required, this.dobValidator])],
      gender: [basicDetails?.gender || '', Validators.required],
      pan: [basicDetails?.panNumber?.toUpperCase() || '', Validators.compose([Validators.required, this.panValidator])],
      //pan: [this.panNumberDisplay || ''],
      personalMobileNum: [basicDetails?.mobileNumber || '', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      residencePincode: [basicDetails?.address?.pincode || '', Validators.compose([Validators.required, this.pincodeValidator])],
      residenceCity: [basicDetails?.address?.city || '', Validators.required],
      cityList: [[] || '', Validators.required],
      address1: [basicDetails?.address?.addressLineOne || '', Validators.compose([Validators.required, this.addressValidator])],
      address2: [basicDetails?.address?.addressLineTwo || '', Validators.compose([Validators.required, this.addressValidator])],

    });

    if (!this.commonService.isObjectNullOrEmpty(basicDetails?.address?.pincode)) {
      this.getStateCityFromPincode(basicDetails?.address?.pincode, this.individualForm)
    }

    if (!this.commonService.isObjectNullOrEmpty(basicDetails?.dateOfBirth)) {
      // const formattedDate = this.datePipe.transform(basicDetails.dateOfBirth, 'dd/MM/yyyy');
      // this.individualForm.controls.dateOfBirth.patchValue(formattedDate);
      // transformedDate = this.transformDate(transformedDate);

      let transformedDate = this.parseDate(basicDetails?.dateOfBirth);
      this.individualForm.controls.dateOfBirth.patchValue(transformedDate);
    }

    if (!this.commonService.isObjectNullOrEmpty(basicDetails?.gender)) {
      let genderValue = this.getGenderViewValue(basicDetails?.gender)
      this.individualForm.controls.gender.patchValue(genderValue);
    }
    this.hideForm = false;
  }

  parseDate(inputDate: string): Date {
    const parsedDate = new Date(inputDate);
    if (isNaN(parsedDate.getTime())) {
      const dateParts = inputDate.split('-');
      return new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
    }
    else return parsedDate;
  }

  transformDate(dateString: string): string {
    // Parse the original date string
    const dateParts = dateString.split('-');
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];

    // Create a new Date object

    const dateObj = this.basicDetails?.dateOfBirth;
    // Use DatePipe to format the date
    return dateObj.slice(0, 10);
  }
  getGenderViewValue(value: string): string {
    const gender = this.GenderList.find(item => item.viewValue.toUpperCase() == value.toUpperCase());
    return gender ? gender.value : '';
  }

  getStateCityFromPincode(residencePincode: number, formGroup?: FormGroup) {
    if (residencePincode?.toString().length !== 6) {
      // Assuming you want to validate residencePincode length
      console.log('Invalid residencePincode');
      return;
    }

    // this.loaderService.show();

    this.msmeService.getStateCityFromPincode(residencePincode).subscribe(response => {
      if (response.status == 200) {
        const data = response.data;

        // Check if city and state data is received
        if (!data || !data.cityId || !data.cityName || !data.state || !data.state.stateId || !data.state.stateName) {
          // Clear city and state fields
          formGroup.controls["cityList"]?.setValue([]);
          formGroup.controls["residenceCity"]?.setValue(null);
          formGroup.controls["stateList"]?.setValue([]);
          formGroup.controls["state"]?.setValue(null);

          this.commonService.warningSnackBar("Mentioned Pincode is not available in the dictionary, kindly try again by entering nearest pincode");
          return;
        }

        formGroup.controls["cityList"]?.setValue([{ "cityId": data["cityId"], "cityName": data["cityName"] }]);
        formGroup.controls["residenceCity"]?.setValue(data["cityId"]);
        formGroup.controls["stateList"]?.setValue([{ "stateId": data["state"]["stateId"], "stateName": data["state"]["stateName"] }]);
        formGroup.controls["state"]?.setValue(data["state"]["stateId"]);
        console.log(formGroup);

      }
      else {
        // Clear city and state fields on error
        formGroup.controls["cityList"]?.setValue([]);
        formGroup.controls["residenceCity"]?.setValue(null);
        formGroup.controls["stateList"]?.setValue([]);
        formGroup.controls["state"]?.setValue(null);

        this.commonService.errorSnackBar(response.message);
      }
    }, (error) => {
      // Clear city and state fields on API failure
      formGroup.controls["cityList"]?.setValue([]);
      formGroup.controls["residenceCity"]?.setValue(null);
      formGroup.controls["stateList"]?.setValue([]);
      formGroup.controls["state"]?.setValue(null);

      this.commonService.errorSnackBar("This Pincode is not in master");
    })
  }

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


  submit() {
    console.log("this.individualForm", this.individualForm.value)

     this.individualForm.controls['pan'].setValue(this.panNumber);


    if (!this.individualForm.valid) {
      this.individualForm.markAllAsTouched();
      return this.commonService.errorSnackBar("Please fill details");
    }
    // return false;
    this.isCallCibilHitted = true;

    let customerDetails: any = {};

    let individualFormKeys = Object.keys(this.individualForm.value)
    individualFormKeys.forEach(element => {
      customerDetails[element] = this.individualForm.value[element];
    });
    customerDetails.applicationId = this.applicationId;
    customerDetails.userId = this.userId;
    customerDetails.residenceCity = this.individualForm?.controls?.cityList?.value[0]?.cityName;
    customerDetails.residenceAddress = this.individualForm?.controls?.address1?.value + ' ' + this.individualForm?.controls?.address2?.value;
    customerDetails.personalPan = this.panNumber?.toUpperCase();
    console.log("customerDetails", customerDetails);

        // call bureau api
        const cibilReq = {
          orgId: 80,
          individual: true,
          userId: this.userId,
          customerDetails: customerDetails,
          pan: customerDetails?.pan?.toUpperCase(),
          isPopUpInClickYes: this.isPopUpInClickYes,
        };
        this.msmeService.callBureau(cibilReq).subscribe(res => {
          console.log("bureau response", res.id);
          if (res?.status == 200) {

            if(!this.commonService.isObjectNullOrEmpty(res?.id)){// If cibilId fetched then it will go to save cibilId
                this.commonService.setStorage(Constants.httpAndCookies.CIBIL_ID, res.id);
                this.commonService.successSnackBar("Success");
               }

                  this.getBuearueHistoryDataAPI();
                  this.hideForm = true;
                  this.isDetailFetched = false;
                  this.isCallCibilHitted = false;
                  // this.router.navigate(['/hsbc/rmConsumerBureauDetail'], { state: { data: this.pageData } });

              // this.getCompanyDetails();

          } else {
            this.isCallCibilHitted = false;
            this.commonService.errorSnackBar(res.message);
          }
        })

    //this.panNumberDisplay=this.maskPanForDisplay(this.panNumber);
  }


  nameValidator(control: FormControl): { [key: string]: boolean } | null {
   const name: string = control.value;

    if (!name) {
      return null; // If name is not provided, return null
    }

    // ✅ Allow letters, numbers, spaces, and special characters: / . - & ( )
    if (!/^(?! )[a-zA-Z0-9/.\-&() ]{3,150}$/.test(name)) {
      return { 'invalidCharacters': true };
    }

    // Check if name starts with a space
    if (name.startsWith(' ')) {
      return { 'startsWithSpace': true };
    }

     // 🔹 Ends with space
    if (name.endsWith(' ')) {
      return { 'endsWithSpace': true };
    }
    return null; // Validation passed
  }

  dobValidator(control: FormControl): { [key: string]: boolean } | null {
    const dob = control.value;
    if (!dob) {
      return null; // If DOB is not provided, return null
    }

    // Calculate age from DOB
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

    // if (pan.slice(-4) === 'XXXX') {
    //   return null;
    // }

    if (!/^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/.test(pan)) {
      return { 'invalidPanFormat': true };
    }

    // if (!/^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/.test(pan) || this.panNumberDisplay.slice(-4) === 'XXXX') {
    //   return { 'invalidPanFormat': true };
    // }

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
    const residencePincode: string = control.value;

    if (!residencePincode) {
      return null; // If PIN code is not provided, return null
    }
    // Check if PIN code starts with a digit from 1 to 9
    if (residencePincode.charAt(0) === '0') {
      return { 'startsWithZero': true };
    }
    // Check if PIN code is numeric
    if (!/^\d{6}$/.test(residencePincode)) {
      return { 'invalidPincodeFormat': true };
    }

    return null; // Validation passed
  }

  onInputChange(event: any) {
    event.target.value = event?.target?.value?.toUpperCase();
    this.isHistoryDataFetched = false;
  }

  callRefresh() {
    GlobalHeaders['x-page-action'] = 'Consumer New';
    const xDaysAgo = new Date();
    xDaysAgo.setDate(xDaysAgo.getDate() - this.XdaysForCibilPing);

    // Check if bureueHistoryDataList is not empty or null
    if (this.bureueHistoryDataList && this.bureueHistoryDataList.length > 0) {

        // Check If is it isCibilProcessCompleted or not
        const isCibilProcessCompleted = this.bureueHistoryDataList[0]?.isCibilProcessCompleted;
        if(isCibilProcessCompleted == null){
          return this.commonService.warningSnackBar("Bureau Analysis is In-process. You can not refresh Bureau now")
        }

        // X Days check logic
      this.isAnyReportWithinXDays = this.bureueHistoryDataList
        .filter(bureueHstry => bureueHstry.dateOfReport) // Filter out null or undefined dateOfReport
        .every(bureueHstry => new Date(bureueHstry.dateOfReport) <= xDaysAgo);
      console.log('Is any report within' + ' ' + this.XdaysForCibilPing + ' ' + 'days?', this.isAnyReportWithinXDays);

      if (!this.isAnyReportWithinXDays) {
        const dateString = this.bureueHistoryDataList[0]?.dateOfReport;
        const date = new Date(dateString);

        // Formatting the date
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        this.formattedDateReportFirst = formattedDate;
        this.BureauReportRefresh_Popup();
        // return this.commonService.warningSnackBar("It seems that a bureau report for this customer has already been fetched on " + formattedDate + ", so you can fetch a new report after " + this.XdaysForCibilPing + " days.");
      }
      else{
        this.callSignzyApi();
      }
    }
    else{
      this.formattedDateReportFirst = '';
      this.callSignzyApi();
    }
  }

  callSignzyApi(){
    let panNumber = this.panNumber?.toUpperCase();
    if (this.commonService.isObjectNullOrEmpty(panNumber)) {
      panNumber = this.panNumberDisplay;
      this.panNumber = panNumber;
    }
    const signzyReq = {
      //applicationId: this.userId,
      pan: panNumber,
      din: this.routerData?.din

    };
    console.log("signzy api req :", signzyReq)

    this.msmeService.getCallDataFromSignzy(signzyReq).subscribe(response => {
      console.log("Signzy api response", response)
      if (response?.status == 1001 || response?.status == 1000 || response?.status == 1002) {
        this.isDetailFetched = true;
        this.basicDetails = response?.data;
        this.createIndividualForm(this.basicDetails);

      } else {
        // this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
        this.commonService.errorSnackBar("We are currently facing a technical issue from the vendor’s side. Request you to please try again after some time.")
      }
    })
  }

  getXdaysForCibilPings() {
    this.msmeService.getXdaysForCibilPing(2).subscribe(response => {
      console.log("XdaysForCibilPing", response)
      if (response?.status == 200) {
        this.XdaysForCibilPing = response?.data?.data;
      } else {
        this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
      }
    });
  }

		getBuearueHistoryDataAPI(event?: any) {
    GlobalHeaders['x-page-action'] = 'Check Buearue';
    let panNumber = event?.target?.value?.toUpperCase();
    // panNumber =this.panNumberDisplay;
    if (this.commonService.isObjectNullOrEmpty(panNumber)) {
      panNumber = this.panNumber;
      // this.panNumber = panNumber;
      // this.panNumber=this.commonService.getStorage("consumer_pan", true);
    }

    if(!this.commonService.isObjectNullOrEmpty(panNumber)){
        if(panNumber.charAt(3) != "P"){
          this.commonService.warningSnackBar("Please enter PAN of Individual. PAN entered is of Non-Individual")
          return;
        }
    }
    // else{
    //   this.panNumber = panNumber;
    // }
    // if(this.panNumberDisplay.endsWith("XXXX")) {
    //   panNumber=this.commonService.getStorage("consumer_pan", true);
    // }
    // this.hideForm = true;
    let filterJson: any = {};
    filterJson.paginationFROM = this.page - 1
    filterJson.paginationTO = this.pageSize

    const bureauHistryReq = {
      bureauType: 2, // for commercial
      pan: panNumber.toUpperCase(),

      filterJSON: this.getFilterJson(filterJson, false)
    };
    console.log("getBuearueHistoryDataAPI req :", bureauHistryReq)

    this.msmeService.getBuearueHistoryData(bureauHistryReq).subscribe(response => {
      console.log("getBuearueHistoryDataAPI response", response)
      if (response?.status == 200 && response?.data?.status == 200) {
        this.bureueHistoryDataList = response?.data?.listData;
        this.totalSize = response?.data?.data;
        this.isHistoryDataFetched = true;
      } else {
        this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
      }
    })
  }

  viewConsumerDetailPage(cibilId,status) {
    this.commonService.setStorage(Constants.httpAndCookies.CIBIL_ID, cibilId);
    this.commonService.setStorage("consumer_pan", this.panNumber);
    this.pageData.status =status;
    this.router.navigate(['/hsbc/rmConsumerBureauDetail'], { state: { data: this.pageData , routerData: this.routerData } });
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
        (this.cibilId && this.cibilId.length > 3)) {

        this.getBuearueHistoryDataAPI(this.panNumber);
      } else if (this.dateOfReport) {
        this.getBuearueHistoryDataAPI(this.panNumber);
      }
      else if (this.createdDate) {
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

formateDate(date: Date | string) {
  if (!date) return null;

  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

  const parts = date.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${Number(parts[0])}-${Number(parts[1])}`;
  }

  return date;
}

  viewAuditPage(cibilId: any) {
    GlobalHeaders['x-page-action'] = 'Audit for Consumer Bureau';
    saveActivity(() => {});
    clearCookie();
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "CIBIL_AUDIT");
    this.commonService.setStorage(Constants.httpAndCookies.REF_ID_FOR_AUDIT, cibilId);
    this.commonService.setStorage(Constants.httpAndCookies.IS_INDIVIDUAL, "true");
    this.router.navigate(["/hsbc/rmApiAuditLogs"], { state: { data:this.pageData , routerData: this.routerData} });
  }

  isActionAvail(actionId: string): boolean {
    let res = false;
    // console.log("******Permission*****");
    // console.log(actionId);
    // console.log(this.pageData);
    if (this.pageData?.subpageId == Constants.pageMaster.CONSUMER_BUREAU2 || this.pageData?.subpageId == Constants.pageMaster.CONSUMER_BUREAU) {
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
              if (page?.subpageId == Constants.pageMaster.CONSUMER_BUREAU) {
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
    this.callSignzyApi();
  }

  onRefreshCancelled(): void {
    console.log('Refresh cancelled');
  }

  resetFilter() {
    this.nameOfCompany = null;
    this.rmName = null;
    this.cibilId = null;
    this.dateOfReport = null;
    this.createdDate = null;
    this.page = 1;
    this.pageSize = 10;
    this.startIndex = 0;
    this.endIndex = 10;

    // Clear saved filter state
    localStorage.removeItem('consumer_bureau_filters');

    // Reload data with cleared filters
    if (this.panNumber) {
      this.getBuearueHistoryDataAPI();
    }
  }

  saveFilterState(): void {
    const filterState = {
      nameOfCompany: this.nameOfCompany,
      rmName: this.rmName,
      cibilId: this.cibilId,
      dateOfReport: this.dateOfReport,
      createdDate: this.createdDate,
      page: this.page,
      pageSize: this.pageSize
    };

    localStorage.setItem('consumer_bureau_filters', JSON.stringify(filterState));
  }

  restoreFilterState(): boolean {
    try {
      const savedState = localStorage.getItem('consumer_bureau_filters');

      if (savedState) {
        const filterState = JSON.parse(savedState);

        this.nameOfCompany = filterState.nameOfCompany || null;
        this.rmName = filterState.rmName || null;
        this.cibilId = filterState.cibilId || null;
        this.dateOfReport = filterState.dateOfReport ? new Date(filterState.dateOfReport) : null;
        this.createdDate = filterState.createdDate ? new Date(filterState.createdDate) : null;
        this.page = filterState.page || 1;
        this.pageSize = filterState.pageSize || 10;

        this.startIndex = (this.page - 1) * this.pageSize;
        this.endIndex = this.startIndex + this.pageSize;

        console.log('Consumer bureau filter state restored');
        return true;
      }
    } catch (error) {
      console.error('Error restoring consumer bureau filter state:', error);
    }
    return false;
  }
}
