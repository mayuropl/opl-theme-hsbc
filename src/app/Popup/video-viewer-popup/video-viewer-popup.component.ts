import {
  Component,
  Inject,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { AesGcmEncryptionService } from 'src/app/CommoUtils/common-services/aes-gcm-encryption.service';

export interface VideoViewerData {
  referenceId: string;
  extension: string;
  fileName: string;
  createdDate: any;
}

@Component({
  selector: 'app-video-viewer-popup',
  templateUrl: './video-viewer-popup.component.html',
  styleUrls: ['./video-viewer-popup.component.scss']
})
export class VideoViewerPopupComponent implements AfterViewInit, OnDestroy {

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  videoSrc!: SafeUrl;
  isLoading = true;
  private sub!: Subscription;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<VideoViewerPopupComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngAfterViewInit(): void {
    // Load video after view is initialized to avoid change detection errors
    setTimeout(() => {
      this.loadVideo();
    });
  }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  // Helper method to encrypt data for API calls (following msme.service pattern)
  private forGetMethodEncrypted(data: any): string {
    return AesGcmEncryptionService.getEncPayload(data);
  }

  // Stream video method 
  private streamVideo(referenceId: string, extension: string): Observable<Blob> {
    const url = RestUrl.STREAM_HELP_AND_SUPPORT_VIDEO + '/' + 
                this.forGetMethodEncrypted(referenceId) + '/' + 
                this.forGetMethodEncrypted(extension);
    
    const headers = new HttpHeaders({
      'req_auth': 'true',
      'Content-Type': 'application/json'
    });
    
    return this.http.get(url, {
      headers,
      responseType: 'blob'
    }).pipe(
      map((res: Blob) => {
        return new Blob([res], { type: res.type });
      })
    );
  }

  loadVideo() {
    this.isLoading = true;

    this.sub = this.streamVideo(this.data.referenceId, this.data.extension)
      .subscribe({
        next: (blob: Blob) => {
          console.log('Blob received:', blob, 'Type:', blob?.type, 'Size:', blob?.size);

          if (!blob || blob.size === 0) {
            console.error('Empty or invalid blob received');
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          const videoURL = URL.createObjectURL(blob);

          this.videoSrc =
            this.sanitizer.bypassSecurityTrustResourceUrl(videoURL);

          // Hide loading spinner first
          this.isLoading = false;
          this.cdr.detectChanges();

          // Wait for video element to be rendered after *ngIf becomes true
          setTimeout(() => {
            if (this.videoPlayer) {
              const video = this.videoPlayer.nativeElement;
              video.src = videoURL;

              video.onloadeddata = () => {
                // Autoplay the video once loaded
                video.play().catch(err => {
                  console.log('Autoplay prevented by browser:', err);
                });
              };
              
              video.onerror = (e) => {
                console.error('Video element error:', e);
              };
            }
          }, 0);
        },
        error: (err) => {
          console.error('Video streaming failed - Full error:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error details:', err.error);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onClose() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();

    if (this.videoPlayer?.nativeElement?.src) {
      URL.revokeObjectURL(this.videoPlayer.nativeElement.src);
    }
  }
}
