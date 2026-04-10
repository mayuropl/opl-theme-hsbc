import { Component } from '@angular/core';
import { MsmeService } from '../../../../../services/msme.service';
import { CommonService } from '../../../../../CommoUtils/common-services/common.service';
import { SharedService } from 'src/app/services/SharedService';

@Component({
  selector: 'app-crilic-data-fetch-processing', 
  templateUrl: './crilic-data-fetch-processing.component.html',
  styleUrl: './crilic-data-fetch-processing.component.scss'
})
export class CrilicDataFetchProcessingComponent {
  modelDate = new Date();
  maxDate: Date;
  expandedRows: Set<number> = new Set();
  
  auditReportData: any[] = [];
  pageSize = 10;
  page = 1;
  startIndex = 0;
  endIndex = 2;
  totalSize = 0;
  pages = 0;
  counts: any = 0;
  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 }];

  constructor(
    private msmeService: MsmeService,
    private commonService: CommonService,
    private sharedService: SharedService
  ) {
     this.sharedService.getCrilcDetailsSubjectChangeEvent().subscribe((message) => {
      console.log('Message received for CRILC');
      console.log(message);
      this.fetchDataFromWebSocket(message);
    });
  }

   fetchDataFromWebSocket(responseFromWebSocket) {
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    this.fetchAuditReportData(null, false);
  }

  ngOnInit(): void {
    this.maxDate = new Date();
    this.fetchAuditReportData(null, false);
  }

  onOpenCalendar(container: any): void {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('month');
  }

  getAlertsSubTabData(_index: number): void {
    // Optional: load data for selected month when needed
    this.fetchAuditReportData(null, false);
  }

  toggleDetails(index: number): void {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
    } else {
      this.expandedRows.add(index);
    }
  }

  isRowExpanded(index: number): boolean {
    return this.expandedRows.has(index);
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.page = 1; // Reset to first page when page size changes
    this.startIndex = 0;
    this.endIndex = this.pageSize;
    this.fetchAuditReportData(this.page, true);
  }

  onChangePage(page: any): void {
    this.page = page;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchAuditReportData(page, true);
  }

  fetchAuditReportData(page?, onPageChangeFlag?: boolean): void {
    const data: any = {};
    console.log('Fetching page:', this.page, 'Page size:', this.pageSize);
    data.size = this.pageSize;
    data.pageIndex = this.page; 

    this.msmeService.getCrilcAuditReportData(data).subscribe((res: any) => {
      console.log('Full API Response: ', res);
      
      if (res && res.status == 200) {
        const responseData = res.data?.data;
        
        if (responseData) {
          // Check if responseData is an array or has a listData property
          if (Array.isArray(responseData)) {
            // If responseData is directly an array
            this.auditReportData = responseData;
          } else if (responseData.listData && Array.isArray(responseData.listData)) {
            // If data is nested in listData
            this.auditReportData = responseData.listData;
          } else {
            // Fallback: use responseData as is
            this.auditReportData = responseData;
          }
          
          // Extract pagination info
          const pagination = responseData.pagination || res.data?.pagination;
          this.totalSize = pagination?.total_records || 0;
          this.counts = pagination?.total_records || 0;
          this.pages = pagination?.total_pages || Math.ceil(this.totalSize / this.pageSize);
          
          console.log('Total records:', this.totalSize);
          console.log('Total pages:', this.pages);
          console.log('Current page:', this.page);
          console.log('Data array length:', this.auditReportData.length);
          console.log('Data:', this.auditReportData);
        } else {
          this.auditReportData = [];
          this.totalSize = 0;
          this.counts = 0;
          this.pages = 0;
          console.log('No data available in response');
        }

      } else {
        this.auditReportData = [];
        this.totalSize = 0;
        this.counts = 0;
        this.pages = 0;
        this.commonService.warningSnackBar(res?.message || 'No data available');
      }
    }, err => {
      console.error('Error fetching audit report data:', err);
      this.auditReportData = [];
      this.totalSize = 0;
      this.counts = 0;
      this.pages = 0;
      this.commonService.errorSnackBar(err);
    });
  }

  resetStartIndex(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  runMonthlyFetch(): void {
    if (!this.modelDate) {
      this.commonService.warningSnackBar('Please select a month');
      return;
    }

    // Format month_year as MMYYYY (e.g., "032025" for March 2025)
    const month = (this.modelDate.getMonth() + 1).toString().padStart(2, '0');
    const year = this.modelDate.getFullYear().toString();
    const monthYear = month + year;

    const data = {
      type: '1',
      month_year: monthYear
    };

    this.msmeService.runCrilcMonthlyFetch(data).subscribe((res: any) => {
      // Handle both success and error responses from backend
      if (res && (res.status == 200 || res.status === 200)) {
        this.commonService.successSnackBar(res.message || 'Monthly fetch initiated successfully');
        this.fetchAuditReportData(null, false);
      } else if (res && res.status >= 400) {
        // Handle 400-level errors (like "No file exists in folder")
        this.commonService.warningSnackBar(res.message || 'Failed to initiate monthly fetch');
      } else {
        this.commonService.warningSnackBar(res?.message || 'Failed to initiate monthly fetch');
      }
    }, err => {
      // Handle HTTP errors
      const errorMessage = err?.error?.message || err?.message || 'Error initiating monthly fetch';
      this.commonService.errorSnackBar(errorMessage);
    });
  }

  rerunFailedFiles(): void {
    if (!this.modelDate) {
      this.commonService.warningSnackBar('Please select a month');
      return;
    }

    // Format month_year as MMYYYY (e.g., "032025" for March 2025)
    const month = (this.modelDate.getMonth() + 1).toString().padStart(2, '0');
    const year = this.modelDate.getFullYear().toString();
    const monthYear = month + year;

    const data = {
      type: '2',
      month_year: monthYear
    };

    this.msmeService.rerunCrilcFailedFiles(data).subscribe((res: any) => {
      // Handle both success and error responses from backend
      if (res && (res.status == 200 || res.status === 200)) {
        this.commonService.successSnackBar(res.message || 'Re-run failed files initiated successfully');
        this.fetchAuditReportData(null, false);
      } else if (res && res.status >= 400) {
        // Handle 400-level errors (like "No file exists in folder")
        this.commonService.warningSnackBar(res.message || 'Failed to initiate re-run');
      } else {
        this.commonService.warningSnackBar(res?.message || 'Failed to initiate re-run');
      }
    }, err => {
      // Handle HTTP errors
      const errorMessage = err?.error?.message || err?.message || 'Error initiating re-run';
      this.commonService.errorSnackBar(errorMessage);
    });
  }

  downloadConsolidatedReport(item: any): void {
    if (!item || !item.month || !item.year) {
      this.commonService.warningSnackBar('Invalid data for download');
      return;
    }

    // Convert month to numeric format (handles both string names and numbers)
    let monthNumber: number;
    
    if (typeof item.month === 'string') {
      // If month is a string like "Mar", "January", etc., convert to number
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthLower = item.month.toLowerCase().substring(0, 3);
      monthNumber = monthNames.indexOf(monthLower) + 1;
      
      if (monthNumber === 0) {
        // If not found in month names, try parsing as number
        monthNumber = parseInt(item.month);
      }
    } else {
      // If month is already a number
      monthNumber = parseInt(item.month.toString());
    }

    // Validate month number
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      this.commonService.warningSnackBar('Invalid month value');
      console.error('Invalid month:', item.month, 'parsed as:', monthNumber);
      return;
    }

    // Format month_year as MMYYYY string (e.g., "032026" for March 2026)
    const month = monthNumber.toString().padStart(2, '0');
    const year = item.year.toString();
    const monthYear = month + year; // Keep as string to preserve leading zero

    const data = {
      month_year: monthYear
    };

    console.log('Downloading consolidated report for:', item.month + '/' + item.year, 'month_year:', monthYear);

    this.msmeService.downloadCrilcConsolidatedReport(data).subscribe((res: any) => {
      console.log('Download response:', res);
      
      if (res && res.status == 200 && res.data && res.data.length > 0) {
        // Extract file data from response
        const fileData = res.data[0];
        if (fileData && fileData.file_data && fileData.filename) {
          try {
            // Decode base64 and download
            const byteCharacters = atob(fileData.file_data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { 
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileData.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.commonService.successSnackBar(res.message || 'Consolidated report downloaded successfully');
          } catch (error) {
            console.error('Error decoding base64 file:', error);
            this.commonService.errorSnackBar('Failed to process file data');
          }
        } else {
          this.commonService.warningSnackBar('No success records found for this pan');
        }
      } else if (res && res.status == 200 && res.data && res.data.length === 0) {
        // Handle case when response is 200 but data array is empty
        this.commonService.warningSnackBar('No success records found for this pan');
      } else if (res && res.status == 404) {
        // Handle 404 - No data found
        this.commonService.warningSnackBar('No success records found for this pan');
      } else {
        this.commonService.warningSnackBar('No success records found for this pan');
      }
    }, err => {
      console.error('Error downloading consolidated report:', err);
      
      // Check if error contains the specific 404 message about no data found
      if (err?.status === 404 || err?.status === 500) {
        // Parse the error message to check if it's about no data found
        let errorMsg = '';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        
        // Check if the error message indicates no data found
        if (errorMsg.includes('No data found') || errorMsg.includes('404 Not Found') || err?.status === 404) {
          this.commonService.warningSnackBar('No success records found for this pan');
        } else {
          this.commonService.errorSnackBar('No success records found for this pan');
        }
      } else {
        // For other errors, show the generic message
        this.commonService.errorSnackBar('No success records found for this pan');
      }
    });
  }

  downloadAuditReport(item: any, reportType: string): void {
    if (!item) {
      this.commonService.warningSnackBar('Invalid data for download');
      return;
    }

    // Validate that we have the required data
    if (!item.summary_id && !item.month && !item.year) {
      this.commonService.warningSnackBar('Missing required data for download');
      return;
    }

    console.log('Downloading audit report:', { item, reportType });

    const data = {
      report_type: reportType,
      type: '1',
      summary_id: item.id ? item.id.toString() : '0',
       detail_id: '0',
      month: item.month ? item.month.toString() : '',
      year: item.year ? item.year.toString() : ''
    };

    console.log('Request payload:', data);

    this.msmeService.downloadCrilcAuditReport(data).subscribe((res: any) => {
      console.log('Download response:', res);
      
      if (res && res.status == 200 && res.data && res.data.length > 0) {
        const fileData = res.data[0];
        if (fileData && fileData.file_data && fileData.filename) {
          try {
            this.downloadBase64File(fileData.file_data, fileData.filename);
            this.commonService.successSnackBar(res.message || 'Report downloaded successfully');
          } catch (error) {
            console.error('Error downloading file:', error);
            this.commonService.errorSnackBar('Failed to process file data');
          }
        } else {
          this.commonService.warningSnackBar('No success records found for this pan');
        }
      } else if (res && res.status == 200 && res.data && res.data.length === 0) {
        // Handle case when response is 200 but data array is empty
        this.commonService.warningSnackBar('No success records found for this pan');
      } else if (res && res.status == 404) {
        // Handle 404 - No data found
        this.commonService.warningSnackBar('No success records found for this pan');
      } else {
        this.commonService.warningSnackBar('No success records found for this pan');
      }
    }, err => {
      console.error('Error downloading audit report:', err);
      
      // Check if error contains the specific 404 message about no data found
      if (err?.status === 404 || err?.status === 500) {
        // Parse the error message to check if it's about no data found
        let errorMsg = '';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        
        // Check if the error message indicates no data found
        if (errorMsg.includes('No data found') || errorMsg.includes('404 Not Found') || err?.status === 404) {
          this.commonService.warningSnackBar('No success records found for this pan');
        } else {
          this.commonService.errorSnackBar('No success records found for this pan');
        }
      } else {
        // For other errors, show the generic message
        this.commonService.errorSnackBar('No success records found for this pan');
      }
    });
  }

  downloadDetailAuditReport(report: any, reportType: string): void {
    if (!report) {
      this.commonService.warningSnackBar('Invalid data for download');
      return;
    }

    console.log('Downloading detail audit report:', { report, reportType });

    const data = {
      report_type: reportType,
      type: '2',
      summary_id: report.id ? report.id.toString() : '0',
      detail_id: report.id ? report.id.toString() : '0',
      month: report.month ? report.month.toString() : '',
      year: report.year ? report.year.toString() : ''
    };

    console.log('Request payload:', data);

    this.msmeService.downloadCrilcAuditReport(data).subscribe((res: any) => {
      console.log('Download response:', res);
      
      if (res && res.status == 200 && res.data && res.data.length > 0) {
        const fileData = res.data[0];
        if (fileData && fileData.file_data && fileData.filename) {
          try {
            this.downloadBase64File(fileData.file_data, fileData.filename);
            this.commonService.successSnackBar(res.message || 'Report downloaded successfully');
          } catch (error) {
            console.error('Error downloading file:', error);
            this.commonService.errorSnackBar('Failed to process file data');
          }
        } else {
          this.commonService.warningSnackBar('No success records found for this pan');
        }
      } else if (res && res.status == 200 && res.data && res.data.length === 0) {
        // Handle case when response is 200 but data array is empty
        this.commonService.warningSnackBar('No success records found for this pan');
      } else if (res && res.status == 404) {
        // Handle 404 - No data found
        this.commonService.warningSnackBar('No success records found for this pan');
      } else {
        this.commonService.warningSnackBar('No success records found for this pan');
      }
    }, err => {
      console.error('Error downloading detail audit report:', err);
      
      // Check if error contains the specific 404 message about no data found
      if (err?.status === 404 || err?.status === 500) {
        // Parse the error message to check if it's about no data found
        let errorMsg = '';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        
        // Check if the error message indicates no data found
        if (errorMsg.includes('No data found') || errorMsg.includes('404 Not Found') || err?.status === 404) {
          this.commonService.warningSnackBar('No success records found for this pan');
        } else {
          this.commonService.errorSnackBar('No success records found for this pan');
        }
      } else {
        // For other errors, show the generic message
        this.commonService.errorSnackBar('No success records found for this pan');
      }
    });
  }

  private downloadBase64File(base64Data: string, filename: string): void {
    try {
      // Decode base64 data
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('File downloaded successfully:', filename);
    } catch (error) {
      console.error('Error in downloadBase64File:', error);
      throw error; // Re-throw to be caught by calling function
    }
  }

  downloadFileByDetailId(item: any): void {
    if (!item || !item.detail_id) {
      this.commonService.warningSnackBar('Invalid data for download');
      return;
    }

    console.log('Downloading file by detail ID:', item);

    const data = {
      type: '1',
      detail_id: item.detail_id.toString()
    };

    console.log('Request payload:', data);

    this.msmeService.downloadFileByDetailId(data).subscribe((res: any) => {
      console.log('Download response:', res);
      
      if (res && res.status == 200 && res.data && res.data.length > 0) {
        const fileData = res.data[0];
        if (fileData && fileData.file_data && fileData.filename) {
          try {
            this.downloadBase64File(fileData.file_data, fileData.filename);
            this.commonService.successSnackBar(res.message || 'File downloaded successfully');
          } catch (error) {
            console.error('Error downloading file:', error);
            this.commonService.errorSnackBar('Failed to process file data');
          }
        } else {
          this.commonService.warningSnackBar('No file data received');
        }
      } else {
        this.commonService.warningSnackBar(res?.message || 'Failed to download file');
      }
    }, err => {
      console.error('Error downloading file by detail ID:', err);
      const errorMessage = err?.error?.message || err?.message || 'Failed to download file';
      this.commonService.errorSnackBar(errorMessage);
    });
  }
}
