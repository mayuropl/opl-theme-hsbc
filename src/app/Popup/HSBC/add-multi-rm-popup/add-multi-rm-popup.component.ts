import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { BureauReportRefreshPopupComponent } from '../bureau-report-refresh-popup/bureau-report-refresh-popup.component';
import { map, startWith } from 'rxjs/operators';
import { data } from 'jquery';
import { MsmeService } from 'src/app/services/msme.service';
import { error } from 'console';

@Component({
  selector: 'app-add-multi-rm-popup', 
  templateUrl: './add-multi-rm-popup.component.html',
  styleUrl: './add-multi-rm-popup.component.scss'
})
export class AddMultiRmPopupComponent implements OnInit{
rmForm!: FormGroup;
maxUsers = 20;
pan: String = '';

  rmIdController = new FormControl('');
  rmNameController = new FormControl('');

  optionsRmIds: string[] = [];
  optionsNames: string[] = [];
  userDetailsLis:any = [];
  rmRoleId:number = 30;

  filteredRmIdOptions: Observable<string[]>;
  filteredRmNameOptions: Observable<string[]>;
  isModelProcessing: boolean = false;
  isShareDisabled: boolean = true;
  customer: any;
  hierarchyFlags: boolean[] = [];

constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder,  private commonService: CommonService, public dialogRef: MatDialogRef<BureauReportRefreshPopupComponent>, private msmeService: MsmeService){}

ngOnInit(): void {
  this.customer = this.data.customer;  
  this.rmForm = this.fb.group({
    rmList: this.fb.array([this.createRM()])
  });

  this.isShareDisabled = true;

  this.getUserDetailsByRoleId();

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

get rmList(): FormArray{
  return this.rmForm.get('rmList') as FormArray;
}

createRM(): FormGroup {
  return this.fb.group({
    rmId: ['', Validators.required],
    rmName: ['', Validators.required],
    // isHierarchy: [false]
  });
}

addRM(): void {
  if (this.rmList.length < this.maxUsers) {
    this.rmList.push(this.createRM());
  } else {
    alert(`You can only add up to ${this.maxUsers} users.`);
  }
}

removeRM(index: number): void {
  if (this.rmList.length > 1) {
    this.rmList.removeAt(index);
    this.hierarchyFlags.splice(index, 1); // remove corresponding hierarchy flag
    this.updateShareButtonState();
  }
}

submit(): void {
  // Check if any RM detail is missing
  const rmListValue = this.rmForm.value.rmList;
  const isIncomplete = rmListValue.some((rm: any) => !rm.rmId || !rm.rmName || rm.rmId === 'NA' || rm.rmName === 'NA');

  if (this.rmForm.invalid || isIncomplete) {
    this.commonService.warningSnackBar("Please select valid RM details");
    return;
  }

  const sharedToRmList = rmListValue;

  // Close popup and send data back to parent
  this.dialogRef.close({
    sharedToRmList
  });
}

// onRmIdChange(index: number): void {
//   if (this.isModelProcessing) return;
//   this.isModelProcessing = true;

//   const rmGroup = this.rmList.at(index);
//   const rawValue = rmGroup.get('rmId')?.value || '';

//   // Allow only numbers & max 8 digits
//   const rmId = rawValue.toString().replace(/\D/g, '').slice(0, 8);
//   rmGroup.get('rmId')?.setValue(rmId, { emitEvent: false });

//   // Always filter dropdown (safe)
//   if (rmId) {
//     this.optionsRmIds = this._filter(rmId, 1);
//   } else {
//     this.optionsRmIds = this.userDetailsLis.map(x => x.employeeCode);
//     rmGroup.get('rmName')?.setValue('');
//     this.isModelProcessing = false;
//     return;
//   }

//   // EXACT duplicate check ONLY (no prefix logic)
//   const duplicate = this.rmList.controls
//     .filter((_, i) => i !== index)
//     .some(ctrl => ctrl.get('rmId')?.value === rmId);

//   if (duplicate) {
//     this.commonService.warningSnackBar("This RM ID is already selected!");
//     rmGroup.get('rmId')?.setValue('', { emitEvent: false });
//     rmGroup.get('rmName')?.setValue('');
//     this.isModelProcessing = false;
//     return;
//   }

//   // Auto-fill only if it exists in master list
//   const userDetails = this.userDetailsLis.find(
//     u => u.employeeCode === rmId
//   );

//   if (userDetails) {
//     rmGroup.get('rmName')?.patchValue(userDetails.userName);
//     this.validateHierarchy(rmId, userDetails.userName, index);
//   } else {
//     rmGroup.get('rmName')?.patchValue('');
//   }

//   this.isModelProcessing = false;
// }
onRmIdChange(index: number): void {
  const rmGroup = this.rmList.at(index);
  const raw = rmGroup.get('rmId')?.value || '';

  const rmId = raw.toString().replace(/\D/g, '').slice(0, 8);
  rmGroup.get('rmId')?.setValue(rmId, { emitEvent: false });

  if (!rmId) {
    this.optionsRmIds = this.userDetailsLis.map(x => x.employeeCode);
    rmGroup.get('rmName')?.setValue('');
    return;
  }

  // ✅ ONLY filter, NEVER validate
  this.optionsRmIds = this._filter(rmId, 1);
}

onRmNameChange(index: number): void {
  if (this.isModelProcessing) return;
  this.isModelProcessing = true;

  const rmGroup = this.rmList.at(index);
  const rmName = rmGroup.get('rmName')?.value;

  const duplicate = this.rmList.controls
  .filter((c, i) => i !== index)
  .some(ctrl => ctrl.get('rmName')?.value === rmName);

if (duplicate) {
  this.commonService.warningSnackBar("This RM Name is already selected!");
  rmGroup.get('rmName')?.setValue('');
  rmGroup.get('rmId')?.setValue('');
  this.isModelProcessing = false;
  return;
}

  //When user clears input → show full list
  if (!rmName || rmName.trim() === '') {
    this.optionsNames = this.userDetailsLis.map(x => x.userName);
    this.isModelProcessing = false;
    return;
  }

  // Filter when typing
  // this.optionsNames = this._filter(rmName, 2);
  this.optionsNames = this._filter(rmName, 2).filter(name =>
    !this.rmList.controls.some(ctrl => ctrl.get('rmName')?.value === name)
  );
  
  const allNames = this.rmList.controls.map(ctrl => ctrl.get('rmName')?.value);
  const duplicateCount = allNames.filter(name => name === rmName).length;
  if (duplicateCount > 1) {
    this.commonService.warningSnackBar("This RM Name is already entered!");
    rmGroup.get('rmName')?.setValue('');
    rmGroup.get('rmId')?.setValue('');
    this.isModelProcessing = false;
    return;
  }

  const userDetails = this.userDetailsLis.find(u => u.userName === rmName);
  if (userDetails) {
    rmGroup.get('rmId')?.patchValue(userDetails.employeeCode);
  } else {
    rmGroup.get('rmId')?.patchValue('');
  }

  this.isModelProcessing = false;
}

onRmIdSelected(event: any, index: number): void {
  // event.option.value contains the selected RM ID
  const selectedId = event?.option?.value;
  if (!selectedId) return;

  const rmGroup = this.rmList.at(index);

  rmGroup.get('rmId')?.setValue(selectedId, { emitEvent: false });

  const isDuplicate = this.rmList.controls
  .filter((_, i) => i !== index)
  .some(ctrl => ctrl.get('rmId')?.value === selectedId);

if (isDuplicate) {
  this.commonService.warningSnackBar("This RM is already selected!");
  rmGroup.get('rmId')?.setValue('', { emitEvent: false });
  rmGroup.get('rmName')?.setValue('');
  return;
}

  // find user and patch name
  const userDetails = this.userDetailsLis.find(u => u.employeeCode === selectedId);
  if (userDetails) {
    rmGroup.get('rmName')?.patchValue(userDetails.userName);
    this.validateHierarchy(selectedId, userDetails.userName, index);
  } else {
    rmGroup.get('rmName')?.patchValue('');
  }

  // restore full dropdown list after selection
  this.optionsRmIds = this.userDetailsLis.map(x => x.employeeCode);
}

onRmIdBlur(index: number): void {
  const rmGroup = this.rmList.at(index);
  const rmId = rmGroup.get('rmId')?.value;

  if (!rmId) return;

  const isDuplicate = this.rmList.controls
    .filter((_, i) => i !== index)
    .some(ctrl => ctrl.get('rmId')?.value === rmId);

  if (isDuplicate) {
    this.commonService.warningSnackBar("This RM is already selected!");
    rmGroup.get('rmId')?.setValue('', { emitEvent: false });
    rmGroup.get('rmName')?.setValue('');
    return;
  }

  const userDetails = this.userDetailsLis.find(
    u => u.employeeCode === rmId
  );

  if (userDetails) {
    rmGroup.get('rmName')?.patchValue(userDetails.userName);
    this.validateHierarchy(rmId, userDetails.userName, index);
  } else {
    rmGroup.get('rmName')?.patchValue('');
  }
}


onRmNameSelected(event: any, index: number): void {
  const selectedName = event?.option?.value;
  if (!selectedName) return;

  const rmGroup = this.rmList.at(index);
  const isDuplicate = this.rmList.controls
  .filter((_, i) => i !== index)
  .some(ctrl => ctrl.get('rmName')?.value === selectedName);

if (isDuplicate) {
  this.commonService.warningSnackBar("This RM is already selected!");
  rmGroup.get('rmId')?.setValue('');
  rmGroup.get('rmName')?.setValue('');
  return;
}
  rmGroup.get('rmName')?.setValue(selectedName);

  const userDetails = this.userDetailsLis.find(u => u.userName === selectedName);
  if (userDetails) {
    rmGroup.get('rmId')?.patchValue(userDetails.employeeCode);
    this.validateHierarchy(userDetails.employeeCode, selectedName, index);
  } else {
    rmGroup.get('rmId')?.patchValue('');
  }

  // restore full dropdown list after selection
  this.optionsNames = this.userDetailsLis.map(x => x.userName);
}

// onRmIdChange(value:string){
//   if(this.isModelProcessing) return;
//   this.isModelProcessing = true;
//   const userDetails = this.userDetailsLis.find((user:any) => user.employeeCode == value);
//   // console.log('userDetails:::::::> ', userDetails);
//   this.rmNameController.patchValue(userDetails?.userName?? 'NA');
//   // this.userName = userDetails?.userName?? 'NA';
//   this.isModelProcessing = false;
// }


// onRmNameChange(value:string){
//   if(this.isModelProcessing) return;
//   this.isModelProcessing = true;
//   const userDetails = this.userDetailsLis.find((user:any) => user.userName == value);
//   this.rmIdController.patchValue(userDetails?.employeeCode?? 'NA');
//   this.isModelProcessing = false;
// }

validateHierarchy(rmId: string, rmName: string, index: number) {
  const request = {
    pan: this.customer?.panNo,
    rmId: rmId,
    rmName: rmName
  };

  console.log(request)
  this.msmeService.manageHierarchy(request).subscribe((res: any) => {
    if (res.status !== 200) {
      // Not Allowed (Hierarchy block)
      this.commonService.warningSnackBar(res.message);

      // this.rmList.at(index).get('isHierarchy')?.setValue(true);
      this.hierarchyFlags[index] = true; 

      // this.rmList.at(index).get('rmId')?.setValue('');
      // this.rmList.at(index).get('rmName')?.setValue('');

      this.isShareDisabled = true;          
    } else {
      // this.rmList.at(index).get('isHierarchy')?.setValue(false);
      this.hierarchyFlags[index] = false; // allowed

      this.isShareDisabled = false;         
    }

    this.updateShareButtonState();  // recalculates share enable/disable
  }, error => {
    this.commonService.errorSnackBar("Something went wrong");
  });
}

updateShareButtonState() {
  // const anyHierarchy = this.rmList.controls
  //   .some(ctrl => ctrl.get('isHierarchy')?.value === true);

  // this.isShareDisabled = anyHierarchy;

  this.isShareDisabled = this.hierarchyFlags.some(flag => flag === true);

}

}
