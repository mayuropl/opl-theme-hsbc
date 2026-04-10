import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Component, Inject, OnInit, Optional} from '@angular/core';
import {Router} from '@angular/router';
import {MsmeService} from 'src/app/services/msme.service';
import {CommonService} from 'src/app/CommoUtils/common-services/common.service';
import {LoaderService} from "../../../CommoUtils/common-services/LoaderService";
import _ from 'lodash';

@Component({
  selector: 'app-balance-deposit-popup',
  templateUrl: './balance-deposit-popup.component.html',
  styleUrl: './balance-deposit-popup.component.scss'
})
export class BalanceDepositPopupComponent  implements OnInit {

  request :any;
  rmName:any;
  trendChange:any;
  showRmdata:any = false;
  showBack:any = false;
  currencySymbol:any;
  custList:any;
  rmList:any
  segmentList:any ;
  cityList:any ;
  selectedSegment: any;
  selectedCity: any;
  selectedSegmentName: any;
  selectedCityName: any;
  pagination = {pageIndex: 1,pageSize: 5,totalSize:0};
  childPagination = {pageIndex: 1,pageSize: 5,totalSize:0};
  PageSelectNumber: any[] = [
    { name: '5', value: 5 },
    { name: '10', value: 10 },
    { name: '15', value: 15 },
    { name: '20', value: 20 },
  ];
  isLoadingPopup: any = false;
  childRequest:any;
  sortStates = {
    innerColumn: '11',
    innerOrder: '1' as '1' | '2'
  };
  childSortStates = {
    innerColumn: '7',
    innerOrder: '1' as '1' | '2'
  };


  constructor(
    public dialogRef: MatDialogRef<BalanceDepositPopupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,private msmeService: MsmeService,private commonService: CommonService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    console.log('data === ',this.data);
    this.request = _.cloneDeep(this.data?.request);
    this.childRequest = _.cloneDeep(this.data?.request);
    this.trendChange = this.data.trendChange;
    this.segmentList = this.data?.segmentList?.filter((item: any) => item.name !== 'All') || [];
    this.cityList = this.data?.cityList?.filter((item: any) => item.name !== 'All') || [];
    this.currencySymbol = this.data.currencySymbol;
    if(this.trendChange === 1){
      if(this.data?.data?.cityWise?.[0]?.rmWise){
        this.rmList = this.data?.data?.cityWise?.[0].rmWise;
        this.pagination.totalSize = this.data?.data?.cityWise?.[0].totalRows;
        this.showRmdata = true;
        this.showBack = true;
        this.selectedSegment = this.getObjectById(this.data?.segmentId?.[0],this.segmentList)?.value;
        this.selectedCity = this.getObjectById(this.data?.cityId?.[0],this.cityList)?.value;
        this.selectedCityName = this.getObjectById(this.data?.cityId?.[0],this.cityList)?.name;
        this.selectedSegmentName = this.getObjectById(this.data?.segmentId?.[0],this.segmentList)?.name;
      }
    }else if(this.trendChange === 2){
      if(this.data?.data?.rmWise?.[0]?.custIdWise){
        this.custList = this.data?.data?.rmWise?.[0].custIdWise;
        this.childPagination.totalSize = this.data?.data?.rmWise?.[0].totalRows;
        this.showRmdata = false;
        this.showBack = false;
        this.rmName = this.data?.rmName;
        this.selectedCity = this.getObjectById(this.data?.cityId?.[0],this.cityList)?.value;
        this.selectedCityName = this.getObjectById(this.data?.cityId?.[0],this.cityList)?.name;
      }
    }
  }


  closePopup(data?): void {
    this.dialogRef.close(data);
  }


  getCustomerByRm(rmObj: any) {
    this.isLoadingPopup = true;
    this.loaderService.subLoaderShow();
    console.log(rmObj);
    this.rmName = rmObj?.rm_name;
    console.log('req === ',this.data.request)
    let request:any  = _.cloneDeep(this.data?.request);
    request.dataRmId = [rmObj?.rmId];
    request.reportType = 4;
    request.innerSortingColumn = Number(this.childSortStates.innerColumn);
    request.innerSortingOrder = Number(this.childSortStates.innerOrder);
    this.childRequest  = _.cloneDeep(request);
    const req ={
      "request":JSON.stringify(request)
    }
    console.log(req);
    this.msmeService.getAbbLevelReport(req,true).subscribe(
      (res: any) => {
        console.log("Response for level report == ",res)
        if (res && res?.status == 200) {
          // res = "{\"userRmId\":[1,2,3,4,5,6,7,8,9,10],\"reportType\":9,\"accountType\":2,\"currency\":1,\"criteria1Year\":2024,\"criteria1Quartars\":[\"Q1\",\"Q2\",\"Q3\",\"Q4\"],\"criteria2Year\":2025,\"criteria2Quartars\":[\"Q1\",\"Q2\",\"Q3\",\"Q4\"],\"yearType\":1,\"outerPageIndex\":0,\"outerSize\":5,\"innerPageIndex\":0,\"innerSize\":2,\"innerSortingColumn\":3,\"outerSortingColumn\":3,\"innerSortingOrder\":1,\"outerSortingOrder\":1,\"cityId\":[1],\"segmentId\":[1],\"dataRmId\":[1],\"data\":{\"segmentWise\":[],\"cityWise\":[],\"rmWise\":[{\"rmId\":1,\"criteria1Total\":38496740.31,\"criteria2Total\":43912356.67,\"changePct\":12.33,\"totalRows\":10,\"custIdWise\":[{\"cust_id\":\"006-302186\",\"criteria1Total\":178334800.92,\"criteria2Total\":0.0,\"changePct\":100,\"cust_name\":\"Madhav Behl\"},{\"cust_id\":\"002-428183\",\"criteria1Total\":50830400.58,\"criteria2Total\":81813646.67,\"changePct\":37.87,\"cust_name\":\"Shivani Saraf\"}],\"rm_name\":\"Dalaja Borde\"}],\"custIdWise\":[],\"totalRows\":1}}";
          let json = JSON.parse(res?.data);
          this.custList = json?.data?.rmWise?.[0]?.custIdWise;
          this.childPagination.totalSize =  json?.data?.rmWise?.[0]?.totalRows;
          this.isLoadingPopup = false;
          this.loaderService.subLoaderHide();
          this.showRmdata = false;

        }else{
          this.isLoadingPopup = false;
          this.loaderService.subLoaderHide();
          this.commonService.warningSnackBar(res?.message);
        }},
      (err) => {
        this.isLoadingPopup = false;
        this.loaderService.subLoaderHide();
        this.commonService.errorSnackBar(err);
      }
    );

  }

  getObjectById(id: number, list: any): any {
    return list.find((data: any) => data?.value === id);
  }

  back(){
    this.showRmdata = true;
  }

  updateCitySegMentvalues(obj:any,vari:any){
    this.loaderService.subLoaderShow();
    let request:any  = _.cloneDeep(this.data?.request);
    if(vari === 1){
      request.segmentId = [obj.value];
      this.data.request.segmentId = [obj.value];
    }else if(vari === 2){
      request.cityId = [obj.value];
      this.data.request.cityId = [obj.value];
    }
    request.innerSortingColumn = Number(this.sortStates.innerColumn);
    request.innerSortingOrder = Number(this.sortStates.innerOrder);
    const req ={
      "request":JSON.stringify(request)
    }
    this.msmeService.getAbbLevelReport(req,true).subscribe(
      (res: any) => {
        console.log("Response for level report == ",res)
        if (res && res?.status == 200) {
        let json = JSON.parse(res?.data);
        this.rmList = json.data?.cityWise?.[0]?.rmWise;
        this.pagination.totalSize = json.data?.cityWise?.[0]?.totalRows;
        this.showRmdata = true;
        this.showBack = true;
          this.loaderService.subLoaderHide();
      }
        else{
          this.loaderService.subLoaderHide();
          this.commonService.warningSnackBar(res?.message);
        }},
      (err) => {
        this.loaderService.subLoaderHide();
        this.commonService.errorSnackBar(err);
      }
    );
  }

  parentPagination(){
    this.loaderService.subLoaderShow();
    let request:any  = _.cloneDeep(this.data?.request);
    request.innerPageIndex = this.pagination.pageIndex-1;
    request.innerSize = this.pagination.pageSize;
    request.innerSortingColumn = Number(this.sortStates.innerColumn);
    request.innerSortingOrder = Number(this.sortStates.innerOrder);
    const req = {
      "request":JSON.stringify(request)
    }
    this.msmeService.getAbbLevelReport(req,true).subscribe(
      (res: any) => {
        console.log("Response for level report == ",res)
        if (res && res?.status == 200) {

          let json = JSON.parse(res?.data);
          this.rmList = json?.data?.cityWise?.[0]?.rmWise;
          this.showRmdata = true;
          this.showBack = true;
          this.pagination.totalSize = json?.data?.cityWise?.[0].totalRows;
          this.loaderService.subLoaderHide();
           }
        else {
          this.loaderService.subLoaderHide();
          this.commonService.warningSnackBar((res?.message));

        }
      },
      (err) => {
        this.loaderService.subLoaderHide();
        this.commonService.errorSnackBar(err);
      }
    );

}

  childPaginations(){
    this.loaderService.subLoaderShow();
    let request:any  = _.cloneDeep(this.childRequest);
    request.innerPageIndex = this.childPagination.pageIndex-1;
    request.innerSize = this.childPagination.pageSize;
    request.innerSortingColumn = Number(this.childSortStates.innerColumn);
    request.innerSortingOrder = Number(this.childSortStates.innerOrder);
    const req = {
      "request":JSON.stringify(request)
    }
    this.msmeService.getAbbLevelReport(req,true).subscribe(
      (res: any) => {
        console.log("Response for level report == ",res)
        if (res && res?.status == 200) {

          let json = JSON.parse(res?.data);
          this.custList = json?.data?.rmWise?.[0].custIdWise;
          this.loaderService.subLoaderHide();
        }
        else {
          this.loaderService.subLoaderHide();
          this.commonService.warningSnackBar((res?.message));

        }
      },
      (err) => {
        this.loaderService.subLoaderHide();
        this.commonService.errorSnackBar(err);
      }
    );

  }

  handleSort(column: string, order: '1' | '2') {
    this.sortStates.innerColumn = column;
    this.sortStates.innerOrder = order;
    this.pagination.pageIndex = 1;
    this.parentPagination();
  }

  handleChildSort(column: string, order: '1' | '2') {
    this.childSortStates.innerColumn = column;
    this.childSortStates.innerOrder = order;
    this.childPagination.pageIndex = 1;
    this.childPaginations();
  }

}
