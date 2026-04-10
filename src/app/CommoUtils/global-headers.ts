import {MsmeService} from "../services/msme.service";
import {inject, Injector, runInInjectionContext} from "@angular/core";

export const GlobalHeaders: { [key: string]: string } = {
  'x-path-url': '',
  'x-api-url': '',
  'x-main-page': '',
  'x-sub-page': '',
  'x-page-action': '',
  'x-page-data': '',
};

export function resetGlobalHeaders(): void {
  Object.keys(GlobalHeaders).forEach((key) => {
    GlobalHeaders[key] = ''; // Reset each value to an empty string
  });
}

export function clearCookie() {
  document.cookie.split(';').forEach(
    (cookie) => {
      document.cookie = cookie.replace(/^ +/, '')
        .replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/');
    });
}


let globalInjector: Injector; // Store global injector instance

export function setGlobalInjector(injector: Injector) {
  globalInjector = injector; // Assign injector globally
}

export function saveActivity(fn?: () => void) {
  if (!globalInjector) {
    console.error('Injector is not set. Call setGlobalInjector() in AppModule.');
    return;
  }

  const msmeService = globalInjector.get(MsmeService); // Get service from global injector

  msmeService.saveUserActivity().subscribe(
    (response: any) => {
   //   console.log(response.status === 200 ? response : response.message);
    },
    (error) => {
      console.error('Upload failed', error);
    }
  );

  if (fn) {
    fn(); // Execute callback if provided
  }
}


