import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '../common-services/common.service';

@Pipe({
  name: 'panFormat',
  standalone: true
})
export class PanFormatPipe implements PipeTransform {

  constructor(private commonService: CommonService) {}

  transform(pan: string): string {
    if (!pan) {
      return 'NA';
    }
    return this.commonService.formatPan(pan);
  }

}
