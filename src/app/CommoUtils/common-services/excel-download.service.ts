import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelDownloadService {

  constructor() { }

  downloadExcel(byteData: string, fileName: string) {
    // Create a Blob from the base64 encoded byte data
    const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Create a temporary anchor element
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    // Create object URL from the Blob
    const url = window.URL.createObjectURL(blob);

    // Set the anchor element's properties
    a.href = url;
    a.download = fileName;

    // Simulate a click event to trigger the download
    a.click();

    // Revoke the object URL to free up resources
    window.URL.revokeObjectURL(url);

    // Remove the temporary anchor element
    a.remove();
  }

  downloadZip(byteData: string, fileName: string) {
    // Create a Blob from the base64 encoded byte data
    // const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const blob = this.base64toBlob(byteData, 'application/zip');

    // Create a temporary anchor element
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    // Create object URL from the Blob
    const url = window.URL.createObjectURL(blob);

    // Set the anchor element's properties
    a.href = url;
    a.download = fileName;

    // Simulate a click event to trigger the download
    a.click();

    // Revoke the object URL to free up resources
    window.URL.revokeObjectURL(url);

    // Remove the temporary anchor element
    a.remove();
  }

  base64toBlob(base64Data: string, contentType: string) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  private dataSubject = new BehaviorSubject<any>(null);
  data$ = this.dataSubject.asObservable();

  setData(data: any) {
    this.dataSubject.next(data);
  }
}
