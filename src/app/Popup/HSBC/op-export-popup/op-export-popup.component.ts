import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import { MatTabGroup } from '@angular/material/tabs';
import { SharedService } from 'src/app/services/SharedService';
import { AesGcmEncryptionService } from 'src/app/services/aes-gcm-encryption.service';

@Component({
  selector: 'app-op-export-popup',
  templateUrl: './op-export-popup.component.html',
  styleUrl: './op-export-popup.component.scss'
})
export class OpExportPopupComponent {
  @ViewChild('tabGroup') tabGroup: any;

selectedIndex: number = 0;
  ActiveCampaignNameList: any[] = [];
  ExpireCampaignList: any[] = [];
InactiveCampaignList: any[] = [];
responseStatusList: any[] = [];
ActiveAndInactiveCampaignList: any[] = [];
ActivePreApprovedCampaignList: any[] = [];
roleId:any;
roleType:any;
prospectType:any;
summary: any;
customerTypeIds: any[] = [];
    selectedReportType: string = "";
   selectedCampaignId_Campaign = 0;
  selectedCampaignId_Inactive = 0;
  selectedCampaignId_Expired = 0;
  selectedCampaignId_Reject = 0;
  selectedCampaignId_Preapproved=0;

  campaignSelections: any = {
    'CAMPAIGN_REPORT': { selectedId: 0, selectedName: null, searchText: '', filteredList: [], sourceList: [] },
    'INACTIVE_WITHIN_90DAYS': { selectedId: 0, selectedName: null, searchText: '', filteredList: [], sourceList: [] },
    'INACTIVE_OLDER_THAN_90DAYS': { selectedId: 0, selectedName: null, searchText: '', filteredList: [], sourceList: [] },
    'PREAPPROVED_STATUS': { selectedId: 0, selectedName: null, searchText: '', filteredList: [], sourceList: [] },
    'REJECTION_REPORT': { selectedId: 0, selectedName: null, searchText: '', filteredList: [], sourceList: [] }
  };
currentPage = 1;
selectedRowsPerPage = 5;
pageSizeOptions = [5, 10, 20, 50];
   reportConfig: any = {
    "CAMPAIGN_REPORT": {
      prefix: "",
      listGetter: () => this.ActiveCampaignNameList,
      idGetter: () => this.selectedCampaignId_Campaign
    },

    "INACTIVE_WITHIN_90DAYS": {
      prefix: "Inactive_",
      listGetter: () => this.InactiveCampaignList,
      idGetter: () => this.selectedCampaignId_Inactive
    },

    "INACTIVE_OLDER_THAN_90DAYS": {
      prefix: "Expired_",
      listGetter: () => this.ExpireCampaignList,
      idGetter: () => this.selectedCampaignId_Expired
    },

    "REJECTION_REPORT": {
      prefix: "Rejected_",
      listGetter: () => this.ActiveAndInactiveCampaignList,
      idGetter: () => this.selectedCampaignId_Reject
    },
    "PREAPPROVED_STATUS":{
      prefix:"Pre-Approved_",
      listGetter: () => this.ActivePreApprovedCampaignList,
      idGetter: () => this.selectedCampaignId_Preapproved
    },

  };
 ngOnInit() {
  this.roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
  this.getAllCampaignSummary();
  this.getCamapignReportStatus();

 }
  constructor(private dialogRef: MatDialogRef<OpExportPopupComponent>, private msmeService: MsmeService,private commonService: CommonService,private http:HttpClient, private sharedService: SharedService, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.customerTypeIds = data?.customerTypeIds || [];
    this.roleType=data?.roleType || 0;
    this.prospectType=data?.prospectType || 0;
    this.initialize();
  }

  private subscription: Subscription;

  private initialize() {
    this.subscription = this.sharedService.getOdReportDownloadStatusChangeEvent().subscribe((message)=>{
      console.log("Message recieved from export");
      this.handleWebSocketMessage(message);
    })
  }
  private debounceTimer: any;

  handleWebSocketMessage(message: any) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        console.log('this.debounceTimer: ', this.debounceTimer);
        const parsedMessage = JSON.parse(message);
        if (parsedMessage?.reqType === "OPPORTUNITY_DASHBOARD_DOWNLOAD_REPORT_STATUS") {
          this.fetchDataFromWebSocket(message);
        }
      }, 1000);
  }

  fetchDataFromWebSocket(responseFromWebSocket?){
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
      console.log("responseFromWebSocket", responseFromWebSocket);
      this.responseStatusList = responseFromWebSocket?.response?.responseStatusList;

      if(responseFromWebSocket?.response?.bucketRefId && responseFromWebSocket?.response?.filename){
        this.downloadExportReport(responseFromWebSocket?.response?.bucketRefId, responseFromWebSocket?.response?.filename);
      }
  }
  submit() {

    if (!this.selectedReportType) {
      this.commonService.warningSnackBar("Please select report type");
      return;
    }
if (!this.selectedReportType) {
      this.commonService.warningSnackBar("Please select report type");
      return;
    }

    const campaignId = this.getSelectedCampaignId();
 const fileName = this.getFileName();
 console.log("fileName :",fileName)
    this.selectedIndex = 1;
  if (this.tabGroup) {
    this.tabGroup.selectedIndex = 1;
  }

  //   this.commonService.successSnackBar(
  //   "Your file is being prepared. The download will begin shortly…"
  // );

    const data={
      reportType:this.selectedReportType,
      campaignId:campaignId,
      roleId: this.roleId,
      fileName:fileName,
      customerTypeIds: this.customerTypeIds,
      roleType:this.roleType,
      prospectType: this.prospectType
    }
    this.msmeService
      .downloadCampaignReportExcel(data)
      .subscribe((res: any) => {

        console.log("resposne::::> ",res);

        if(!this.commonService.isObjectNullOrEmpty(res?.data?.responseStatusList)){
          this.responseStatusList = res?.data?.responseStatusList;
        }

        if (res?.data?.status === 200 && res?.data?.bucketReferenceId) {
          console.log(res);
          this.downloadExportReport(res?.data?.bucketReferenceId, fileName);
        }
        else {
          // this.commonService.warningSnackBar(res.message);
        }
      });

  }
   getSelectedCampaignId(): number {
    const selection = this.campaignSelections[this.selectedReportType];
    return selection ? selection.selectedId : 0;
  }

  downloadExcel(byteData: string, fileName: string) {
    const blob = this.base64toBlob(
      byteData,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName + ".xlsx";
    a.click();
    URL.revokeObjectURL(url);
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

getFileName(): string {
  const config = this.reportConfig[this.selectedReportType];
  if (!config) return "Report";

  const prefix = config.prefix;
  const list = config.listGetter();
  const campaignId = config.idGetter();

   const now = new Date();
  const timestamp = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .replace(/[:]/g, "-")
    .replace("T", "_")
    .replace(/\..+/, "");


  if (campaignId === 0) {
    return `${prefix}All_Campaigns_Report_${timestamp}`;
  }

  const selected = list.find(c => c.id === campaignId);
  if (!selected) {
    return `${prefix}Report_${timestamp}`;
  }

  const safeName = selected.campaignName.replace(/\s+/g, "_");


  return `${prefix}${safeName}_Report_${timestamp}`;
}
getAllCampaignSummary(){
  const data={
    roleId:this.roleId,
    customerTypeIds: this.customerTypeIds,
    roleType:this.roleType,
    prospectType: this.prospectType
  }
  this.msmeService.getCampaignSummary(data).subscribe((res: any) => {
    if (res.status === 200) {
      this.summary=res.data
      // this.campaignNameList = res.data.map((item: any) => ({
      //     id: item.id,
      //     campaignName: item.campaignName
      //   }));

      this.ActiveCampaignNameList = this.summary.allActiveCampaigns;
      this.InactiveCampaignList = this.summary.inactiveCampaigns;
      this.ExpireCampaignList = this.summary.expiredCampaigns;
      this.ActiveAndInactiveCampaignList=this.summary.rejectCustomerCampaign;
      this.ActivePreApprovedCampaignList=this.summary.allActivePreApprovedCampaigns
      if (this.ActiveCampaignNameList.length > 0) this.ActiveCampaignNameList.unshift({ id: 0, campaignName: "All Campaigns Report" });
      if (this.InactiveCampaignList.length > 0) this.InactiveCampaignList.unshift({ id: 0, campaignName: "All Campaigns Report" });
      if (this.ExpireCampaignList.length > 0) this.ExpireCampaignList.unshift({ id: 0, campaignName: "All Campaigns Report" });
      if (this.ActiveAndInactiveCampaignList.length > 0) this.ActiveAndInactiveCampaignList.unshift({ id: 0, campaignName: "All Campaigns Report" });
      if (this.ActivePreApprovedCampaignList.length > 0) this.ActivePreApprovedCampaignList.unshift({ id: 0, campaignName: "All Campaigns Report" });

      // Initialize campaign selections
      this.campaignSelections['CAMPAIGN_REPORT'].sourceList = [...this.ActiveCampaignNameList];
      this.campaignSelections['CAMPAIGN_REPORT'].filteredList = [...this.ActiveCampaignNameList];

      this.campaignSelections['INACTIVE_WITHIN_90DAYS'].sourceList = [...this.InactiveCampaignList];
      this.campaignSelections['INACTIVE_WITHIN_90DAYS'].filteredList = [...this.InactiveCampaignList];

      this.campaignSelections['INACTIVE_OLDER_THAN_90DAYS'].sourceList = [...this.ExpireCampaignList];
      this.campaignSelections['INACTIVE_OLDER_THAN_90DAYS'].filteredList = [...this.ExpireCampaignList];

      this.campaignSelections['PREAPPROVED_STATUS'].sourceList = [...this.ActivePreApprovedCampaignList];
      this.campaignSelections['PREAPPROVED_STATUS'].filteredList = [...this.ActivePreApprovedCampaignList];

      this.campaignSelections['REJECTION_REPORT'].sourceList = [...this.ActiveAndInactiveCampaignList];
      this.campaignSelections['REJECTION_REPORT'].filteredList = [...this.ActiveAndInactiveCampaignList];


    } else {
      this.commonService.warningSnackBar(res.message);
    }
  });
}
get paginatedReportStatuses(): any[] {
  const startIndex = (this.currentPage - 1) * this.selectedRowsPerPage;
  return this.responseStatusList.slice(startIndex, startIndex + this.selectedRowsPerPage);
}

changePageSize(newSize: number) {
  this.selectedRowsPerPage = newSize;
  this.currentPage = 1; // Reset to first page
}

getCamapignReportStatus(){
  // const data = {
  //   customerTypeIds: this.customerTypeIds
  // };
    const data={
      roleId: this.roleId,
      roleType:this.roleType,
      customerTypeIds:this.customerTypeIds,
      prospectType: this.prospectType
    }
  this.msmeService.getCampaignReportStatus(data).subscribe(
    (res:any)=>{
      if(res.status===200){
        this.responseStatusList=res.data
      }
      else {
      this.commonService.warningSnackBar(res.message);
    }
    }
  );
}

downloadExportReport(docReferenceId,reportName){
  this.downloadTemplate(docReferenceId,reportName);
}

downloadTemplate(docReferenceId,reportName) {
  this.downloadFileFromBucket(docReferenceId,'xlsx').subscribe(blob => {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = reportName+'.xlsx';
    a.click();
    URL.revokeObjectURL(objectUrl);
  });
}

encryptedObject(data) {
  return { data: AesGcmEncryptionService.getEncPayload(data) };
}
                
downloadFileFromBucket(fileName: string, extension: string): Observable<Blob> {
  let createMasterJson: any = {};
  createMasterJson["fileName"] = fileName;
  createMasterJson["extension"] = extension;
  return this.http.post(RestUrl.GET_FILE_S3_BUCKET, this.encryptedObject(createMasterJson), { responseType: 'blob' }).pipe(
  map((res: Blob) => {
    return new Blob([res], { type: res.type });
  })
  );
}

  ngOnDestroy() {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }

  displayCampaign(campaign: any): string {
    return campaign ? campaign.campaignName : '';
  }

  onCampaignSelected(reportType: string, event: any): void {
    const selectedCampaign = event.option.value;
    this.campaignSelections[reportType].selectedId = selectedCampaign.id;
    this.campaignSelections[reportType].selectedName = selectedCampaign;

    // Update legacy properties for backward compatibility
    if (reportType === 'CAMPAIGN_REPORT') this.selectedCampaignId_Campaign = selectedCampaign.id;
    if (reportType === 'INACTIVE_WITHIN_90DAYS') this.selectedCampaignId_Inactive = selectedCampaign.id;
    if (reportType === 'INACTIVE_OLDER_THAN_90DAYS') this.selectedCampaignId_Expired = selectedCampaign.id;
    if (reportType === 'PREAPPROVED_STATUS') this.selectedCampaignId_Preapproved = selectedCampaign.id;
    if (reportType === 'REJECTION_REPORT') this.selectedCampaignId_Reject = selectedCampaign.id;
  }

  filterCampaignOptions(reportType: string): void {
    const selection = this.campaignSelections[reportType];
    if (!selection.searchText) {
      selection.filteredList = [...selection.sourceList];
    } else {
      selection.filteredList = selection.sourceList.filter(campaign =>
        campaign.campaignName.toLowerCase().includes(selection.searchText.toLowerCase())
      );
    }
  }

  onTabChange(event: any): void {
    Object.keys(this.campaignSelections).forEach(key => {
      this.campaignSelections[key].searchText = '';
      this.campaignSelections[key].selectedId = 0;
      this.campaignSelections[key].selectedName = null;
      this.campaignSelections[key].filteredList = [...this.campaignSelections[key].sourceList];
    });

    // Reset legacy properties
    this.selectedCampaignId_Campaign = 0;
    this.selectedCampaignId_Inactive = 0;
    this.selectedCampaignId_Expired = 0;
    this.selectedCampaignId_Reject = 0;
    this.selectedCampaignId_Preapproved = 0;
    this.selectedReportType = '';
  }

   closeDialog(): void {
    this.dialogRef.close();
  }

  isFormValid(): boolean {
    if (!this.selectedReportType) return false;
    
    const selection = this.campaignSelections[this.selectedReportType];
    return selection && selection.selectedName && 
          (typeof selection.selectedName === 'string' ? 
            selection.selectedName.trim() : 
            selection.selectedName.campaignName);
  }
}
