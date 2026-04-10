import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface PdfViewerData {
  pdfUrl: string;
  fileName: string;
  createdDate:any
}

@Component({
  selector: 'app-pdf-viewer-popup',
  templateUrl: './pdf-viewer-popup.component.html',
  styleUrls: ['./pdf-viewer-popup.component.scss', './pdf-viewer-dialog.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PdfViewerPopupComponent implements OnDestroy {
  safePdfUrl: SafeResourceUrl;
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<PdfViewerPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PdfViewerData,
    public sanitizer: DomSanitizer
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.pdfUrl);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onIframeLoad(): void {
    this.isLoading = false;
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  ngOnDestroy(): void {
    // Blob URL will be revoked by parent component
  }
}
