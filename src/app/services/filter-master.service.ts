import { inject, Injectable } from '@angular/core';
import { Constants } from '../CommoUtils/constants';
import { MsmeService } from './msme.service';
import { CommonService } from '../CommoUtils/common-services/common.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class FilterMasterService {

  private filterMasterCache: any = null;
  constants = Constants;
  msmeService = inject(MsmeService);
  commonService = inject(CommonService);

  getInsightFilterMaster(ignoreLoader?: boolean): Observable<any> {

    // Check cache first
    const cachedData = this.getCachedFilterMaster();
    if (cachedData) {
       // Return deep copy, not same reference
      return of( _.cloneDeep(cachedData));
    }

    // If no cache, make API call
    return this.msmeService.getInsightFilter(ignoreLoader).pipe(
      map((response: any) => {
        if (response && response.status == 200 && response.data) {
          const filterListMaster = this.processFilterData(response.data);
          this.saveToCache(filterListMaster);
           // Return deep copy here too
           return  _.cloneDeep(filterListMaster);
        }
        throw new Error(response.message || 'Failed to load filter master');
      })
    );
  }

  private getCachedFilterMaster(): any {
    // Check memory cache first
    if (this.filterMasterCache) {
      return this.filterMasterCache;
    }

    // Check storage cache
    const stored = this.commonService.getStorageAesEncryption(Constants.CLEAN_FILTER_LIST_MASTER);
    if (stored && stored !== "undefined") {
      try {
        const cleanedStored  = stored.replace(/[\x00-\x1F\x7F]/g, '');
        const parsed = JSON.parse(JSON.parse(cleanedStored));
        this.filterMasterCache = parsed; // Cache in memory
        return parsed;
      } catch (error) {
        console.error('Error parsing cached filter master:', error);
      }
    }
    return null;
  }

  private processFilterData(data: any): any {
    data.forEach(filter1 => {
      filter1.count = 0;
      filter1.insightTwoFilter.forEach(filter2 => {
        if(filter2.json) {
          filter2.json = JSON.parse(filter2.json);
          
          // Clear pre-populated min/max values for minMax type filters
          // Keep minTemp/maxTemp as bounds for validation
          if (filter2.type === 'minMax') {
            // Store original values as temp bounds if not already set
            if (filter2.json.minTemp === undefined && filter2.json.min !== undefined) {
              filter2.json.minTemp = filter2.json.min;
            }
            if (filter2.json.maxTemp === undefined && filter2.json.max !== undefined) {
              filter2.json.maxTemp = filter2.json.max;
            }
            // Clear the actual min/max values so fields start empty
            filter2.json.min = null;
            filter2.json.max = null;
            filter2.json.count = 0;
          }
        }
      });
    });
    return data;
  }

  private saveToCache(filterListMaster: any): void {
    // Save to memory cache
    this.filterMasterCache = filterListMaster;

    // Save to storage
    this.commonService.setStorageAesEncryption(
      Constants.CLEAN_FILTER_LIST_MASTER,
      JSON.stringify(filterListMaster)
    );
  }

  // Optional: Clear cache when needed
  clearCache(): void {
    this.filterMasterCache = null;
  }
}
