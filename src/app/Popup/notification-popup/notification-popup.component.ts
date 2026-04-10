import { Component, Inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-popup',
  templateUrl: './notification-popup.component.html',
  styleUrls: ['./notification-popup.component.scss']
})
export class NotificationPopupComponent {
  notificationData: any[] = [];
  groupedNotifications: { today: any[], yesterday: any[], older: any[] } = { today: [], yesterday: [], older: [] };
  groupedUnreadNotifications: { today: any[], yesterday: any[], older: any[] } = { today: [], yesterday: [], older: [] };
  unreadNotifications: any[] = [];
  allNotificationsCount: number = 0;
  filteredCount: number = 0;
  filteredUnreadCount: number = 0;
  userId: any;
  roleType: any;
  searchText: string = '';

  constructor(
    public dialogRef: MatDialogRef<NotificationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msmeService: MsmeService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    this.roleType = this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true);
    this.notificationData = data?.notificationData || [];
    console.log("notificationData: ", this.notificationData);
    this.processNotifications();
  }

  onSearch() {
    this.processNotifications();
  }

  processNotifications() {
    let filteredData = this.notificationData;

    if (this.searchText) {
      const lowerSearch = this.searchText.toLowerCase();
      filteredData = this.notificationData.filter(n =>
        (n.title && n.title.toLowerCase().includes(lowerSearch)) ||
        (this.getMessage(n) && this.getMessage(n).toLowerCase().includes(lowerSearch))
      );
    }

    this.allNotificationsCount = this.notificationData.length;
    this.filteredCount = filteredData.length;
    this.unreadNotifications = this.notificationData.filter(n => !n.isRead);

    // Apply search to grouped lists
    this.groupedNotifications = this.groupNotificationsByDate(filteredData);
    this.groupedUnreadNotifications = this.groupNotificationsByDate(this.unreadNotifications);

    // Pre-calculate Safe HTML to prevent DOM thrashing
    const processSafeHtml = (list: any[]) => {
      list.forEach(notification => {
        if (notification.htmlBody && !notification.safeHtml) {
          let html = notification.htmlBody;

          // Replace {{message}}
          const msg = this.getMessage(notification);
          html = html.replace(/{{message}}/g, msg);

          // Replace {{cir}}
          const cir = notification.parameters?.cir || notification.referenceId || '';
          html = html.replace(/{{cir}}/g, cir);

          // Generic replacement
          // Generic replacement
          if (notification.parameters) {
            for (const key in notification.parameters) {
              if (Object.prototype.hasOwnProperty.call(notification.parameters, key)) {
                let value = notification.parameters[key];

                // Check if key is 'requestTime' and value is a timestamp
                if ((key === 'requestTime' || key === 'timestamp') && !isNaN(value)) {
                  try {
                    const date = new Date(Number(value));
                    // Format: 05 Feb 2026, 11:34 am
                    const options: Intl.DateTimeFormatOptions = {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: true
                    };
                    value = date.toLocaleString('en-GB', options);
                  } catch (e) {
                    console.error('Error parsing date:', value);
                  }
                }

                const safeValue = (typeof value === 'object') ? JSON.stringify(value) : String(value);
                html = html.replace(new RegExp(`{{${key}}}`, 'g'), safeValue);
              }
            }
          }
          notification.safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
        }
      });
    };

    // Process all lists just to be safe
    processSafeHtml(this.groupedNotifications.today);
    processSafeHtml(this.groupedNotifications.yesterday);
    processSafeHtml(this.groupedNotifications.older);
    processSafeHtml(this.groupedUnreadNotifications.today);
    processSafeHtml(this.groupedUnreadNotifications.yesterday);
    processSafeHtml(this.groupedUnreadNotifications.older);

    // For unread tab, we also filter by search text if present
    let filteredUnread = this.unreadNotifications;
    if (this.searchText) {
      const lowerSearch = this.searchText.toLowerCase();
      filteredUnread = filteredUnread.filter(n =>
        (n.title && n.title.toLowerCase().includes(lowerSearch)) ||
        (this.getMessage(n) && this.getMessage(n).toLowerCase().includes(lowerSearch))
      );
    }
    this.filteredUnreadCount = filteredUnread.length;
    this.groupedUnreadNotifications = this.groupNotificationsByDate(filteredUnread);
  }

  groupNotificationsByDate(notifications: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped = { today: [], yesterday: [], older: [] };

    notifications.forEach(notification => {
      const notifDate = new Date(notification.notificationDate);
      const notifDateOnly = new Date(notifDate);
      notifDateOnly.setHours(0, 0, 0, 0);

      if (notifDateOnly.getTime() === today.getTime()) {
        grouped.today.push(notification);
      } else if (notifDateOnly.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(notification);
      } else {
        grouped.older.push(notification);
      }
    });
    return grouped;
  }

  getMessage(notification: any): string {
    if (notification.template === 'ADD_TO_TARGET' && notification.parameters?.customerNames) {
      return `New targets assigned: ${notification?.parameters?.customerNames?.join(', ')}`;
    }
    if (notification.template === 'WARNING' && notification.parameters?.customerNames) {
      return `WARNING: ${notification?.parameters?.customerNames?.join(', ')}`;
    }
    if (notification.template === 'SIMPLE' && notification.parameters?.customerNames) {
      return `${notification?.parameters?.customerNames?.join(', ')}`;
    }
    return notification.title;
  }

  markAsRead(notification: any) {
    if (notification.isRead) return;

    const data = {
      notificationId: notification.id,
      userId: String(this.userId),
    }

    this.msmeService.markNotificationAsRead(data).subscribe({
      next: (response) => {
        if (response?.status === 200 || response) {
          notification.isRead = true;
          this.processNotifications();

          // if(notification.notificationId === 32) {
          //   this.router.navigate(['/hsbc/rmDashboard']);
          //   // this.dialogRef.close();
          // }
        } else {
          console.error("Failed to mark as read");
        }
      },
      error: (error) => {
        console.error("API Error:", error);
      }
    });
  }

  getNotificationDataForUser() {
    const data = {
      userId: String(this.userId),
      roleType: String(this.roleType),
    }
    this.msmeService.getNotificationDataForUser(data).subscribe({
      next: (response) => {
        console.log("getNotificationDataForUser", response);
        if (response?.status === 200) {
          this.notificationData = response?.data;
          this.processNotifications();
        } else {
          this.commonService.errorSnackBar(response?.message);
        }
      },
      error: (error) => {
        console.error("API Error:", error);
        this.commonService.errorSnackBar(error?.error?.message || 'Something went wrong. Please try again.');
      }
    });
  }
  markAllAsRead() {
    const unread = this.notificationData.filter(n => !n.isRead);
    if (unread.length === 0) return;

    // Optimistically update UI
    const unreadCount = unread.length;
    unread.forEach(n => n.isRead = true);
    this.processNotifications();


    const data = {
      userId: String(this.userId),
      roleType: String(this.roleType),
    };

    this.msmeService.markNotificationAsRead(data).subscribe({
      next: (response) => {
        if (response?.status === 200 || response) {
          // Success, UI already optimistically updated
          console.log("Marked all as read successfully");
        } else {
          console.error("Failed to mark all as read");
          // Optional: Revert UI changes here if strict consistency is needed
        }
      },
      error: (error) => {
        console.error("API Error while marking all as read:", error);
        // Optional: Revert UI changes here
      }
    });
  }

  date: string = null;
  today: Date = new Date();
  bsConfig: any = {
    dateInputFormat: 'MM/YYYY',
    adaptivePosition: true,
    minMode: 'month'
  };

  getDynamicHtml(notification: any): SafeHtml {
    let html = notification.htmlBody || '';
    if (html) {
      // Replace {{message}} with the generated message
      const msg = this.getMessage(notification);
      html = html.replace(/{{message}}/g, msg);

      // Attempt to replace {{cir}} from parameters if available, otherwise empty string for now
      const cir = notification.parameters?.cir || notification.referenceId || '';
      html = html.replace(/{{cir}}/g, cir);

      // Generic replacement for other parameters
      if (notification.parameters) {
        for (const key in notification.parameters) {
          if (Object.prototype.hasOwnProperty.call(notification.parameters, key)) {
            const value = notification.parameters[key];
            const safeValue = (typeof value === 'object') ? JSON.stringify(value) : String(value);
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), safeValue);
          }
        }
      }
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  handleDynamicClick(event: Event, notification: any) {
    console.log('handleDynamicClick triggered', event.target);
    const target = event.target as HTMLElement;
    const acceptBtn = target.closest('.btn-accept');
    const declineBtn = target.closest('.btn-decline');
    const correlationId = notification.correlationId;

    let actionKey = '';
    if (acceptBtn) actionKey = 'accept';
    if (declineBtn) actionKey = 'decline';

    if (actionKey) {
      event.preventDefault();
      event.stopPropagation();

      const actionData = notification.parameters?.actions?.[actionKey];
      const finalPayload = {
        ...actionData.payload,
        correlationId: correlationId
      }
      if (actionData && actionData.url) {
        // console.log(`Executing ${actionKey} action for notification:`, notification.id);
        // alert(`${actionKey.toUpperCase()} Action!\nURL: ${actionData.url}\nPayload: ${JSON.stringify(actionData.payload)}`);
        this.msmeService.performDynamicAction(actionData.url, actionData.method || 'POST', finalPayload).subscribe({
          next: (res) => {
            console.log(`${actionKey} action success`, res);
            if (res?.status === 200) {
              this.commonService.successSnackBar(res.message || 'Action completed successfully');

              // Mark as read first, then fetch fresh data
              if (!notification.isRead) {
                const markReadData = {
                  notificationId: notification.id,
                  userId: String(this.userId),
                };
                this.msmeService.markNotificationAsRead(markReadData).subscribe({
                  next: () => this.getNotificationDataForUser(),
                  error: () => this.getNotificationDataForUser() // Refresh even if mark read fails
                });
              } else {
                this.getNotificationDataForUser();
              }
            } else {
              this.commonService.errorSnackBar(res?.message || 'Action failed');
            }
          },
          error: (err) => {
            console.error(`${actionKey} action error`, err);
            this.commonService.errorSnackBar(err?.error?.message || 'Something went wrong. Please try again.');
          }
        });
      } else {
        console.warn(`No action definition found for ${actionKey} in notification parameters`, notification);
        this.commonService.warningSnackBar('Action not configured for this notification.');
      }
    }
  }
}
