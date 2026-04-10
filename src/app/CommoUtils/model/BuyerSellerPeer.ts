import { PaginationSignal } from "./paginationSignal";

export interface BuyerSellerPeer {
  buyerName: string;
  sorting: string;
  isCollapsed?: boolean;
  totalNumberOfShipments:number;
  totalShipmentValue:number;
  parentCompany: string;
  parentCompanyAddress: string;
  address: string;
  mappingDataList:mappingDataList[];
  internalPagination: PaginationSignal;
  searchByProductId:string
}

export interface mappingDataList {
  id: number;
  name: string;
  ccnId: string;
  noOfShipments: string;
  address: string;
  hsnData: HSNData[];
  valueUsd: number;
}

export interface HSNData {
  hsnId: number;
  hsnCode: string | null;
  hsnValue: number;
  hsnDescription: string;
}
export interface SearchByAnchor {
  nameOfCompetitor: string;
  ccnId:string;
  noOfShipment: number;
  shipmentValue:number;
}
