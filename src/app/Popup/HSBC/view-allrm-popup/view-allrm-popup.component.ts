import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-view-allrm-popup', 
  templateUrl: './view-allrm-popup.component.html',
  styleUrl: './view-allrm-popup.component.scss'
})
export class ViewAllrmPopupComponent {

  rmList: any[] = [];
  panNo: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewAllrmPopupComponent>, private msmeService:MsmeService, private commonService: CommonService
  ) {    
    console.log('Popup data:', data);
    this.rmList = data?.rmList || [];
    this.panNo = data?.panNo || '';
  }

  removeRM(rm: any, index: number, customerPan: string): void {
    const payload = {
      pan: customerPan,
      rmId: rm.rmId
    };

    this.msmeService.removeSharedRm(payload).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.status === 200) {
          this.rmList.splice(index, 1);
          this.commonService.successSnackBar(res.message);
        } else {
          console.warn('Failed to remove RM:', res.message);
          this.commonService.errorSnackBar(res.message);
        }
      },
      error: (err) => console.error('Error removing RM:', err)
    });
  }

  closeDialog(): void {
    this.dialogRef.close(this.rmList); 
  }
}
