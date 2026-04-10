import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { GlobalHeaders } from 'src/app/CommoUtils/global-headers';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-listof-customer-popup',
  templateUrl: './listof-customer-popup.component.html',
  styleUrl: './listof-customer-popup.component.scss',
})
export class ListofCustomerPopupComponent {
  customerRmList: any;
  pageData: any;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  isReceverRemarkFlag:boolean  = false;
  isApproverRemarkForSender:boolean = false;
  PageSelectNumber: any[] = [
    { name: '10', value: 10 },
    { name: '20', value: 20 },
    { name: '50', value: 50 },
    { name: '100', value: 100 },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { customer: any , isRequesterRemarkForRecevier:boolean, isApproverRemarkForSender:boolean},
    private msmeService: MsmeService,
    private commonService: CommonService,
    private dialogRef: MatDialogRef<ListofCustomerPopupComponent>,
    private router: Router // using fetch the data from different componet using this `data in customer` key
  ) {
    console.log(data?.customer);
    
    console.log("recevier ::",data?.isRequesterRemarkForRecevier);
    console.log("sender ::",data?.isApproverRemarkForSender);
    
    this.customerRmList = data?.customer;
    this.totalSize = this.customerRmList?.length;
    this.isReceverRemarkFlag= data?.isRequesterRemarkForRecevier,
    this.isApproverRemarkForSender = data?.isApproverRemarkForSender;
  }

  ngOnInit(): void {
    this.pageData = history.state.data;
    this.pageData = renameKey(this.pageData, 'subSubpages', 'subpages');
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  }

  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  }
  revokeCustomer(cust: any) {
    const revokeRequestPayload = {
      id: cust.id,
      status: "Revoked",
      isRevoked: true
    };

    this.msmeService.revokeRequestPortFolio(revokeRequestPayload).subscribe((res) => {
      if (res && res.status === 200) {
        this.commonService.successSnackBar(res.message);

        const index = this.data.customer.findIndex((c: any) => c.id === cust.id);
        if (index > -1) {
          this.data.customer[index] = {
            ...this.data.customer[index],
            status: "Revoked",
            isRevoked: true
          };
        }
        this.data.customer = [...this.data.customer];
      }
    });
  }

  navigateToView(pan: String) {
    let panData: any = pan.toString();
    GlobalHeaders['x-page-data'] = panData;
    GlobalHeaders['x-page-action'] = 'View Exisiting Portfolio';
    const routerData = { pan: pan, tabId: 1 }; // Data to pass
    this.dialogRef.close();

    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], {
      state: { routerData, data: this.pageData },
    });
  }
}

function renameKey(obj: any, oldKey: string, newKey: string): any {
  if (obj.hasOwnProperty(oldKey)) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }
  return obj;
}
