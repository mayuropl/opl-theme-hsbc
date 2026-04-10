import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { Constants } from 'src/app/CommoUtils/constants';
import { GlobalHeaders } from 'src/app/CommoUtils/global-headers';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import alasql from 'alasql';
import { HttpClient } from '@angular/common/http';
import { SharedService } from 'src/app/services/SharedService';

@Component({
  selector: 'app-upload-customer-popup',
  templateUrl: './upload-customer-popup.component.html',
  styleUrl: './upload-customer-popup.component.scss'
})
export class UploadCustomerPopupComponent implements OnInit {
  filedata:any;
  files: any[] = [];
  constants:any = [];
  pageData: any;
  btnDisabled:boolean;
  userName: string;
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  batchId;
  uploadHistory:any;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  count: 0;
  totalCount;
  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 }, ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private commonService:CommonService, private msmeService:MsmeService,private http: HttpClient,private sharedService: SharedService) {
    this.sharedService.getPreScreenSelectedPanClickEvent().subscribe((message) => {
      console.log("2message Recived");
      this.PreScreenSelectedPanfetchDataFromWebSocket(message);
       })
    this.filedata=data;
  }
  PreScreenSelectedPanfetchDataFromWebSocket(responseFromWebSocket?) {
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    console.log(responseFromWebSocket);
    this.fetchBulkUploadHistory();
  }
  ngOnInit(){
    this.pageData = history.state.data;
    this.constants = Constants;
    this.getUserDetails();
    this.fetchBulkUploadHistory(null, false);
  }
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }
  prepareFilesList(files: Array<any>) {
    if (files && files.length > 0) {
      if (!this.files) {
        this.files = [];
      }
      for (const item of files) {
        item.progress = 0;
        this.files.push(item);
      }
      this.uploadFilesSimulator(0);
    }
  }
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index]?.progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            if (this.files && this.files.length > 0) {
              this.files[index].progress += 5;
            }
          }
        }, 200);
      }
    }, 1000);
  }

  getUserDetails() {
      this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
  }

  submit() {
        GlobalHeaders['x-page-action'] = 'Uploading file';
        // //console.log("upload data", this.bulkUploadDetailsForm.value.fileUpload);
        //   //console.log("upload data", this.bulkUploadDetailsForm.value);
        const formData: any = new FormData();
        if (this.files.length == 0) {
          this.commonService.errorSnackBar('Please upload the smart excel file');
          return false;
        }
        for (let i = 0; i < this.files.length; i++) {
          if (this.commonService.isObjectIsEmpty(this.files)) {
            this.commonService.errorSnackBar('Please upload a file.');
            return false;
          } else {
            // console.log("filesss...",this.files[0].type);
            const extension = this.getFileExtension(this.files[0].name);
            if (extension != 'csv' && extension != 'xls' && extension != 'xlsx') {
              this.commonService.errorSnackBar('File format of the upload should be csv or xls or xlsx');
              return;
            }
            formData.append('file', this.files[0]);
          }
        }

        // console.log("formdata", formData);
        this.btnDisabled = true;
        this.msmeService.preScreenPanUpload(formData,this.userName).subscribe(res => {
          console.log("res=========",res);
          if (res.status === 200) {
            this.files.splice(0,1);
            this.btnDisabled = false;

            this.batchId = res.data.id;
            this.totalEntry = res.data.totalRows;
            this.successfullEntry = res.data.success;
            // this.failEntry = element.invalidEntryCount + element.failedEntryCount
            this.failEntry = res.data.fail;

            this.commonService.successSnackBar('File uploaded successfully');
            this.fetchBulkUploadHistory(null, false);

          } else {
            this.btnDisabled = false;
            this.commonService.errorSnackBar('Error in Uploading file');
          }
        }, error => {
          this.btnDisabled = false;
          this.commonService.errorSnackBar('Error in Uploading file');
        });

          return true;
      }

    fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void {
      const data: any = {};
      data.tableType = 'HSBC';
      data.size = this.pageSize;
      data.pageIndex = this.page - 1;

      this.msmeService.getPreScreenPanFiles(data).subscribe((res: any) => {
        console.log("response ", res)
        if (res && res.status == 200) {
          if (res.data != null) {
            this.totalSize = res.data;
          }
          
          if (res.listData && Array.isArray(res.listData)) {
    
            res.listData = res.listData.map(item => {
              return {
                ...item,
                success: item.totalCustomer != null ? item.totalCustomer : null
              };
            });
          }
          this.uploadHistory = res.listData;
        } else {
          console.error;
          this.commonService.warningSnackBar(res.message);
        }
      }, err => {
        this.commonService.errorSnackBar(err);
      });
    }

  getFileExtension(filename) {
    // get file extension
    const extension = filename.split('.').pop();
    return extension;
  }

  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory(page, true);
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory(page, true);
  }

  getData(type, batchId) {
        if ( type === 1 ){ GlobalHeaders['x-page-action'] = 'Donwload Success file'; }
        if ( type === 2 ){ GlobalHeaders['x-page-action'] = 'Donwload fail file'; }
        if ( type === 3 ){ GlobalHeaders['x-page-action'] = 'Donwload All file'; }

        console.log(type);
        const createMasterJson: any = {};
        createMasterJson.mstId = batchId;
        createMasterJson.tableType = 'HSBC';
        this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
        if (type == 1) {
          createMasterJson.isFailed = false;
          this.msmeService.getPreScreenPanData(createMasterJson).subscribe((res: any) => {
            console.log('res=========', res.data);
            if (res.status == 200) {
              const fileName = 'Successful_Entries_' + new Date().toDateString();
              this.downloadDataInExcel(res.data, 2, type);
            }
          }, error => {
            this.commonService.errorSnackBar('Error in Downloading validData');
          });
        } else if (type == 2) {
          createMasterJson.isFailed = true;
          this.msmeService.getPreScreenPanData(createMasterJson).subscribe(res => {
            if (res.status == 200) {
              const fileName = 'Failed_Entries_' + new Date().toDateString();
              this.downloadDataInExcel(res.data, 2, type);
            }
          }, error => {
            this.commonService.errorSnackBar('Error in Downloading InValid data');
          });
        } else if (type == 3) {
          this.msmeService.getPreScreenPanData(createMasterJson).subscribe(res => {
            if (res.status == 200) {
              const fileName = 'Total_Entries_' + new Date().toDateString();
              this.downloadDataInExcel(res.data, 2, type);
            }
          }, error => {
            this.commonService.errorSnackBar('Error in Downloading Total Data');
          });
        }
      }

      downloadDataInExcel(excelData, type, reqType) {
        let downloadData = [];
        const a = type === 1 ? '.xls' : '.xlsx';
        let fileName = '';
      
        if (reqType === 1) {
          fileName = 'Successful_Entries_' + new Date().toDateString() + a;
      
          if (excelData && excelData.length > 0) {
            excelData.forEach((element) => {
              downloadData.push({
                'MRN': element.mrn ?? '-',
                'Pan': element.pan ?? '-',
                'CIN': element.cin ?? '-',
                'Company Name': element.companyName ?? '-',
                'Address': element.address ?? '-',
                'City': element.city ?? '-',
                'State': element.state ?? '-',
                'PIN Code': element.pinCode ?? '-',
              });
            });
          } else {
            downloadData.push({
              'MRN': '',
              'Pan': '',
              'CIN': '',
              'Company Name': '',
              'Address': '',
              'City': '',
              'State': '',
              'PIN Code': ''
            });
          }
      
        } else if (reqType === 2) {
          fileName = 'Failed_Entries_' + new Date().toDateString() + a;
      
          if (excelData && excelData.length > 0) {
            excelData.forEach((element) => {
              downloadData.push({
                'Pan': element.pan ?? '-',
                'Failure Reason': element.failureReason ?? '-',
              });
            });
          } else {
            downloadData.push({
              'Pan': '',
              'Failure Reason': ''
            });
          }
      
        } else if (reqType === 3) {
          fileName = 'Total_Entries_' + new Date().toDateString() + a;
      
          if (excelData && excelData.length > 0) {
            excelData.forEach((element) => {
              downloadData.push({
                'MRN': element.mrn ?? '-',
                'Pan': element.pan ?? '-',
                'CIN': element.cin ?? '-',
                'Company Name': element.companyName ?? '-',
                'Address': element.address ?? '-',
                'City': element.city ?? '-',
                'State': element.state ?? '-',
                'PIN Code': element.pinCode ?? '-',
                'Failure Reason': element.failureReason ?? '-',
              });
            });
          } else {
            downloadData.push({
              'MRN': '',
              'Pan': '',
              'CIN': '',
              'Company Name': '',
              'Address': '',
              'City': '',
              'State': '',
              'PIN Code': '',
              'Failure Reason': ''
            });
          }
        }
      
  
      
        alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
      }

  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true; // Return true if found
      }
    }
    return false; // Return false if not found
  }
  fetchPrescreendata(){
    this.fetchBulkUploadHistory(null, false);
  }
}
