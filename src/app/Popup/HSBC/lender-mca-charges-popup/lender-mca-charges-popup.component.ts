import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-lender-mca-charges-popup',
  templateUrl: './lender-mca-charges-popup.component.html',
  styleUrl: './lender-mca-charges-popup.component.scss'
})
export class LenderMcaChargesPopupComponent implements OnInit {

  currentSortField: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';

  lenderMcaChargesProxyPag: PaginationSignal = new PaginationSignal();

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

  mcaIndexOfCharges: McaIndexOfCharge[] = [];
  pan: any;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private msmeService: MsmeService,
    private commonService: CommonService ) {
  }

  ngOnInit() {
    this.pan = this.data.pan;
    this.getMcaCharges();
  }
  getMcaCharges() {

      var json = {};
      json["pan"] = this.pan;
      json["pageIndex"] = this.lenderMcaChargesProxyPag.page()-1;
      json["size"] = this.lenderMcaChargesProxyPag.pageSize();

      this.msmeService.getMcaCharge(json).subscribe((response: any) => {
        console.log(response);
        if (response.status == 200) {
          if (!response?.listData || response?.listData.length != 0) {
            this.commonService.successSnackBar(response.message)
          }
          if (!response?.listData || response?.listData.length == 0) {
            this.commonService.warningSnackBar("No Record Found")
          }
          this.mcaIndexOfCharges = response?.listData;
          this.lenderMcaChargesProxyPag.totalSize = response?.data;
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

  toggleSort(column: any,direction:string) {
    // if (this.currentSortField === column) {
    //   this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    // } else {
    //   this.currentSortField = column;
    //   this.sortDirection = 'ASC'; // You can default to 'asc' for new columns
    // }
    // if(this.sortDirection === 'ASC') {
    //   return this.mcaIndexOfCharges.sort((a, b) => 0 - (new Date(a.dateOfModification) > new Date(b.dateOfModification) ? -1 : 1 ));
    // }
    // else if(this.sortDirection === 'DESC') {
    //   return this.mcaIndexOfCharges.sort((a, b) => 0 - (new Date(a.dateOfModification) > new Date(b.dateOfModification) ? 1 : -1));
    // }
    // else{
    //   //  this.mcaIndexOfCharges = this.mcaIndexOfCharges.sort(function (a, b) { return a.dateOfModification - b.dateOfModification});
    // }
      if(this.currentSortField != column){
      this.currentSortField=column;
    }
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
     this.mcaIndexOfCharges.sort((a, b) => {
      const dateA = a.dateOfModification ? new Date(a.dateOfModification) : null;
      const dateB = b.dateOfModification ? new Date(b.dateOfModification) : null;
      if(dateA === null && dateB === null) return 0;
      if(dateA === null) return 1;
      if(dateB === null) return -1;
      return this.sortDirection === 'ASC' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  }

}


interface McaIndexOfCharge {
  id: number;
  cin?: string;
  chargeHolder?: string;
  chargeAmount?: string;
  dateOfCreation?: Date;
  dateOfModification?: Date;
  dateOfSatisfaction?: Date;
  status?: string;
  assetsUnderCharge?: string;
  chargeId?: string;
  address?: string;
}
