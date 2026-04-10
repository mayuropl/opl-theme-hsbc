import { Pipe, PipeTransform } from "@angular/core";
import { split } from "lodash";

@Pipe({
  name: "shortName"
})
export class ShortNamePipe implements PipeTransform {
  transform(fullName: string): any {
    if(fullName !== null && fullName !== undefined){
      return fullName.split(" ").map(n => n[0]).join("");
    } else {
      return fullName;
    }
     
  }
}
