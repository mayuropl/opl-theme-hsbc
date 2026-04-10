import { Component, Inject, Input, Output,signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { FormBuilder, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-associated-legal-entities-popup', 
  templateUrl: './associated-legal-entities-popup.component.html',
  styleUrl: './associated-legal-entities-popup.component.scss'
})
export class AssociatedLegalEntitiesPopupComponent {


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
  pageData:any;
  listOfAssociatedEntitiesDetails:any=[];
  tracxnAssociatedEntitiesPage: PaginationSignal = new PaginationSignal();

  constructor(public dialog: MatDialog, private msmeService: MsmeService, @Inject(MAT_DIALOG_DATA) public data: any,public commonService: CommonService, private router: Router,
          public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute,private fb: FormBuilder) {
        }
        loadAfterDelay(): void {
          this.isRLoaded = true;
  }

  ngOnInit(): void {
    this.tracxnAssociatedEntitiesPage.totalSize = this.data?.pageSize;
    this.listOfAssociatedEntitiesDetails = this.data?.listData;
  }

  getAllAssociatedEntities(){

    // console.log('inside the popup box');

    const data: any = {};
    data.pageSize = this.tracxnAssociatedEntitiesPage.pageSize();
    data.pageIndex = this.tracxnAssociatedEntitiesPage.page() - 1;
    data.domain =this.data?.domain ;
    data.cin=this.data?.cinnumber;
    data.isCompany = 0;
    data.isFrom = this.data?.isFrom;
    data.id = this.data?.details?.id;
    this.msmeService.getAllTracxnAssociatedEntitiesDetails(data).subscribe((res: any) => {

      // console.log('calling the tracxn entities details')

      if (res.status == 200 && res?.listData) {
        if(res?.listData && res?.listData.length != 0){
          this.listOfAssociatedEntitiesDetails = res.listData;
          this.tracxnAssociatedEntitiesPage.totalSize = res.data;
          console.log("---> listOfPartOfCompanies is here ::::",this.listOfAssociatedEntitiesDetails);
        }else{
          this.listOfAssociatedEntitiesDetails =[];
        }
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    }), error=>{
      console.log(error);
    };
  }
}
