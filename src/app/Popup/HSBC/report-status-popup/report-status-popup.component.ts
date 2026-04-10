import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { data } from 'jquery';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { SharedService } from 'src/app/services/SharedService';
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { map } from 'rxjs/operators';
import { AesGcmEncryptionService } from 'src/app/services/aes-gcm-encryption.service';

@Component({
  selector: 'app-report-status-popup',
  templateUrl: './report-status-popup.component.html',
  styleUrl: './report-status-popup.component.scss'
})
export class ReportStatusPopupComponent {

  startIndex=0;
  currentPage=1;
  totalSize=10;
  pageSize=10
  PageSelectNumber: any[] = [10, 20, 50, 100]
  newIncorporationHistory:any = undefined;
  private subscription: Subscription;
  reportType:any;

  constructor(public dialogRef: MatDialogRef<ReportStatusPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private sharedService : SharedService,
  private excelDownload : ExcelDownloadService, private msmeService: MsmeService, public commonService: CommonService, public http: HttpClient){

    this.subscription = this.sharedService.getNewIncorporationStatusClickEvent().subscribe((message)=>{
      console.log("Message recieved from export");
      this.fetchDataFromWebSocket(message);
    });

    this.subscription = this.sharedService.getHsbcStatusClickEvent().subscribe((message)=>{
      console.log("Message recieved from hsbc status");
      this.dowbloadByRefId(message);
    });

    this.subscription = this.sharedService.getHsbcCountryStatusClickEvent().subscribe((message)=>{
      console.log("Message recieved from hsbc country status");
      this.fetchDataFromWebSocket(message);
    });

     this.subscription = this.sharedService.getNewGccReportStatusClickEvent().subscribe((message)=>{
      console.log("Message recieved from hsbc country status");
      this.fetchDataFromWebSocket(message);
    });

  }

  dowbloadByRefId(responseFromWebSocket){
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    console.log('responseFromWebSocket for new Incorporation: ', responseFromWebSocket);
      this.newIncorporationHistory = responseFromWebSocket?.response;
      console.log("history ==============>",this.newIncorporationHistory);
      // if(responseFromWebSocket?.contentInBytes){
      //   console.log("Calling for exel download...")
      //   this.reportName = responseFromWebSocket?.fileName;
      // }

      const fileName: string = responseFromWebSocket?.fileName;
      console.log("fileName========>",fileName)
      const bucketRef = responseFromWebSocket?.bucketReferenceId;
      this.downloadTemplate(bucketRef, fileName)
  }

  ngOnInit() {
    this.reportType = this.data?.reportType;
    console.log("reportType=>",this.reportType);
    if(this.reportType== 'NEW_GCC_STATUS'){
        this.fetchNewGccExcelDownloadStatus();
    }else{
        this.fetchExcelDownloadStatus();
    }

  }

  ngOnDestroy() {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }


reportName ="Incorporation Report"
  fetchDataFromWebSocket(responseFromWebSocket?){
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    console.log('responseFromWebSocket for new Incorporation: ', responseFromWebSocket);
      this.newIncorporationHistory = responseFromWebSocket?.response;
      console.log("history ==============>",this.newIncorporationHistory);
      // if(responseFromWebSocket?.contentInBytes){
      //   console.log("Calling for exel download...")
      //   this.reportName = responseFromWebSocket?.fileName;
      // }

      const fileName: string = responseFromWebSocket?.fileName;
      console.log("fileName========>",fileName)
  const fileContent = responseFromWebSocket?.contentInBytes;
  if (fileContent && fileName) {
    if (this.reportType == "HSBC_BANKING_STATUS" || this.reportType == "HSBC_COUNTRY_STATUS") {
      console.log("Detected ZIP file download...");
      this.excelDownload.downloadZip(fileContent, fileName);
    } else if (this.reportType == 'NEW_INCORPORATION_STATUS' || this.reportType == 'NEW_GCC_STATUS') {
      console.log("Detected Excel file download...");
      this.excelDownload.downloadExcel(fileContent, fileName);
    } else {
      console.warn("Unknown file format, fallback to Excel download.");
      this.excelDownload.downloadExcel(fileContent, fileName);
    }
  }
      //   this.excelDownload.downloadZip(responseFromWebSocket?.contentInBytes, responseFromWebSocket?.fileName);
      // this.excelDownload.downloadExcel(responseFromWebSocket?.contentInBytes, responseFromWebSocket?.fileName);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  changePageSize(pageSize: number, page: number) {
    this.pageSize = pageSize;
    this.currentPage = page;
    if(this.reportType=='NEW_GCC_STATUS'){
      this.fetchNewGccExcelDownloadStatus();
    }else{
      this.fetchExcelDownloadStatus();
    }

  }

  inCorporationOnPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.startIndex = (pageNumber - 1) * this.pageSize;
    if(this.reportType=='NEW_GCC_STATUS'){
      this.fetchNewGccExcelDownloadStatus();
    }else{
      this.fetchExcelDownloadStatus();
    }
  }

    getExcelDownloadStatus(){
      // const req = {
      //   "pageNumber" : this.currentPage-1,
      //   "pageSize" : this.pageSize
      // }
      console.log("start exceldownload method========>")
      this.msmeService.getHsbcStatusDownloadReport().subscribe(res=>{
        if(res.status == 200){
          this.fetchExcelDownloadStatus();
        }
        console.log("calling from hsbc status =====>")
      })
    }

    getExcelDownloadForCountryStatus(){
      // const req = {
      //   "pageNumber" : this.currentPage-1,
      //   "pageSize" : this.pageSize
      // }
      this.msmeService.getHsbcStatusDownloadReportForCountry().subscribe(res=>{
        if(res.status == 200){
          this.fetchExcelDownloadStatus();
        }
        console.log("calling from hsbc country status =====>")
      })
    }

  fetchExcelDownloadStatus(){
    const req = {
      "pageNumber": this.currentPage-1,
      "pageSize": this.pageSize,
      "reportType":this.reportType
    }
    this.msmeService.getNewIncorporationExcel(req, true).subscribe((response: any) => {
      console.log('response: ', response);
      if (response?.status == 200) {
        this.newIncorporationHistory = response?.listData;
        this.totalSize = response?.data
      }
      console.log("========>from new Incorporation")
    });

  }

    fetchNewGccExcelDownloadStatus(){
    const req = {
      "pageNumber": this.currentPage-1,
      "pageSize": this.pageSize,
      "reportType":this.reportType
    }
    this.msmeService.getNewGccExcelStatus(req, true).subscribe((response: any) => {
      console.log('response: ', response);
      if (response?.status == 200) {
        this.newIncorporationHistory = response?.listData;
        this.totalSize = response?.data
      }
      console.log("========>from new Incorporation")
    });

  }


  downloadExcelReport() {
    const request = this.data;
    console.log("data=======>",this.data);

    if (this.data.reportType == "HSBC_BANKING_STATUS") {
            this.getExcelDownloadStatus();
            // console.log("docRefrenceId=======>",this.data.docReferenceId, "reportName=====>",this.data.reportName);
            // this.downloadTemplate(this.data.docReferenceId, this.data.reportName);
    } else if(this.data.reportType == "HSBC_COUNTRY_STATUS"){
      this.getExcelDownloadForCountryStatus();
    }else if(this.data.reportType == "NEW_INCORPORATION_STATUS"){
      this.msmeService.downloadNewIncorporationExcel(request, true).subscribe(
        (response: any) => {
          console.log('response: ', response);
          if (response.status == 200) {
            this.fetchExcelDownloadStatus();
          } else {
            this.commonService.errorSnackBar(response.message || 'Failed to download incorporation data');
          }
        },
        error => {
          this.commonService.errorSnackBar('Something went wrong while downloading incorporation data');
        }
      );
    }
    else if(this.data.reportType == "NEW_GCC_STATUS"){
      this.msmeService.getNewGccExcel(request, true).subscribe(
        (response: any) => {
          console.log('response: ', response);
          if (response.status == 200) {
            this.fetchNewGccExcelDownloadStatus();
          } else {
            this.commonService.errorSnackBar(response.message || 'Failed to download New GCC data');
          }
        },
        error => {
          this.commonService.errorSnackBar('Something went wrong while downloading New Gcc data');
        }
      );
    }
  }


  downloadExportReport(docReferenceId,reportName){
    console.log(this.reportType)
    if(this.reportType == 'NEW_GCC_STATUS'){
      this.downloadByBucketRef(docReferenceId,reportName);
    }else{
      this.downloadTemplate(docReferenceId,reportName);
    }

  }

  downloadTemplate(docReferenceId,reportName) {
    let extension ='txt'; 
    if(this.reportType == "HSBC_BANKING_STATUS" || this.reportType == "HSBC_COUNTRY_STATUS"){
      let extension ='zip'; 
    }
    this.downloadFileFromBucket(docReferenceId,extension).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      if(this.reportType == "HSBC_BANKING_STATUS" || this.reportType == "HSBC_COUNTRY_STATUS"){
        a.download = reportName+'.zip';
      }else if(this.reportType=="NEW_INCORPORATION_STATUS"){
          a.download = reportName+'.xlsx';
      }else{
      a.download = reportName+'.txt';  // Update with the actual file name and extension
      }
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

encryptedObject(data) {
  return { data: AesGcmEncryptionService.getEncPayload(data) };
}
                
downloadFileFromBucket(fileName: string, extension: string): Observable<Blob> {
  let createMasterJson: any = {};
  createMasterJson["fileName"] = fileName;
  createMasterJson["extension"] = extension;
  return this.http.post(RestUrl.GET_FILE_FROM_BUCKET, this.encryptedObject(createMasterJson), { responseType: 'blob' }).pipe(
  map((res: Blob) => {
    return new Blob([res], { type: res.type });
  })
  );
}

    downloadZip(byteData: any, fileName: string) {
      console.log('Received data:', byteData);
      // const byteArray = new Uint8Array(byteData);
      // console.log('Byte array length:', byteArray.length);

      const byteArray = this.base64ToUint8Array(byteData);
      const blob = new Blob([byteArray], { type: 'application/zip' });


      // const blob = new Blob([byteArray], { type: 'application/zip' });
      // const blob = new Blob(byteData);
      // const blob = new Blob(byteData, { type: 'application/zip' });
      // window.URL.createObjectURL(blob);
      //  const blob = this.base64toBlob(byteData, 'application/zip');
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      // link.href = window.URL.createObjectURL(byteData);
      link.download = fileName;  // Set your desired file name
      link.click();
      window.URL.revokeObjectURL(link.href); // Clean up the object URL
    }

    base64ToUint8Array(base64: string): Uint8Array {
      const binaryString = window.atob(base64); // Decode Base64
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    downloadByBucketRef(bucketRef,name) {
    if(this.commonService.isObjectNullOrEmpty(bucketRef)){
      this.commonService.warningSnackBar("File Not Found");
      return;
    }
    var formData = new FormData();
    formData.append('bucketRefId', bucketRef)
    formData.append('fileType','xlsx')
    console.info('inside file download');
     this.msmeService.getByBucketRef(formData).subscribe((blob: Blob) => {
       if (blob.size > 0) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = name;
        a.click();
        URL.revokeObjectURL(objectUrl);
      } else {
        console.error('Received empty blob');
        this.commonService.warningSnackBar('File is empty or could not be downloaded');
      }
    },
    (error) => {
      console.error('Failed to download file', error);
      this.commonService.warningSnackBar('Failed to download file');
    }
  );
}
}
