import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-gcc-upload',
  templateUrl: './new-gcc-upload.component.html',
  styleUrls: ['./new-gcc-upload.component.scss']
})
export class NewGccUploadComponent {
  selectedFile: File | null = null;
  uploadProgress:any = 0;
  fileHistoryList:any=[];
  fileHistoryIndex:any=0;
  fileName:string;
  isFileUploaded = false;
  files: any[] = [];

  PageSelectNumber: number[] = [10, 20, 50, 100];

  newGccUploadPageNumber = 1
  newGccUploadStartIndex = 0;
  newGccUploadTotalSize: number = 0;
  newGccUploadPageSize: number = 10;
  newGccUploadTotalPages: number = 0;
  newGccUploadPage: number = 0;

  constructor(public commonService: CommonService, private msmeService: MsmeService) {}

  ngOnInit() {
    this.getFileHistory();
  }

  @ViewChild('fileInput') fileInput!: ElementRef;

  onFileSelected(event: Event): void {
    console.log("------------------>", event);
    const input = event.target as HTMLInputElement;
    this.fileName = input.files[0].name;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isFileUploaded=true;
        this.selectedFile = file;
    }
  }

  uploadFile(): void {
    if (!this.isFileUploaded) {
      this.commonService.warningSnackBar('Please select the file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.files[0], this.files[0].name);

    // Call the upload service
    this.msmeService.uploadNewGccFile(formData).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.commonService.successSnackBar(response.message);
          this.files= [];
          this.isFileUploaded=false;
          this.getFileHistory();
        } else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        console.error('Upload failed:', error);
        this.commonService.errorSnackBar('Something went wrong. Please try again.');
      }

    );
  }

   getFileHistory() {
    let request :any = {};
    request["pageIndex"] = this.newGccUploadPage;
    request["size"] = this.newGccUploadPageSize;
      this.msmeService.getNewGccFileHistory(request,true).subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.fileHistoryList = response.data;
            this.newGccUploadPageSize = response.pageSize;
            this.newGccUploadTotalPages = response.totalPage;
            this.newGccUploadTotalSize = response.totalSize;
              }
          else {
            this.commonService.errorSnackBar('Failed to fetch File History');

          }
        },
        (error) => {
          this.commonService.errorSnackBar('Something went wrong while fetching File History');

        }
      );
    }

  // removeFile(): void {
  //   this.selectedFile = null;
  //   this.isFileUploaded=false;
  //   this.uploadProgress = 0; // Reset progress if needed
  // }

  downloadByBucketRef(bucketRef,name,type) {
    if(this.commonService.isObjectNullOrEmpty(bucketRef)){
      this.commonService.warningSnackBar("File Not Found");
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

uploadFilesSimulator(index: number) {
  setTimeout(() => {
    if (index === this.files.length) {
      return;
    } else {
      const progressInterval = setInterval(() => {
        if (this.files[index].progress === 100) {
          clearInterval(progressInterval);
          this.uploadFilesSimulator(index + 1);
          this.isFileUploaded=true;
        } else {
          this.files[index].progress += 5;
        }
      }, 200);
    }
  }, 1000);
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
  this.isFileUploaded=false;
}


newGccPageSizeChange(pageSize: number, page: number) {
  this.newGccUploadPageSize = pageSize;
  this.newGccUploadPage = page;
  this.getFileHistory();
}

newGccOnPageChange(pageNumber: number): void {
  this.newGccUploadPage = pageNumber;
  this.newGccUploadStartIndex = (pageNumber - 1) * this.newGccUploadPageSize;
  this.getFileHistory();
}

}
