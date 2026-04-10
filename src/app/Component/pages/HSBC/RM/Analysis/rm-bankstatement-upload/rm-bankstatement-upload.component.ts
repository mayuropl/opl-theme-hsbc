import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AesGcmEncryptionService } from 'src/app/CommoUtils/common-services/aes-gcm-encryption.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../../../CommoUtils/global-headers";

@Component({
  selector: 'app-rm-bankstatement-upload',
  templateUrl: './rm-bankstatement-upload.component.html',
  styleUrl: './rm-bankstatement-upload.component.scss'
})
export class RmBankstatementUploadComponent implements OnInit, OnDestroy {

  mode: ProgressBarMode = 'determinate';
  value;
  bufferValue = 75;

  selectedbsDetails: any;
  activatebs: any;

  tab:any;
  userId: any;
  pan: string;
  bsId: number;
  bsMasterId: number;
  BankDetailsList = [];
  passMapList: any = [] = [];
  uploadForm: FormGroup;
  yearRange:any;
  selectedBankId: string;
  filteredOptions: Observable<any[]>;

  fileData: any = [];
  showFileData: any = [];

  constants: any;
  pageData: any;
  // file upload @Nikul
  files: any[] = [];
  maxDate: Date = new Date();
  public bankStatementDurations = [
    Constants.BANK_STATEMENT_DURATION_TYPE.SIX_MONTH,
    Constants.BANK_STATEMENT_DURATION_TYPE.TWELVE_MONTH
  ] ;
  monthNames: string[] = [];

  private messageSubject = new BehaviorSubject<string>('');
  bankStmtUploadMsg$ = this.messageSubject.asObservable();
  private subscription: Subscription;

  bsUploaded: boolean=false;
  constructor(public commonService: CommonService, private msmeService: MsmeService, private router: Router,
    private fb: FormBuilder, private route: ActivatedRoute,private datePipe: DatePipe) {}


  ngOnInit():void{
    this.monthNames = this.commonService.getLast12Months();
    this.constants = Constants;
    this.pageData = history.state.data;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmBankStatementUpload';
    GlobalHeaders['x-main-page'] = this.pageData.subpageName;
    // this.bankStmtUploadMsg = `Please Make Sure That You Have Uploaded Latest 6 Months Bank Statements
    // (From ${this.monthNames[5]} To ${this.monthNames[0]})`
    this.initForm();
    this.updateMessage();
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.pan = this.commonService.toATOB(this.route.snapshot.params.pan);
    this.getBankList();
    this.filteredOptions = this.getFilteredOptions();
    this.filteredOptions = this.uploadForm.get("bankId").valueChanges.pipe(
      startWith(''),
      map(name => name ? this._filterBanks(name) : this.BankDetailsList.slice())
    );
    const bsIdTemp = this.commonService.getStorage("bsId",true);

    if(bsIdTemp != null){
      this.bsId = Number(bsIdTemp);
      this.bsMasterId = Number(this.commonService.getStorage("bsMasterId",true));
    } else {
      this.getBsId();
    }
    this.getFileData();

    console.log(`bsId :: ${this.bsId}`);
    console.log(`bsMasterId :: ${this.bsMasterId}`);
    // this.bsId =85;
    // this.getFileData();
    // this.tab  = 1;
    // this.changeTab(1);
  }

  updateMessage() {
    let fromDate = new Date(this.getControlValue("toDate"));
    let toDate = new Date(this.getControlValue("fromDate" ));
    let yearRange = this.getYearRange(fromDate, toDate);
    let fromMonth = yearRange?.fromMonth;
    let toMonth = yearRange?.toMonth;

    const monthsDifference = this.calculateMonthDifference(fromDate, toDate);

    const fromMonthName = this.getMonthName(fromMonth);
    const toMonthName = this.getMonthName(toMonth);

    // const message = `Please Make Sure That You Have Uploaded Latest ${monthsDifference} Months Bank Statements
    // (From ${fromMonthName} ${yearRange?.fromYear} To ${toMonthName} ${yearRange?.toYear})`;

    const message = `Please Make Sure That You Have Uploaded Bank Statement Of Selected Date Range Only`;

    this.messageSubject.next(message);
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || ''; // Fallback to empty string if date is null
  }

  calculateMonthDifference(fromDate: Date, toDate: Date): number {
    const fromYear = toDate.getFullYear();
    const toYear = fromDate.getFullYear();
    const fromMonth = toDate.getMonth();
    const toMonth = fromDate.getMonth();
    return (toYear - fromYear) * 12 + (toMonth - fromMonth + 1); // Adding 1 to include the last month
  }


  getMonthName(monthNumber: number): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber - 1]; // Adjust for 0-based indexing
  }

  ngOnDestroy(): void {
    this.commonService.removeStorage("bsId");
    this.commonService.removeStorage("bsMasterId");

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getBsId() {
    let createMasterJson:any = {}
    createMasterJson["pan"] = this.pan;
    createMasterJson["userId"] = this.userId ;
      this.msmeService.createBsMaster(createMasterJson)
      .subscribe((response: any) => {

        if (response.status == 200) {
          this.commonService.setStorage("bsId", response.data.profileId);
          this.bsId = response.data.profileId;
          console.log('fetched successful', response.message);
        } else {
          this.commonService.errorSnackBar(response.message)
          console.error('getting errror while fetching list', response.message);
        }
      }, error => {
        this.commonService.errorSnackBar('Something Went Wrong')
        console.error('ERROR', error);

      });
  }

  initForm() {
    this.uploadForm = this.fb.group({
      bankId: new FormControl(null, Validators.required),
      fromDate: new FormControl(null, Validators.required),
      toDate: new FormControl(null, Validators.required)
    })

    this.subscription = this.uploadForm.get('sinceMonth')?.valueChanges.subscribe(() => {
      this.updateMessage();
    });
  }

  // changeTab(tabId){
  //   this.tab = tabId;
  // }

  getFilteredOptions(): Observable<any[]> {
    return of(this.BankDetailsList).pipe(
      map(list => list.filter(item => {
        // Example filter criteria: name starts with 'B'
        return item.name.startsWith('B');
      }))
    );
  }

  private _filterBanks(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.BankDetailsList.filter(bank => bank.bankName.toLowerCase().includes(filterValue));
  }


  activeClick(index, item) {
    this.activatebs = index;
    this.selectedbsDetails = item;
  }


 /**
  * on file drop handler
  */
 onFileDropped($event) {
   this.prepareFilesList($event);
 }

 /**
  * handle file from browsing
  */
 fileBrowseHandler(files) {
  // if (files.length > 1)
  // this.commonService.warningSnackBar( "Only one file at time allow");
  // else {
    this.prepareFilesList(files);
  // }
 }

 /**
  * Delete file from files list
  * @param index (File index)
  */
 deleteFile(index: number) {
   this.files.splice(index, 1);
 }

 /**
  * Simulate the upload process
  */
 uploadFilesSimulator(index: number) {
   setTimeout(() => {
     if (index === this.files.length) {
       return;
     } else {
       const progressInterval = setInterval(() => {
         if (this.files[index].progress === 100) {
           clearInterval(progressInterval);
           this.uploadFilesSimulator(index + 1);
         } else {
           this.files[index].progress += 5;
         }
       }, 200);
     }
   }, 1000);
 }

 /**
  * Convert Files list to normal array list
  * @param files (Files List)
  */
 prepareFilesList(files: Array<any>) {
   for (const item of files) {
     item.progress = 0;
     this.files.push(item);
   }
   this.uploadFilesSimulator(0);
 }

 /**
  * format bytes
  * @param bytes (File size in bytes)
  * @param decimals (Decimals point)
  */
 formatBytes(bytes, decimals) {
   if (bytes === 0) {
     return '0 Bytes';
   }
   const k = 1024;
   const dm = decimals <= 0 ? 0 : decimals || 2;
   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
 }

 getBankList(): void {
  //  debugger
  this.msmeService.fetchbankList().subscribe(
    (response: any) => {
      // debugger
      if (response.status === 200) {
        this.BankDetailsList = response.data;
        // this.BankDetailsList.sort((a, b) => a.name.localeCompare(b.name));
        console.log('Fetched successfully', response.message);
      } else {
        console.error('Error while fetching list', response.message);
      }
    },
    error => {
      console.error('ERROR', error);
    }
  );
}

// Method to get value of a specific control
getControlValue(controlName: string) {
  return this.uploadForm.get(controlName)?.value;
}

onSubmit(): void {
  GlobalHeaders['x-page-action'] = 'Uploading BS';
  console.log(this.uploadForm.value)

  let createMasterJson:any = {}
  createMasterJson["pan"] = this.pan;
  createMasterJson["userId"] = this.userId ;
  let formData = new FormData();

  // formData['bsId'] = this.bsId
  formData.append('userId', this.userId);
  // formData.append('rangeMonth', this.getControlValue("sinceMonth"));
  let bankId = '';
  // formData.append('bankId', this.getControlValue("bankId"));
  for (let bank of this.BankDetailsList) {
    if (bank.bankName === this.selectedBankId) {
      bankId = bank.id;
    }
  }

  formData.append('bankId',bankId);
  let fromDate = new Date(this.getControlValue("toDate"));
  let toDate = new Date(this.getControlValue("fromDate"));
  formData.append('yearRange',JSON.stringify(this.getYearRange(fromDate,toDate)));
  formData.forEach((value, key) => {
    console.log(`${key}:`, value);
  });
  // formData['bankId'] = this.getControlValue("bankId");
  for (let file of this.files) {
    formData.append('multipartFiles', file);
  }
  // formData['multipartFiles'], this.files;
  if(this.passMapList && this.passMapList.length > 0){
    formData.append('passMapList', JSON.stringify(this.passMapList))
  }
  // formData['passMapList'], JSON.stringify(this.passMapList);

  // formData['applicationId'] = this.applicationId;
  // this.msmeService.createBsMaster(createMasterJson)
  //   .subscribe((response: any) => {

  //     if (response.status == 200) {
        // formData.append('bsMasterId', response.data.bsMasterId);
        // formData.append('profileId' ,response.data.profileId);
        formData.append('bsMasterId', this.bsMasterId+'');
        formData.append('profileId' ,this.bsId+'');
        // this.bsId = response.data.profileId;
        this.msmeService.bankStatementAnalysisUpload(formData)
        .subscribe((uploadResponse: any) => {
          uploadResponse = JSON.parse(AesGcmEncryptionService.getDecPayload(uploadResponse.encData));;
          if (uploadResponse.status === 200) {

            this.bsUploaded=true;
            this.commonService.successSnackBar(uploadResponse.message);
            // this.router.navigate([Constants.ROUTE_URL.PROVIDE_DATA_SELECTION]);
            console.log('fetched successful', uploadResponse.message);
          } else {
            if (uploadResponse.message) {
              this.commonService.warningSnackBar(uploadResponse.message);
            } else {
              this.commonService.warningSnackBar('Upload failed');
            }

            console.error('getting errror while fetching list', uploadResponse.message);
          }
          this.getFileData();
        }, error => {
          this.commonService.warningSnackBar('Upload failed')
          console.error('ERROR', error);

        });
    //     console.log('fetched successful', response.message);
    //   } else {
    //     console.error('getting errror while fetching list', response.message);
    //   }
    // }, error => {
    //   console.error('ERROR', error);

    // });
}

  onBankSelected(event: any) {
    this.selectedBankId = event.option.value;
  }


  getFileData(){
    if(this.bsId == null){
      return;
    }
    let formData = {}
    formData['profileId'] = 123;
    formData['bsId'] = this.bsId
    this.msmeService.fileByBankeS(formData).subscribe((response: any) => {
      if (response.status === 200) {
        this.fileData = response.data;
        this.selectedbsDetails = this.fileData[0];

      } else {
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    })
  }

  uichangeForaddBank() {
    this.bsUploaded = false;
    this.selectedBankId  ='';
    this.files = [];
    this.uploadForm.reset();
  }

  getYearRange(fromDate: Date, toDate: Date): any {
    const yearRange: Partial<YearRange> = {
      fromYear: toDate.getFullYear().toString(),
      toYear: fromDate.getFullYear().toString(),
      fromMonth: (toDate.getMonth() + 1).toString().padStart(2, '0'),  // Adding prefix 0 for single-digit months
      toMonth: (fromDate.getMonth() + 1).toString().padStart(2, '0')    // Adding prefix 0 for single-digit months
    };
    console.log('yearRange ===>', yearRange);
    return yearRange;
  }


// Nikul Add NGX-Slider Start
slideConfig = {
  slidesToShow: 4,
  slidesToScroll: 1,
  dots: false,
  infinite: false,
  // initialSlide: 1,
  // "nextArrow": "<div class='nav-btn next-slide'></div>",
  // "prevArrow": "<div class='nav-btn prev-slide'></div>",
  arrows: true,
  margin: 10,
  mobileFirst: false,
  respondTo: 'window',
  swipeToSlide: false,
  rows: 1,
  // cssEase: 'linear',
  lazyLoad: 'ondemand',
  responsive: [
    {
      breakpoint: 1440,
      settings: {
        slidesToShow: 3
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        arrows: true,
      }
    },
    {
      breakpoint: 620,
      settings: {
        slidesToShow: 2,
        arrows: true,
      }
      // settings: "unslick" // destroys slick
    },
    {
      breakpoint: 515,
      settings: {
        slidesToShow: 1,
        arrows: true,
      }
      // settings: "unslick" // destroys slick
    }
  ]

};

  slickInit(e) {
    console.log('slick initialized');
  }

  breakpoint(e) {
    console.log('breakpoint');
  }

  afterChange(e) {
    console.log('afterChange');
  }

  beforeChange(e) {
    console.log('beforeChange');
  }
  // Nikul Add NGX-Slider End
  navBack(){
    this.router.navigate(['/hsbc/rmBankStatementAnalysis'],{state: { data: this.pageData }});
  }

  navForw(){
    this.router.navigate(['/hsbc/rmBankStatementAnalysisView/'+this.commonService.toBTOA(this.bsId+'')],{state: { data: this.pageData }});
  }

  isActionAvail(actionId: string): boolean {
    // console.log(actionId);
    // console.log(this.pageData);
    for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
            return true; // Return true if found
        }
    }
    return false; // Return false if not found
}

}

export interface YearRange {
  fromYear: string;
  toYear: string;
  fromMonth: string;
  toMonth: string;
  firstDate: string;
  lastDate: string;
}


