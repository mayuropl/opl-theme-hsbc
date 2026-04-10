import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customSort',
  standalone:true
})
export class CustomSortPipe implements PipeTransform {
  transform(array: any[], field: string, reverse: boolean = false): any[] {
    if (!Array.isArray(array) || array.length <= 1) {
      return array;
    }

    // Check if the field is valid for sorting
    if (!field || typeof array[0][field] === 'undefined') {
      console.warn(`Invalid field '${field}' for sorting. Sorting by default order.`);
      return array;
    }

    // Perform sorting
    array.sort((a: any, b: any) => {
      let aValue = a[field];
      let bValue = b[field];

      // Handle case insensitivity for string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return reverse ? 1 : -1;
      } else if (aValue > bValue) {
        return reverse ? -1 : 1;
      } else {
        return 0;
      }
    });

    return array;
  }
}
