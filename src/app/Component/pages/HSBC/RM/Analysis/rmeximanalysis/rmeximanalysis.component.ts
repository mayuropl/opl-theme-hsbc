import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { EximSearchPopupComponent } from 'src/app/Popup/HSBC/exim-search-popup/exim-search-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import { panValidator } from 'src/app/shared/validators/custom-validators';
import {
  clearCookie,
  GlobalHeaders,
  resetGlobalHeaders,
  saveActivity
} from "../../../../../../CommoUtils/global-headers";

@Component({
  selector: 'app-rmeximanalysis',
  templateUrl: './rmeximanalysis.component.html',
  styleUrl: './rmeximanalysis.component.scss'
})
export class RMEXIMAnalysisComponent implements OnInit, OnDestroy {
  panForm: FormGroup;
  searchForm: FormGroup;
  eximAnalysisHistories: EximAnalysisHistory[] = [];
  // pagination:Pagination;
  pagination: PaginationSignal;

  //data pass from prevous page
  routerData: any;
  eximId : any;
  submitBtnTitle:string = "Verify PAN";
  panPlaceHolder:string = "Enter PAN";
  selectdDropDown:string = "PAN" || "NAME";
  // submitBtnTitle:string = "Verify PAN";

  externalRoutData:any = null;

  // private pageSizeSubject = new BehaviorSubject<number>(10);
  // pageSize$ = this.pageSizeSubject.asObservable();
  // private currentPageSubject = new BehaviorSubject<number>(1);
  // currentPage$ = this.currentPageSubject.asObservable();

  private destroy$ = new Subject<void>();
  personaList = [
    { value: 'PAN', viewValue: 'Search By PAN'},
    { value: 'NAME', viewValue: 'Search By Name' },
  ];

  // userId:any;
  panVerified: boolean = false;
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
  pageData:any;
  constants:any;
  constructor(
    public dialog: MatDialog, private msmeService: MsmeService, private commonService: CommonService, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute,
    public commonMethod: CommonMethods, private loaderService: LoaderService, private formBuilder: UntypedFormBuilder, private datepipe: DatePipe, private fb: FormBuilder
  ) {
    // this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
  }

  isExistingPanFound : boolean = false;
  pan:any;
  protected readonly consValue = Constants;
  ngOnInit() {
    this.constants = Constants;
    this.pageData = history.state.data;
      if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS2,this.consValue.pageMaster.FINANCIALS_ANALYSIS,this.consValue.pageMaster.EXIM_ANALYSIS)
    }
    this.pagination = new PaginationSignal();

    if (history.state?.routerData) {
      this.routerData = history.state?.routerData;
    }

    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmEXIMAnalysis';
    GlobalHeaders['x-main-page'] = 'Exim Analysis';

    if(!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("existing_pan", true))) {
      this.isExistingPanFound = true;
      this.initForm(this.commonService.getStorage("exim_search_by", true),this.commonService.getStorage("existing_pan", true));
    } else if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("exim_pan", true))) {
      this.initForm(this.commonService.getStorage("exim_search_by", true), this.commonService.getStorage("exim_pan", true));
    } else {
      this.initForm();
    }

    // this.pageSize$.pipe(takeUntil(this.destroy$)).subscribe(size => {
    //   // this.pagination.pageSize = size;
    //   // this.updateIndices();
    // });

    // this.currentPage$.pipe(takeUntil(this.destroy$)).subscribe(page => {
    //   // this.pagination.page = page;
    //   // this.updateIndices();
    // });

    // for Specific Class on Page
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('with_pageTitle_searchForm');


    this.activatedRoute.queryParams.subscribe(params => {
      if(params?.externalRoutData) {
        this.externalRoutData = params?.externalRoutData;
      }
    });

  }

  navigateToViewComponent(panNo:string){
    // Tab id 1 for existing tab, 2 for targer prospect
    let selectedTabIndex = 5;
    if(this.externalRoutData) {
      const externalRoutData = JSON.parse(this.commonService.toATOB(this.externalRoutData));
      selectedTabIndex = externalRoutData?.isFindProspects ? 4 : selectedTabIndex;
    }
    const routerData =  this.routerData; //  { pan: panNo,tabId:1, selectedTabIndex:selectedTabIndex};
    routerData.pan = panNo;
    routerData.tabId = 1;
    routerData.selectedTabIndex = selectedTabIndex;
    this.router.navigate(['/hsbc/rmExisitingPortfolioView'], { state: { routerData, data:this.pageData }, queryParams: {externalRoutData: this.externalRoutData} });
  }

  onPageChange(page: any): void {
    console.log("onPageChange");
    // this.currentPageSubject.next(page);
    // his.pagination.page.set($event)
    this.verifyPan();
  }

  // onPageSizeChange(size: number): void {
  onPageSizeChange(size: number): void {
    // this.pageSizeSubject.next(size);
    // this.pagination.pageSize.set(size)
    this.verifyPan();
  }

  // updateIndices(): void {
  //   this.pagination.startIndex = this.getStartIndex();
  //   this.pagination.endIndex = this.getEndIndex();
  //   this.verifyPan();
  // }
  // getStartIndex(): number {
  //   return (this.currentPageSubject.value - 1) * this.pageSizeSubject.value;
  // }

  // getEndIndex(): number {
  //   return this.getStartIndex() + this.pageSizeSubject.value - 1;
  // }

  initForm(searchBy?: any, pan?: any) {
    this.panForm = this.fb.group({
      searchBy:[searchBy || 'PAN',  [Validators.required]],
      pan: [pan || '', [Validators.required, panValidator()]]
      // pan: [value || '', [Validators.required]]
    });
    this.pan = pan;
    this.searchSelectionChange()
    // Subscribe to value changes
    this.panForm.get('pan')?.valueChanges.subscribe(value => {
      this.panForm.patchValue({
        pan: value.toUpperCase()
      }, { emitEvent: false });
      this.panVerified = false;
    })
    // Initialize controls outside the main form
    this.searchForm = this.fb.group({
      nameOfCompany: '',
      eximId: '',
      rmName: '',
      dateOfReport: ''
    });
    // this.panForm.valueChanges.pipe(
    //   debounceTime(300),// Wait for 300ms pause in events
    //   distinctUntilChanged(), // Only emit when the value has changed
    //   takeUntil(this.destroy$),
    // ).subscribe(value => {
    //   // Call API method on form value change
    //   // this.searchSelectionChange();
    // })

    // Subscribe to value changes in mainForm
    this.searchForm.valueChanges.pipe(
      debounceTime(300),// Wait for 300ms pause in events
      distinctUntilChanged(), // Only emit when the value has changed
      takeUntil(this.destroy$),
    ).subscribe(value => {
      // Call API method on form value change
      this.verifyPan();
    })
    // )
    if (!this.commonService.isObjectNullOrEmpty(pan)) {
      this.verifyPan();
    }
  }

  // Method to get value of a specific control
  getControlValue(controlName: string) {
    return this.panForm.get(controlName)?.value;
  }
  verifyPan() {
    GlobalHeaders['x-page-action'] = 'Searching from Exim Analysis history';
    if (this.panForm.valid) {
      this.commonService.setStorage("exim_pan", this.panForm?.value?.pan);
      this.commonService.setStorage("exim_search_by", this.panForm?.value?.searchBy);

      var json = {};

      if(this.getControlValue('searchBy') == "NAME") {
        json["name"] = this.getControlValue('pan');
      } else {
        json["pan"] = this.getControlValue('pan');
      }
      json["searchBy"] = this.getControlValue('searchBy');
      if (this.searchForm.valid) {
        json["filterJSON"] = this.getFilteredFormValue();
        if (json["filterJSON"] != null) {
          json["filterJSON"] = JSON.stringify(json["filterJSON"]);
        }
      };
      console.log(json);
     // GlobalHeaders['x-page-action'] = 'Search By '+json;
      this.msmeService.eximAnalysisHistory(json).subscribe((response: any) => {
        console.log(response);
        response = response.data;
        if (response.status == 200) {
          if (!response?.listData || response?.listData.length == 0) {
            this.commonService.successSnackBar(response.message)
          }
          this.eximAnalysisHistories = response?.listData;
          this.panVerified = true;
          this.pagination.totalSize = response?.data;
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

  searchSelectionChange() {
    // this.panVerified = false;
    this.selectdDropDown = this.getControlValue('searchBy');
    // debugger;
    if(this.getControlValue('searchBy') == "NAME") {

      this.submitBtnTitle = "Search";
      this.panPlaceHolder = "Enter Name"
      const emailControl = this.panForm.get('pan');

      // Remove 'required' validator dynamically
      if (emailControl) {
        emailControl.clearValidators(); // Remove all validators
        emailControl.addValidators( Validators.required);
        emailControl.updateValueAndValidity(); // Important to recalculate validation
      }
    } else {
      this.submitBtnTitle = "Verify PAN";
      this.panPlaceHolder = "Enter PAN"
      const emailControl = this.panForm.get('pan');

      // Add 'required' validator dynamically
      if (emailControl) {
        emailControl.addValidators( panValidator());
        emailControl.updateValueAndValidity(); // Important to recalculate validation
      }

    }

  }



  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('with_pageTitle_searchForm');
  }

  // Method to get filtered form value
  getFilteredFormValue() {
    const formValue = this.searchForm.value;
    const filteredFormValue: any = {};

    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== '' && value !== undefined) {
        filteredFormValue[key] = value;
      }
    });

    if (this.searchForm.get("dateOfReport")?.value) {
      filteredFormValue["dateOfReport"] = this.commonService.formateDate(this.searchForm.get("dateOfReport")?.value.toLocaleDateString('en-US'))
    }
    // filteredFormValue.paginationFROM = this.pagination.page - 1
    // filteredFormValue.paginationFROM = this.pagination.page() - 1
    filteredFormValue.paginationFROM = this.pagination.startIndex();
    // filteredFormValue.paginationFROM = this.pagination.page()
    // filteredFormValue.paginationTO = this.pagination.pageSize
    filteredFormValue.paginationTO = this.pagination.pageSize();
    return filteredFormValue;
  }

  navigateToView(bsHistory: EximAnalysisHistory) {
    const routerData = { eximId: bsHistory?.eximId, pan: this.getControlValue('pan') }; // Data to pass

    this.router.navigate([`/hsbc/rmEXIMAnalysisView`], { state: { routerData,data:this.pageData } });
  }

  viewAuditPage(eximId: any) {
    GlobalHeaders['x-page-action'] = 'Audit for Exim Analysis';
    saveActivity(() => {});
    clearCookie();
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "EXIM_ANALYSIS");
    this.commonService.setStorage(Constants.httpAndCookies.REF_ID_FOR_AUDIT, eximId);
    this.router.navigate(["/hsbc/apiAuditLog"]);
  }


  onRefresh() {
    GlobalHeaders['x-page-action'] = 'Refresh for New Search';
    if (!this.panForm.valid) {
      return;
    }
    // debugger
    // if(this.getControlValue('searcyBy') == "NAME") {
     if(this.getControlValue('searchBy') == "NAME") {
      this.searchCompany();
    } else {

      this.msmeService.getIECByPAN(this.getControlValue('pan'))
        .subscribe((response: any) => {

          if (response.status == 200) {

            const routerData = { eximId: response?.data, pan: this.getControlValue('pan') }; // Data to pass
            this.router.navigate(['/hsbc/rmEXIMAnalysisView'], { state: { routerData,data:this.pageData } });

            console.log('fetched successful', response.message);
          }  else  if(response.status == 110 || response.status == 103)
          {
            // this.commonService.errorSnackBar(response.message)
            // console.error('getting errror while fetching list', response.message);
            this.eximId= response?.data;
            this.EximSearch_Popup();
          } else if(response.status == 208) {
            this.commonService.warningSnackBar(response.message)
          }

          else {
            this.commonService.errorSnackBar(response.message)
            console.error('getting errror while fetching list', response.message);
          }
        }, error => {
          console.error('ERROR', error);

        });

    }
  }

  // EximSearch_Popup popup
  EximSearch_Popup(): void {
    let eximData ={
      eximId : this.eximId
    }
    if(this.getControlValue('searchBy') == "NAME") {
      eximData['companyName'] = this.getControlValue('pan');
      eximData['isSearchHidden'] = true;
    }


    const dialogRef = this.dialog.open(EximSearchPopupComponent,{
       panelClass: ['popupMain_design'],
       data: eximData,
       }

    );

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  isActionAvail(actionId: string): boolean {
    let res = false;
    // console.log("******Permission*****");
    // console.log(actionId);
    // console.log(this.pageData);
    if (this.pageData?.subpageId == Constants.pageMaster.EXIM_ANALYSIS2 || this.pageData?.subpageId == Constants.pageMaster.EXIM_ANALYSIS) {
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
              if (page?.subpageId == Constants.pageMaster.EXIM_ANALYSIS) {
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

  searchCompany() {
    var json = {};
    // console.log(this.data?.eximId);
    json['companyName'] = this.getControlValue('pan');
    json['isSearchHidden'] = true;

      this.msmeService.getEximByName(this.getControlValue('pan'))
        .subscribe((response: any) => {

          if (response.status == 200) {
            this.eximId= response?.data;
            this.EximSearch_Popup();
          } else {
            this.commonService.errorSnackBar(response.message)
            console.error('getting errror while fetching list', response.message);
          }
        }, error => {
          console.error('ERROR', error);

        });
    // this.EximSearch_Popup();

    // this.msmeService.getCompanyNames(json).subscribe((response: any) => {
    //   if (response != null && response?.status == 200) {
    //     this.companyNameList = response.listData;

    //   } else {
    //     this.commonService.errorSnackBar(response.message);
    //     console.log(response.message);
    //   }
    // }, error => {
    //   this.commonService.errorSnackBar('Something Went Wrong')
    //   console.error('Analysis By ccn failed', error);
    // })

  }

}

interface EximAnalysisHistory {
  eximId: number;
  name?: string;
  dateOfReport?: Date;
  rmName?: string;
}
