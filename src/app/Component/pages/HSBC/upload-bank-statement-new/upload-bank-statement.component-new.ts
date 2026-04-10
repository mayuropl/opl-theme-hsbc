import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../../../CommoUtils/common-services/common.service';
import { MsmeService } from '../../../../services/msme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { Constants } from 'src/app/CommoUtils/constants';
import { map, startWith } from 'rxjs/operators';
import { GlobalHeaders, resetGlobalHeaders } from '../../../../CommoUtils/global-headers';
import { AesGcmEncryptionService } from '../../../../CommoUtils/common-services/aes-gcm-encryption.service';
import { YearRange } from '../RM/Analysis/rm-bankstatement-upload/rm-bankstatement-upload.component';
import { SharedService } from '../../../../services/SharedService';
import { log } from 'console';

@Component({
  selector: 'app-upload-bank-statement',
  templateUrl: './upload-bank-statement.component-new.html',
  styleUrls: ['./upload-bank-statement.component-new.scss']
})
export class UploadBankStatementComponentNew implements OnInit, OnDestroy {

  // UI / data
  modelDate = '';
  maxDate = new Date();
  filteredOptionsList: Observable<any[]>[] = [];
  BankDetailsList: any[] = [];
  protected readonly Constants = Constants;
  private selectedBankId: any;
  private bsId: any;
  private bsMasterId: any;
  private userId: number;
  private pan: string;
  uploadHistory: any;
  pageData: any;
  fromDate: any;
  toDate: any;
  status: any;

  // form
  uploadForm: FormGroup;

  // Misc
  constants: any;

  selectedBankMap: any = [];
  bankIndexMap: { [index: number]: number } = {};



  constructor(
    public commonService: CommonService,
    private msmeService: MsmeService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private sharedService: SharedService
  ) {
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.pan = this.commonService.toATOB(this.route.snapshot.params.pan);

    // Initialize form
    this.uploadForm = this.fb.group({
      header: this.fb.group({
        fromMonth: [null],
        toMonth: [null],
        isScanned: [false],
        status: [null],
        message: ['']
      }),
      uploads: this.fb.array([this.initUploadGroup()])
    });

    const bsIdTemp = this.commonService.getStorage('bsId', true);
    if (bsIdTemp != null) {
      this.bsId = Number(bsIdTemp);
      this.bsMasterId = Number(this.commonService.getStorage('bsMasterId', true));
    }

    // websocket event
    this.sharedService.getBsUploadStatusStatusClickEvent().subscribe((message) => {
      try {
        const parsed = JSON.parse(message);
        this.fetchDataFromWebSocket(parsed);
      } catch (e) {
        console.warn('WS message parse failed', e);
      }
    });

    // Handle isScanned toggle to update UI validation
    this.uploadForm.get('header.isScanned')?.valueChanges.subscribe(() => {
      // Trigger validation for all rows
      this.uploads.controls.forEach(control => {
        control.get('files')?.updateValueAndValidity();
      });
    });
  }

  // ---------- Form helpers ----------
  get uploads(): FormArray {
    return this.uploadForm.get('uploads') as FormArray;
  }

  get header(): FormGroup {
    return this.uploadForm.get('header') as FormGroup;
  }

  initUploadGroup(): FormGroup {
    return this.fb.group({
      bank: ['', Validators.required],
      bankId: ['', Validators.required],
      fromMonth: [this.fromDate],
      toMonth: [this.toDate],
      files: this.fb.array([], Validators.required), // <-- important: FormArray
      status: [''],
      message: [''],
      accId: [''],
      isSaved: [false]
    });
  }

  // returns FormArray for given upload index
  getFiles(index: number): FormArray {
    return (this.uploads.at(index).get('files') as FormArray);
  }

  // ---------- lifecycle ----------
  ngOnInit(): void {
    this.constants = Constants;
    this.pageData = history.state.data;
    const encodedPan = this.route.snapshot.paramMap.get('pan');
    if (encodedPan) {
      this.pan = this.commonService.toATOB(encodedPan);
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmBankStatementUpload';
    GlobalHeaders['x-main-page'] = this.pageData?.subpageName || '';
    this.getBankList();
  }

  ngOnDestroy(): void {
    // cleanup if needed
  }

  // ---------- Bank list & autocomplete ----------
  getBankList(): void {
    this.msmeService.fetchbankList().subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.BankDetailsList = response.data || [];
          this.initAutocompleteForAll();
          this.fetchUploadHistory();
        } else {
          console.error('Error while fetching list', response.message);
        }
      },
      error => {
        console.error('ERROR', error);
      }
    );
  }

  initAutocompleteForAll(): void {
    // ensure filteredOptionsList length matches uploads
    this.filteredOptionsList = this.uploads.controls.map(control =>
      (control.get('bank') as FormControl).valueChanges.pipe(
        startWith(''),
        map(value => this._filterBanks(value || ''))
      )
    );
  }

  private _filterBanks(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';
    return this.BankDetailsList.filter(bank => bank.bankName.toLowerCase().includes(filterValue));
  }

  onBankSelected(event: any, index?: number) {
    const selectedBankId = event.option.value;
    const selectedBank = this.BankDetailsList.find(b => b.id === selectedBankId);
    const duplicate = Object.keys(this.bankIndexMap).some(key =>
      Number(key) !== index && this.bankIndexMap[key] === selectedBankId
    );
    const control = this.uploads.at(index);
    if (duplicate) {
      this.commonService.warningSnackBar('Bank already selected at another row');
      control.get('bank')?.setValue(null);
      control.get('bankId')?.setValue(null);
      return;
    }
    if (selectedBank) {
      control.get('bank')?.setValue(selectedBank.bankName);
      control.get('bankId')?.setValue(selectedBank.id);
    }

    this.bankIndexMap[index] = selectedBankId;
  }

  hasDuplicateBanks(): boolean {
    const values = Object.values(this.selectedBankMap);   // All selected bankIds
    const uniqueValues = new Set(values);                 // Remove duplicates
    return uniqueValues.size !== values.length;           // If sizes differ → duplicates exist
  }

  // ---------- File selection & progress ----------
  onFileSelected(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFiles = Array.from(input.files) as File[];
      const validFiles = selectedFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));

      if (validFiles.length < selectedFiles.length) {
        this.commonService.warningSnackBar('Only PDF files are allowed.');
      }

      if (validFiles.length === 0) {
        return;
      }

      const filesArray = this.getFiles(index);
      const MAX_FILES = 30;
      const MAX_SIZE_MB = 30;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

      // Calculate existing files count and size
      let currentFileCount = filesArray.length;
      let currentTotalSize = 0;
      filesArray.controls.forEach(ctrl => {
        const file = ctrl.get('file')?.value;
        if (file && file instanceof File) {
          currentTotalSize += file.size;
        }
      });

      for (const file of validFiles) {
        if (currentFileCount >= MAX_FILES) {
          this.commonService.warningSnackBar(`Maximum ${MAX_FILES} files allowed per bank.`);
          break; // Stop adding more files
        }

        if (currentTotalSize + file.size > MAX_SIZE_BYTES) {
          this.commonService.warningSnackBar(`Total file size cannot exceed ${MAX_SIZE_MB}MB per bank.`);
          break; // Stop adding more files
        }

        const group = this.fb.group({
          file: this.fb.control<File | { name: string }>(file),
          password: this.fb.control(''),
          id: this.fb.control(null),
          progress: this.fb.control(0)
        });

        filesArray.push(group);
        currentFileCount++;
        currentTotalSize += file.size;

        // simulate progress, pass last index
        this.simulateProgress(index, filesArray.length - 1);
      }

      // reset input so same file can be selected again if needed
      input.value = '';
    }
  }

  simulateProgress(uploadIndex: number, fileIndex: number) {
    const filesArray = this.getFiles(uploadIndex);
    const ctrl = filesArray.at(fileIndex);
    if (!ctrl) {
      return;
    }

    let progress = 0;
    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        ctrl.get('progress')?.setValue(100);
      } else {
        progress += 10;
        ctrl.get('progress')?.setValue(progress);
      }
    }, 300);
  }

  openFileDialog(fileInput: HTMLInputElement) {
    setTimeout(() => fileInput.click(), 0);
  }

  // ---------- Remove logic ----------
  removeFile(groupIndex: number, fileIndex: number, isSaved?: boolean, fileId?: any): void {
    // If saved and status is pending/success, don't delete
    if (isSaved && !this.disabled()) {
      const req = { profileId: this.bsId, fileId };
      this.msmeService.deleteBsUploadFileData(req).subscribe({
        next: (uploadResponse: any) => {
          if (uploadResponse?.status === 200) {
            // Remove from FormArray
            this.getFiles(groupIndex).removeAt(fileIndex);
          } else {
            this.commonService.warningSnackBar(uploadResponse?.message || 'Delete File failed');
          }
        },
        error: () => this.commonService.warningSnackBar('Upload failed')
      });
      return;
    }

    if (!this.disabled()) {
      this.getFiles(groupIndex).removeAt(fileIndex);
    }
  }

  removeUploadGroup(index: number, isSaved?: boolean, accId?: any): void {
    let isDelete = true;
    if (isSaved) {
      const req = { profileId: this.bsId, accId };
      this.msmeService.deleteBsUploadAccountData(req).subscribe({
        next: (uploadResponse: any) => {
          if (uploadResponse?.status === 200) {
            isDelete = true;
            this.finalRemoveUploadGroup(index);
          } else {
            this.commonService.warningSnackBar(uploadResponse?.message || 'Delete Account failed');
          }
        },
        error: () => this.commonService.warningSnackBar('Delete failed')
      });
    } else {
      this.finalRemoveUploadGroup(index);
    }
  }

  private finalRemoveUploadGroup(index: number) {
    const single = this.uploads.length === 1;
    const bankId = this.bankIndexMap[index];

    if (bankId) {
      delete this.bankIndexMap[index];
    }
    this.uploads.removeAt(index);
    if (single) {
      this.bankIndexMap = {};
      this.uploadForm.patchValue({
        header: { fromMonth: null, toMonth: null, isScanned: false, status: null, message: '' }
      });
      this.addUploadGroup();
    }
  }

  addUploadGroup(): void {
    this.uploads.push(this.initUploadGroup());
    this.initAutocompleteForAll();
  }

  // ---------- History fetch & mapping ----------
  fetchUploadHistory(): void {
    const req = { profileId: this.bsId, version: Number(2) };
    this.msmeService.getFetchBsUploadHistory(req).subscribe({
      next: (uploadResponse: any) => {
        if (uploadResponse?.status === 200) {
          this.uploadHistory = uploadResponse.data || {};
          // Patch header
          this.uploadForm.patchValue({
            header: {
              fromMonth: this.uploadHistory?.fromMonth ? new Date(this.uploadHistory.fromMonth) : null,
              toMonth: this.uploadHistory?.toMonth ? new Date(this.uploadHistory.toMonth) : null,
              isScanned: this.uploadHistory?.isScanned || false,
              status: this.uploadHistory?.status || null,
              message: this.uploadHistory?.message || ''
            }
          });

          // Rebuild uploads FormArray
          const uploadArray = this.uploads;
          uploadArray.clear();

          if (Array.isArray(this.uploadHistory.accList) && this.uploadHistory.accList.length > 0) {
            this.uploadHistory.accList.forEach((acc: any) => {
              const selectedBank = this.BankDetailsList.find(b => b.id == acc.bankId);
              this.selectedBankMap.push(selectedBank?.id);
              const filesFA: any = this.fb.array([]);
              (acc.filesList || []).forEach((f: any) => {
                filesFA.push(this.fb.group({
                  file: this.fb.control({ name: f.fileName }),   // placeholder object, not File
                  password: this.fb.control(f?.filePassword ?? ''),
                  id: this.fb.control(f.id),
                  progress: this.fb.control(100)
                }));
              });

              uploadArray.push(this.fb.group({
                bank: [selectedBank?.bankName],
                bankId: [acc.bankId, Validators.required],
                fromMonth: [this.uploadHistory?.fromMonth ? new Date(this.uploadHistory.fromMonth) : null],
                toMonth: [this.uploadHistory?.toMonth ? new Date(this.uploadHistory.toMonth) : null],
                files: filesFA,
                status: [acc.status],
                accId: [acc.id],
                message: [acc.message],
                isSaved: [acc.isSaved]
              }));
            });
          } else {
            this.addUploadGroup();
          }

          // Re-init autocomplete
          this.initAutocompleteForAll();
        } else {
          this.commonService.warningSnackBar(uploadResponse?.message || 'Upload failed');
        }
      },
      error: err => {
        this.commonService.warningSnackBar('Upload failed');
        console.error('Error fetching upload history:', err);
      }
    });
  }

  fetchDataFromWebSocket(message: any) {
    if (message?.response?.data) {
      this.fetchHistory(message.response.data);
    }
  }

  fetchHistory(res: any) {
    console.log(res);
    if (res) {
      this.uploadHistory = res;
    }

    this.uploadForm.patchValue({
      header: {

        fromMonth:
          this.uploadHistory?.fromMonth != null
            ? new Date(this.uploadHistory.fromMonth)
            : this.header.get('fromMonth').value || null,

        toMonth:
          this.uploadHistory?.toMonth != null
            ? new Date(this.uploadHistory.toMonth)
            : this.header.get('toMonth').value || null,

        isScanned: this.uploadHistory.isScanned || false,
        status: this.uploadHistory.status || null,
        message: this.uploadHistory?.message || '',
      }
    });
    if (this.header.get('status').value === '1') {
      const routerData = { accountNo: '' };
      console.log('isConsolidatedRequired === ', this.uploadHistory?.consolidatedRequired);
      this.commonService.setStorage('consolidatedRequired', this.uploadHistory?.consolidatedRequired);
      this.router.navigate([`/hsbc/newRmBankStatementAnalysisView/${this.commonService.toBTOA(this.bsId + '')}`], {
        state: {
          routerData,
          data: this.pageData
        }
      });
    }
    const existingMap: { [bankId: number]: number } = {};
    const uploadArray = this.uploads;
    uploadArray.controls.forEach((ctrl, idx) => {
      const bankId = ctrl.get('bankId')?.value;
      if (bankId != null) existingMap[bankId] = idx;
    });

    // uploadArray.clear();

    if (Array.isArray(this.uploadHistory.accList) && this.uploadHistory.accList.length > 0) {
      this.uploadHistory.accList.forEach((acc: any) => {
        const selectedBank = this.BankDetailsList.find(b => b.id == acc.bankId);

        const filesFA: any = this.fb.array([]);
        (acc.filesList || []).forEach((f: any) => {
          filesFA.push(this.fb.group({
            file: this.fb.control({ name: f.fileName }),
            password: this.fb.control(f?.filePassword ?? ''),
            id: this.fb.control(f.id),
            progress: this.fb.control(100)
          }));
        });

        // CHECK IF THIS BANK-ID ALREADY EXISTS IN UI
        if (existingMap[acc.bankId] !== undefined) {

          // 👉 UPDATE EXISTING ROW
          const index = existingMap[acc.bankId];
          const ctrl: any = uploadArray.at(index);

          ctrl.patchValue({
            bank: selectedBank?.bankName,
            bankId: acc.bankId,
            fromMonth: this.uploadHistory?.fromMonth ? new Date(this.uploadHistory.fromMonth) : null,
            toMonth: this.uploadHistory?.toMonth ? new Date(this.uploadHistory.toMonth) : null,
            status: acc.status,
            accId: acc.id,
            message: acc.message,
            isSaved: acc.isSaved
          });

          // Replace files array
          ctrl.setControl("files", filesFA);

        } else {

          // 👉 ADD NEW ROW
          uploadArray.push(this.fb.group({
            bank: [selectedBank?.bankName],
            bankId: [acc.bankId, Validators.required],
            fromMonth: [this.uploadHistory?.fromMonth ? new Date(this.uploadHistory.fromMonth) : null],
            toMonth: [this.uploadHistory?.toMonth ? new Date(this.uploadHistory.toMonth) : null],
            files: filesFA,
            status: [acc.status],
            accId: [acc.id],
            message: [acc.message],
            isSaved: [acc.isSaved]
          }));
        }
      });
    }
    console.log(this.uploadHistory);
  }
  // ---------- Submit single account (upload files) ----------
  submit(i: number): void {
    const formGroup = this.uploads.at(i);
    const headerGroup = this.header;
    if (!formGroup) {
      return;
    }

    // validate same period if multiple groups

    GlobalHeaders['x-page-action'] = 'Uploading BS';
    const formData = new FormData();
    formData.append('userId', this.userId.toString());
    formData.append('bankId', formGroup.get('bankId')?.value);
    formData.append('yearRange', JSON.stringify(this.getYearRange(formGroup.get('toMonth')?.value, formGroup.get('fromMonth')?.value)));
    formData.append('fromMonth', headerGroup.value.fromMonth);
    formData.append('toMonth', headerGroup.value.toMonth);
    const filePasswordObject: { [key: string]: string } = {};
    let hasValidFile = false;

    // append files (only real File objects)
    const filesArray = this.getFiles(i);
    filesArray.controls.forEach(ctrl => {
      const f = ctrl.get('file')?.value;
      const name = f?.name || (typeof f === 'string' ? f : null);
      const password = ctrl.get('password')?.value || '';
      if (f && (f instanceof File)) {
        formData.append('multipartFiles', f);
        filePasswordObject[name] = password;
        hasValidFile = true;
      } else {
        // if history placeholder (no real File), skip appending; backend might expect these to remain or be re-used
        filePasswordObject[name] = password;
      }
    });

    if (!hasValidFile && !formGroup.get('accId')?.value) {
      this.commonService.warningSnackBar('No real files to upload.');
      return;
    }

    formData.append('passMapList', JSON.stringify(filePasswordObject));
    formData.append('bsMasterId', String(this.bsMasterId || ''));
    formData.append('profileId', String(this.bsId || ''));

    const numericStatus = Number(formGroup.get('status')?.value);
    if (!isNaN(numericStatus) && numericStatus === 2) {
      formData.append('isFailureCaseString', String(true));
      formData.append('accId', formGroup.get('accId')?.value);
    }

    formData.append('scanned', String(headerGroup.get('isScanned')?.value || false));

    this.msmeService.bankStatementAnalysisSaveRequest(formData).subscribe({
      next: (uploadResponse: any) => {
        try {
          uploadResponse = JSON.parse(AesGcmEncryptionService.getDecPayload(uploadResponse.encData));
        } catch (e) { /* fallback */ }
        if (uploadResponse?.status === 200) {
          this.uploads.at(i).get('accId')?.setValue(uploadResponse?.data?.accId);
          this.fetchHistory(uploadResponse?.data);
          this.commonService.successSnackBar('Bank statements saved successfully.');
        } else {
          this.commonService.warningSnackBar(uploadResponse?.message || 'Upload failed');
        }
      },
      error: () => this.commonService.warningSnackBar('Upload failed')
    });
  }

  // ---------- Submit all accounts ----------
  submitAccounts() {
    const req = {
      profileId: this.bsId,
      bankId: this.uploads.at(0).get('bankId')?.value,
      fromMonth: this.header.get('fromMonth')?.value,
      pan: this.pan,
      toMonth: this.header.get('toMonth')?.value,
      scanned: String(this.header.get('isScanned')?.value),
      yearRange: JSON.stringify(this.getYearRange(this.header.get('toMonth')?.value, this.header.get('fromMonth')?.value)),
      userId: this.userId

    };
    console.log('Request PAN:', req.pan);

    this.msmeService.bankStatementAnalysisSubmitMulti(req).subscribe({
      next: (uploadResponse: any) => {
        if (uploadResponse?.status === 200) {
          this.fetchHistory(uploadResponse?.data);
        } else {
          this.commonService.warningSnackBar(uploadResponse?.message || 'Upload failed');
        }
      },
      error: () => this.commonService.warningSnackBar('Upload failed')
    });
  }

  // ---------- Utilities ----------
  getYearRange(fromDate: any, toDate: any): any {
    const frDate: Date = new Date(toDate);
    const tDate: Date = new Date(fromDate);
    const lastDay = new Date(frDate.getFullYear(), frDate.getMonth(), 1);
    const firstDay = new Date(tDate.getFullYear(), tDate.getMonth() + 1, 0);
    const formattedFirst = firstDay.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedLast = lastDay.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return {
      fromYear: frDate.getFullYear().toString(),
      toYear: tDate.getFullYear().toString(),
      fromMonth: (frDate.getMonth() + 1).toString().padStart(2, '0'),
      toMonth: (tDate.getMonth() + 1).toString().padStart(2, '0'),
      firstDate: formattedLast,
      lastDate: formattedFirst
    } as YearRange;
  }

  isSamePeriod(formA: any, formB: any): boolean {
    const format = (d: any) => formatDate(d, 'yyyy-MM', 'en-IN');
    return format(formA.fromMonth) === format(formB.fromMonth) && format(formA.toMonth) === format(formB.toMonth);
  }

  disableFields(i: number): boolean {
    const form = this.uploads.at(i);
    const status = form?.get('status')?.value;
    const numericStatus = status !== null && status !== undefined && status !== '' ? Number(status) : null;
    return numericStatus === 0 || numericStatus === 1;
  }

  addMoreButtonDisable(): boolean {
    const control = this.uploads.at(this.uploads.length - 1);
    return control?.get('files') && (control.get('files') as FormArray).length > 0;
  }

  submitDisabled(): boolean {
    if (!this.uploads || this.uploads.length === 0) {
      return true;
    }
    const statuses = this.uploads.controls.map(control => control.get('isSaved')?.value);
    const savedAccount = statuses.filter(status => status === true).length;
    const fromMonth = this.header.get('fromMonth')?.value;
    const toMonth = this.header.get('toMonth')?.value;
    const hasSuccessStatus = this.header.get('status')?.value === '2' || this.header.get('status')?.value === null;
    const hasValidFromDate = fromMonth !== null && fromMonth !== undefined && fromMonth !== '';
    const hasValidToDate = toMonth !== null && toMonth !== undefined && toMonth !== '';
    return !(savedAccount > 0 && hasValidFromDate && hasValidToDate && hasSuccessStatus);
  }

  disabled(): boolean {
    return this.header.get('status')?.value === '0';
  }

  navBack() {
    this.router.navigate(['/hsbc/newRmBankStatementAnalysis'], { state: { data: this.pageData } });
  }

  onOpenCalendar(container) {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('month');
  }


  updateDate(type: any, date: any) {
    if (type === 1) {
      this.fromDate = date;
    } else {
      this.toDate = date;
    }
    this.uploads.controls.forEach(control => {
      control.get('fromMonth')?.setValue(this.fromDate);
      control.get('toMonth')?.setValue(this.toDate);
    });
  }

  isScannedLimitExceeded(index: number): boolean {
    const isScanned = this.header.get('isScanned')?.value;
    if (!isScanned) {
      return false;
    }
    const filesArray = this.getFiles(index);
    return filesArray.length > 12;
  }

}
