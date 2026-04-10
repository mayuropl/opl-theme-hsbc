import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-customer-processing-overview',
  templateUrl: './customer-processing-overview.component.html',
  styleUrl: './customer-processing-overview.component.scss'
})
export class CustomerProcessingOverviewComponent implements OnInit {
  modelDate = new Date();
  maxDate: Date;
  commercialSummaryData : any;
  reportMonth : any;
   pageData: any;

  protected readonly consValue = Constants;
  ngOnInit(): void {
    this.maxDate = new Date();
    this.pageData = history.state.data;
    if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD,this.consValue.pageMaster.COMMERCIAL_CIBIL,this.consValue.pageMaster.COMMERCIAL_SUMMARY)
    }
    this.getCommercialSummaryData(0);
  }

  constructor(private msmeService: MsmeService, private commonService: CommonService){
    
  }

  onOpenCalendar(container: any): void {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('month');
  }

  getCommercialSummaryData(_index: number): void {
    // Optional: load data for selected month when needed
    if (!this.modelDate) return;

    const reportMonth = this.formatToYYYYMM(this.modelDate);
    this.reportMonth = reportMonth;

    const payload = {
      reportMonth: reportMonth
    };

    console.log(payload);
    this.msmeService.getCommercialSummaryData(payload).subscribe(res=>{
      console.log("res=========",res);
      if(res?.data){
        this.commercialSummaryData = res.data;
      }else{
          this.commonService.warningSnackBar(res?.message);
      }
    })

  }

  downloadSummary(category: string): void {
  const payload = {
    reportMonth: this.reportMonth,
    categoryName: category
  };
  this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
  this.msmeService.downloadExcelCommercialSummary(payload).subscribe(
        (res) => {
          if (res?.contentInBytes) {
            const downloadDate = this.getDownloadDate();
             const fileName =`PR Summary_${category}_${downloadDate}.xlsx`;
            this.downloadExcel(res.contentInBytes, fileName);
          } else {
            this.commonService.warningSnackBar(res?.message);
          }
        },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting Download Excel Commercial Summary');
      }
    );
    
}

  getDownloadDate(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(',', '');
}

    downloadExcel(byteData: string, fileName: string) {
    const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = fileName;

    a.click();

    window.URL.revokeObjectURL(url);

    a.remove();
  }

  base64toBlob(base64Data: string, contentType: string) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  private formatToYYYYMM(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JS month starts from 0
    return Number(`${year}${month.toString().padStart(2, '0')}`);
  }
}
