export interface CustomerList{
  srNo: number;
  id:number,
  panNo: string;
  customerId: string;
  name: string;
  persona: string;
  region: string;
  segment: string;
  city:string;
  preApprovedProducts: string[];
  totalOpportunity: string;
  cuaWallet: number;
  taxAndSalWallet: number;
  churnWallet: number;
  eximCountWallet: number;
  eximVolumeWallet: number;
  lendingOutstandingWallet: number;
  lendingProductWallet: number;
  noOfProductInLending: number; // Number of Products in Lending
  bbMmeLcReferrals: number; // BB/MME/LC Referrals
  gbIsbReferrals: number; // GB ISB Referrals
  crossBorderReferrals: number; // Cross Border Referrals
  uboDirectorSalaryWallet: number; // UBO/Director Salary Wallet
  employeeSalaryWallet: number; // Employee Salary Wallet
  uboLoansWallet: number; // UBO Loans Wallet
  totalRevenueWallet: number; // Total Revenue Wallet
  preApproved: string[];
  cin:string;
  rmId:string;
  isMcaFetched:boolean;
  customerType:string;
  scope:string;
  globalRm:string;
  country:string;
  parentCompanyName:string;
  subsidiary:string
  subsidiaryCountry:string;
  customerTypeStr:string;
  // for ECB, FDI, ODI
  pan: string;
  company: string;
  month: string;
  purpose: string;
  route: string;
  maturityPeriod: string;
  usdAmount: string;
  period: string;
  entityName: string;
  type: string;
  countryName: string;
  total: string;
  foreignCollaborator: string;
  lenderCategory: string;
  disableAssignButtonForSharedrm: boolean;
  campaignName: string;
  assignmentSource?: string;
  assignedBy?: string;


}
