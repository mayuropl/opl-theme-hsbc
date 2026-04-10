import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AesGcmEncryptionService } from '../common-services/aes-gcm-encryption.service';
import { staticDemoMockPayload } from './static-demo.mock';

function tryDecryptRequestBody(body: unknown): any {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const enc = (body as Record<string, unknown>)['data'];
  if (typeof enc !== 'string') {
    return undefined;
  }
  try {
    const json = AesGcmEncryptionService.getDecPayload(enc);
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}

@Injectable()
export class StaticDemoInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.staticDemo) {
      return next.handle(req);
    }

    if (this.shouldPassThrough(req)) {
      return next.handle(req);
    }

    const url = req.url;

    if (req.responseType === 'blob') {
      return of(
        new HttpResponse({
          status: 200,
          body: new Blob([], { type: 'application/octet-stream' }),
        })
      );
    }

    if (req.responseType === 'arraybuffer') {
      return of(new HttpResponse({ status: 200, body: new ArrayBuffer(0) }));
    }

    const decrypted =
      req.method === 'POST' || req.method === 'PUT' ? tryDecryptRequestBody(req.body) : undefined;
    const payload = staticDemoMockPayload(url, req.method, decrypted);

    if (this.usesPlainResponse(url)) {
      return of(new HttpResponse({ status: 200, body: payload }));
    }

    const u = url.toLowerCase();
    if (u.includes('/bsanalysis/uploadstatement') || u.includes('/bsanalysis/multi/saveaccdata')) {
      const body = {
        decrypted: AesGcmEncryptionService.getEncPayload(payload),
      };
      return of(new HttpResponse({ status: 200, body }));
    }

    const encBody = { encData: AesGcmEncryptionService.getEncPayload(payload) };
    return of(new HttpResponse({ status: 200, body: encBody }));
  }

  private shouldPassThrough(req: HttpRequest<unknown>): boolean {
    const u = req.url.toLowerCase();
    if (u.includes('/assets/') || u.includes('/i18n/') || u.includes('i18n')) {
      return true;
    }
    if (u.endsWith('.json') && !u.includes('/hsbc/')) {
      return true;
    }
    if (u.startsWith('https://fonts.') || u.includes('googleapis.com')) {
      return true;
    }
    if (u.includes('chrome-extension://')) {
      return true;
    }
    return false;
  }

  private usesPlainResponse(url: string): boolean {
    const u = url.toLowerCase();
    return (
      u.includes('/api/config/timeout') ||
      u.includes('/common/user/details') ||
      u.includes('gettokensforclient')
    );
  }
}
