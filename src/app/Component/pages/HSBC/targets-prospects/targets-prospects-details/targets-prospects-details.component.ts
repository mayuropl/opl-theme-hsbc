import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-targets-prospects-details',
  templateUrl: './targets-prospects-details.component.html',
  styleUrl: './targets-prospects-details.component.scss'
})
export class TargetsProspectsDetailsComponent {
  pageOfItems: Array<any>;
  isCollapsed: boolean = false;
  isCollapsed1 = true;
  isCollapsed2 = true;
  isCollapsed3 = true;
  isCollapsed4 = true;
  isCollapsed5 = true;
  selectedTabIndex: number;
  tabValue: number;
  selectedbsDetails: any;
  activatebs: any;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  userId: any;
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

  psgeGstList: any = [];

  DataStatus = [
    { value: 'Buys from India', viewValue: 'someData', tab: '1' },
    { value: 'Sales to India', viewValue: 'someData', tab: '1' },
  ];

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
  }
}
