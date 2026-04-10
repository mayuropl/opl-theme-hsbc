export interface TradingName {
  optionName: String;
  optionValue: String | null;
  selected:Boolean;
}

export interface CreditRating {
  optionName: String;
  optionValue: String | null;
  selected:Boolean;
}

export interface Industry {
  optionName: String;
  optionValue: String | null;
  selected:Boolean;
}

export interface Sector {
  optionName: String;
  optionValue: String | null;
  selected:Boolean;
}

export interface Turnover {
  optionName: String;
  optionValue: String | null;
  selected:Boolean;
}

export interface BusinessAddress {
  optionName: String;
  optionValue: String | null;
  selected:Boolean;
}

export interface Constitutions {
  optionName: String;
  optionValue: String | null;
  selected:Boolean;
}

export interface ContactPerson {
  selectType: String;
  contactPersonName: String;
  mobile: String | null;
  email: String;
  selected:Boolean;
}

export interface firmDatailsModel {
  tradingNames: TradingName[];
  cin: String;
  tradingNameFromCustomer: string;
  dateOfIncorporation: String;
  constitution: String;
  persona: String;
  noOfEmployees: String;
  pan: String;
  displayPan : String;
  leiNumber: String;
  leiExpiry: String;
  activeGSTIN: String;
  inactiveAndCancelledGSTIN: String;
  activeGstInList:String[];
  inAtiveGstInList:String[];
  udyamNoCertificate: String;
  iecNumber: String;
  msme: String;
  udyamMsmeStatus: String;
  udyamCategory: String;
  udyamFetchDate:any;
  udhyamCertificateRefId: String;
  existingLenders: String;
  // latestCreditRating: CreditRating[];
  ratingDate: String;
  ratingAgency: String;
  creditRatingProxy: RatingDetail[];
  industry: Industry[];
  sector: Sector[];
  turnover: Turnover[];
  businessAddress: BusinessAddress[];
  constitutions: Constitutions[];
  contactPersonName: ContactPerson[];
  mcaTurnoverUnit : String;
  mcaTurnoverFY : string;
  agriPSL : string;
  startupPSL : string;
  alertCountData: any;
  timeWithHsbc : any;
  cddRating: any;
  cddReviewDate : string;
  limitReviewDate: any;
  crr : any;
  latestCreditRating: any;
  bureauCmrScore : any;
  lastApprovalDate: any;
  customerId: string;
  rmName: string;
  efillingStatus:any;
  childCustomers: ChildCustomerMapping[];

}

export interface RatingDetail {
  CIN: String;
  ratingDate: String;
  Agency: String;
  Instrument_Category: String;
  Instrument_Detail: String;
  Amount: String;
  Rating: String;
  Development: String;
  Outlook: String;
  Link: String;
  Unit: String;
}

export interface ChildCustomerMapping {
  parentCustomerId: string;
  childCustomerId: string;
  childCustomerName: string;
}
