import { Component, Inject, OnInit } from '@angular/core';
import { BureauReportRefreshPopupComponent } from '../bureau-report-refresh-popup/bureau-report-refresh-popup.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { FormControl,Validators } from '@angular/forms';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, filter, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-userid-popup',
  templateUrl: './userid-popup.component.html',
  styleUrl: './userid-popup.component.scss'
})
export class UseridPopupComponent implements OnInit {

  rmIdController = new FormControl('');
  rmNameController = new FormControl('');
  remarksController = new FormControl('', [
    Validators.required,
    Validators.maxLength(5000),
    this.remarksValidator.bind(this)
  ]);
  
  optionsRmIds: string[] = [];
  optionsNames: string[] = [];

  rmRoleId:number = 30;
  employeeCode: string;
  userName:string = 'NA';
  userDetailsLis:any = [];

  isAssign:boolean = false;

  filteredRmIdOptions: Observable<string[]>;
  filteredRmNameOptions: Observable<string[]>;
  isModelProcessing: boolean = false;  // Flag to prevent recursion


  constructor(public dialogRef: MatDialogRef<BureauReportRefreshPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private msmeService: MsmeService, private commonService: CommonService){
  }

  ngOnInit(): void {

    this.getUserDetailsByRoleId();
    // this.onFormValueChanges();
  }

  onRmIdValueChanges(){
    this.filteredRmIdOptions = this.rmIdController.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', 1)),
    );
  };

  onRmNameValueChanges(){
    this.filteredRmNameOptions = this.rmNameController.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', 2)),
    );
  }

  private remarksValidator(control: FormControl) {
    if (!control.value) {
      return { required: true };
    }
  
    const value = control.value.trim();
  
    // only spaces
    if (!value) {
      return { invalidRemarks: true };
    }
  
    // must contain at least one alphabet
    if (!/[A-Za-z]/.test(value)) {
      return { invalidRemarks: true };
    }
  
    return null;
  }

  // onKeyPress() {
  //   this.filteredRmNameOptions = fromEvent(this.rmNameController.nativeElement, 'keypress').pipe(
  //     debounceTime(300), // Optional debounce for performance
  //     map((event: KeyboardEvent) => (event.target as HTMLInputElement).value), // Extract value from input
  //     startWith(''), // Emit initial empty value
  //     switchMap(value => this._filter(value || '', 2)), // Call filter function to get options
  //   );
  // }

  private _filter(value: string, type): string[] {
    if(type == 1){
      return this.optionsRmIds.filter(item => item.toLowerCase().includes(value.toLowerCase()));
    }
    else{
      return this.optionsNames.filter(item => item.toLowerCase().includes(value.toLowerCase()));
    }
  }

  getUserDetailsByRoleId(){
    this.msmeService.getUserDetailsByRoleId(this.rmRoleId).subscribe((response: any) => {
      if (response.status == 200) {
        this.userDetailsLis = response.data;
        // console.log('this.userDetailsLis: ', this.userDetailsLis);

        this.optionsRmIds = this.userDetailsLis.filter(item => item.employeeCode != null).map(item => item.employeeCode);
        if(!this.commonService.isObjectIsEmpty(this.optionsRmIds)){
          this.onRmIdValueChanges();
        }

        this.optionsNames = this.userDetailsLis.filter(item => item.userName != null).map(item => item.userName);

        if(!this.commonService.isObjectIsEmpty(this.optionsNames)){
          this.onRmNameValueChanges();
        }
      }
      else {
        console.log(response.message);
        this.commonService.errorSnackBar(response.message)
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    })
  }

  onRmIdChange(value:string){
    if(this.isModelProcessing) return;
    this.isModelProcessing = true;
    const userDetails = this.userDetailsLis.find((user:any) => user.employeeCode == value);
    // console.log('userDetails:::::::> ', userDetails);
    this.rmNameController.patchValue(userDetails?.userName?? 'NA');
    // this.userName = userDetails?.userName?? 'NA';
    this.isModelProcessing = false;
  }


  onRmNameChange(value:string){
    if(this.isModelProcessing) return;
    this.isModelProcessing = true;
    const userDetails = this.userDetailsLis.find((user:any) => user.userName == value);
    this.rmIdController.patchValue(userDetails?.employeeCode?? 'NA');
    this.isModelProcessing = false;
  }


  onAssignRm(): void {
    if(!this.rmIdController.value || !this.rmNameController.value){
      this.commonService.warningSnackBar("Please select RM details");
      return;
    }

    const remarksValue = this.remarksController.value?.trim();
    this.remarksController.setValue(remarksValue);
    
    if (this.remarksController.invalid) {
      this.commonService.warningSnackBar("This field can’t contain only numbers or special characters. Please add text.");
      return;
    }

    const userDetails:any = this.userDetailsLis.find((user:any) => user.employeeCode == this.rmIdController.value);
    if(this.commonService.isObjectNullOrEmpty(userDetails)) {
      this.commonService.warningSnackBar("Please select valid Rm Details");
      return;
    }

    const selectedRm = {
      isAssign: true,
      userId: this.rmIdController.value,
      userName: this.rmNameController.value,
      assignmentRemark: remarksValue
    }
    this.dialogRef.close(selectedRm);
  }


}
