import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  constructor() { }

  paginate(array: any[], page_size: number, page_number: number): any[] {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }
}
