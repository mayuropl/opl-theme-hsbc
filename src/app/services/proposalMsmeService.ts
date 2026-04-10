import { Injectable } from '@angular/core';
import { HttpService } from '../CommoUtils/common-services/http.service';
import { Observable } from 'rxjs';
import { RestUrl } from '../CommoUtils/resturl';


@Injectable({
    providedIn: 'root'
})
export class ProposalViewService{
    constructor(private http: HttpService) { }

    getCGTMSEData(data): Observable<any> {
        return this.http.post(RestUrl.GET_CGTMSE_DATA, data,false);
      }

    getFraudDetectionData(data): Observable<any> {
        return this.http.post(RestUrl.GET_FRAUD_DETECTION_DATA, data,false);
      }

      getMcaReportStatus(data): Observable<any> {
        return this.http.post(RestUrl.GET_MCA_REPORT_STATUS, data,false);
      }

      getMcaReportData(data): Observable<any> {
        return this.http.post(RestUrl.GET_MCA_REPORT_DATA, data,false);
      }

      getOtherDirectorshipData(data): Observable<any> {
        return this.http.post(RestUrl.GET_OTHER_DIRECTORSHIP_DATA, data,false);
      }

      getGSTComparisionData(data): Observable<any> {
        return this.http.post(RestUrl.GET_GST_COMPARISION_DATA, data,false);
      }

      getBSData(data): Observable<any> {
        return this.http.post(RestUrl.GET_BS_DATA, data,false);
      }

      getGSTData(data): Observable<any> {
        return this.http.post(RestUrl.GET_GST_DATA, data,false);
      }

      getFinancialData(data): Observable<any> {
        return this.http.post(RestUrl.GET_FINANCIAL_DATA, data,false);
      }

      getCompanyProfile(data): Observable<any> {
        return this.http.post(RestUrl.GET_COMPANY_PROFILE_DATA, data,false);
      }
      
      
      getDirectorProfile(data): Observable<any> {
        return this.http.post(RestUrl.GET_DIRECTOR_PROFILE_DATA, data,false);
      }
}