import { Component } from '@angular/core';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AesGcmEncryptionService } from 'src/app/CommoUtils/common-services/aes-gcm-encryption.service';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { VideoViewerPopupComponent } from 'src/app/Popup/video-viewer-popup/video-viewer-popup.component';
import { PdfViewerPopupComponent } from 'src/app/Popup/pdf-viewer-popup/pdf-viewer-popup.component';
import { Constants } from 'src/app/CommoUtils/constants';
export interface HelpSupportFile {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  previewUrl?: string;
  thumbnailUrl?: string;
}

@Component({
  selector: 'app-help-and-support',
  templateUrl: './help-and-support.component.html',
  styleUrl: './help-and-support.component.scss'
})
export class HelpAndSupportComponent {
  files: HelpSupportFile[] = [];
  bulkUploadHistory: any[] = [];  // Initialize as empty array
  page: number = 1;
  pageSize: number = 10;
  totalSize: number = 0;
  showAllFiles = false;
  pageData: any;
  constants: any;
  onUploadClick(): void {}

  onViewAll(): void {
    this.showAllFiles = true;
  }
  
  toggleViewAll(): void {
    this.showAllFiles = !this.showAllFiles;
  }

  constructor(
    public dialog: MatDialog, 
    private msmeService: MsmeService, 
    private commonService: CommonService, 
    private http: HttpClient
  ) {}
  protected readonly consValue = Constants;
    ngOnInit(): void {
    this.constants = Constants;
    this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.HELP_AND_SUPPORT,this.consValue.pageMaster.HELP_AND_SUPPORT_SUBPAGE)

  this.fetchHelpAndSupportHistory();
}

// Helper method to encrypt data for API calls
private forGetMethodEncrypted(data: any): string {
  return AesGcmEncryptionService.getEncPayload(data);
}

// Method to fetch video with authentication
private viewHelpAndSupportVideo(referenceId: any, ext: any): Observable<HttpResponse<Blob>> {
  const url = RestUrl.STREAM_HELP_AND_SUPPORT_VIDEO + '/' + 
              this.forGetMethodEncrypted(referenceId) + '/' + 
              this.forGetMethodEncrypted(ext);
  
  return this.http.get(url, {
    responseType: 'blob',
    observe: 'response'
  }).pipe(
    catchError((err) => {
      console.error('Error fetching video:', err);
      return throwError(() => err);
    })
  );
}

// Method to fetch PDF with authentication
private viewHelpAndSupportPdf(referenceId: any, ext: any): Observable<HttpResponse<Blob>> {
  const url = RestUrl.VIEW_HELP_AND_SUPPORT_PDF + '/' + 
              this.forGetMethodEncrypted(referenceId) + '/' + 
              this.forGetMethodEncrypted(ext);
  
  return this.http.get(url, {
    responseType: 'blob',
    observe: 'response'
  }).pipe(
    catchError((err) => {
      console.error('Error fetching PDF:', err);
      return throwError(() => err);
    })
  );
}

getFileType(fileName: string): string {
  if (!fileName) return '';

  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') return 'pdf';
  if (ext === 'mp4') return 'mp4';
  if (ext === 'doc' || ext === 'docx') return 'doc';
  if (ext === 'ppt' || ext === 'pptx') return 'ppt';
  if (ext === 'xlsx') return 'excel';

  return 'other';
}
getFileExtension(fileName: string): string {
  if (!fileName) return '';

  return fileName.split('.').pop()?.toLowerCase() || '';
}


download(file: any): void {
  if (!file.referenceId) {
    this.commonService.warningSnackBar('File not found');
    return;
  }

  let ext = this.getFileExtension(file.fileName);
//  if (ext && !ext.startsWith('.')) {
//     ext = '.' + ext;
//   }
  this.downloadFileFromBucket(file.referenceId, ext).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  });
}

viewFile(file: any): void {
  if (!file.referenceId) return;

  const fileType = this.getFileType(file.fileName);

  // For videos, fetch with auth and open video viewer popup
  if (fileType === 'mp4') {
    this.fetchAuthenticatedVideo(file.referenceId, file.fileName,file.createdDate);
    return;
  }

  // For PDFs, fetch with auth and open PDF viewer popup
  if (fileType === 'pdf') {
    this.fetchAuthenticatedPdf(file.referenceId, file.fileName,file.createdDate);
    return;
  }

  // For other files, download and open
  const ext = this.getFileExtension(file.fileName);
  this.downloadFileFromBucket(file.referenceId, ext).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  });
}

fetchAuthenticatedVideo(referenceId: string, fileName: string, createdDate: any): void {

  const ext = this.getFileExtension(fileName);

  this.dialog.open(VideoViewerPopupComponent, {
    panelClass: 'video-viewer-dialog',
    data: {
      referenceId: referenceId,
      extension: ext,
      fileName: fileName,
      createdDate: createdDate
    }
  });
}


fetchAuthenticatedPdf(referenceId: string, fileName: string, createdDate: any): void {
  // Get file extension from fileName
  const ext = this.getFileExtension(fileName);
  
  // Open dialog immediately with loading state (empty URL shows loading)
  const dialogRef = this.dialog.open(PdfViewerPopupComponent, {
    panelClass: 'pdf-viewer-dialog',
    data: {
      pdfUrl: '', // Empty URL initially - triggers loading state
      fileName: fileName,
      createdDate: createdDate
    },
    disableClose: false,
    autoFocus: false,
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-dark-backdrop'
  });
  
  // Fetch PDF with authentication in background
  this.viewHelpAndSupportPdf(referenceId, ext).subscribe({
    next: (response) => {
      // Create blob URL from authenticated response
      const blob = new Blob([response.body!], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Update dialog component with loaded PDF
      const component = dialogRef.componentInstance;
      component.data.pdfUrl = blobUrl;
      component.safePdfUrl = component.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    },
    error: () => {
      dialogRef.close();
      this.commonService.errorSnackBar('Failed to load PDF. Please try again.');
    }
  });
  
  // Clean up blob URL when dialog closes
  dialogRef.afterClosed().subscribe(() => {
    const pdfUrl = dialogRef.componentInstance.data.pdfUrl;
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  });
}

openVideoPlayer(blobUrl: string, fileName: string,createdDate:any): void {
  const dialogRef = this.dialog.open(VideoViewerPopupComponent, {
    panelClass: 'video-viewer-dialog',
    data: {
      streamUrl: blobUrl,
      fileName: fileName,
      createdDate:createdDate
    },
    disableClose: false,
    autoFocus: false,
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-dark-backdrop'
  });

  // Clean up blob URL when dialog closes
  dialogRef.afterClosed().subscribe(() => {
    URL.revokeObjectURL(blobUrl);
  });
}

openPdfViewer(blobUrl: string, fileName: string,createdDate:any): void {
  const dialogRef = this.dialog.open(PdfViewerPopupComponent, {
    panelClass: 'pdf-viewer-dialog',
    data: {
      pdfUrl: blobUrl,
      fileName: fileName,
      createdDate:createdDate
    },
    disableClose: false,
    autoFocus: false,
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-dark-backdrop'
  });

  // Clean up blob URL when dialog closes
  dialogRef.afterClosed().subscribe(() => {
    URL.revokeObjectURL(blobUrl);
  });
}


   fetchHelpAndSupportHistory(page?: number): void {
    if (page) {
      this.page = page;
    }
    
    const data: any = {
      size: this.pageSize,
      pageIndex: this.page - 1
    };

    this.msmeService.getHelpAndSupportFiles(data).subscribe({
      next: (res: any) => {
        if (res?.status === 200) {
          this.totalSize = res.data.completedFiles.length;
          this.bulkUploadHistory = res.data.completedFiles || [];
          
          // If no totalSize found, use array length as fallback
          if (this.totalSize === 0 && this.bulkUploadHistory.length > 0) {
            this.totalSize = this.bulkUploadHistory.length;
          }
        } else {
          this.bulkUploadHistory = [];
          this.totalSize = 0;
          this.commonService.warningSnackBar(res?.message || 'API returned error status');
        }
      },
      error: () => {
        this.bulkUploadHistory = [];
        this.totalSize = 0;
        this.commonService.errorSnackBar('Failed to load data from backend');
      }
    });
  }

  downloadFile(file: any): void {
    if (file.referenceId) {
      this.downloadExportReport(file.referenceId, file.fileName || 'download');
    }
  }
  downloadExportReport(docReferenceId: string, reportName: string) {
    this.downloadTemplate(docReferenceId, reportName);
  }

  downloadTemplate(docReferenceId: string, reportName: string) {

  const ext = this.getFileExtension(reportName);

  this.downloadFileFromBucket(docReferenceId, ext).subscribe(blob => {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);

    a.href = objectUrl;
    a.download = reportName; // already has extension
    a.click();

    URL.revokeObjectURL(objectUrl);
  });
}


  encryptedObject(data: any) {
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
isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
            return true; // Return true if found
        }
    }
    return false; // Return false if not found
  }
  deleteFile(fileId: any): void {
    if (confirm('Are you sure you want to delete this file?')) {
      this.msmeService.deleteHelpAndSupportFile(fileId).subscribe({
        next: (response: any) => {
          this.commonService.successSnackBar('File deleted successfully');
          this.fetchHelpAndSupportHistory();
        },
        error: (error) => {
          console.error('Error deleting file:', error);
          this.commonService.errorSnackBar('Failed to delete file');
        }
      });
    }
  }

  
}
