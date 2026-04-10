import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
// import { CommonService } from 'src/app/commonUtils/common-services/common.service';
import { HSBCGSTOTPVerifyComponent } from '../hsbcgstotpverify/hsbcgstotpverify.component';
// import { Constants } from 'src/app/commonUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
// import { LoaderService } from 'src/app/commonUtils/common-services/LoaderService';

@Component({
  selector: 'app-hsbcprovide-seles',
  templateUrl: './hsbcprovide-seles.component.html',
  styleUrl: './hsbcprovide-seles.component.scss'
})
export class HSBCProvideSelesComponent {
  turnover: any;
  qtrTurnover: any;
  turnoverWithoutComa: any;
  mstId: any;
  orignalValue: any;
  pageData:any;

  constructor(public dialogRef: MatDialogRef<HSBCProvideSelesComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private msmeService: MsmeService, private router: Router,
    private commonService: CommonService, private loaderService: LoaderService) {
      this.pageData = data[0]
      
  }

  ngOnInit(): void {
    this.mstId = this.commonService.getStorage(Constants.httpAndCookies.ANALYSIS_MASTER_ID, true);
  }

  closePopup(data?): void {
    this.dialogRef.close(data ? data : 0);
  }
  rmprovideSeles() {
    this.closePopup();
    this.router.navigate(['/hsbc/' + Constants.ROUTE_URL.VIEW_GST_ANALYSIS],{state: { data: this.pageData }});
  }

  onInput(event: Event, formCon: any, length: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove all non-numeric characters
    value = value.replace(/[^0-9]/g, '');

    // Remove leading zeros
    value = value.replace(/^0+/, '');

    // Ensure the value does not exceed the specified length
    if (value.length > length) {
      value = value.substring(0, length);
    }

    // Format the value according to Indian currency
    value = this.formatIndianCurrency(value);

    // Update the input value
    this.turnover = value;
  }

  changeTurnover(value: any) {
    this.turnoverWithoutComa = value;
    this.orignalValue = value;
    this.turnover = this.formatIndianCurrency(value)
    this.turnoverWithoutComa = this.turnover.replace(/,/g, '');
    this.qtrTurnover = this.turnoverWithoutComa / 4;
    this.qtrTurnover = this.formatIndianCurrency(this.qtrTurnover)
  }

  formatIndianCurrency(value: string): string {
    // Ensure value is a string
    value = value ? value.toString() : '';

    // Remove any non-numeric characters except for the decimal point
    value = value.replace(/[^0-9.]/g, '');

    // Parse the string to a number and round it
    const numValue = Math.round(parseFloat(value));

    if (isNaN(numValue)) {
      return '0';
    }

    // Convert the number back to a string
    let integerPart = numValue.toString();

    // Format the integer part according to the Indian numbering system
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);

    if (otherNumbers !== '') {
      integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    } else {
      integerPart = lastThree;
    }

    return integerPart;
  }
  removeCommas(value: string): string {
    return value.replace(/,/g, '');
  }

  // Function to check if a string consists only of numeric characters
  isNumeric(value: string): boolean {
    // Regular expression to match numeric digits (0-9)
    value = value.replace(/,/g, '');
    const numberPattern = /^[0-9]+$/;
    return numberPattern.test(value);
  }

  submit() {

    // Regular expression to match only numbers
    const numberPattern = /^[0-9]+$/;

    if (this.commonService.isObjectNullOrEmpty(this.mstId)
      || this.commonService.isObjectNullOrEmpty(this.turnoverWithoutComa)) {
      return this.commonService.errorSnackBar('Please fill details')
    }
    if (this.orignalValue && !numberPattern.test(this.orignalValue.replace(/,/g, ''))) {
      return this.commonService.errorSnackBar('only numeric characters are allow')
    }
    let formData = {}
    formData['refId'] = this.mstId;
    formData['projectedSale'] = this.turnoverWithoutComa;
    console.log(formData);
    this.loaderService.show();
    this.msmeService.gstAnalysisSubmit(formData).subscribe((response: any) => {

      let dataObj = null;
      if (response != null && response?.status == 200) {
        this.loaderService.show();
        dataObj = response;
        // setTimeout( () => {
        this.dialogRef.close(dataObj);
        this.loaderService.show();
        // this.router.navigate([Constants.ROUTE_URL.PROVIDE_DATA_SELECTION])
        // }, 3000 );
      } else {
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    })

  }


}
