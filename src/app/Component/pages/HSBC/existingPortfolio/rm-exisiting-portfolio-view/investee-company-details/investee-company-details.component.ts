import { Component, Inject, Input, Output,signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { FormBuilder, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FundingRoundPopupComponent } from 'src/app/Popup/HSBC/funding-round-popup/funding-round-popup.component';


@Component({
  selector: 'app-investee-company-details',
  templateUrl: './investee-company-details.component.html',
  styleUrl: './investee-company-details.component.scss'
})
export class InvesteeCompanyDetailsComponent {

    listOfEmployeeDetailsData:any = [];
    listOfinvestorDetailsData:any = [];
    listOfFacilitorsData:any =[];
    litOfBusinessAndCoverageDetails :any =[];
    listOfFundingRoundListdetails:any =[];
    listOfFundingRoundVentureDebtListdetails:any =[];
    listOfFundingRoundBuyOutListdetails:any =[];

    tracxnEmployeePage: PaginationSignal = new PaginationSignal();
    tracxnInvestorPage: PaginationSignal = new PaginationSignal();
    tracxnFacilitorPage: PaginationSignal = new PaginationSignal();
    tracxnBusinessAndCoveragePage : PaginationSignal = new PaginationSignal();
    tracxnFundingRoundListDetailsPage:PaginationSignal = new PaginationSignal();
    tracxnFundingVentureDebtPage: PaginationSignal = new PaginationSignal();
    tracxnFundingBuyOutPage: PaginationSignal = new PaginationSignal();

    innovateBankingDetails:any;
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
    data : any;
    pageData:any;
    tracxnCompanyList:any=[];
    tracxnCompanyDomainList:any=[];
    selectedCompanyDomain:any;
    selectedDomainDetails: any;
    changeDomain:any;
    
    investorCompanyProgressMap: { [id: number]: boolean } = {};
    investorCompanySuccessMap: { [id: number]: boolean } = {};

   constructor(public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router,
      public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute,private fb: FormBuilder) {
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
        console.log("Params ::::",params);
        this.getInnovateBasicDetails();
      });
    }

    navigateToViewComponent(){
      const routerData = { pan: this.data?.pan,tabId:1,selectedTabIndex:6,cin:this.data?.cinnumber, tabName: 'New-age Economy Insights'}

      console.log(this.pageData) // Data to pass
      if(this.data?.isPage == 1){
        this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData,data:this.pageData } });
      }else if (this.data?.isPage == 2){
        this.router.navigate(['/hsbc/investee-companies'], { queryParams: this.data, state: { data: this.pageData } });
      }
    }

    getAllTracxnCompanydetails(){
      const reqJson = {
        domain: this.data?.selectedDomain,
        cin:this.data?.cinnumber,
        id:this.data?.id,
        isFrom:this.data?.isFrom
      };
      this.msmeService.getAllTracxnCompanydetails(reqJson).subscribe((res: any) => {
        if (res.status == 200 && res?.listData) {
          this.tracxnCompanyList = res.listData;
          this.tracxnCompanyList.forEach(cmpDomain => {
              this.tracxnCompanyDomainList.push(cmpDomain?.domain);
          });
          console.log("tracxnCompanyList::::",this.tracxnCompanyList);
          this.selectedCompanyDomain = this.tracxnCompanyDomainList[0];
          this.onDomainSelected({ value: this.selectedCompanyDomain });
        } else {
          this.commonService.errorSnackBar(res.message)
        }
      });
    } 

    onDomainSelected(event: any) {
      const selectedDomain = event.value;
      this.changeDomain = event.value;
      this.selectedCompanyDomain = selectedDomain;
      this.selectedDomainDetails = this.getInnovateBasicDetails();
    }

    getInnovateBasicDetails(){
        let reqJson;
        if(this.data?.isFrom == 1){
           reqJson = {
            domain: this.data?.investorDomain ?? this.data?.domain,
            cin:this.data?.cinnumber,
            id:this.data?.id,
            isCompany:1
          };
        }else if(this.data?.isFrom == 2){
           reqJson = {
            domain: this.data?.domainName ?? this.data?.domain,
            cin:this.data?.cinnumber,
            id:this.data?.id,
            isCompany:1
          };
        }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4 || this.data?.isFrom == 5){
          reqJson = {
           domain: this.data?.domain,
           cin:this.data?.cinnumber,
           id:this.data?.id,
           isCompany:1
         };
       }
        this.msmeService.getInnovateBankingDetails(reqJson).subscribe((res: any) => {
            if (res.status == 200 && res?.data) {
              this.innovateBankingDetails = res.data;
              console.log("innovateBankingDetails::::",this.innovateBankingDetails);
              this.tracxnEmployeePage.pageSize = signal(5);
              this.tracxnFacilitorPage.pageSize = signal(5);
              this.tracxnInvestorPage.pageSize = signal(5);
              this.getAllBusinessAndCoverageDetails();
            } else {
              this.commonService.errorSnackBar(res.message)
            }
          });
        }
    
          getAllBusinessAndCoverageDetails(){
            const data: any = {};
            if(this.data?.isFrom == 1){
              data.pageSize = this.tracxnBusinessAndCoveragePage.pageSize();
              data.pageIndex = this.tracxnBusinessAndCoveragePage.page() - 1;
              //data.domain = this.changeDomain;
              data.domain = this.data?.investorDomain ?? this.data?.domain;
              data.cin=this.data?.cinnumber;
              data.isCompany=1;
              data.id = this.data?.id
            }else if(this.data?.isFrom == 2){
              data.pageSize = this.tracxnBusinessAndCoveragePage.pageSize();
              data.pageIndex = this.tracxnBusinessAndCoveragePage.page() - 1;
              data.domain = this.data?.domainName ?? this.data?.domain;
              data.cin=this.data?.cinnumber;
              data.isCompany=1;
              data.id = this.data?.id
            }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4 || this.data?.isFrom == 5){
              data.pageSize = this.tracxnBusinessAndCoveragePage.pageSize();
              data.pageIndex = this.tracxnBusinessAndCoveragePage.page() - 1;
              data.domain = this.data?.domain;
              data.cin=this.data?.cinnumber;
              data.isCompany=1;
              data.id = this.data?.id
            }
              this.msmeService.getAllBusinessandCoverageDetails(data).subscribe((res: any) => {
                if (res.status == 200 && res?.listData) {
                  if(res?.listData && res?.listData?.length != 0){
                    this.litOfBusinessAndCoverageDetails = res.listData;
                    this.tracxnBusinessAndCoveragePage.totalSize = res.data;
                    console.log("litOfBusinessAndCoverageDetails::::",this.litOfBusinessAndCoverageDetails);
                  }else{
                    this.litOfBusinessAndCoverageDetails = [];
                  }
                } else {
                  this.commonService.errorSnackBar(res.message)
                }
                this.getAllEmployeeDetails();
              }), error=>{
                console.log(error);
              };
        }
    
        getAllEmployeeDetails(){
          const data: any = {};
          if(this.data?.isFrom == 1){
            data.pageSize = this.tracxnEmployeePage.pageSize();
            data.pageIndex = this.tracxnEmployeePage.page() - 1;
            data.domain =this.data?.investorDomain ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id
          }else if(this.data?.isFrom == 2){
            data.pageSize = this.tracxnEmployeePage.pageSize();
            data.pageIndex = this.tracxnEmployeePage.page() - 1;
            data.domain =this.data?.domainName ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id
          }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4 || this.data?.isFrom == 5){
            data.pageSize = this.tracxnEmployeePage.pageSize();
            data.pageIndex = this.tracxnEmployeePage.page() - 1;
            data.domain =this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id
          }
          
          this.msmeService.getAllEmployeeDetails(data).subscribe((res: any) => {
            if (res.status == 200) {
              if(res?.listData && res?.listData.length != 0){
                this.listOfEmployeeDetailsData = res.listData;
                this.tracxnEmployeePage.totalSize = res.data;
                console.log("listOfEmployeeDetailsData::::",this.listOfEmployeeDetailsData);
              }else{
                this.listOfEmployeeDetailsData = [];
              }
            } else {
              this.commonService.errorSnackBar(res.message)
            }
            this.getAllInvestorDetails();
          }), error=>{
            console.log(error);
          };
        }
    
        getAllInvestorDetails(){
          const data: any = {};
          if(this.data?.isFrom == 1){
            data.pageSize = this.tracxnInvestorPage.pageSize();
            data.pageIndex = this.tracxnInvestorPage.page() - 1;
            data.domain = this.data?.investorDomain ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id
          }else if(this.data?.isFrom == 2){
            data.pageSize = this.tracxnInvestorPage.pageSize();
            data.pageIndex = this.tracxnInvestorPage.page() - 1;
            data.domain = this.data?.domainName ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id
          }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4 || this.data?.isFrom == 5){
            data.pageSize = this.tracxnInvestorPage.pageSize();
            data.pageIndex = this.tracxnInvestorPage.page() - 1;
            data.domain = this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id
          }
          this.msmeService.getAllInvestorDetails(data).subscribe((res: any) => {
            if (res.status == 200) {
              if(res?.listData && res?.listData.length != 0){
                this.listOfinvestorDetailsData = res.listData;
                this.tracxnInvestorPage.totalSize = res.data;
                console.log("listOfinvestorDetailsData::::",this.listOfinvestorDetailsData);
              }else{
                this.listOfinvestorDetailsData=[]; 
              }
            } else {
              this.commonService.errorSnackBar(res.message)
            }
            this.getAllFacilitors();
          }), error=>{
            console.log(error);
          };
        }
    
        getAllFacilitors(){
          const data: any = {};
          if(this.data?.isFrom == 1){
            data.pageSize = this.tracxnFacilitorPage.pageSize();
            data.pageIndex = this.tracxnFacilitorPage.page() - 1;
            data.domain = this.data?.investorDomain ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }else if(this.data?.isFrom == 2){
            data.pageSize = this.tracxnFacilitorPage.pageSize();
            data.pageIndex = this.tracxnFacilitorPage.page() - 1;
            data.domain =this.data?.domainName ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4 || this.data?.isFrom == 5){
            data.pageSize = this.tracxnFacilitorPage.pageSize();
            data.pageIndex = this.tracxnFacilitorPage.page() - 1;
            data.domain =this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }
          this.msmeService.getAllFacilitorsDetails(data).subscribe((res: any) => {
            if (res.status == 200 && res?.listData) {
              if(res?.listData && res?.listData.length != 0){
                this.listOfFacilitorsData = res.listData;
                this.tracxnFacilitorPage.totalSize = res.data;
                console.log("listOfFacilitorsData::::",this.listOfFacilitorsData);
              }else{
                this.listOfFacilitorsData = [];
              }
            } else {
              this.commonService.errorSnackBar(res.message)
            }
            this.getAllFundingRoundListDetails();
          }), error=>{
            console.log(error);
          };
        } 
    
        parseFloatValue(value: any): number {
          return parseFloat(value);
        }

        getAllFundingRoundListDetails(){
          const data: any = {};
          if(this.data?.isFrom == 1){
            data.pageSize = this.tracxnFundingRoundListDetailsPage.pageSize();
            data.pageIndex = this.tracxnFundingRoundListDetailsPage.page() - 1;
            data.domain = this.data?.investorDomain ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }else if(this.data?.isFrom == 2){
            data.pageSize = this.tracxnFundingRoundListDetailsPage.pageSize();
            data.pageIndex = this.tracxnFundingRoundListDetailsPage.page() - 1;
            data.domain =this.data?.domainName ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4 || this.data?.isFrom == 5){
            data.pageSize = this.tracxnFundingRoundListDetailsPage.pageSize();
            data.pageIndex = this.tracxnFundingRoundListDetailsPage.page() - 1;
            data.domain =this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }
          this.msmeService.getAllFundingRoundListDetailsDetails(data).subscribe((res: any) => {
            if (res.status == 200 && res?.listData) {
              if(res?.listData && res?.listData?.length != 0){
                this.listOfFundingRoundListdetails = res.listData;
                this.tracxnFundingRoundListDetailsPage.totalSize = res.data;
                console.log("listOfFundingRoundListdetails::::",this.listOfFundingRoundListdetails);
              }else{
                this.listOfFundingRoundListdetails = [];
              }
            } else {
              this.commonService.errorSnackBar(res.message)
            }
          }), error=>{
            console.log(error);
          };
        }

        getAllTracxnFundingVentureDebtDetails(){
         const data: any = {};
          if(this.data?.isFrom == 1){
            data.pageSize = this.tracxnFundingVentureDebtPage.pageSize();
            data.pageIndex = this.tracxnFundingVentureDebtPage.page() - 1;
            data.domain = this.data?.investorDomain ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }else if(this.data?.isFrom == 2){
            data.pageSize = this.tracxnFundingVentureDebtPage.pageSize();
            data.pageIndex = this.tracxnFundingVentureDebtPage.page() - 1;
            data.domain =this.data?.domainName ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4 || this.data?.isFrom == 5){
            data.pageSize = this.tracxnFundingVentureDebtPage.pageSize();
            data.pageIndex = this.tracxnFundingVentureDebtPage.page() - 1;
            data.domain =this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }
          this.msmeService.getAllTracxnFundingVentureDebtDetails(data).subscribe((res: any) => {
            if (res.status == 200 && res?.listData) {
              if(res?.listData && res?.listData?.length != 0){
                this.listOfFundingRoundVentureDebtListdetails = res.listData;
                this.tracxnFundingVentureDebtPage.totalSize = res.data;
                console.log("listOfFundingRoundVentureDebtListdetails::::",this.listOfFundingRoundVentureDebtListdetails);
              }else{
                this.listOfFundingRoundVentureDebtListdetails = [];
              }
            } else { 
              this.commonService.errorSnackBar(res.message)
            }
          }), error=>{
            console.log(error);
          };
        }
      
        getAllTracxnFundingBuyOutDetails(){
          const data: any = {};
          if(this.data?.isFrom == 1){
            data.pageSize = this.tracxnFundingBuyOutPage.pageSize();
            data.pageIndex = this.tracxnFundingBuyOutPage.page() - 1;
            data.domain = this.data?.investorDomain ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }else if(this.data?.isFrom == 2){
            data.pageSize = this.tracxnFundingBuyOutPage.pageSize();
            data.pageIndex = this.tracxnFundingBuyOutPage.page() - 1;
            data.domain =this.data?.domainName ?? this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4 || this.data?.isFrom == 5){
            data.pageSize = this.tracxnFundingBuyOutPage.pageSize();
            data.pageIndex = this.tracxnFundingBuyOutPage.page() - 1;
            data.domain =this.data?.domain;
            data.cin=this.data?.cinnumber;
            data.isCompany=1;
            data.id = this.data?.id;
          }
          this.msmeService.getAllTracxnFundingBuyOutDetails(data).subscribe((res: any) => {
            if (res.status == 200 && res?.listData) {
              if(res?.listData && res?.listData?.length != 0){
                this.listOfFundingRoundBuyOutListdetails = res.listData;
                this.tracxnFundingBuyOutPage.totalSize = res.data;
                console.log("listOfFundingRoundBuyOutListdetails::::",this.listOfFundingRoundBuyOutListdetails);
              }else{
                this.listOfFundingRoundBuyOutListdetails = [];
              }
            } else {
              this.commonService.errorSnackBar(res.message)
            }
          }), error=>{
            console.log(error);
          };
        }

        Funding_Round_popup(): void {
            let getDomain ;
            if(this.data?.isFrom == 1){
              getDomain = this.data?.investorDomain
            }else if(this.data?.isFrom == 2){
              getDomain = this.data?.domainName
            }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4){
              getDomain = this.data?.domain
            }
              const dialogRef = this.dialog.open(FundingRoundPopupComponent, {
                data: {
                  pageSize:this.tracxnFundingRoundListDetailsPage.totalSize,
                  listData:this.listOfFundingRoundListdetails,
                  pageSizeVenturesize:this.tracxnFundingVentureDebtPage.totalSize,
                  ventureDebtListData:this.listOfFundingRoundVentureDebtListdetails,
                  pageSizeBuyOutsize:this.tracxnFundingBuyOutPage.totalSize,
                  buyOutListData:this.listOfFundingRoundBuyOutListdetails,
                  domain:getDomain,
                  cinnumber:this.data?.cinnumber,
                  isFrom:this.data?.isFrom,
                  id: this.data?.id
                },
                panelClass: ['popupMain_design'],
              });
        }

        investeeCompaniesDialog(investCompaniesData :any,type:any) {
          console.log("investorCompanySuccessMap:::", this.investorCompanySuccessMap);
          if(investCompaniesData?.investorCompanyStatus === 'Success'){
            this.investorCompanySuccessMap[investCompaniesData.id] = true;
            investCompaniesData.isFrom = this.data?.isFrom;
            investCompaniesData.selectedDomain  = this.data?.selectedDomain
            investCompaniesData.cinnumber = this.data?.cinnumber;
            investCompaniesData.pan = this.data?.pan;
            investCompaniesData.isPage = 2;
            investCompaniesData.selectedDomainId = this.data?.selectedDomainId
            this.router.navigate(['/hsbc/investeeCompanyDetails'], { queryParams: investCompaniesData});
          }
            
          if(investCompaniesData?.investorCompanyStatus === 'Pending' || investCompaniesData?.investorCompanyStatus == null || Object.keys(this.investorCompanySuccessMap).length === 0){
                  let reqJson;
                    if(type == 1){
                      this.investorCompanyProgressMap[investCompaniesData.id] = true;
                      reqJson = {
                        requestApiType: 1,
                        userId:this.data?.userId,
                        refValue:this.data?.pan,
                        cin:this.data?.cinnumber,
                        refType:'TRACXN_ANALYSIS',
                        domain:investCompaniesData?.domain ?? investCompaniesData?.investorDomain,
                        selectedDomain:this.data?.investorDomain ?? this.data?.domainName,
                        isCallFromPartOf:false,
                        isFrom:type,
                        isInvestorProfile:2,
                        id:investCompaniesData?.id,
                        isMainInvesteeCompanyCall:4,
                        tracxnReqProxy: {
                          sort: [
                            {
                              sortField: 'relevance',
                              order: 'DEFAULT'
                            }
                          ],
                          filter: {
                            domain: [investCompaniesData?.domain ?? investCompaniesData?.investorDomain]
                          }
                        }
                      };
                    }else if(type == 2){
                      this.investorCompanyProgressMap[investCompaniesData.id] = true;
                      reqJson = {
                        requestApiType: 1,
                        userId:this.data?.userId,
                        refValue:this.data?.pan,
                        cin:this.data?.cinnumber,
                        refType:'TRACXN_ANALYSIS',
                        domain:investCompaniesData?.domain ?? investCompaniesData?.domainName,
                        selectedDomain:this.data?.investorDomain ?? this.data?.domainName,
                        isCallFromPartOf:false,
                        isFrom:type,
                        isInvestorProfile:2,
                        id:investCompaniesData?.id,
                        isMainInvesteeCompanyCall:4,
                        tracxnReqProxy: {
                          sort: [
                            {
                              sortField: 'relevance',
                              order: 'DEFAULT'
                            }
                          ],
                          filter: {
                            domain: [investCompaniesData?.domain ?? investCompaniesData?.domainName]
                          }
                        }
                      };
                    }
                   
                  
        
                  this.msmeService.callCompanyApi(reqJson).subscribe((res: any) => {
                    if (res.status == 200) {
                      if(res?.isDisplayMessage === 'Pending'){
                        this.investorCompanyProgressMap[investCompaniesData.id] = false;
                      }if(res?.isDisplayMessage === 'Success'){
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
}
