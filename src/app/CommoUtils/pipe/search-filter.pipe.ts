import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
    standalone: true
})
export class SearchFilterPipe implements PipeTransform {
  transform(items: any[], searchTerm: string): any[] {
    if (!items) return [];
    if (!searchTerm) return items;

    searchTerm = searchTerm.toLowerCase();

    return items.filter(item =>
      item.customerName.toLowerCase().includes(searchTerm)
    );
  }
}
