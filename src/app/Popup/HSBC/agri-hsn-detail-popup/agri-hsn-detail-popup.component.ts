import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { HsnCodeDetail } from 'src/app/CommoUtils/model/HsnCodeDetail';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { PaginationService } from 'src/app/services/pagination.service';
import { EximSearchPopupComponent } from '../exim-search-popup/exim-search-popup.component';
import { SectorHSNDetailsComponent } from '../sector-hsn-details/sector-hsn-details.component';
import { MsmeService } from 'src/app/services/msme.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-agri-hsn-detail-popup',
  templateUrl: './agri-hsn-detail-popup.component.html',
  styleUrl: './agri-hsn-detail-popup.component.scss'
})
export class AgriHsnDetailPopupComponent {
  agriHsnPage: PaginationSignal = new PaginationSignal();
  pan: string | undefined;
  gstHsnCodes: HsnCodeDetail[] = [];
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
  }

getHsnData(currentTab:string) {
    if (!this.pan) {
      return;
    }
    var json = {};
    json["pan"] = this.pan;


    this.msmeService.getAgriEximHsnDetail(json).subscribe((response: any) => {
      if (response.status == 200) {
          this.gstHsnCodes = response.listData;
          this.agriHsnPage.totalSize = this.gstHsnCodes?.length;
          this.updateAgriHsnPaginatedData();
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

   updateAgriHsnPaginatedData(): void {
    this.gstHsnCodePagData = this.paginationService.paginate(this.gstHsnCodes, this.agriHsnPage?.pageSize(), this.agriHsnPage?.page());
  }

  get totalValue(): number {
    return (this.gstHsnCodes || []).reduce((sum, item) => sum + (item.value || 0), 0);
  }

}
