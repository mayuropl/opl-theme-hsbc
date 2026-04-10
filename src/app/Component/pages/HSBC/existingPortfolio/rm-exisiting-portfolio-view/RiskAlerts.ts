import { List } from "src/app/Component/shared/ui/emaillist/email-list.model";

export interface NonFinancialData {
  id: Number;
  CIN: String;
  Score: String;
  Date: string;
  Subject: String;
  URL: String;
  Type: String;
  Comment: String;
  actionRequired: Boolean;
  actionedClosed: Boolean;
  ragStatus: Boolean;
  isActionRequired: Boolean;
  isActionedClosed: Boolean;
  alertModuleMasterName: String;
  alertModuleMasterId: number;
  alertParameterMasterId: number;
  category: string;
  categoryId: number;
  status: number;
  pan: string;
  severity: string;
  severityId : number;
  alertCategoryMasterList:Array<master>;
  alertSeverityMasterList:Array<master>;
  submittedRemark:string;
  submittedByName:string;
  submittedDate:Date;
  completedRemark:string;
  completedByName:string;
  completedDate:Date;
}

export interface master {
  id:number;
  type:string;
}
