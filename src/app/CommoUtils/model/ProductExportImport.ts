import { PaginationSignal } from "./paginationSignal";

export interface CompanyData {
    id: number;
    name: string;
    ccnId: string;
    address: string;
    totalNoOfShipment: number;
    totalShipmentValue: number;
  }
  
  export interface ProductExportImport {
    hsnCode: string;
    description: string;
    totalValueUsd: number;
    customerShare: number;
    companyDataList: CompanyData[];
    isCollapsed: boolean;
    sorting: string;
    internalPagination: PaginationSignal;
  }