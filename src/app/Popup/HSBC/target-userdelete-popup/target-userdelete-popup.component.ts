import { Component, Inject } from '@angular/core';
import { SucessfullyDeletePopupComponent } from '../sucessfully-delete-popup/sucessfully-delete-popup.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { data } from 'jquery';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';

@Component({
  selector: 'app-target-userdelete-popup', 
  templateUrl: './target-userdelete-popup.component.html',
  styleUrl: './target-userdelete-popup.component.scss'
})
export class TargetUserdeletePopupComponent {

  selectedCustomers:number[] = [];
  customerList: any[] = [];
  deleteCount: number;
  
  constructor(
    public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<TargetUserdeletePopupComponent>, 
    public msmeService: MsmeService, public commonService: CommonService, public commonMethods: CommonMethods) {}

  ngOnInit(){
    console.log("Data received from parent:", this.data);
    this.selectedCustomers = this.data?.customerIds || [];
    this.deleteCount = this.selectedCustomers.length;
    this.customerList = this.data?.customerIds ?? [];
  }

  confirmDelete(): void {
    const payloadData = {
      id: this.customerList
    };
    console.log("customerIds========>",payloadData);

    this.msmeService.deleteMultipleCustomer(payloadData).subscribe(response => {
      console.log("Response =>", response);

      if (response.status == 200) {
        this.dialogRef.close({
          isDelete : true,
          count : this.selectedCustomers.length
        });
        // this.Sucess_popup(this.selectedCustomers.length);
      } else {
        this.commonService.errorSnackBar("Something went wrong");
      }
    });
  }

  Sucess_popup(count:number): void {
    const dialogRef = this.dialog.open(SucessfullyDeletePopupComponent, {
      data:{count},
      panelClass: ['popupMain_design'],
    });
    dialogRef.afterClosed().subscribe(() => { 
      this.dialogRef.close({
        isDelete: true,
      });
    });
  }

  onCancel(): void {
    this.dialogRef.close({ isDelete: false });
  }

}
