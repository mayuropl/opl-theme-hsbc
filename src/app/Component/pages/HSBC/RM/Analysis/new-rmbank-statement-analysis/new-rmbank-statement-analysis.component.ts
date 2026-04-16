import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { AuditAPIType, Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import {
  clearCookie,
  GlobalHeaders,
  resetGlobalHeaders,
  saveActivity
} from '../../../../../../CommoUtils/global-headers';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rmbank-statement-analysis',
  templateUrl: './new-rmbank-statement-analysis.component.html',
  styleUrl: './new-rmbank-statement-analysis.component.scss'
})
export class NewRMBankStatementAnalysisComponent implements OnInit, OnDestroy {
  private readonly demoPan = 'AAGFV5271N';
  today: string;
  panForm: FormGroup;
  searchForm: FormGroup;
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
  panVerified: boolean = false;
  pan:any;
  pageData:any;
  constants:any;

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

  bankStatementHistories: BankStatementHistory[] = [];
  subscriptions: Subscription[] = [];
  constructor(
    public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router, private http: HttpClient,
    public commonMethod: CommonMethods, private loaderService: LoaderService, private formBuilder: UntypedFormBuilder, private datepipe: DatePipe, private fb: FormBuilder
  ) {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
  }

  onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.verifyPan();
  }

  isExistingPanFound : boolean = false;
  protected readonly consValue = Constants;
  ngOnInit() {
    this.constants = Constants;
    this.pageData = history.state.data;
      if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS2,this.consValue.pageMaster.FINANCIALS_ANALYSIS,this.consValue.pageMaster.BANK_STATEMENT_ANALYSIS)
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmBankStatementAnalysis';
    GlobalHeaders['x-main-page'] = 'Bank Statement Analysis';
    if(!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("existing_pan", true))) {
      this.isExistingPanFound = true;
      this.initForm(this.commonService.getStorage("existing_pan", true));
    }else if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("bs_pan", true))) {
      this.initForm(this.commonService.getStorage("bs_pan", true));
    } else {
      this.initForm();
    }

    // for Specific Class on Page
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('with_pageTitle_searchForm');
    if (!this.pageData) {
      const storedData = this.commonService.getStorage(Constants.httpAndCookies.US_PR, true);
      if (storedData) {
        try {
          const routeData = JSON.parse(storedData);
          const analysisPage = routeData.find(
            (el: any) => (el?.pageId) === (this.constants.pageMaster.ANALYTICS2)
          );
          if (analysisPage){
            this.pageData  = analysisPage.subpages.find(
              (el: any) => (el?.subpageId) === (this.constants.pageMaster.BANK_STATEMENT_ANALYSIS2)
            );
          }
          console.log(this.pageData);
        } catch (error) {
          console.error('Invalid JSON in storage:', error);
        }
      }
    }


  }

  navigateToViewComponent(panNo:string){
    // Tab id 1 for existing tab, 2 for targer prospect
    const routerData = { pan: panNo,tabId:1,selectedTabIndex:5}; // Data to pass
    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData ,data:this.pageData} });
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('with_pageTitle_searchForm');
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  initForm(value?: any) {
    this.panForm = this.fb.group({
      pan: new FormControl(value || '', [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')])
    })
    this.pan = value;

    // Subscribe to value changes
    this.subscriptions.push(
      this.panForm.get('pan')?.valueChanges.subscribe(value => {
        this.panForm.patchValue({
          pan: value.toUpperCase()
        }, { emitEvent: false });
        this.panVerified = false;
      })
    )
    // Initialize controls outside the main form
    this.searchForm = this.fb.group({
      accountHolderName: new FormControl(''),
      bankName: new FormControl(''),
      accountNumber: new FormControl(''),
      bsId: new FormControl(''),
      rmName: new FormControl(''),
      dateOfReport: new FormControl('')
    });


    // Subscribe to value changes in mainForm
    this.subscriptions.push(
      this.searchForm.valueChanges.pipe(
        debounceTime(300),// Wait for 300ms pause in events
        distinctUntilChanged() // Only emit when the value has changed
      ).subscribe(value => {
        // Call API method on form value change
        this.verifyPan();
      })
    )
    if (environment.staticDemo || !this.commonService.isObjectNullOrEmpty(value)) {
      this.verifyPan();
    }
  }

  // Method to get value of a specific control
  getControlValue(controlName: string) {
    return this.panForm.get(controlName)?.value;
  }
  // Method to get filtered form value
  getFilteredFormValue() {
    const formValue = this.searchForm.value;
    // Check if all controls are empty or undefined
    // const allControlsEmpty = Object.keys(formValue).every(key => {
    //   const value = formValue[key];
    //   return value === '' || value === undefined;
    // });

    // if (allControlsEmpty) {
    //   return null; // Return null if all controls are empty
    // }

    const filteredFormValue: any = {};
    filteredFormValue["version"] = Number(2);

    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== '' && value !== undefined) {
        filteredFormValue[key] = value;
      }
    });

    if (this.searchForm.get("dateOfReport")?.value) {
      // filteredFormValue["dateOfReport"]=this.formateDate(this.searchForm.get("dateOfReport")?.value.toLocaleDateString());
      filteredFormValue["dateOfReport"] = this.formateDate(this.searchForm.get("dateOfReport")?.value.toLocaleDateString('en-US'))
    }
    if(!filteredFormValue["dateOfReport"]){
      delete filteredFormValue["dateOfReport"];
    }
    filteredFormValue.paginationFROM = this.page - 1
    filteredFormValue.paginationTO = this.pageSize
    if(!filteredFormValue["dateOfReport"]){
      delete filteredFormValue["dateOfReport"];
    }
    return filteredFormValue;
  }

  // formateDate(date) {
  //   var date1 = date?.split("/");
  //   date1 = date1[2]+ '-' +date1[0] + '-' +date1[1];
  //   return date1;
  // }

  formateDate(dateString: string): string {
    if (!dateString) return '';

    const dateParts = dateString.split('/');
    if (dateParts.length !== 3) return '';

    const [month, day, year] = dateParts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  verifyPan() {
    // if(this.userId){
    //   this.panForm.addControl('userId', this.fb.control(this.userId));
    // }

    if (environment.staticDemo && !this.panForm?.valid) {
      this.panForm.patchValue({ pan: this.demoPan }, { emitEvent: false });
      this.pan = this.demoPan;
    }

    if (this.panForm.valid) {
      this.commonService.setStorage("bs_pan", this.panForm?.value?.pan);
      var json = {};
      json["pan"] = this.getControlValue('pan');
      if (this.searchForm.valid) {
        json["filterJSON"] = this.getFilteredFormValue();
        if (json["filterJSON"] != null) {
          json["filterJSON"] = JSON.stringify(json["filterJSON"]);

        }
      };
      console.log(json);
      if(json){
        GlobalHeaders['x-page-action'] = 'Searching from BankStatement analysis history';
      }

      if (environment.staticDemo) {
        const allFiltered = this.filterStaticDemoBankRows(this.getStaticDemoBankHistoryRows());
        const from = (this.page - 1) * this.pageSize;
        this.bankStatementHistories = allFiltered.slice(from, from + this.pageSize);
        this.panVerified = true;
        this.totalSize = allFiltered.length;
        return;
      }

      this.msmeService.bankAnalysisVerifyPan(json).subscribe((response: any) => {
        console.log(response);
        // console.log(response.status);
        if (response.status == 200) {
          this.bankStatementHistories = response?.listData ?? [];
          console.log(this.bankStatementHistories);
          // this.updatePage();
          this.panVerified = true;
          this.totalSize = response?.data;
          console.log(response);
        } else {
          this.commonService.errorSnackBar(response.message)
          console.log(response.message);
        }
      }, error => {
        this.commonService.errorSnackBar('Something Went Wrong')
        console.error('Upload failed', error);
      })
    }
  }

  updatePage() {
    if (this.bankStatementHistories.length <= 10) {
      this.totalSize = 1;
    } else {
      this.totalSize = this.bankStatementHistories.length / 10;
    }

  }

  viewAuditPage(refId: any) {
    GlobalHeaders['x-page-action'] = 'Audit for BankStatement Analysis';
    saveActivity(() => {});
    clearCookie();
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "BS");
    this.commonService.setStorage(Constants.httpAndCookies.REF_ID_FOR_AUDIT, refId);
    const routerData = {apiType : AuditAPIType.API_AUDIT};
    this.router.navigate(["/hsbc/apiAuditLog"], { state: { routerData,data:this.pageData} });
  }

  isActionAvail(actionId: string): boolean {
    if (
      this.pageData?.subpageId == Constants.pageMaster.BANK_STATEMENT_ANALYSIS2 ||
      this.pageData?.subpageId == Constants.pageMaster.BANK_STATEMENT_ANALYSIS
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
        if (page?.subpageId != Constants.pageMaster.BANK_STATEMENT_ANALYSIS) {
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

  private getStaticDemoBankHistoryRows(): BankStatementHistory[] {
    return [
      { bsId: 520001, accountHolderName: 'Acme Manufacturing Pvt Ltd', bankName: 'HSBC', accountNumber: '****4521', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-16'), isConsolidatedRequired: '0' },
      { bsId: 520002, accountHolderName: 'Zenith Textiles Pvt Ltd', bankName: 'HSBC', accountNumber: '****8832', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-15'), isConsolidatedRequired: '0' },
      { bsId: 520003, accountHolderName: 'Bluepeak Logistics LLP', bankName: 'HSBC', accountNumber: '****1109', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-14'), isConsolidatedRequired: '1' },
      { bsId: 520004, accountHolderName: 'Nova Agro Industries', bankName: 'HSBC', accountNumber: '****7743', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-13'), isConsolidatedRequired: '0' },
      { bsId: 520005, accountHolderName: 'Aster Components Ltd', bankName: 'HSBC', accountNumber: '****2290', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-12'), isConsolidatedRequired: '0' },
      { bsId: 520006, accountHolderName: 'Orion Plastics Private Limited', bankName: 'HSBC', accountNumber: '****6612', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-11'), isConsolidatedRequired: '0' },
      { bsId: 520007, accountHolderName: 'Silverline Foods LLP', bankName: 'HSBC', accountNumber: '****3388', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-10'), isConsolidatedRequired: '1' },
      { bsId: 520008, accountHolderName: 'Vertex Auto Parts', bankName: 'HSBC', accountNumber: '****9054', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-09'), isConsolidatedRequired: '0' },
      { bsId: 520009, accountHolderName: 'Prime Cables & Wires', bankName: 'HSBC', accountNumber: '****4417', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-08'), isConsolidatedRequired: '0' },
      { bsId: 520010, accountHolderName: 'Northstar Chemicals', bankName: 'HSBC', accountNumber: '****5520', rmName: 'Demo Banker', dateOfReport: new Date('2026-04-07'), isConsolidatedRequired: '0' },
    ];
  }

  private filterStaticDemoBankRows(rows: BankStatementHistory[]): BankStatementHistory[] {
    const formValue = this.searchForm?.value || {};
    const contains = (source: any, query: any) => {
      const q = (query ?? '').toString().trim().toLowerCase();
      if (!q) {
        return true;
      }
      return (source ?? '').toString().toLowerCase().includes(q);
    };
    const selectedDate = formValue?.dateOfReport
      ? this.formateDate(new Date(formValue.dateOfReport).toLocaleDateString('en-US'))
      : '';

    return rows.filter((row) =>
      contains(row.accountHolderName, formValue?.accountHolderName) &&
      contains(row.bankName, formValue?.bankName) &&
      contains(row.accountNumber, formValue?.accountNumber) &&
      contains(row.bsId, formValue?.bsId) &&
      contains(row.rmName, formValue?.rmName) &&
      (!selectedDate || this.formateDate(new Date(row.dateOfReport as Date).toLocaleDateString('en-US')) === selectedDate)
    );
  }

  onRefresh() {
    GlobalHeaders['x-page-action'] = 'Forwading to Upload BS Page ';
    let createMasterJson: any = {};
    createMasterJson.pan = this.getControlValue('pan');
    createMasterJson.userId = this.userId;
    createMasterJson.version = Number(2);
    this.msmeService.createBsMaster(createMasterJson)
      .subscribe((response: any) => {

        if (response.status === 200) {
          this.commonService.setStorage('bsMasterId', response.data.bsMasterId);
          this.commonService.setStorage('bsId', response.data.profileId);
          // tslint:disable-next-line:max-line-length
          this.router.navigate(['/hsbc/upload-bank-statement-new', this.commonService.toBTOA(this.getControlValue('pan'))], { state: { data: this.pageData }} );

          console.log('fetched successful', response.message);
        } else {
          console.error('getting errror while fetching list', response.message);
        }
      }, error => {
        console.error('ERROR', error);

      });
  }

  navigateToView(bsHistory: BankStatementHistory) {
    const routerData = { accountNo: bsHistory?.accountNumber };
    console.log('isConsolidatedRequired === ' , bsHistory?.isConsolidatedRequired);// Data to pass
    if(bsHistory?.isConsolidatedRequired === '1'){
      this.commonService.setStorage('consolidatedRequired', 'true');
    }else{
      this.commonService.setStorage('consolidatedRequired', 'false');
    }
    this.router.navigate([`/hsbc/newRmBankStatementAnalysisView/${this.commonService.toBTOA(bsHistory.bsId + '')}`], { state: { routerData,data:this.pageData } });
  }

}

interface BankStatementHistory {
  bsId: number;
  rmEmailId?: string;
  dateOfReport?: Date;
  bankName?: string;
  rmName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  isConsolidatedRequired?: any;
}
