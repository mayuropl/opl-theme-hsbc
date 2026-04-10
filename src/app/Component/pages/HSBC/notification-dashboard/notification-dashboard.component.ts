import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from 'src/app/Popup/delete-popup/delete-popup.component';
import { GlobalHeaders, resetGlobalHeaders } from 'src/app/CommoUtils/global-headers';

@Component({
  selector: 'app-notification-dashboard',
  templateUrl: './notification-dashboard.component.html',
  styleUrl: './notification-dashboard.component.scss'
})
export class NotificationDashboardComponent implements OnInit {

  notificationForm: FormGroup;
  toggleOn = false;
  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  listOfNotificationData: any[] = [];
  updateForData: any;
  pageData: any;
  constants: any;
  isActive: boolean = true;

  constructor(
    private router: Router, private fb: FormBuilder, private msme: MsmeService, public commonservice: CommonService, public dialog: MatDialog) {
    this.notificationForm = fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      templateJson: ['', Validators.required,],
      isActive: [true]
    });
    this.getNotificationData();
  }

  PageSelectNumber: any[] = [
    { name: '10', value: 10 },
    { name: '20', value: 20 },
    { name: '50', value: 50 },
    { name: '100', value: 100 }
  ];
  typeList: string[] = [
    'Email',
    'System Notify'
  ];


  ngOnInit(): void {
    this.isActive = true; // default active
    this.constants = Constants;
    this.pageData = history.state.data;
    if (!this.pageData || this.pageData === 'undefined') {
      this.pageData = this.commonservice.getPageData(this.constants.pageMaster.HSBC, 'NOTIFICATION_DASHBOARD');
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/notification-dashboard';
    GlobalHeaders['x-main-page'] = this.pageData?.subpageName || 'Notification Dashboard';
  }

  jsonValidator(control: any) {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  onPageChange(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getNotificationData(page, true);
  }
  onToggleChange() {
    this.getNotificationData();
  }
  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getNotificationData(page, true);
  }

  resetStartIndex(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  onSubmit() {
    GlobalHeaders['x-page-action'] = this.updateForData ? 'Update Data' : 'Add New Data';

    if (this.notificationForm.valid) {
      const dataToSend = {
        id: this.updateForData != null && this.updateForData != undefined ? this.updateForData : null,
        name: this.notificationForm.value.name,
        type: this.notificationForm.value.type,
        description: this.notificationForm.value.description,
        template: this.notificationForm.value.templateJson,
        isActive: this.notificationForm.value.isActive
      };

      this.saveNotification(dataToSend);
    }
  }

  saveNotification(data: any) {
    // Call backend API to save notification
    this.msme.saveNotificationMasterData(data).subscribe(
      (response: any) => {
        if (response.status === 202) {
          this.commonservice.warningSnackBar(response.message);
        } else {
          this.commonservice.successSnackBar(response.message);
        }
        this.getNotificationData();
        this.resetForm();
      },
      (error) => {
        this.commonservice.errorSnackBar('Error saving notification: ' + error.message);
        this.resetForm();
      }
    );
  }

  generateId(): number {
    return Math.max(...this.listOfNotificationData.map(item => item.id || 0), 0) + 1;
  }

  deleteNotification(id: any) {
    // const dialogRef = this.dialog.open(DeletePopupComponent, {
    //   data: { message: 'Are you sure you want to delete this notification?' }
    // });

    GlobalHeaders['x-page-action'] = 'Delete Notification';

    // dialogRef.afterClosed().subscribe(result => {
    // if (result === 'confirm') {
    this.msme.deleteNotificationMasterData(id).subscribe(
      (response: any) => {
        this.commonservice.successSnackBar(response.message);
        this.getNotificationData();
      },
      (error) => {
        this.commonservice.errorSnackBar('Error deleting notification: ');
      }
    );
    // }
    // });
  }

  updateNotification(item: any) {
    GlobalHeaders['x-page-action'] = 'Update Data';
    this.toggleOn = true;

    this.notificationForm.patchValue({
      name: item.templateName,
      type: item.notificationTypeName,
      description: item.notificationDescription,
      templateJson: item.notificationTemplate,
      isActive: item.isActive === undefined ? false : item.isActive
    });
    this.updateForData = item.id;
  }

  getNotificationData(page?: any, onPageChangeFlag?: boolean) {
    const data: any = {};
    data.size = this.pageSize;
    data.pageIndex = this.page - 1;
    data.isActive = this.isActive;

    this.msme.getNotificationMasterData(data).subscribe(
      (response: any) => {
        this.listOfNotificationData = response.data || [];
        this.totalSize = response.data.totalElements || 0;
      },
      (error) => {
        console.log('Error fetching notification data:', error);
        this.commonservice.errorSnackBar('Error fetching notification data');

      }
    );
  }

  onCancel() {
    this.notificationForm.reset();
    this.toggleOn = false;
    this.updateForData = null;
  }

  resetForm() {
    this.notificationForm.reset();
    this.updateForData = null;
    this.toggleOn = false;
  }

  blockInvalidChars(event: KeyboardEvent): void {
    const invalidChars = ['<', '>', '"', '$', '.', "'", '*'];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  handlePaste(event: ClipboardEvent): void {
    const pasteData = event.clipboardData?.getData('text') || '';
    const invalidChars = /[<>"$.]/g;
    if (invalidChars.test(pasteData)) {
      event.preventDefault();
    }
  }
}
