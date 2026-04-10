import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from 'jquery';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';

@Component({
  selector: 'app-show-request-response',
  templateUrl: './show-request-response.component.html',
  styleUrls: ['./show-request-response.component.scss']
})
export class ShowRequestResponseComponent implements OnInit {

  constructor(private commonMethod: CommonMethods, public activeModal: NgbActiveModal) { }
  responseData: any;
  typeName: any;
  ngOnInit(): void {    
  }
  copyToClipBoard(data, isJson) {
    this.commonMethod.copyToClipBoard(data, isJson);
  }
  closeModal() {
    this.activeModal.close();
  }

  downloadTxtFile(jsonData?) {
    const jsonDataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonDataStr], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'JSON.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
