import { signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MsmeService } from 'src/app/services/msme.service';
import { SharedService } from 'src/app/services/SharedService';

@Component({
    selector: 'app-exim-internal-bulk-upload',
    templateUrl: './exim-internal-bulk-upload.component.html',
    styleUrls: ['./exim-internal-bulk-upload.component.scss']
})
export class EximInternalBulkUploadComponent implements OnInit {
    pagination: PaginationSignal;
    isLoading = false;
    PageSelectNumber: any[] = [
        { name: '5', value: 5 },
        { name: '10', value: 10 },
        { name: '20', value: 20 },
        { name: '50', value: 50 },
        { name: '100', value: 100 }
    ];
    uploadForm: UntypedFormGroup;
    uploadedFiles: any[] = [];
    uploadAuditList: Audit[] = [];

    constructor(
        private fb: UntypedFormBuilder,
        private commonService: CommonService,
        private msmeService: MsmeService,
        private http: HttpClient,
        private sharedService: SharedService
    ) {
        this.sharedService.getEximInternalDataUploadStatusEvent().subscribe((message) => {
            setTimeout(() => {
                this.updateStatus(message);
            }, 1000);

            // this.getAudit();
        });

        this.initForm();
    }

    ngOnInit(): void {
        this.pagination = new PaginationSignal();
        this.pagination.pageSize = signal(5);
        this.getAudit();
    }

    initForm() {
        this.uploadForm = this.fb.group({
            fileType: ['export', Validators.required],
            fileUpload: ['']
        });
    }

    toggleFileUploadControl() {
        const fileControl = this.uploadForm.get('fileUpload');
        if (!this.canUploadFile()) {
            fileControl?.disable({ emitEvent: false });
        } else {
            fileControl?.enable({ emitEvent: false });
        }
    }

    canUploadFile(): boolean {
        const fileType = this.uploadForm.get('fileType')?.value;
        return !!fileType;
    }

    removeFile(index: number): void {
        this.uploadedFiles.splice(index, 1);
    }

    onSubmit() {
        if (this.uploadForm.valid) {
            let fArray = [];
            if (this.uploadedFiles.length == 0) {
                this.commonService.errorSnackBar('Please upload a file');
                return false;
            }
            for (let i = 0; i < this.uploadedFiles.length; i++) {
                let extension = this.getFileExtension(this.uploadedFiles[i].name);
                if (extension != 'xls' && extension != 'xlsx') {
                    this.commonService.errorSnackBar("File format of the upload should be xls or xlsx");
                    return;
                }
            }
            for (const obj of this.uploadedFiles) {
                fArray.push(obj.name);
            }

            const req: any = {};
            req.fileType = this.uploadForm?.value.fileType;
            req.fileNameList = fArray;

            this.msmeService.eximInternalDataUpload(req).subscribe(res => {
                this.getAudit();

                if (res.status === 200) {
                    this.commonService.successSnackBar(res.message);
                    this.uploadedFiles = [];
                } else {
                    this.commonService.warningSnackBar(res.message);
                    this.uploadedFiles = [];
                }
            }, error => {
                this.commonService.errorSnackBar("Error in Uploading file");
            });
        }
    }

    retryUpload(uuid) {
        const req: any = {};
        req.uuid = uuid;
        this.msmeService.eximInternalDataRetryUpload(req).subscribe(res => {
            if (res.status === 200) {
                this.commonService.successSnackBar(res.message);
            } else {
                this.commonService.warningSnackBar(res.message);
            }
        }, error => {
            this.commonService.errorSnackBar("Error in Uploading file");
        });
    }

    getAudit() {
        console.log('inside audit check...');
        
        this.isLoading = true;
        let page = this.pagination.page() - 1;
        let pageSize = this.pagination.pageSize();
        this.msmeService.eximInternalDataAudit(page, pageSize).subscribe(res => {
            if (res.status === 200) {
                this.isLoading = false;
                this.uploadAuditList = res.listData;
                console.log('audit data: ', res.listData);
                
                this.pagination.totalSize = res?.data ? res?.data : 0;
            } else {
                this.isLoading = false;
                this.commonService.warningSnackBar(res.message);
            }
        }, error => {
            this.isLoading = false;
            this.commonService.errorSnackBar("Error in fetch history");
        });
    }

    openFileDialog(fileInput: HTMLInputElement) {
        setTimeout(() => {
            fileInput.click();
        }, 0);
    }

    onBlockClick(event: Event, fileInput: HTMLInputElement) {
        if (event.target === fileInput) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.openFileDialog(fileInput);
    }

    onFileDropped($event) {
        this.prepareFilesList($event);
    }

    fileBrowseHandler(files) {
        this.prepareFilesList(files);
    }

    prepareFilesList(files: Array<any>) {
        let alreadyUploadedFileName = '';
        if (files && files.length > 0) {
            if (!this.uploadedFiles) {
                this.uploadedFiles = [];
            }
            for (const item of files) {
                item.progress = 0;
                this.uploadedFiles.findIndex((f) => f.name == item.name) == -1 ? (this.uploadedFiles = [...this.uploadedFiles, item]) : (alreadyUploadedFileName == '' ? alreadyUploadedFileName = item.name : alreadyUploadedFileName + ',' + item.name);
            }
            if (alreadyUploadedFileName != '') {
                this.commonService.warningSnackBar("This file is already uploaded : " + alreadyUploadedFileName);
                alreadyUploadedFileName = '';
            }
            this.uploadForm.controls.fileUpload.patchValue(null);
            this.uploadFilesSimulator(0);
        }
    }

    getFileExtension(filename) {
        const extension = filename.split('.').pop();
        return extension;
    }

    uploadFilesSimulator(index: number) {
        setTimeout(() => {
            if (index === this.uploadedFiles.length) {
                return;
            } else {
                const progressInterval = setInterval(() => {
                    if (this.uploadedFiles[index]?.progress === 100) {
                        clearInterval(progressInterval);
                        this.uploadFilesSimulator(index + 1);
                    } else {
                        if (this.uploadedFiles && this.uploadedFiles.length > 0) {
                            this.uploadedFiles[index].progress += 10;
                        }
                    }
                }, 200);
            }
        }, 1000);
    }

    downloadTemplate(fileType) {
        let fileUrl;
        let fileName;
        if (fileType == 1) {
            fileUrl = 'assets/files/EximInternalDataUpload/Exim-Internal-Data Export Template.xlsx';
            fileName = 'Exim-Internal-Data Export Template.xlsx';
        } else {
            fileUrl = 'assets/files/EximInternalDataUpload/Exim-Internal-Data Import Template.xlsx';
            fileName = 'Exim-Internal-Data Import Template.xlsx';
        }

        this.downloadFileByUrl(fileUrl).subscribe(blob => {
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(objectUrl);
        });
    }

    downloadFileByUrl(fileUrl: string): Observable<Blob> {
        return this.http.get(fileUrl, { responseType: 'blob' }).pipe(
            map((res: Blob) => {
                return new Blob([res], { type: res.type });
            })
        );
    }

    updateStatus(responseFromWebsocket) {
        responseFromWebsocket = JSON.parse(responseFromWebsocket);
        let updatedAudit = responseFromWebsocket.response;
        let index = this.uploadAuditList.findIndex((f) => f.uuid == updatedAudit.uuid);
        if (index != -1) {
            this.uploadAuditList[index].status = updatedAudit.status;
            this.uploadAuditList[index].successCount = updatedAudit.successCount;
            this.uploadAuditList[index].uploadFailedCount = updatedAudit.uploadFailedCount;
            this.uploadAuditList[index].uploadFailedFilePath = updatedAudit.uploadFailedFilePath;
            this.uploadAuditList[index].validationFailedFilePath = updatedAudit.validationFailedFilePath;
            this.uploadAuditList[index].validationFailedCount = updatedAudit.validationFailedCount;
            this.uploadAuditList[index].failureReason = updatedAudit.failureReason;
        }
    }

    downloadByBucketRef(type, actualFileName: string, filePath: string) {
        this.startLoading(type, filePath);
        const formData = new FormData();
        formData.append('fileName', filePath);

        this.msmeService.eximInternalDataDownloadFile(formData).subscribe(
            (resp) => {
                const blob = resp.body as Blob;

                if (!blob || blob.size === 0) {
                    this.stopLoading(type, filePath);
                    this.commonService.warningSnackBar('File is empty or could not be downloaded');
                    return;
                }
                const cd = resp.headers.get('content-disposition') || resp.headers.get('Content-Disposition') || '';
                let filename = (() => {
                    const star = /filename\*\s*=\s*[^']*''([^;]+)/i.exec(cd);
                    if (star && star[1]) {
                        try {
                            return decodeURIComponent(star[1]);
                        } catch { }
                    }
                    const quoted = /filename\s*=\s*"([^"]+)"/i.exec(cd);
                    if (quoted && quoted[1]) return quoted[1];

                    const unquoted = /filename\s*=\s*([^;]+)/i.exec(cd);
                    if (unquoted && unquoted[1]) return unquoted[1].trim();

                    return '';
                })();
                if (!actualFileName) {
                    const ct = resp.headers.get('content-type') || blob.type || '';
                    if (ct.includes('xlsx')) actualFileName = name + '.xlsx';
                    else if (ct.includes('xls')) actualFileName = name + '.xls';
                    else actualFileName = name + '.bin';
                }

                const objectUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = actualFileName.split(".")[0] + ".xlsx";
                a.click();
                URL.revokeObjectURL(objectUrl);

                this.stopLoading(type, filePath);
            },
            (error) => {
                this.stopLoading(type, filePath);
                this.commonService.warningSnackBar('Failed to download file');
            }
        );
    }

    startLoading(type, bucketRefId: String) {
        const item = this.uploadAuditList.find((i) => type == 1 ? i.uploadFailedFilePath === bucketRefId : i.validationFailedFilePath === bucketRefId);
        if (item) {
            type == 1 ? item.isUploadFailLoading = true : item.isValidationFailLoading = true;
        }
    }

    stopLoading(type, bucketRefId: String) {
        const item = this.uploadAuditList.find((i) => type == 1 ? i.uploadFailedFilePath === bucketRefId : i.validationFailedFilePath === bucketRefId);
        if (item) {
            type == 1 ? item.isUploadFailLoading = false : item.isValidationFailLoading = false;
        }
    }
}

export interface Audit {
    id: number;
    uuid: string;
    fileName: string;
    fileType: 'Export' | 'Import';
    status: 'Pending' | 'Processing' | 'Success' | 'Fail';
    createdDate: Date | string;
    successCount: number;
    successFilePath?: string;
    uploadFailedCount: number;
    uploadFailedFilePath?: string;
    validationFailedCount: number;
    validationFailedFilePath?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedDate?: Date | string;
    isUploadFailLoading?: boolean;
    isValidationFailLoading?: boolean;
    failureReason?: string;
}
