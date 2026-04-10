import { MatDialog } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { HttpClient } from '@angular/common/http';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/SharedService';
import { Constants } from 'src/app/CommoUtils/constants';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-matching-tool-cue-data',
  templateUrl: './matching-tool-cue-data.component.html',
  styleUrl: './matching-tool-cue-data.component.scss'
})
export class MatchingToolCueDataComponent {
[x: string]: any;


  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  pages = 10;

  counts = 10;
  matchingToolReportHistory: any[] = [];
  inputFileHistory: any[] = [];
  matchFileHistory: any[] = [];
  allCombinedHistory: any[] = [];

  inputFiles: any[] = [];
  matchFile: any[] = [];
  uiFileType: 'Input File' | 'Match File'
  allRecords: any[] = [];      // merged full data
pagedRecords: any[] = [];   // data shown in table


  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 },]

  fileTypes = [
    { name: 'OMNIA', value: 'OMNIA' },
    { name: 'CARM', value: 'CARM' },
    { name: 'CME', value: 'CME' },
    { name: 'Top Client', value: 'Top Client' },
    // { name: 'Others', value: 'Others' }
  ];

  selectedInputFileType: string = '';

  matchingToolUploadForm: UntypedFormGroup;
     protected readonly consValue = Constants;

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
    private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient, private downloadExcelService : ExcelDownloadService
    ,private sharedService:SharedService) {

      this.websocketResponse();
  }

  ngOnInit(): void {
    this.createMatchingUploadForm(null);
    this.fetchAuditData(null, false);
  }

  private websocketResponse() {
    this.sharedService.getMatchingStatusStatusClickEvent().subscribe((message)=>{
      console.log("Message recieved from Matching tool status");
      this.fetchDataFromWebSocket(message);
  })
}

  fetchDataFromWebSocket(responseFromWebSocket?){
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    console.log("response from web socket", responseFromWebSocket?.response);
    this.matchingToolReportHistory = responseFromWebSocket?.response?.response?.data?.data;
    this.counts = responseFromWebSocket?.response?.response?.data?.pagination.total_count;
    this.totalSize = responseFromWebSocket?.response?.response?.data?.pagination.total_count;

  }

  inputTotal = 0;
matchTotal = 0;


fetchAuditData(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void{
    const data: any = {};
    data.size = this.pageSize;
    data.pageIndex = this.page;

    this.msmeService.getInputMatchingToolReportData(data, true).subscribe((res: any) => {
      console.log('res:', res);
      if(res && res.data.status === 'success'){
        if(res.data.data != null){
          this.counts = res.data.pagination.total_count;
          this.totalSize = res.data.pagination.total_count;
          // this.counts = res?.data?.data.size;
          // this.totalSize = res?.data?.data.size;
          this.matchingToolReportHistory = res?.data?.data;
        }
      }else{
        this.commonService.warningSnackBar(res?.message || 'Failed to fetch history');
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });
  }

  downloadFile(file){
    const req = {
      file_name:  file?.output_file
    };
    this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…');
    this.msmeService.matchingToolDataDownload(req, true).subscribe((res: any) => {
      if (res && res.status == 200) {
        this.downloadExcelService.downloadExcel(res?.data, file?.file_name);

      } else {
        this.commonService.warningSnackBar(res?.message);
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });
   }

  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchAuditData(page, true);
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchAuditData(page, true);
  }

  get startRecord(): number {
  return this.totalSize === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
}

get endRecord(): number {
  return Math.min(this.page * this.pageSize, this.totalSize);
}


  fileBrowseHandler(files) {
    // Check if file type is selected before allowing upload
    if (!this.selectedInputFileType) {
      this.commonService.warningSnackBar('Please select file type before uploading input file');
      return;
    }
    this.prepareFilesList(files);
  }

  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.inputFiles.push(item);
    }
    this.uploadFilesSimulator(0);
  }

  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.inputFiles.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if(this.inputFiles.length == 0){
            return;
          }
          if (this.inputFiles[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.inputFiles[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  removeInputFile(index: number) {
    this.inputFiles.splice(index, 1);
  }

  resetInputFiles(){
    this.inputFiles = [];
  }

  resetMatchFile(){
    this.matchFile = [];
  }

  fileBrowseHandlerForMatchFile(files) {
    this.prepareFilesListForMatchFile(files);
  }

  prepareFilesListForMatchFile(files: Array<any>) {
    // Only allow single file for match file
    if (this.matchFile.length > 0) {
      this.commonService.warningSnackBar('Only one match file is allowed. Please remove the existing file first.');
      return;
    }
    // Take only the first file
    if (files.length > 0) {
      const item = files[0];
      item.progress = 0;
      this.matchFile.push(item);
      this.uploadFilesSimulatorForMatchFile(0);
    }
  }

  uploadFilesSimulatorForMatchFile(index: number) {
    setTimeout(() => {
      if (index === this.matchFile.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if(this.matchFile.length == 0){
            return;
          }
          if (this.matchFile[index]?.progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulatorForMatchFile(index + 1);
          } else {
            this.matchFile[index].progress = this.matchFile[index]?.progress + 5;
          }
        }, 200);
      }
    }, 1000);
  }

  removeMatchFile(index: number) {
    this.matchFile.splice(index, 1);
  }

  createMatchingUploadForm(bulkUploadDetails) {
    this.matchingToolUploadForm = this.formBuilder.group({
      inputFileUpload: new UntypedFormControl('', Validators.required),
      matchfileUpload: new UntypedFormControl('', Validators.required),
      inputFileType: new UntypedFormControl('', Validators.required)
    });

  }

  submitInputFiles() {
    if (this.inputFiles.length === 0) {
      this.commonService.errorSnackBar('Please upload input file(s)');
      return;
    }

    if (!this.selectedInputFileType) {
      this.commonService.warningSnackBar('Please select file type');
      return;
    }

    // Validate all files are CSV
    for (const file of this.inputFiles) {
      const ext = this.getFileExtension(file.name);
      if (ext !== 'csv') {
        this.commonService.errorSnackBar('Only CSV files are allowed');
        return;
      }
    }

    // Build request body as JSON array with file_type and file_path for each file
    const requestBody = this.inputFiles.map(file => ({
      fileType: this.selectedInputFileType,
      fileName: `${file.name}`
    }));
    console.log("requestbody ==>",this.requestBody);

    const data={
      matchingToolUploadRequestList: requestBody,
    }
    this.msmeService.uploadInputMatchingToolFiles(data).subscribe(
      (res: any) => {
        console.log("input file", res);
        // if (res.success === "PROCESSING") {
        if(res != null){
          res.success === false ? this.commonService.errorSnackBar(res.message) :  this.commonService.successSnackBar(res.message);
          this.resetUploadForm();
          this.fetchAuditData(null, false);

        } else {
          this.commonService.warningSnackBar(res.message || 'Upload failed');
        }
      },
      () => {
        this.commonService.errorSnackBar('Error while uploading input files');
      }
    );
  }

  submitMatchFile() {
    if (this.matchFile.length === 0) {
      this.commonService.errorSnackBar('Please upload match file');
      return;
    }

    const file = this.matchFile[0];
    const ext = this.getFileExtension(file.name);

    if (ext !== 'csv') {
      this.commonService.errorSnackBar('Only CSV files are allowed');
      return;
    }

    // Build the file path as expected by backend
    const fileName = `${file.name}`;

    // Send as JSON object with match_file property
    const requestBody = {
      match_file: fileName
    };
        console.log("requestbody ==>",this.requestBody);

    this.msmeService.uploadMatchingToolFiles(requestBody).subscribe(
      (res: any) => {
        console.log("res===>",res);
        // if (res.success === "PROCESSING") {
          if (res != null) {
           res.success === false ? this.commonService.errorSnackBar(res.message) :  this.commonService.successSnackBar(res.message);
          // this.resetUploadForm();
          this.resetMatchUploadForm();
          this.fetchAuditData(null, false);

        } else {
          this.commonService.warningSnackBar(res.message || 'Matching failed');
        }
      },
      () => {
        this.commonService.errorSnackBar('Error while uploading match file');
      }
    );
  }

  getFileExtension(filename) {
    const extension = filename.split('.').pop();
    return extension;
  }

  resetUploadForm() {
  this.matchingToolUploadForm.reset();
  this.inputFiles = [];
  this.selectedInputFileType = '';
}

resetMatchUploadForm(){
    this.matchingToolUploadForm.reset();
    this.matchFile = [];
}



}
