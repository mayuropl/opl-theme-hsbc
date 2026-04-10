import { Injectable } from '@angular/core';
import { Constants } from '../CommoUtils/constants';

@Injectable({ providedIn: 'root' })
export class ProspectsFilterStorageService {

  constants:any = Constants;
  constructor() { }

  readonly TAB_COUNT = 5;

  getFilterStorageKey(tabIndex: number): string {
    return `${this.constants.FILTER_LIST_MASTER_PROSPECTS}_${tabIndex}`;
  }

  clearAllFilterStates(): void {
    for (let i = 0; i < this.TAB_COUNT; i++) {
      localStorage.removeItem(this.getFilterStorageKey(i));
    }
  }

  saveFilter(tabIndex: number, filter: any): void {
    localStorage.setItem(this.getFilterStorageKey(tabIndex), JSON.stringify(filter));
  }

  loadFilter(tabIndex: number): any | null {
    const saved = localStorage.getItem(this.getFilterStorageKey(tabIndex));
    return saved ? JSON.parse(saved) : null;
  }
}
