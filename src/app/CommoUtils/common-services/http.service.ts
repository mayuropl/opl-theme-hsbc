import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { CommonService } from './common.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { AesGcmEncryptionService } from './aes-gcm-encryption.service';
import { GlobalHeaders } from '../global-headers';


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient, private loaderService: LoaderService, private commonService: CommonService) { }

  /**
   * For Post service url with data
   */
  header = new HttpHeaders();

  postupload(url: string, data: any, ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    this.loaderService.show();
    if (ignoreLoader !== undefined && !ignoreLoader) {
      this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
      return this.http.post(url, data, { headers: this.header }).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    } else {
      return this.http.post(url, data).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); ; // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    }
  }

  post(url: string, data: any, ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    if(ignoreLoader == undefined){
      ignoreLoader = false;
    }
    if (ignoreLoader !== undefined && !ignoreLoader) {
      this.loaderService.show();
      this.header = this.header.set('ignoreLoader', ignoreLoader.toString());
      // return this.http.post(url, data, { headers: this.header }).pipe(
      //   catchError((err: HttpErrorResponse) => {
      //     return this.commonService.errorHandle(err.status,err.message);
      //   }));
      return this.http.post(url, this.encryptedObject(data), { headers: this.header }).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    } else {
      this.header = this.header.set('ignoreLoader', ignoreLoader.toString());
      return this.http.post(url, this.encryptedObject(data), { headers: this.header }).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));

      // return this.http.post(url, data).pipe(
      //   catchError((err: HttpErrorResponse) => {
      //     return this.commonService.errorHandle(err.status,err.message);
      //   }));
    }
  }

  postEncrypted(url: string, data: any, ignoreLoader?: boolean,userId?: any) {
    GlobalHeaders['x-api-url'] = url;
    if(userId){
      this.header = this.header.set('userId', userId);
    }else{
      this.header.delete('userId');
    }


    if(ignoreLoader == undefined){
      ignoreLoader = false;
    }

    if (!ignoreLoader) {
      this.loaderService.show();
      this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
      return this.http.post(url, this.encryptedObject(data), { headers: this.header }).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    } else {
      return this.http.post(url, this.encryptedObject(data)).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));

      // return this.http.post(url, data).pipe(
      //   catchError((err: HttpErrorResponse) => {
      //     return this.commonService.errorHandle(err.status,err.message);
      //   }));
    }
  }

  postForUser(url: string, data: any, ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    if (ignoreLoader !== undefined && !ignoreLoader) {
      this.loaderService.show();
      this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
      return this.http.post(url, data, { headers: this.header }).pipe(
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    } else {

      return this.http.post(url, data).pipe(
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    }
  }

  encryptedObject(data) {
    return { data: AesGcmEncryptionService.getEncPayload(data) };
  }

  /**
   * for get method call
   */
  get(url: any, responseType: any, ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    if(ignoreLoader == undefined){
      ignoreLoader = false;
    }
    if (responseType === true) {
      if (!ignoreLoader) {
        this.header = this.header.set('ignoreLoader', ignoreLoader.toString());
        return this.http.get(url, { responseType: 'arraybuffer', headers: this.header }).pipe(
          map(response => {
            return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      } else {
        return this.http.get(url, { responseType: 'arraybuffer' }).pipe(
          map(response => {
            return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      }
    } else {
      if (ignoreLoader) {
        this.header = this.header.set('ignoreLoader', ignoreLoader.toString());
        return this.http.get(url, { headers: this.header }).pipe(
          map(response => {
            return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      } else {
        this.loaderService.show();
        this.header = this.header.set('ignoreLoader', ignoreLoader.toString());
        return this.http.get(url).pipe(
          map(response => {
            return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      }
    }
  }

  getEncrypted(url: any, responseType: any, ignoreLoader?: boolean,userId?: any) {
    GlobalHeaders['x-api-url'] = url;
    if(userId){
      this.header = this.header.set('userId', userId);
    }else{
      this.header.delete('userId');
    }
    if(ignoreLoader == undefined){
      ignoreLoader = false;
    }
    if (responseType === true) {
      if (ignoreLoader !== undefined && !ignoreLoader) {
        this.loaderService.show();
        this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
        return this.http.get(url, { responseType: 'arraybuffer', headers: this.header }).pipe(
          map(response => {
            return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      } else {
        return this.http.get(url, { responseType: 'arraybuffer' }).pipe(
          map(response => {
            return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      }
    } else {
      if (ignoreLoader !== undefined && !ignoreLoader) {
        this.loaderService.show();
        this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
        return this.http.get(url, { headers: this.header }).pipe(
          map(response => {
            return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      } else {
        return this.http.get(url).pipe(
          map(response => {
            return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      }
    }
  }

  getForUser(url: any, responseType: any, ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    if (responseType === true) {
      if (ignoreLoader !== undefined && !ignoreLoader) {
        this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
        return this.http.get(url, { responseType: 'arraybuffer', headers: this.header }).pipe(
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      } else {
        return this.http.get(url, { responseType: 'arraybuffer' }).pipe(
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      }
    } else {
      if (ignoreLoader !== undefined && !ignoreLoader) {
        this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
        return this.http.get(url, { headers: this.header }).pipe(
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      } else {
        this.loaderService.show();
        return this.http.get(url).pipe(
          catchError((err: HttpErrorResponse) => {
            console.log(err);

            return this.commonService.errorHandle(err.status,err.message);
          }));
      }
    }
  }

  /**
   * for delete method call
   */
  delete(url: any, ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    if (ignoreLoader !== undefined && !ignoreLoader) {
      this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
      return this.http.delete(url, { headers: this.header }).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    } else {
      this.loaderService.show();
      return this.http.delete(url).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    }
  }

  /**
   * For put method call
   */
  put(url: string, data: any, ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    if (ignoreLoader !== undefined && !ignoreLoader) {
      this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
      return this.http.put(url, this.encryptedObject(data), { headers: this.header }).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          console.log("error in post method : ", err);
          return this.commonService.errorHandle(err.status,err.message);
        }));
    } else {
      this.loaderService.show();
      return this.http.put(url, this.encryptedObject(data)).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          console.log("error in post method11 : ", err);
          return this.commonService.errorHandle(err.status,err.message);
        }));
    }
  }

  upload(url: string, formData: any) {
    GlobalHeaders['x-api-url'] = url;
    const headersData = new HttpHeaders({ 'Content-Type': 'multipart/form-data', enctype: 'multipart/form-data' });
    return this.http.post(url, formData, { reportProgress: true, observe: 'events', headers: headersData }).pipe(
      map(response => {
        console.log('')
        console.log('')
        console.log('RESPONSE FOR GET METHOD :', response)
        console.log('')
        console.log('')
        return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
      }),
      catchError((err: HttpErrorResponse) => {
        return this.commonService.errorHandle(err.status,err.message);
      }));
  }

  downloadFilesGetMethod(url) {
    GlobalHeaders['x-api-url'] = url;
    this.loaderService.show();
    return this.http.get(url, { responseType: 'blob', headers: new HttpHeaders().append('Content-Type', 'application/json') }).pipe(
      map(response => {
        console.log('')
        console.log('')
        console.log('RESPONSE FOR GET METHOD :', response)
        console.log('')
        console.log('')
        return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
      }),
      catchError((err: HttpErrorResponse) => {
        return this.commonService.errorHandle(err.status,err.message);
      }));;
  }

  downloadReport(url, data,ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    if (ignoreLoader !== undefined && !ignoreLoader) {
      this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
      return this.http.post(url, data, {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      });
    }else{
      this.loaderService.show();
      return this.http.post(url, data, {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      });
    }
    // return this.http.post(url, data, {
    //   responseType: 'blob',
    //   headers: new HttpHeaders().append('Content-Type', 'application/json')
    // });
  }
  postForDownload(url, data,ignoreLoader?: boolean) {
    GlobalHeaders['x-api-url'] = url;
    if (ignoreLoader !== undefined && !ignoreLoader) {
      this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
      return this.http.post(url, this.encryptedObject(data), {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      });
    }else{
      this.loaderService.show();
      return this.http.post(url, this.encryptedObject(data), {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      });
    }
  }
  postNew(url: string, responseType: any, data: any, ignoreLoader?: string | string[]) {
    GlobalHeaders['x-api-url'] = url;
    if (responseType === true) {
      if (ignoreLoader) {
        this.header = this.header.append('ignoreLoader', ignoreLoader);
        return this.http.post(url, this.encryptedObject(data), {responseType: 'arraybuffer', headers: this.header }).pipe(
          catchError((err: HttpErrorResponse) => {
            return this.commonService.errorHandle(err.status,err.message);
          }));
      } else {
        this.loaderService.show();
        return this.http.post(url, this.encryptedObject(data), { responseType: 'arraybuffer' }).pipe(
          // map(response => {
          //   return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          // }),
          catchError((err: HttpErrorResponse) => {
            return this.commonService.errorHandle(err.status,err.message);
          }));
      }
    } else {
      if (ignoreLoader) {
        this.header = this.header.append('ignoreLoader', ignoreLoader);
        return this.http.post(url, this.encryptedObject(data), { headers: this.header }).pipe(
          // map(response => {
          //   return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          // }),
          catchError((err: HttpErrorResponse) => {
            return this.commonService.errorHandle(err.status,err.message);
          }));
      } else {
        this.loaderService.show();
        return this.http.post(url, this.encryptedObject(data)).pipe(
          // map(response => {
          //   return JSON.parse(AesGcmEncryptionService.getDecPayload(response['encData'])); // kind of useless
          // }),
          catchError((err: HttpErrorResponse) => {
            return this.commonService.errorHandle(err.status,err.message);
          }));
      }
    }
  }

  postReqIsDecrypted(url: string, data: any, ignoreLoader?: boolean, userId?: any) {
    GlobalHeaders['x-api-url'] = url;
    this.header = new HttpHeaders();
    this.header = this.header.set('is_decrypt', 'false');
    if (userId) {
      this.header = this.header.set('userId', userId);
    } else {
      this.header.delete('userId');
    }
    if (ignoreLoader !== undefined && !ignoreLoader) {
      this.header = this.header.append('ignoreLoader', ignoreLoader.toString());
      return this.http.post(url, data, { headers: this.header }).pipe(
        map(response => {
          return JSON.parse(AesGcmEncryptionService.getDecPayload(response['decrypted'])); // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    } else {
      this.loaderService.show();
      return this.http.post(url, data, { headers: this.header }).pipe(
        map(response => {
          return response; // kind of useless
        }),
        catchError((err: HttpErrorResponse) => {
          return this.commonService.errorHandle(err.status,err.message);
        }));
    }
  }

  downloadStreamData(url, data) {
    return this.http.post(url, data, {
      responseType: 'blob',
         });
  }

  downloadStreamDataForAllTypes(url, data) {
    return this.http.post(url, data, {
      responseType: 'blob',observe: 'response'
   });
  }

}
