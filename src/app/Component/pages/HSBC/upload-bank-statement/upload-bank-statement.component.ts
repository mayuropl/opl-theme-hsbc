import {Component, input, OnDestroy, OnInit} from '@angular/core';
import {CommonService} from "../../../../CommoUtils/common-services/common.service";
import {MsmeService} from "../../../../services/msme.service";
import {ActivatedRoute, Event, Router} from "@angular/router";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DatePipe, formatDate} from '@angular/common';
import {Observable} from "rxjs/internal/Observable";
import { Constants } from 'src/app/CommoUtils/constants';
import {map, single, startWith} from "rxjs/operators";
import {GlobalHeaders, resetGlobalHeaders} from '../../../../CommoUtils/global-headers';
import {AesGcmEncryptionService} from "../../../../CommoUtils/common-services/aes-gcm-encryption.service";
import {YearRange} from "../RM/Analysis/rm-bankstatement-upload/rm-bankstatement-upload.component";
import {SharedService} from '../../../../services/SharedService';

@Component({
  selector: 'app-upload-bank-statement',
  templateUrl: './upload-bank-statement.component.html',
  styleUrl: './upload-bank-statement.component.scss'
})
export class UploadBankStatementComponent implements OnInit,OnDestroy {
  // Month select S
  modelDate = '';
  maxDate = new Date(); // today
  filteredOptionsList: Observable<any[]>[] = [];
  BankDetailsList = [];
  // uploadForm: FormGroup;
  protected readonly Constants = Constants;
  private selectedBankId: any;
  private bsId: any;
  private bsMasterId: any;
  private userId: number;
  private pan: string;
  private uploadHistory;
  private pageData: any;
  constants: any;

  constructor(public commonService: CommonService, private msmeService: MsmeService, private router: Router,
              private fb: FormBuilder, private route: ActivatedRoute,private datePipe: DatePipe, private sharedService: SharedService) {
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.pan = this.commonService.toATOB(this.route.snapshot.params.pan);
    this.uploadForm = this.fb.group({
      uploads: this.fb.array([this.initUploadGroup()])
    });
    const bsIdTemp = this.commonService.getStorage("bsId",true);
    if(bsIdTemp != null) {
      this.bsId = Number(bsIdTemp);
      this.bsMasterId = Number(this.commonService.getStorage("bsMasterId", true));
    }

    this.sharedService.getBsUploadStatusStatusClickEvent().subscribe((message)=>{
      console.log("Message recieved");
      console.log(message);
      this.fetchDataFromWebSocket(message);
    })
  }

  fetchDataFromWebSocket(responseFromWebSocket){
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    this.fetchHistory(responseFromWebSocket?.response?.data);
  }

  fetchHistory(res){
    console.log(res);
    if (res) {
      this.uploadHistory = res;
    }
    if (this.uploadHistory?.accList.length > 0) {
      this.uploads.controls.forEach(control => {
        const bankId = control.get('accId')?.value;
        const matchedAcc = this.uploadHistory?.accList.find(acc => acc.id === bankId);

        if (matchedAcc) {
          control.get('status')?.setValue(matchedAcc.status);
          control.get('message')?.setValue(matchedAcc.message);

          const filesFormArray = control.get('files') as FormArray;

          if (Array.isArray(matchedAcc.filesList) && filesFormArray && filesFormArray.value.length > 0) {
            filesFormArray.value.forEach(fileControl => {
              const formFileName = fileControl?.name;
              const matchedFile = matchedAcc.filesList.find(f => f.fileName === formFileName);
              if (matchedFile) {
                  fileControl.id = matchedFile.id;
              }
            });
          }
        }
      });

      console.log(this.uploads);
    }
    console.log( this.uploadHistory );
  }

  ngOnInit(): void {
    this.constants = Constants;
    this.pageData = history.state.data;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmBankStatementUpload';
    GlobalHeaders['x-main-page'] = this.pageData.subpageName;
    this.getBankList();

  }
  private _filterBanks(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.BankDetailsList.filter(bank => bank.bankName.toLowerCase().includes(filterValue));
  }

  initAutocompleteForAll(): void {
    this.filteredOptionsList = this.uploads.controls.map(control =>
      control.get('bank').valueChanges.pipe(
        startWith(''),
        map(value => this._filterBanks(value || ''))
      )
    );
  }

  onOpenCalendar(container) {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('month');
  }

  getBankList(): void {
    this.msmeService.fetchbankList().subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.fetchUploadHistory();
          this.BankDetailsList = response.data;
          this.initAutocompleteForAll();
          console.log('Fetched successfully', response.message);
        } else {
          console.error('Error while fetching list', response.message);
        }
      },
      error => {
        console.error('ERROR', error);
      }
    );
  }

  onBankSelected(event: any,index?: number) {
    const selectedBankName = event.option.value;
    const selectedBank = this.BankDetailsList.find(bank => bank.id === selectedBankName);
    if (selectedBank) {
      const control = this.uploads.at(index);
      control.get('bank').setValue(selectedBank.bankName); // Set name for display
      control.get('bankId').setValue(selectedBank.id); // Set ID for backend
    }
  }

  uploadForm: FormGroup;

  get uploads(): FormArray {
    return this.uploadForm.get('uploads') as FormArray;
  }

  initUploadGroup(): FormGroup {
    return this.fb.group({
      bank: ['', Validators.required],
      bankId: ['', Validators.required],
      fromMonth: ['', Validators.required],
      toMonth: ['', Validators.required],
      files: [[], Validators.required],
      status: [''],
      message: [''],
      accId: [''],
    });
  }

  addUploadGroup(): void {
    this.uploads.push(this.initUploadGroup());
    this.initAutocompleteForAll();
    // const control = this.uploads.at(this.uploads.length - 1);
    // this.filteredOptionsList.push(
    //   control.get('bank').valueChanges.pipe(
    //     startWith(''),
    //     map(value => this._filterBanks(value || ''))
    //   )
    // );
  }

  addMoreButtonDisable(): boolean {
    const control = this.uploads.at(this.uploads.length - 1);
    if (control?.value?.files?.length > 0) {
      return true;
    } else {
      return false;
    }
  }


  removeUploadGroup(index: number , status?: any , accId?: any): void {
    let isDelete:boolean = true;
    if (status != null &&  status !== '') {
      const numericStatus = Number(status);
      if (!isNaN(numericStatus) && (numericStatus === 0 || numericStatus === 1)) {
        this.commonService.warningSnackBar('Cannaot Delete Account Data if status is success or pending');
        return;
      }else  if (!isNaN(numericStatus) && (numericStatus === 2)) {
        const req = {
          profileId: this.bsId,
          accId
        };
        this.msmeService.deleteBsUploadAccountData(req)
          .subscribe((uploadResponse: any) => {
            console.log('fetched response ====> ', uploadResponse);
            if (uploadResponse?.status === 200) {
              isDelete = true;
            } else {
              if (uploadResponse?.message) {
                this.commonService.warningSnackBar(uploadResponse?.message);
              } else {
                this.commonService.warningSnackBar('Delete File failed');
              }

              console.error('getting errror while fetching list', uploadResponse?.message);
            }
            // this.getFileData();
          }, error => {
            this.commonService.warningSnackBar('Upload failed');
            console.error('ERROR', error);

          });
      }
    }

   if(isDelete){
    let single:boolean = false;
    if (this.uploads.length === 1) {
      single = true ;
    }
    this.uploads.removeAt(index);
    if(single)
    {this.addUploadGroup();}
   }
  }
  removeFile(groupIndex: number, fileIndex: number , status?: any ,fileId?:any): void {
    if (status != null && status !== '' && fileId!=null && fileId!="") {
      const numericStatus = Number(status);
      if (!isNaN(numericStatus) && (numericStatus === 0 || numericStatus === 1)) {
        this.commonService.warningSnackBar('Cannot delete file if status is success or pending');
        return;
      }
      else   if (!isNaN(numericStatus) && (numericStatus === 2)) {
        const req = {
          profileId: this.bsId,
          fileId
        };
        this.msmeService.deleteBsUploadFileData(req)
          .subscribe((uploadResponse: any) => {
            console.log('fetched response ====> ', uploadResponse);
            if (uploadResponse?.status === 200) {
              // this.uploadHistory = uploadResponse?.data;
              // this.commonService.setStorage( 'consolidatedRequired', this.uploadHistory?.consolidatedRequired );
              // this.router.navigate(['/hsbc/rmBankStatementAnalysisView/'+this.commonService.toBTOA(this.bsId+'')],{state: { data: this.pageData }});
              const files = [...this.uploads.at(groupIndex).get('files')?.value];
              files.splice(fileIndex, 1);
              this.uploads.at(groupIndex).get('files')?.setValue(files);
            } else {
              if (uploadResponse?.message) {
                this.commonService.warningSnackBar(uploadResponse?.message);
              } else {
                this.commonService.warningSnackBar('Delete File failed');
              }

              console.error('getting errror while fetching list', uploadResponse?.message);
            }
            // this.getFileData();
          }, error => {
            this.commonService.warningSnackBar('Upload failed');
            console.error('ERROR', error);

          });
      }
    }else{
      let files = [...this.uploads.at(groupIndex).get('files')?.value];
      files.splice(fileIndex, 1);
      this.uploads.at(groupIndex).get('files')?.setValue(files);
    }
    }

  removeAccount(groupIndex: number, fileIndex: number , status?: any ,accId?:any): void {
    if(status && (status === 1 || status === 0 )) {
      this.commonService.warningSnackBar('Cannaot Delete Acc if status is success or pending');
      return;
    }else{
      const req = {
        profileId: this.bsId,
        accId
      };
      this.msmeService.deleteBsUploadAccountData(req)
        .subscribe((uploadResponse: any) => {
          console.log('fetched response ====> ', uploadResponse);
          if (uploadResponse?.status === 200) {

          } else {
            if (uploadResponse?.message) {
              this.commonService.warningSnackBar(uploadResponse?.message);
            } else {
              this.commonService.warningSnackBar('Delete File failed');
            }

            console.error('getting errror while fetching list', uploadResponse?.message);
          }
          // this.getFileData();
        }, error => {
          this.commonService.warningSnackBar('Upload failed');
          console.error('ERROR', error);

        });
    }}

  onFileSelected(event: any, i: number): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFiles = Array.from(input.files);

      const validFiles = selectedFiles
        .filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
        .map(file => ({
          file,
          name: file.name,
          password: '',
          progress: 0
        }));

      // Show error if any file is not PDF
      if (validFiles.length < selectedFiles.length) {
        this.commonService.warningSnackBar('Only PDF files are allowed.');
      }

      // Proceed if any valid PDF files remain
      if (validFiles.length > 0) {
        const existingFiles = this.uploads.at(i).get('files')?.value || [];
        const updatedFiles = [...existingFiles, ...validFiles];

        this.uploads.at(i).get('files')?.setValue(updatedFiles);
        validFiles.forEach((_, j) => {
          this.simulateProgress(i, existingFiles.length + j);
        });
      }
    }
  }


  simulateProgress(i: number, j: number) {
    const fileGroup = this.uploads.at(i).get('files')?.value;
    let progress = 0;

    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
      } else {
        progress += 10;
        fileGroup[j].progress = progress;
        this.uploads.at(i)?.get('files')?.setValue([...fileGroup]);
      }
    }, 300);
  }

  openFileDialog(fileInput: HTMLInputElement) {
    setTimeout(() => {
      fileInput.click();
    }, 0);
  }
  isSamePeriod(formA: any, formB: any): boolean {
    const format = (d: any) => formatDate(d, 'yyyy-MM', 'en-IN');
    return format(formA.fromMonth) === format(formB.fromMonth) && format(formA.toMonth) === format(formB.toMonth);
  }

  submit(i:any): void {
    console.log(this.uploads);
    console.log(this.uploads.value);
    let form: any = this.uploads.at(i);
    console.log(`form === `, form);
    if(i > 0){
      let formO : any = this.uploads.at(0);
      if (!this.isSamePeriod(form.value , formO.value)) {
        this.commonService.warningSnackBar('Bank statements do not have the same period.');
        return;
      }

    }

    GlobalHeaders['x-page-action'] = 'Uploading BS';
    let formData = new FormData();
    formData.append('userId', this.userId.toString());
    formData.append('bankId', form.value.bankId);
    formData.append('yearRange', JSON.stringify(this.getYearRange(form.value.toMonth, form.value.fromMonth)));
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
    formData.append('fromMonth', form.value.fromMonth);
    formData.append('toMonth', form.value.toMonth );
    const filePasswordObject: { [key: string]: string } = {};
    let hasValidFile = false;
    if (form.value.files && form.value.files.length > 0) {
      for (const file of form.value.files) {
        if (file && file.file.size>0) {
          formData.append('multipartFiles', file.file);
          filePasswordObject[file.name] = file.password || '';
          hasValidFile = true;
        }
      }
    }
    formData.append('passMapList', JSON.stringify(filePasswordObject));
    formData.append('bsMasterId', this.bsMasterId + '');
    formData.append('profileId' , this.bsId + '');
    const numericStatus = Number(form?.value?.status);
    if (!isNaN(numericStatus) && (numericStatus === 2)) {
      let isFailure = true;
      formData.append('isFailureCaseString' , isFailure.toString());
      formData.append('accId' , form.value.accId);

      }
    this.msmeService.bankStatementAnalysisUpload(formData)
      .subscribe((uploadResponse: any) => {
        uploadResponse = JSON.parse(AesGcmEncryptionService.getDecPayload(uploadResponse.encData));
        if (uploadResponse.status === 200) {
          this.uploads.at(i).get('accId')?.setValue(uploadResponse?.data?.accId);
          this.fetchHistory(uploadResponse?.data);
          // this.bsUploaded=true;
          this.commonService.successSnackBar(uploadResponse.message);
          // this.router.navigate([Constants.ROUTE_URL.PROVIDE_DATA_SELECTION]);
          console.log('fetched successful', uploadResponse.message);
        } else {
          if (uploadResponse.message) {
            this.commonService.warningSnackBar(uploadResponse.message);
          } else {
            this.commonService.warningSnackBar('Upload failed');
          }

          console.error('getting errror while fetching list', uploadResponse.message);
        }
        // this.getFileData();
      }, error => {
        this.commonService.warningSnackBar('Upload failed')
        console.error('ERROR', error);

      });
    //     console.log('fetched successful', response.message);
    //   } else {
    //     console.error('getting errror while fetching list', response.message);
    //   }
    // }, error => {
    //   console.error('ERROR', error);

    // });
  }

  getYearRange(fromDate: any, toDate: any): any {
    let frDate : Date = new Date(fromDate);
    let tDate : Date = new Date(toDate) ;
    const yearRange: Partial<YearRange> = {
      fromYear: tDate.getFullYear().toString(),
      toYear: frDate.getFullYear().toString(),
      fromMonth: (tDate.getMonth() + 1).toString().padStart(2, '0'),  // Adding prefix 0 for single-digit months
      toMonth: (frDate.getMonth() + 1).toString().padStart(2, '0')    // Adding prefix 0 for single-digit months
    };
    console.log('yearRange ===>', yearRange);
    return yearRange;
  }

  ngOnDestroy(): void {
  }

  disableFields(i: number): boolean {
    const form = this.uploads.at(i);
    const status = form?.get('status')?.value;

    const numericStatus = status !== null && status !== undefined && status !== ''
      ? Number(status)
      : null;

    return numericStatus === 0 || numericStatus === 1;
  }


  submitDisabled(): boolean {
    if (!this.uploads || this.uploads.length === 0) {
      console.warn('Uploads not ready');
      return true;
    }

    const statuses = this.uploads.controls.map(control => control.get('status')?.value);
    const successCount = statuses.filter(status => status === 1).length;
    const pendingCount = statuses.filter(status => status === 0).length;

    // If any upload is still pending, disable submit
    if (pendingCount > 0) {
      return true;
    }

    // If at least one upload succeeded and none are pending, allow submit
    if (successCount > 0) {
      return false;
    }

    // All failed or unknown: disable
    return true;
  }





  private fetchUploadHistory() {
    const req = {
      profileId: this.bsId
    };
    this.msmeService.getFetchBsUploadHistory(req)
      .subscribe((uploadResponse: any) => {
        console.log('fetched response ====> ', uploadResponse);
        if (uploadResponse?.status === 200) {
          this.uploadHistory = uploadResponse?.data;
          if (this.uploadHistory.accList.length > 0){
          const uploadArray = this.uploadForm.get('uploads') as FormArray;
          uploadArray.clear(); // clear if existing

          this.uploadHistory.accList.forEach(acc => {
            const selectedBank = this.BankDetailsList.find(bank => bank.id == acc.bankId);
            const transformedFiles = (acc.filesList || []).map(f => ({
              file: { name: f.fileName },  // Mimic the file structure for UI
              filePassword: f.filePassword,
              id: f.id,
              progress: '100',

            }));
            const fromDate = new Date(acc.fromMonth);
            const toDate = new Date(acc.toMonth);
            uploadArray.push(this.fb.group({
              bank: [selectedBank?.bankName], // You can map bank name if needed
              bankId: [acc.bankId, Validators.required],
              fromMonth: [fromDate, Validators.required],
              toMonth: [toDate, Validators.required],
              files: [transformedFiles, Validators.required],
              status: [acc.status],
              accId: [acc.id],
              message: [acc.message],
            }));
          });

          // this.bsUploaded=true;
          // this.commonService.successSnackBar(uploadResponse?.message);
          // this.router.navigate([Constants.ROUTE_URL.PROVIDE_DATA_SELECTION]);
          console.log('fetched successful data ==> ', uploadResponse?.data);
        }} else {
          if (uploadResponse?.message) {
            this.commonService.warningSnackBar(uploadResponse?.message);
          } else {
            this.commonService.warningSnackBar('Upload failed');
          }

          console.error('getting errror while fetching list', uploadResponse?.message);
        }
        // this.getFileData();
      }, error => {
        this.commonService.warningSnackBar('Upload failed');
        console.error('ERROR', error);

      });
  }

  submitAccounts(){
      const req = {
        profileId: this.bsId
      };
      this.msmeService.getSubmitBsUploadData(req)
        .subscribe((uploadResponse: any) => {
          console.log('fetched response ====> ', uploadResponse);
          if (uploadResponse?.status === 200) {
            this.uploadHistory = uploadResponse?.data;
            this.commonService.setStorage( 'consolidatedRequired', this.uploadHistory?.consolidatedRequired );
            this.router.navigate(['/hsbc/rmBankStatementAnalysisView/'+this.commonService.toBTOA(this.bsId+'')],{state: { data: this.pageData }});
          } else {
            if (uploadResponse?.message) {
              this.commonService.warningSnackBar(uploadResponse?.message);
            } else {
              this.commonService.warningSnackBar('Upload failed');
            }

            console.error('getting errror while fetching list', uploadResponse?.message);
          }
          // this.getFileData();
        }, error => {
          this.commonService.warningSnackBar('Upload failed');
          console.error('ERROR', error);

        });
  }

  getStatus(stageId: any): string {
    switch (Number(stageId)) {
      case 0:
        return 'Pending';
      case 1:
        return 'Succesfully Uploaded';
      case 2:
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  toMonthAfterFromMonthValidator(group: AbstractControl): { [key: string]: any } | null {
    const from = group.get('fromMonth')?.value;
    const to = group.get('toMonth')?.value;

    if (!from || !to) return null;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Ignore day comparison — only year and month
    const fromYearMonth = fromDate.getFullYear() * 12 + fromDate.getMonth();
    const toYearMonth = toDate.getFullYear() * 12 + toDate.getMonth();

    return toYearMonth >= fromYearMonth ? null : { toBeforeFrom: true };
  }

  navBack(){
    this.router.navigate(['/hsbc/rmBankStatementAnalysis'],{state: { data: this.pageData }});
  }
}
