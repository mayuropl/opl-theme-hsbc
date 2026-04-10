import { ShareholdingType} from "src/app/CommoUtils/constants";
import { PaginationSignal } from "src/app/CommoUtils/model/paginationSignal";

export interface ConnectedLendingDetails {
    CIN: String;
    connectedEntity: String;
    entityType: String;
    relatedThrough: String;
    dateOfAppointment: String;
    relationshipYears: String;
    linkageDetails: String;
  }

  export interface DirectorDetails {
    isCollapsed: Boolean;
    id: number;
    cin: String;
    din: String;
    age: String;
    pan : String
    displayPan:String;
    name: String;
    designation: String;
    dateOfAppointment: String;
    disqualifiedUs164Pdf: String;
    disqualifiedUs164Din: String;
    stakePercent: String;
    stakeYear: String;
    noOfDirectorships: number;
    contactNo: String;
    email: String;
    presentResidentialAddress: String;
    directorships : OtherDirectorship[];
    otherDirectorPagination: PaginationSignal;
    bureuFetchDate : String;
  }

  export interface CustomData {
    Nasscom: String;
    Startup: String;
    Exco: String;
    excoDate: String;
  }

  export interface OtherDirectorship {
    name: String;
    designation: String;
    dateOfAppointment: String;
  }

  export interface Shareholding {
    CIN: String;
    Year: String;
    Particular: String;
    particularType: ShareholdingType;
    No_of_Shares_Promoter: number;
    No_of_Shares_Public: number;
    No_of_Shares_total: number;
    holdingPercentPromoter: number;
    holdingPercentPublic: number;
    holdingPercentTotal: number;
    subShareHoldingPatterns:Shareholding[];
  }

  export interface RelatedEntities {
    CIN: String;
    RunCIN: String;
    Company: String;
    Related_CIN: string;
    Relation_Source: string;
    Agency: string;
    creditRating: string;
    Flags: string;
    FY: string;
    grossDebt: string;
    netDebtEbidta: string;
    openCharges: string;
    revenue: string;
    country: string ;// Mapping not available right now
    Related_Party_Address: string ;
    sharePer:string;
    // relatedPartyAddress: string ;
  }

  export interface ShareHoldingAndRelatedEntities {
    shareholding: Shareholding[];
  }

  export interface DetailedShareHoldingEntities {
    Designation : string;
    FY : string;
    Value :string;
    FY2 : string;
    Value2 :string;
    Shareholder : string;
  }
  export interface IndustryPeer {
    CIN: String;
    companyName: String; // Changed from "Company_Name (Rs.Cr)" to a simpler name
    Year: String;
    Age: String;
    Revenue: String;
    EBITDA: String;
    profitAfterTax: String;
    totalDebt: String;
    Rating: String;
  }

  export interface EximTop5Parties {
    eximId: Number;
    mappingId: Number;
    buyerName: String;
    country: String;
    percentageHsbc: Number;
    isHsbcPresence: Boolean;
  }


  export interface ApiTypeList {
    apiName: any;
    apiId: number;
    lastFetchedDate: Date;
    status: String;
    failedApiNames: String;
    // percentageHsbc: Number;
  }
