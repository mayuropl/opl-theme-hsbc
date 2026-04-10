import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-exim-search-popup',
  templateUrl: './exim-search-popup.component.html',
  styleUrl: './exim-search-popup.component.scss'
})
export class EximSearchPopupComponent {
  companyName;
  companyForm: FormGroup;
  selectedCompanyForm: FormGroup;
  companyNameList: [];
  selectedCompanyName: string;
  eximData: any;
  eximId: any;
  filteredCompanyList: any;
  pan: any;
  resData : any;
  isSearchHidden = false;

  constructor(public dialogRef: MatDialogRef<EximSearchPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EximSearchPopupComponent, private router: Router, private msmeService: MsmeService, private commonService: CommonService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.eximData = this.data
    this.companyForm = this.fb.group({
      companyName: [this.eximData.companyName || '', Validators.required]
    });

    this.selectedCompanyForm = this.fb.group({
      selectednameOfCompany: ['']
    });

    if( this.data?.isSearchHidden ){
      this.isSearchHidden = true;
      this.searchCompany()
    }
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  searchCompany() {
    var json = {};
    console.log(this.data?.eximId);
    json['companyName'] = this.getControlValue('companyName');
    json['eximId'] = this.data?.eximId;
    this.isSearchHidden = true;

    this.msmeService.getCompanyNames(json).subscribe((response: any) => {
      if (response != null && response?.status == 200) {
        this.companyNameList = response.listData;

      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Analysis By ccn failed', error);
    })

  }

  proceed() {
    const selectedCompany = this.selectedCompanyForm && this.selectedCompanyForm.get('selectednameOfCompany')?.value;
    console.log(selectedCompany.id);
    console.log(selectedCompany.ccnId);
    var json ={};
    json['eximId'] = this.data?.eximId;
    json['companyId']= selectedCompany?.id;
    json['ccnId']= selectedCompany?.ccnId;


    this.msmeService.getIECByCOMPANY(json).subscribe((response: any) => {
      if (response != null && response?.status == 200) {
        this.resData = response;
        console.log(response);
        if (!this.commonService.isObjectNullOrEmpty(this.commonService.getStorage("exim_pan", true))) {
          this.pan = this.commonService.getStorage("exim_pan", true);
        }
        const routerData = { eximId: this.data?.eximId, pan: this.pan}; // Data to pass
        this.router.navigate(['/hsbc/rmEXIMAnalysisView'], { state: { routerData } });

          console.log('fetched successful', this.resData?.message);
      } else {
        this.commonService.errorSnackBar(this.resData?.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Company Name Get failed', error);
    })
  }


  getControlValue(controlName: string) {
    return this.companyForm.get(controlName)?.value;
  }

  getControlValueForSelectedCompany(controlName: string) {
    return this.selectedCompanyForm.get(controlName)?.value;
  }
}
