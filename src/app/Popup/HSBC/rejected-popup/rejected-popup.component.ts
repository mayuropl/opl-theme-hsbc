import { Component, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {  EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
@Component({
  selector: 'app-rejected-popup',
  templateUrl: './rejected-popup.component.html',
  styleUrl: './rejected-popup.component.scss'
})
export class RejectedPopupComponent implements OnInit{
  RejectionReason: string = '';
  showFields: boolean; 
  remarks: string = '';
  wordLimitExceeded: boolean = false;
  selectedStatus: string = ''; // Tracks Approve/Reject
  clientStatus: string = 'work_in_progress'; // Tracks Client Meeting/Discussion status
  reasonList: any[] = [];
  selectedReason: string | null = null;

  charactersRemaining: number = 5000;
  @Output() remarksChange = new EventEmitter<{ status: string; remarks: string }>();
  
  constructor(
    public dialogRef: MatDialogRef<RejectedPopupComponent>,public commonService: CommonService, private msmeService: MsmeService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }
  ngOnInit(): void {
    if (this.data?.clientStatus) {
            // default radio selection
      this.clientStatus = 'work_in_progress';

      // load dropdown for default radio
      this.reasonList = this.data.clientStatus[this.clientStatus] || [];

      // reset dropdown selection
      this.selectedReason = null;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
    return;
  }

onClientStatusChange(): void {
  this.reasonList = this.data.clientStatus[this.clientStatus] || [];
  this.selectedReason = null; // reset dropdown
}
  
  updateCharCount(event: KeyboardEvent) {
    const currentLength = this.remarks?.length || 0;
    this.charactersRemaining = 5000 - currentLength;
  }
  
  blockExtraCharacters(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab', 'Enter'
    ];
  
    if ((this.remarks?.length || 0) >= 5000 && !allowedKeys.includes(event.key)) {
      event.preventDefault(); 
    }
  }
  
    rejectCustomerRemarks() {
    if(this.commonService.isObjectNullOrEmptyWithTrim(this.selectedReason)){
      this.commonService.warningSnackBar("Please select Reasons..");
      return;
    }
    if(this.commonService.isObjectNullOrEmptyWithTrim(this.remarks)){
      this.commonService.warningSnackBar("Please enter remarks..");
      return;
    }
    if(this.commonService.isObjectNullOrEmptyWithTrim(this.clientStatus)){
      this.commonService.warningSnackBar("Please select Client Status..");
      return;
    }
      if (this.isInvalidRemarks(this.remarks)) {
        this.commonService.warningSnackBar(
          "Remarks must contain at least one alphabet. Only numbers or special characters are not allowed."
        );
        return;
      }
    const requestData = { status: this.selectedStatus,reasons : this.selectedReason, remarks: this.remarks ,clientStatus : this.clientStatus};
    this.remarksChange.emit(requestData); 
    if(!this.commonService.isObjectIsEmpty(requestData)){
      console.log("REQUEST-STATUS ", requestData);
      this.dialogRef.close(requestData); // Pass remarks to the parent when closing
    }
    }

  isInvalidRemarks(data: any): boolean {
    if (data === null || data === undefined) return true;

    if (typeof data !== 'string') return true;
    const trimmed = data.trim();
    if (trimmed === '') return true;
    if (/^[0-9]+$/.test(trimmed)) return true;
    if (/^[^a-zA-Z0-9]+$/.test(trimmed)) return true;
    if (!/[a-zA-Z]/.test(trimmed)) return true;

    return false;
  }



}

