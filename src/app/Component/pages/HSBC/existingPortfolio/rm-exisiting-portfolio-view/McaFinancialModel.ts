export interface FinancialYearData {
    salesRevenue: String;
    grossProfitMarginPer?: String | null;
    ebitdaMarginPer?: String | null;
    financeCost?: String | null;
    depriciation: Number;
    profitBeforeTax?: String | null;
    netProfit?: String | null;
    netWorth?: String | null;
    tetWorth?: String | null;
    totalCurrentLiabilities?: String | null;
    longTermBorrowings?: String | null;
    totalNoncurrentliabilities?: String | null;
    shortTermborrowing?: String | null;
    thortTermborrowing?: String | null;
    tradePayable?: String | null;
    totalNoncurrentSssets?: String | null;
    totalCurrentAssets?: String | null;
    currentInvestments?: String | null;
    inventories?: String | null;
    tradeReceivables?: String | null;
    cashAndCashBalance: String;
    ebitda?: String | null;
    operatingProfitMarginPer?: String | null;

    daysOfSalesOutstanding : String | null;
		payableDays : String | null;
		inventoryDays : String | null;
		netDebitBookEntity : String | null;
		netDebitEbitda : String | null;
		dscr : String | null;
		currentRatio : String | null;
		cashConversionCycle : String | null;
		interestCoverageRatio : String | null;

  }

  export interface YearsData {
    [year: string]: FinancialYearData;
  }

  export interface FinancialDataModel {
    nameOfAuditor: String;
    gstTurnoverBucket: String;
    gstTurnoverBucketUnit: String;
    dateOfBalanceSheet: String;
    balanceSheetUnit:String;
    profitAndLossUnit :String;
    gstTurnoverFY : String;
    spreadDownloadUrl : String;
    
    consolidatedGstTurnoverFY :String;
    consolidatedDateOfBalSheet: String;
    consolidatedGstTurnoverBucket:String;
    consolidatedGstTurnoverBucketUnit:String;

    standaloneFinancialYear: YearsData;
    consolidatedFinancialYear: YearsData;

  }
