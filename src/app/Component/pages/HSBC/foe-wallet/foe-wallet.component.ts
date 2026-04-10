import { DatePipe } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { GlobalHeaders } from 'src/app/CommoUtils/global-headers';
import { SharedService } from 'src/app/services/SharedService';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-foe-wallet', 
  templateUrl: './foe-wallet.component.html',
  styleUrl: './foe-wallet.component.scss'
})
export class FoeWalletComponent {
  
  isLoading=false;

  date:string  = null;
  type:string  = null;
  files: any[] = [];
  pageData: any;
  uploadProgress:any = 0;
  fileHistoryList:any=[];
  fileHistoryIndex:any=0;
  fileName:string;
  selectedFile: File | null = null;
  isFileUploaded = false;
  constants:any = Constants;
  refFlag:boolean = false;

  today: Date = new Date();

  bsConfig = {
    dateInputFormat: 'MM/YYYY',
    adaptivePosition: true,
    minMode: 'month'
  };

  walletPage: number = 0;
  walletStartIndex = 0;
  walletTotalSize: number = 0;
  walletPageSize: number = 10;
  walletTotalPages: number = 0;
  PageSelectNumber: number[] = [10, 20, 50, 100];

  constructor(public commonService: CommonService, private msmeService: MsmeService, private datePipe: DatePipe, private loaderService: LoaderService, private sharedService: SharedService){
    this.sharedService.getFdiOdiEcbWalletRes().subscribe((message) => {
      // console.log("FoeWallet webSock message Recived ::>", message);
      this.fetchDataFromWebSocket(message);
    });
  }

  ngOnInit() {
    this.pageData = history.state.data;
    GlobalHeaders['x-main-page'] = this.pageData.pageName;

    this.getFileHistory();
  }

  fetchDataFromWebSocket(message?){
    // let refFlagRes = JSON.parse(message).response?.refFlag;
    // this.refFlag = refFlagRes?? this.refFlag;
      this.getFileHistory();
  }

  // @ViewChild('fileInput') fileInput!: ElementRef;
  // onFileSelected(event: Event): void {
  //   console.log("------------------>", event);
  //   const input = event.target as HTMLInputElement;
  //   this.fileName = input.files[0].name;
  //   if (input.files && input.files.length > 0) {
  //     const file = input.files[0];
  //     this.isFileUploaded=true;
  //       this.selectedFile = file;
  //   }
  // }

  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index]?.progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
            this.isFileUploaded=true;
          } else {
            this.files[index].progress += 5;
          }
        }, 100);
      }
    }, 2000);
  }

  proceedAndUploadFile(): void {

    if (this.files.length == 0) {
      this.commonService.warningSnackBar('Please select the file.');
      return;
    }

    if (this.date == null) {
      this.commonService.warningSnackBar('Please select the date.');
      return;
    }

    if (this.type == null) {
      this.commonService.warningSnackBar('Please select the Type.');
      return;
    }

    const dateFormatted = this.datePipe.transform(this.date, 'yyyy-MM-dd'); // "2025-02-01"

    let reqData = {
      "walletType": this.type,
      "date": dateFormatted,
    }

    const formData = new FormData();
    formData.append('reqData', JSON.stringify(reqData));
    // formData.append('date', this.date);
    formData.append('file', this.files[0], this.files[0].name);
    this.msmeService.uploadFdiOdiEcbWalletFile(formData).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.commonService.successSnackBar(response.message);
          this.date = null;
          this.type = null;
          this.files = [];
          this.getFileHistory();
        } 
        else {
          this.commonService.warningSnackBar(response.message);
        }
      },
      (error) => {
        console.error('Upload failed:', error);
        this.commonService.errorSnackBar('Something went wrong. Please try again.');
      }
    );
  }

  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    this.uploadFilesSimulator(0);
  }
  
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  getFileHistory() {
    let request = {
      pageIndex: this.walletPage,
      size: this.walletPageSize
    };

    this.isLoading=true;
    this.loaderService.subLoaderShow();
    this.msmeService.getfdiOdiEcbWalletFileHistory(request).subscribe(
      (response: any) => {
        this.isLoading=false;
        this.loaderService.subLoaderHide();

        if (response.status === 200) {
          this.fileHistoryList = response.data;
          this.walletPageSize = response.pageSize;
          this.walletTotalPages = response.totalPage;
          this.walletTotalSize = response.totalSize;
        }
        else {
          this.commonService.errorSnackBar('Failed to fetch File History'); 
        }
      },
      (error) => {
        this.loaderService.subLoaderHide();
        this.commonService.errorSnackBar('Something went wrong while fetching File History');
      });  
  }

  walletPageSizeChange(pageSize: number, page: number) {
    this.walletPage = page;
    this.walletPageSize = pageSize;
    this.getFileHistory();
  }
  
  walletOnPageChange(pageNumber: number): void {
    this.walletPage = pageNumber;
    this.walletStartIndex = (pageNumber - 1) * this.walletPageSize;
    this.getFileHistory();
  }

  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
            return true; // Return true if found
        }
    }
    return false; // Return false if not found
}

  downloadByBucketRef(bucketRef, name, type) {
    if(this.commonService.isObjectNullOrEmpty(bucketRef)){
      this.commonService.warningSnackBar("File Not Found!");
      return;
    }
    var formData = new FormData();
    formData.append('bucketRefId', bucketRef)
    formData.append('fileType',type)
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
