import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/CommoUtils/common-services/http.service';
import { RestUrl } from 'src/app/CommoUtils/resturl';

@Injectable({
    providedIn: 'root'
})
export class IncomeDashboardService {

    constructor(private http: HttpService) { }

    getIncomeData(data: any, ignoreLoader: boolean = false): Observable<any> {
        return this.http.post(RestUrl.GET_INCOME_VISUALIZATION_DATA, data, ignoreLoader);
    }

    getChildIncomeData(data: any, ignoreLoader: boolean = false): Observable<any> {
        return this.http.post(RestUrl.GET_INCOME_VISUALIZATION_DATA, data, ignoreLoader);
    }

    getFilterOptions(): Observable<any> {
        return this.http.get(RestUrl.GET_FILTER_OPTIONS, null, false);
    }
}
