import { Component, Inject, Input, Output,signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { FormBuilder, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _ from 'lodash';
import { TracxnFileAndTabCategory } from 'src/app/CommoUtils/constants';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AssociatedLegalEntitiesPopupComponent } from 'src/app/Popup/HSBC/associated-legal-entities-popup/associated-legal-entities-popup.component';

@Component({
  selector: 'app-investee-companies',
  templateUrl: './investee-companies.component.html',
  styleUrl: './investee-companies.component.scss'
})
export class InvesteeCompaniesComponent {

  isRLoaded = false;
  PageSelectNumber: any[] = [
    {
      name: '5',
      value: 5,
    },
    {
      name: '10',
      value: 10,
    },
    {
      name: '20',
      value: 20,
    },
    {
      name: '50',
      value: 50,
    },
    {
      name: '100',
      value: 100,
    },
  ];
  data: any;
  pageData: any;
  // pageSize = 10;
  tracxnCompanyList: any = [];
  tracxnCompanyofPage: PaginationSignal = new PaginationSignal();
  tracxnInvestorCompanyList: any = [];
  tracxnInvestorCompanyofPage: PaginationSignal = new PaginationSignal();

  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  pages = 10;
  

  investorCompanyProgressMap: { [id: number]: boolean } = {};
  investorCompanySuccessMap: { [id: number]: boolean } = {};

  tracxnInvestorPage: PaginationSignal = new PaginationSignal();
  listOfinvestorDetailsData: any = [];

  tracxnFacilitorPage: PaginationSignal = new PaginationSignal();
  listOfFacilitorsData: any = [];

  selectSearchType: string = 'NAME';

  tracxnInvestorList = [];

  searchQuery = '';
  debounceEventForFilter = _.debounce((event) => this.getInvesteeCompaniesSearchDetails(event), 600, {});
  searchDataFound: boolean = false;

  searchResult: any = null;
  serachDomainList:any=[];

  isSearch: boolean = false;
  isDisable: boolean = true;
  tracxnInvestorCompanySearchList:any = [];
  isLoading:boolean = false;

  isFirstTimePageLoding = false;
  fristTotalPage = 0;
  firstTracxnInvestorList = [];

  associatedEntitiesProgressMap: { [id: number]: boolean } = {};
  associatedEntitieSuccessMap: { [id: number]: boolean } = {};

  tracxnAssociatedEntitiesPage: PaginationSignal = new PaginationSignal();
  listOfAssociatedEntitiesDetails:any=[];


   pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getAllTracxnInvestorCompanydetails(true);

  }
  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getAllTracxnInvestorCompanydetails(true);

  }

  onSearchTypeChange(event: any) {
    this.searchErrMsg='';
    this.searchQuery = '';
    this.tracxnCompanyList = [];
    this.searchDataFound = false;
    this.searchSuggestions = [];
    this.tracxnInvestorList = [];
    // this.searchQuery = '';
    // this.clearFilterFormValue();
  }

  searchErrMsg = '';

  getInvesteeCompaniesSearchDetails(event) {
    this.searchSuggestions = [];
    const nameRegex = /^(?=[^a-zA-Z]*[a-zA-Z])(?!^[0-9]+$)(?!^[^a-zA-Z0-9]+$).*$/;

    if(this.commonService.isObjectNullOrEmpty(this.searchQuery.trim())){
      this.isDisable = true;
      this.page = 1;
      this.totalSize = this.fristTotalPage;
      this.tracxnInvestorCompanyList = this.firstTracxnInvestorList;
      this.isSearch = false;
      return;
    }

    if(this.searchQuery?.trim().length > 0 && this.selectSearchType === 'NAME' && !nameRegex.test(this.searchQuery.trim())) {
      // console.log('here inside name checking...')
      this.isDisable = true;
      this.searchErrMsg = 'Investor name must not contain only numerics or special characters';
      return;
    }

    if (!this.commonService.isObjectNullOrEmpty(this.searchQuery.trim()) && this.searchQuery.trim().length <= 2) {
      this.searchErrMsg = '';
      this.isDisable = true;
      return;
    }
    
    this.searchErrMsg = '';
    this.isDisable = false;
    this.searchDataFound = true;
    this.getInvestorList();
  }

  searchSuggestions = [];
  getInvestorList = () => {
    const reqJson = {
      searchType: this.selectSearchType,
      searchQuery: this.searchQuery,
      fieldName: (this.data?.isFrom == 2) ? TracxnFileAndTabCategory.FACILITATOR_LIST : TracxnFileAndTabCategory.INVESTOR
    };

    this.msmeService.getInvesteeCompaniesSearchDetails(reqJson).subscribe((res: any) => {
      // this.tracxnInvestorList = res;
      this.searchDataFound = false;

      if(res.status == 200 && res.data && res.data?.length > 0) {
        this.tracxnInvestorList = res.data;
        this.selectSearchType == 'NAME' ? this.searchSuggestions = res.data?.map(data => data.companyName) :
        this.searchSuggestions = res.data?.map(data => data.domain);
      }
      else {
         console.log('response from the server: ',res.message)
      }
    });
  }

  constructor(public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router,
    public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute, private fb: FormBuilder,private loaderService: LoaderService) {
      this.tracxnInvestorCompanyofPage.pageSize.set(10);
  }
  loadAfterDelay(): void {
    this.isRLoaded = true;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loadAfterDelay();
    }, 100);
    
    this.pageData = history.state.data || JSON.parse(this.commonService.getStorage('pageData', true) || '{}');
    if (this.pageData && Object.keys(this.pageData).length > 0) {
      this.commonService.setStorage('pageData', JSON.stringify(this.pageData));
    }
    
    this.activatedRoute.queryParams.subscribe(params => {
      this.data = params;
      console.log("Params ::::", params);
      this.getAllTracxnInvestorCompanydetails(true);
    });
  }

  previousTotalSize = 0;

  navigateToViewComponent() {
    if(!this.isSearch){
      const routerData = { pan: this.data?.pan, tabId: 1, selectedTabIndex: 6, cin: this.data?.cinnumber, tabName: 'New-age Economy Insights' };
      console.log(this.pageData) // Data to pass
      this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: this.pageData } });
    }else{
      this.page = 1;
      this.totalSize = this.fristTotalPage;
      this.tracxnInvestorCompanyList = this.firstTracxnInvestorList;
      this.searchQuery = "";
      this.isSearch = false;
    }
  }

  getAllTracxnCompanydetails() {
    const reqJson = {
      domain: this.data?.selectedDomain,
      cin: this.data?.cinnumber,
      id: this.data?.id,
      isFrom: this.data?.isFrom,
      pageSize: this.tracxnCompanyofPage.pageSize(),
      pageIndex: this.tracxnCompanyofPage.page() - 1
    };
    this.msmeService.getAllTracxnCompanydetails(reqJson).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData && res?.listData.length != 0) {
          this.tracxnCompanyList = res.listData;
          this.tracxnCompanyofPage.totalSize = res.data;
          console.log("tracxnCompanyList::::", this.tracxnCompanyList);
        } else {
          this.tracxnCompanyList = [];
        }
        console.log("tracxnCompanyList::::", this.tracxnCompanyList);
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    });
  }

   onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    console.log('Option selected:', event.option.value);
    this.isDisable = false;
  }

  getAllTracxnInvestorCompanydetails(isFromClickonEntities:any) {
    let reqJson;
    let domainid;
    if (this.data?.isPage == 1) {
      domainid = this.data?.id;
    } else {
      if(this.data?.isFrom == 1){
        domainid = this.data?.tracxnInvestorCompanyId;
      }else{
        domainid = this.data?.tracxnFacilitorCompanyId;
      }
    }
    if(!this.isSearch){
      if (this.data?.isFrom == 1) {
        reqJson = {
          selectedDomain: this.data?.selectedDomain,
          domain: this.data?.investorDomain ?? this.data?.domain,
          cin: this.data?.cinnumber,
          id: domainid,
          isFrom: this.data?.isFrom,
          pageSize: this.pageSize,
          pageIndex: this.page - 1,
          selectedDomainId: this.data?.selectedDomainId
        };
      } else if (this.data?.isFrom == 2) {
        reqJson = {
          selectedDomain: this.data?.selectedDomain,
          domain: this.data?.domainName ?? this.data?.domain,
          cin: this.data?.cinnumber,
          id: domainid,
          isFrom: this.data?.isFrom,
          pageSize: this.pageSize,
          pageIndex: this.page - 1,
          selectedDomainId: this.data?.selectedDomainId
        };
      }
    } else{
      reqJson = {
        searchDomainList:this.serachDomainList,
        pageSize: this.pageSize,
        pageIndex: this.page - 1
      };
    }

    if(isFromClickonEntities){
      this.isLoading = true;
      console.log("this.isLoading:::::::",this.isLoading);
      this.loaderService.subLoaderShow();  
    }
    
    this.msmeService.getAllTracxnInvestorCompaniesDetails(reqJson).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if(isFromClickonEntities){
          this.isLoading = false;
          this.loaderService.subLoaderHide();
        }
        if (res?.listData && res?.listData.length != 0) {
          this.tracxnInvestorCompanyList = res.listData;
          if(!this.isSearch){
            this.tracxnInvestorCompanySearchList  = [...this.tracxnInvestorCompanyList];
            console.log("tracxnInvestorCompanySearchList::::", this.tracxnInvestorCompanySearchList);
          }
          // this.tracxnInvestorCompanyofPage.totalSize = res.data;

          this.totalSize = res.data;

          if(!this.isFirstTimePageLoding) {
            this.isFirstTimePageLoding = true;
            this.firstTracxnInvestorList = res.listData;
            this.fristTotalPage = res.data;
          }


          console.log("tracxnInvestorCompanyList::::", this.tracxnInvestorCompanyList);
        } else {
          this.tracxnInvestorCompanyList = [];
        }
        console.log("tracxnCompanyList::::", this.tracxnInvestorCompanyList);
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    });
  }

  investeeCompaniesDialog(investCompaniesData: any) {
    console.log("investorCompanySuccessMap:::", this.investorCompanySuccessMap);
    if (investCompaniesData?.investorCompanyStatus === 'Success') {
      this.investorCompanySuccessMap[investCompaniesData.id] = true;
      investCompaniesData.isFrom = this.data?.isFrom;
      investCompaniesData.selectedDomain = this.data?.selectedDomain
      investCompaniesData.cinnumber = this.data?.cinnumber;
      investCompaniesData.pan = this.data?.pan;
      investCompaniesData.isPage = 2;
      investCompaniesData.selectedDomainId = this.data?.selectedDomainId;
      investCompaniesData.selectedInvesteeDomain = this.data?.investorDomain ?? this.data?.domainName;
      investCompaniesData.selectedInvesteeId = this.data?.id;
      investCompaniesData.isShow = true;
      this.router.navigate(['/hsbc/investeeCompanyDetails'], { queryParams: investCompaniesData, state: { data: this.pageData } });
    }

    if (investCompaniesData?.investorCompanyStatus === 'Pending' || investCompaniesData?.investorCompanyStatus == null || Object.keys(this.investorCompanySuccessMap).length === 0) {
      let reqJson;
      if (this.data?.isFrom == 1) {
        this.investorCompanyProgressMap[investCompaniesData.id] = true;
        reqJson = {
          requestApiType: 1,
          userId: this.data?.userId,
          refValue: this.data?.pan,
          cin: this.data?.cinnumber,
          refType: 'TRACXN_ANALYSIS',
          domain: investCompaniesData?.domain,
          selectedDomain: this.data?.selectedDomain,
          isCallFromPartOf: false,
          isFrom: this.data?.isFrom,
          isInvestorProfile: 2,
          id: investCompaniesData?.id,
          isMainInvesteeCompanyCall: 2,
          tracxnReqProxy: {
            sort: [
              {
                sortField: 'relevance',
                order: 'DEFAULT'
              }
            ],
            filter: {
              domain: [investCompaniesData?.domain]
            }
          }
        };
      } else if (this.data?.isFrom == 2) {
        this.investorCompanyProgressMap[investCompaniesData.id] = true;
        reqJson = {
          requestApiType: 1,
          userId: this.data?.userId,
          refValue: this.data?.pan,
          cin: this.data?.cinnumber,
          refType: 'TRACXN_ANALYSIS',
          domain: investCompaniesData?.domain,
          selectedDomain: this.data?.selectedDomain,
          isCallFromPartOf: false,
          isFrom: this.data?.isFrom,
          isInvestorProfile: 2,
          id: investCompaniesData?.id,
          isMainInvesteeCompanyCall: 2,
          tracxnReqProxy: {
            sort: [
              {
                sortField: 'relevance',
                order: 'DEFAULT'
              }
            ],
            filter: {
              domain: [investCompaniesData?.domain]
            }
          }
        };
      }
      this.msmeService.callCompanyApi(reqJson).subscribe((res: any) => {
        if (res.status == 200) {
          if (res?.isDisplayMessage === 'Pending') {
            this.investorCompanyProgressMap[investCompaniesData.id] = false;
          } if (res?.isDisplayMessage === 'Success') {
            this.investorCompanyProgressMap[investCompaniesData.id] = false;
            this.investorCompanySuccessMap[investCompaniesData.id] = true;
            investCompaniesData.investorCompanyStatus = "Success";
          }
        } else {
          this.commonService.errorSnackBar(res.isDisplayMessage)
        }
      })
    }
  }

  isFetchingDetails: boolean = false;

   reinitialisePageData() {
      this.pageSize = 10;
      this.startIndex = 0;
      this.endIndex = 10;
      this.totalSize = 0;
      this.page = 1
  }

  OnClickSearch() {

    let domains = [];
    this.isDisable = true;
    const nameRegex = /^(?=[^a-zA-Z]*[a-zA-Z])(?!^[0-9]+$)(?!^[^a-zA-Z0-9]+$).*$/;

    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

    if(this.selectSearchType === 'NAME' && !nameRegex.test(this.searchQuery)) {
        this.commonService.warningSnackBar('Please enter valid name');
        return;
    }

    if (this.selectSearchType === 'DOMAIN' && !domainRegex.test(this.searchQuery)) {
      this.commonService.warningSnackBar('Please enter valid domain');
      return;
    }

    let feildName = (this.data?.isFrom == 1) ? 'Investor' : 'Facilitator';
     
    if(this.selectSearchType === 'NAME') {

      const filteredList = this.tracxnInvestorList.filter(item => item.companyName === this.searchQuery);
      if(filteredList.length == 0) {
        this.commonService.warningSnackBar('No details found for searched '+feildName+' Name');
        return;
      }

      filteredList.forEach(result => domains.push(result.domain));
    } else {
      domains.push(this.searchQuery);
    }

    this.serachDomainList = domains;
 
    console.log('domains: ',domains);
    this.isDisable = true;

    let reqJson;
    if (this.data?.isFrom == 1) {
      reqJson = {
        requestApiType: 1,
        userId: this.data?.userId,
        refValue: this.data?.pan,
        cin: this.data?.cinnumber,
        refType: 'TRACXN_ANALYSIS',
        domain: this.data?.investorDomain,
        selectedDomain: this.data?.selectedDomain,
        isFrom: this.data?.isFrom,
        tracxnReqProxy: { 
          sort: [
            {
              sortField: 'relevance',
              order: 'DEFAULT'
            }
          ],
          filter: {
            institutionalInvestorDomain: domains,
            companyStage: ["Unfunded All", "Funded", "Public", "Acquisition"],
            country: ["India"]
          },
          from:0,
          size:100
        }
      };
    } else if (this.data?.isFrom == 2) {
      reqJson = {
        requestApiType: 1,
        userId: this.data?.userId,
        refValue: this.data?.pan,
        cin: this.data?.cinnumber,
        refType: 'TRACXN_ANALYSIS',
        domain: this.data?.domainName,
        selectedDomain: this.data?.selectedDomain,
        isFrom: this.data?.isFrom,
        tracxnReqProxy: {
          sort: [
            {
              sortField: 'relevance',
              order: 'DEFAULT'
            }
          ],
          filter: {
            fundingRoundFacilitators: domains,
            companyStage: ["Unfunded All", "Funded", "Public", "Acquisition"],
            country: ["India"]
          },from:0,
          size:100
        }
      };
    }

    this.isFetchingDetails = true;

    this.msmeService.callInvestorCompaniesSearchApi(reqJson).subscribe((res: any) => {
      if (res.status == 200) {
        this.reinitialisePageData();

        this.isSearch = true;
        this.isFetchingDetails = false;
        this.getAllTracxnInvestorCompanydetails(true);
      } else {
        this.commonService.errorSnackBar(res.isDisplayMessage)
        this.isFetchingDetails = false;
      }
    })
  }


  associated_Entities_popup(fetchDetails:any){
  
    if(fetchDetails?.associatedEntitiesStatus === 'Success'){
        this.associatedEntitieSuccessMap[fetchDetails.id] = true;
    }
  
    if(fetchDetails?.associatedEntitiesStatus === 'Pending' || fetchDetails?.associatedEntitiesStatus == null || Object.keys(this.associatedEntitieSuccessMap).length === 0){
      
      this.associatedEntitiesProgressMap[fetchDetails.id] = true;
      
      const data: any = {};
      data.requestApiType = 2,
      data.userId=this.data?.userId,
      data.refValue=this.data?.pan,
      data.selectedDomain= this.data?.selectedDomain,
      data.cin=this.data?.cinnumber,
      data.refType='TRACXN_ANALYSIS',
      data.domain=fetchDetails?.domain,
      data.isFrom=this.data?.isFrom,
      data.tracxnReqProxy = {
            filter: {
              associationsName: [
                fetchDetails?.domain
                ]
            }
        };
      if(this.isSearch){
        data.searchDomain = this.serachDomainList[0];
        data.id = fetchDetails?.id;
      }else{
        if (this.data?.isFrom == 1) {
          data.id = fetchDetails.tracxnInvestorCompanyId;
        } else if(this.data?.isFrom == 2){
          data.id = fetchDetails.tracxnFacilitorCompanyId;
        }
      }
      
      this.msmeService.callTracxnAssociatedEntitiesApi(data,true).subscribe((res: any) => {
        if (res.status == 200) {
          if(res?.isDisplayMessage === 'Pending'){
            this.associatedEntitiesProgressMap[fetchDetails.id] = false;
          }if(res?.isDisplayMessage === 'Success'){
            this.associatedEntitiesProgressMap[fetchDetails.id] = false;
            this.associatedEntitieSuccessMap[fetchDetails.id] = true;
            this.getAllTracxnInvestorCompanydetails(false);
          }
        } else {
          this.commonService.errorSnackBar(res.isDisplayMessage)
        }
      });
    }
  
    if(fetchDetails?.associatedEntitiesStatus === 'Success' || this.associatedEntitieSuccessMap[fetchDetails.id]){
      this.getAllAssociatedEntities(fetchDetails);
     }
  }


  getAllAssociatedEntities(fetchDetails:any){
    const data: any = {};
    data.pageSize = this.tracxnAssociatedEntitiesPage.pageSize();
    data.pageIndex = this.tracxnAssociatedEntitiesPage.page() - 1;
    data.domain =this.data?.selectedDomain;
    data.cin=this.data?.cinnumber;
    data.isCompany = 0;
    data.isFrom = this.data?.isFrom;
    data.id = fetchDetails?.id
    this.msmeService.getAllTracxnAssociatedEntitiesDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if(res?.listData){
          this.listOfAssociatedEntitiesDetails = res.listData;
          this.tracxnAssociatedEntitiesPage.totalSize = res.data;
          console.log("listOfAssociatedEntitiesDetails::::",this.listOfAssociatedEntitiesDetails);
          if (this.dialog.openDialogs.length === 0) {
            const dialogRef = this.dialog.open(AssociatedLegalEntitiesPopupComponent, {
              data: {
                pageSize:this.tracxnAssociatedEntitiesPage.totalSize,
                listData:this.listOfAssociatedEntitiesDetails,
                domain:this.data?.selectedDomain,
                cinnumber:this.data?.cinnumber,
                isFrom:this.data?.isFrom,
                details:fetchDetails
              },
              panelClass: ['popupMain_design'],
            });
          }
        }else{
          this.listOfAssociatedEntitiesDetails = [];
        }
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    }), error=>{
      console.log(error);
    };
  }
}
