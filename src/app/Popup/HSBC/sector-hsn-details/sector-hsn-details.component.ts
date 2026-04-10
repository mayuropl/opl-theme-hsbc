import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { HSNData } from 'src/app/CommoUtils/model/BuyerSellerPeer';
import { HsnCodeDetail } from 'src/app/CommoUtils/model/HsnCodeDetail';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MsmeService } from 'src/app/services/msme.service';
import { EximSearchPopupComponent } from '../exim-search-popup/exim-search-popup.component';
import { PaginationService } from 'src/app/services/pagination.service';

@Component({
  selector: 'app-sector-hsn-details',
  templateUrl: './sector-hsn-details.component.html',
  styleUrl: './sector-hsn-details.component.scss'
})
export class SectorHSNDetailsComponent {

  pan: string | undefined;

  exportHsnPage: PaginationSignal = new PaginationSignal();
  importHsnPage: PaginationSignal = new PaginationSignal();
  gstHsnPage: PaginationSignal = new PaginationSignal();

  exportHsnCodes: HsnCodeDetail[] = [];
  importHsnCodes: HsnCodeDetail[] = [];
  gstHsnCodes: HsnCodeDetail[] = [];

  exportHsnCodePagData: HsnCodeDetail[] = [];
  importHsnCodePagData: HsnCodeDetail[] = [];
  gstHsnCodePagData: HsnCodeDetail[] = [];

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
  constructor(public dialogRef: MatDialogRef<SectorHSNDetailsComponent>, private router: Router,
    private msmeService: MsmeService, private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: EximSearchPopupComponent,  private paginationService: PaginationService) { }

  ngOnInit(): void {
    this.pan = this.data.pan;
    this.getHsnData('EXPORT')
    // this.exportHsnPage.totalSize = this.hsnCodes.length;
    // this.exportHsnPage.totalSize = this.exportHsnCodes.length;
    // this.importHsnPage.totalSize = this.importHsnCodes.length;
    // this.gstHsnPage.totalSize = this.gstHsnCodes.length;
  //   this.exportHsnCodes = [
  //     {
  //       'CODE':"1234",
  //       'DESCRIPTION':"1234SDFSD"
  //     },
  //     {
  //       'CODE':"1234",
  //       'DESCRIPTION':"1234SDFSD"
  //     }
  // ]
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  onTabChange(event: MatTabChangeEvent) {

    const selectedIndex = event.index;

    switch (selectedIndex) {

      case 0:
        (!this.exportHsnCodes || this.exportHsnCodes.length == 0) && this.getHsnData("EXPORT");
        break;
      case 1:
        (!this.importHsnCodes || this.importHsnCodes.length == 0) && this.getHsnData("IMPORT");
        break;
      case 2:
        (!this.gstHsnCodes || this.gstHsnCodes.length == 0) && this.getHsnData("GST");
        break;
      default:
        break;
    }
  }

  getHsnData(currentTab:string) {
    if (!this.pan) {
      return;
    }
    var json = {};
    json["pan"] = this.pan;
    json["hsnType"] = currentTab;

    this.msmeService.getHsnDetail(json).subscribe((response: any) => {
      if (response.status == 200) {
        if(currentTab == "GST"){
          this.gstHsnCodes = response.listData;
          // this.gstHsnPage.totalSize = response?.data;
          this.gstHsnPage.totalSize = this.gstHsnCodes?.length;
          this.updateGstPaginatedData();
        } else if (currentTab == "EXPORT"){
          this.exportHsnCodes = response?.data?.exportHsnData;
          this.exportHsnPage.totalSize = this.exportHsnCodes?.length;
          this.updateExportPaginatedData();

        } else {
          this.importHsnCodes = response?.data?.importHsnData;
          this.importHsnPage.totalSize = this.importHsnCodes?.length;
          this.updateImportPaginatedData();
        }

      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  updateExportPaginatedData(): void {
    this.exportHsnCodePagData = this.paginationService.paginate(this.exportHsnCodes, this.exportHsnPage?.pageSize(), this.exportHsnPage?.page());
  }

  updateImportPaginatedData(): void {
    this.importHsnCodePagData = this.paginationService.paginate(this.importHsnCodes, this.importHsnPage?.pageSize(), this.importHsnPage?.page());
  }

  updateGstPaginatedData(): void {
    this.gstHsnCodePagData = this.paginationService.paginate(this.gstHsnCodes, this.gstHsnPage?.pageSize(), this.gstHsnPage?.page());
  }

}
