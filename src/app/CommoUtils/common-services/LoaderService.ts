import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class LoaderService {
    isLoading = new Subject<boolean>();
    isSubLoading = new Subject<boolean>();

    // Track if subloader is currently active to prevent main loader from showing
    private _isSubLoaderActive = false;

    // Getter to check if subloader is active (used by interceptor)
    get isSubLoaderActive(): boolean {
      return this._isSubLoaderActive;
    }

    constructor() {
      if (environment.staticDemo) {
        this._isSubLoaderActive = false;
        this.isLoading.next(false);
        this.isSubLoading.next(false);
      }
    }

    show() {
        if (environment.staticDemo) {
          return;
        }
        // Don't show main loader if subloader is active
        if (!this._isSubLoaderActive) {
            this.isLoading.next(true);
        }
    }
    hide() {
        this.isLoading.next(false);
    }

    subLoaderShow() {
      if (environment.staticDemo) {
        return;
      }
      this._isSubLoaderActive = true;
      // Hide main loader when subloader starts
      this.isLoading.next(false);
      this.isSubLoading.next(true);
    }

    subLoaderHide() {
      this._isSubLoaderActive = false;
      this.isSubLoading.next(false);
    }

    getSubLoaderFlag(): Observable<any>{
      return this.isSubLoading.asObservable();
    }

  }
