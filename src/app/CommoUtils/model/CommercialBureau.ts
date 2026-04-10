import { PaginationSignal } from "./paginationSignal";

export interface SubTypeOfProductDetail {
  subProduct: any;
  subNoOfCreditFacility: any;
  subSanctionedAmountHsbc: any;
  subSanctionedAmountOther: any;
  subUtilizationHsbc: any | null;
  subUtilizationOther: any;
  subSanctionBy: any;
  subUtilizationBy: any;
}

export interface MainTypeWiseLatestSixMonthProductDetail {
  product: any;
  noOfCreditFacility: any;
  sanctionedAmountHsbc: any;
  sanctionedAmountOther: any;
  utilizationHsbc: any;
  utilizationOther: any;
  outStandingAmountOther : any;
  outStandingAmountHsbc: any;
  sanctionBy: any;
  utilizationBy: any;
  subTypeOfProductDetails: SubTypeOfProductDetail[];
  internalPagination: PaginationSignal;
}
