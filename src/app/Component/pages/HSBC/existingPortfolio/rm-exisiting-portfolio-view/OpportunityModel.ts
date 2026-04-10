export interface Exim {
    totalExport: number | null;
    totalnoOfImportBills: number | null;
    totalNoOfExportBills: number | null;
    totalImport: number | null;
    itesexport: string;
    financialYear : string;
}

export interface Liabilities {
    currentAccountBalance: string;
    travelExpense: number | null;
    annualTax: string;
    annualSalary: string;
    fdi: number | null;
    odi: number | null;
    ebc: number | null;
    unbilledRF: number | null;
    expectedMonthlyChurnCredit: number;
    expectedMonthlyChurnDebit: number;
    fixedDepositAndShortTeamInvestments: string;
    interestIncome: string;
    yearlyDepositOpportunity: string;
    latestFY: String;
    liabilitiesUnit : String;

    fdiData : FdiData;
    odiData : OdiData;
    ecbData : EcbData;
    msmeOutstanding: number | null;
}

export interface FdiData {
  Date: string | null;
  foreignCollaborator: string | null;
  Country: string | null;
  Route: string;
  itemOfManufacture : string;
  fdiInflows : string;
}

export interface OdiData {
  Period: string | null;
  entityName: string | null;
  Type: string | null;
  Country: string | null;
  Activity: string | null;
  Equity: string | null;
  Loan: string | null;
  guaranteeIssued: string | null;
  Total: string | null;
}

export interface EcbData {
  RunCIN: string | null;
  Month: string | null;
  Purpose: string | null;
  Route: string | null;
  maturityPeriod: string | null;
  amountUsdMm: string | null;
  lenderCategory: string | null;
}


export interface Referral {
    noOfEmployees: number | null;
    directorRemuneration: string;
    homeLoans: string;
    loanAgainstProprty: string;
    cards: string;
}

export interface ExistingLendingDetails {
    totalOutstanding: number | null;
    totalSanctionAmt:number | null;
    dateOfReport: string | null;
    yourInstitution: string | null;
    otherInstitution: string | null;
    perOfHSBC: number | null;
    noOfproducts: number | null;
    productsNotWithHSBC: number | null;
    interstExpenseUnit: String;
    interstExpense: string;
    avgUtilisationFunBaseLimit: string;
    derrivedInterestRate: string;
}

export interface HsbcPreApprovedProd {
  applicationId: number | null;
  name: string | null;
  amount: string | null;
  dateOfApproval: string | null;
  status: string | null;
  riskFlag: string | null;
  eligibilityType : number | null;
}

export interface Opportunity {
    exim: Exim;
    liabilities: Liabilities;
    refferal: Referral;
    existingLendingDetails: ExistingLendingDetails;
    hsbcPreApprovedProd : HsbcPreApprovedProd[];
    hsbcRevenueCurrentYear : any;
    hsbcRevenueLastYear : any;
}
