import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-spread-order-popup',
  templateUrl: './spread-order-popup.component.html',
  styleUrl: './spread-order-popup.component.scss'
})
export class SpreadOrderPopupComponent {

  dataJson:any = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data, private msmeService: MsmeService, private commonService: CommonService) {
    this.dataJson = this.data;
    console.log('this.dataJson: ', this.dataJson);
  }

  processForSpreadOrder() {
    const reqJson = {
      pan: this.dataJson.pan,
      query: this.dataJson.cin,
      emails: [this.dataJson.email],
    };
    this.msmeService.getSpreadOrderStatus(reqJson).subscribe((res: any) => {
      if (res.status == 200) {
        this.commonService.successSnackBar(res.message);
      }
      else {
        this.commonService.warningSnackBar(res.message);
      }
    });
  }
}
