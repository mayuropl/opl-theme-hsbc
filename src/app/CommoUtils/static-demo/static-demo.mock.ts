/**
 * Mock API payloads for static demo (decrypted object — interceptor wraps with encData where needed).
 */

export function staticDemoMockPayload(url: string, method: string, reqBody?: any): unknown {
  const u = url.toLowerCase();

  if (u.includes('/api/config/timeout')) {
    return { timeout: 86400 };
  }

  if (u.includes('logoutuser') || (u.includes('/logout') && u.includes('user'))) {
    return { status: 200, message: 'OK' };
  }

  if (u.includes('saveuseractivity')) {
    return { status: 200, message: 'OK' };
  }

  if (u.includes('getcommercialcibilbulkuploadshowflag')) {
    return { status: 200, flag: false, message: 'OK' };
  }

  if (u.includes('top-bar-filters')) {
    return { status: 200, data: topBarPayload(), message: 'OK' };
  }

  if (u.includes('getrmdatabycities')) {
    return { status: 200, data: topBarPayload(), message: 'OK' };
  }

  if (u.includes('get-cusotmer') || u.includes('get-customer')) {
    return mockGetCustomerResponse(reqBody);
  }

  if (u.includes('insightfilter')) {
    return { status: 200, data: insightFilterList(), message: 'OK' };
  }

  if (u.includes('gethsbchodashboarddetails') || u.includes('gethsbchodashboarddetailsv2')) {
    const list = demoRmDashboardListData();
    return {
      status: 200,
      message: 'OK',
      listData: list,
      data: list.length,
      summary: {
        inProcess: 2,
        completed: 4,
        totalLimit: '12.5 Cr',
      },
    };
  }

  if (u.includes('get_general_audit_log') || u.includes('general_audit_log')) {
    const rows = demoAuditLogRows();
    return {
      status: 200,
      message: 'OK',
      data: {
        body: { data: rows, totalSize: rows.length },
        length: rows.length,
      },
    };
  }

  if (u.includes('getuserlistbysp') || u.includes('getuserlist')) {
    const list = demoBankUserRows();
    return { status: 200, message: 'OK', listData: list, data: list.length };
  }

  if (u.includes('getcampaigndetails')) {
    return {
      status: 200,
      message: 'OK',
      data: demoCampaignDetails(),
    };
  }

  if (u.includes('getopportunitydashboarddata')) {
    const data = demoOpportunityDashboardInner();
    return {
      status: 200,
      message: 'OK',
      data,
    };
  }

  if (u.includes('fetch-filter-data')) {
    return {
      status: 200,
      message: 'OK',
      data: {
        loanTopBarData: {
          filters: [
            {
              topBarFilterType: 'CITY',
              options: [{ name: 'Mumbai' }, { name: 'Delhi' }, { name: 'Bengaluru' }],
            },
            {
              topBarFilterType: 'SEGMENT',
              options: [{ name: 'SME' }, { name: 'Mid-Market' }, { name: 'Corporate' }],
            },
          ],
        },
      },
    };
  }

  if (u.includes('parent-country') && !u.includes('paginated')) {
    return {
      status: 200,
      message: 'OK',
      data: [
        { name: 'India', value: 'IN' },
        { name: 'United Kingdom', value: 'GB' },
        { name: 'Singapore', value: 'SG' },
      ],
    };
  }

  if (u.includes('parent-company/paginated')) {
    return {
      status: 200,
      content: [
        { name: 'Demo Parent Alpha', value: 'PARENT-DEMO-1' },
        { name: 'Demo Parent Beta', value: 'PARENT-DEMO-2' },
      ],
      hasMore: false,
      totalElements: 2,
      page: 0,
      size: 50,
      message: 'OK',
    };
  }

  if (u.includes('search-parent-company')) {
    return {
      status: 200,
      data: {
        content: [
          { name: 'Demo Parent Alpha', value: 'PARENT-DEMO-1' },
          { name: 'Demo Parent Beta', value: 'PARENT-DEMO-2' },
        ],
        hasMore: false,
        totalElements: 2,
        page: 0,
        size: 50,
      },
      message: 'OK',
    };
  }

  if (u.includes('getsaverisksearchdetails')) {
    return {
      status: 200,
      data: [
        {
          companyName: 'Acme Manufacturing Pvt Ltd',
          cin: 'L25200MH1995PLC085963',
          pan: 'AABCD1234E',
        },
      ],
      message: 'OK',
    };
  }

  if (u.includes('saveindividualgst') && u.includes('saverisk')) {
    return {
      status: 200,
      data: {
        pan: 'AABCD1234E',
        cin: 'L25200MH1995PLC085963',
        type: 'etb',
        companyName: 'Acme Manufacturing Pvt Ltd',
        rmId: 'RM001',
        scope: 'active',
      },
      message: 'OK',
    };
  }

  if (u.includes('gettokensforclient')) {
    return { access_token: 'demo', refresh_token: 'demo' };
  }

  if (u.includes('/common/user/details')) {
    return { userName: 'Demo Banker', userId: 1, email: 'demo.user@example.com' };
  }

  const broad = extraStaticDemoMocks(u, method, reqBody);
  if (broad !== undefined) {
    return broad;
  }

  if (method === 'GET') {
    return demoOmniGetResponse();
  }

  return defaultPostTableMock(url);
}

function mockGetCustomerResponse(reqBody: any): unknown {
  const ct = mapCustomerTypeFromRequest(reqBody);
  const base = dummyCustomers();
  const inner = {
    ...base,
    data: base.data.map((row: any) => ({ ...row, customerType: ct })),
  };
  const isNew = reqBody?.isNewFilter !== false;

  if (isNew) {
    return {
      status: 200,
      data: JSON.stringify(inner),
      message: 'OK',
      map: { customerType: mapCustomerTypeFromRequest(reqBody) },
    };
  }

  const wrapped = {
    data: JSON.stringify(inner.data),
    counts: inner.counts,
  };
  return {
    status: 200,
    data: { result: JSON.stringify(wrapped) },
    message: 'OK',
    map: { customerType: mapCustomerTypeFromRequest(reqBody) },
  };
}

function mapCustomerTypeFromRequest(reqBody: any): number {
  const t = (reqBody?.type || '').toString().toUpperCase();
  if (t === 'TARGET') {
    return 2;
  }
  if (t === 'PROSPECT' || t === 'PROSPECTS') {
    return 3;
  }
  if (t === 'FDI') {
    return 4;
  }
  if (t === 'ODI') {
    return 5;
  }
  if (t === 'ECB') {
    return 6;
  }
  return 1;
}

function defaultPostTableMock(url: string): unknown {
  void url;
  return demoOmniPostResponse();
}

const PR_DATASET_NAMES = [
  'lending_analysis',
  'trends_of_lending',
  'segment_level_opportunity',
  'product_level_chart',
  'product_level_opportunity',
  'customer_level_opportunity',
  'customer_level_opportunity_total_rows',
  'particular_product_wise_customer_level_total_rows',
  'customer_level_wallet_chart',
  'particular_customer_wise_product_level',
  'particular_product_wise_customer_level',
  'product_level_opportunity_fetch_excel',
  'customer_level_opportunity_fetch_excel',
  'insights_analysis',
  'report_query',
  'report_total_rows_query',
  /** Totals / drill-down datasets referenced by wallet dashboard but omitted earlier */
  'product_level_opportunity_total_rows',
  'particular_customer_wise_product_level_total_rows',
] as const;

function demoPrDatasetList(): Array<{ dataset_id: number; dataset_name: string }> {
  return PR_DATASET_NAMES.map((dataset_name, i) => ({ dataset_id: 500 + i, dataset_name }));
}

function demoPrDatasetId(name: string): number | undefined {
  return demoPrDatasetList().find((d) => d.dataset_name === name)?.dataset_id;
}

/**
 * Date option *values* must match `report_month` on trend rows so `dateOfReportMap` resolves x-axis labels.
 * Order: latest first (matches `setupSearchByMenu` / top bar default).
 */
const DEMO_PR_DATE_OF_REPORT_OPTS = [
  { key: 'Jan 2026', value: '2026-01-31' },
  { key: 'Dec 2025', value: '2025-12-31' },
  { key: 'Nov 2025', value: '2025-11-30' },
  { key: 'Oct 2025', value: '2025-10-31' },
  { key: 'Sep 2025', value: '2025-09-30' },
  { key: 'Aug 2025', value: '2025-08-31' },
] as const;

/** Chronological (oldest → newest) for trend / wallet series — same values as date filter. */
const DEMO_PR_TREND_MONTH_VALUES: string[] = [...DEMO_PR_DATE_OF_REPORT_OPTS].reverse().map((o) => o.value);

function demoPrFiltersMinimal(): any[] {
  const opt = (pairs: { key: string; value: string }[]) =>
    pairs.map((p) => ({ key: p.key, value: p.value, name: p.value }));

  return [
    {
      filter_name: 'date_of_report',
      filter_label: 'Date of Report',
      options: opt([...DEMO_PR_DATE_OF_REPORT_OPTS]),
    },
    {
      filter_name: 'crif_date_of_report',
      filter_label: 'CRIF Date of Report',
      options: opt([...DEMO_PR_DATE_OF_REPORT_OPTS]),
    },
    {
      filter_name: 'product_type',
      filter_label: 'Product Type',
      options: opt([
        { key: 'ALL', value: 'ALL' },
        { key: 'Working Capital', value: 'Working Capital' },
        { key: 'Trade Finance', value: 'Trade Finance' },
      ]),
    },
    {
      filter_name: 'product_sub_type',
      filter_label: 'Product Sub Type',
      options: [
        {
          parent_id: 'ALL',
          group_name: 'All',
          options: [{ label: 'ALL', value: 'ALL' }],
        },
        {
          parent_id: 'Working Capital',
          group_name: 'Working Capital',
          options: [
            { label: 'Funded', value: 'Funded' },
            { label: 'Non-funded', value: 'Non-funded' },
          ],
        },
        {
          parent_id: 'Trade Finance',
          group_name: 'Trade Finance',
          options: [
            { label: 'Funded', value: 'TF_Funded' },
            { label: 'Non-funded', value: 'TF_Non-funded' },
          ],
        },
      ],
    },
    {
      filter_name: 'bureau',
      filter_label: 'Bureau',
      options: opt([
        { key: 'CIBIL', value: 'CIBIL' },
        { key: 'CRIF', value: 'CRIF' },
      ]),
    },
    {
      filter_name: 'utilization_wallet_pct',
      filter_label: 'Utilization Wallet %',
      options: opt([
        { key: 'ALL', value: 'ALL' },
        { key: '0-25', value: '0-25' },
        { key: '25-50', value: '25-50' },
      ]),
    },
    {
      filter_name: 'cmr',
      filter_label: 'CMR',
      options: opt([
        { key: 'ALL', value: 'ALL' },
        { key: 'CMR1', value: 'CMR1' },
        { key: 'CMR2', value: 'CMR2' },
      ]),
    },
    {
      filter_name: 'crif_cmr',
      filter_label: 'CRIF CMR',
      options: opt([
        { key: 'ALL', value: 'ALL' },
        { key: 'CMR1', value: 'CMR1' },
      ]),
    },
    {
      filter_name: 'psl_status',
      filter_label: 'PSL Status',
      options: opt([
        { key: 'ALL', value: 'ALL' },
        { key: 'PSL', value: 'PSL' },
        { key: 'Non-PSL', value: 'Non-PSL' },
      ]),
    },
    {
      filter_name: 'which_level',
      filter_label: 'Which Level',
      options: opt([
        { key: 'Level 1', value: 'Level 1' },
        { key: 'Level 2', value: 'Level 2' },
      ]),
    },
    {
      filter_name: 'gain_or_loss',
      filter_label: 'Gain or Loss',
      options: opt([
        { key: 'Gain', value: 'Gain' },
        { key: 'Loss', value: 'Loss' },
      ]),
    },
    /** Comparison tab top bar (`setupTopBarFilterC`) */
    {
      filter_name: 'calculation_on',
      filter_label: 'Calculation On',
      options: opt([
        { key: 'Sanction', value: '1' },
        { key: 'Utilization', value: '2' },
      ]),
    },
    {
      filter_name: 'wallet',
      filter_label: 'Wallet',
      options: opt([
        { key: 'Bucket 1', value: '1' },
        { key: 'Bucket 2', value: '2' },
        { key: 'Bucket 3', value: '3' },
      ]),
    },
  ];
}

function demoPrLendingAnalysisRow(): Record<string, unknown> {
  return {
    unique_cust_count: 1284,
    competition_sanction: 452.3,
    hsbc_sanction: 320.8,
    competition_utilization: 280.5,
    competition_utilization_pct: 62.0,
    hsbc_utilization: 195.2,
    hsbc_utilization_pct: 60.8,
    hsbc_wallet_utilization_pct: 58.4,
    million_values: [],
    billion_values: [],
    absolute_values: [],
  };
}

function demoPrTrendsRow(i: number): Record<string, unknown> {
  const report_month = DEMO_PR_TREND_MONTH_VALUES[i % DEMO_PR_TREND_MONTH_VALUES.length];
  return {
    report_month,
    unique_cust_count: 200 + i * 15,
    hsbc_sanction: 50 + i * 5,
    competition_sanction: 48 + i * 4.5,
    hsbc_wallet_sanction_pct: 12 + i * 0.5,
    hsbc_utilization: 40 + i * 4,
    competition_utilization: 38 + i * 3.8,
    hsbc_wallet_utilization_pct: 10 + i * 0.4,
  };
}

function demoPrSegmentRow(i: number): Record<string, unknown> {
  return {
    segment_name: ['SME', 'Mid-Market', 'Corporate'][i % 3],
    unique_cust_count: 300 + i * 20,
    competition_utilization: 120 + i * 10,
    hsbc_utilization: 95 + i * 8,
    hsbc_wallet_utilization_pct: 35 + i,
  };
}

/** Bar chart on PR / Lending wallet dashboard (`product_level_chart` dataset). */
function demoPrProductLevelChartRows(): Record<string, unknown>[] {
  return [
    {
      product_id: 1,
      product_name: 'Working Capital',
      competition_utilization: 120,
      hsbc_competition_utilization: 85,
      hsbc_wallet_utilization_pct: 41.5,
    },
    {
      product_id: 2,
      product_name: 'Trade Finance',
      competition_utilization: 95,
      hsbc_competition_utilization: 72,
      hsbc_wallet_utilization_pct: 43.1,
    },
    {
      product_id: 3,
      product_name: 'Term Loan',
      competition_utilization: 78,
      hsbc_competition_utilization: 55,
      hsbc_wallet_utilization_pct: 41.4,
    },
    {
      product_id: 4,
      product_name: 'FX & Treasury',
      competition_utilization: 42,
      hsbc_competition_utilization: 30,
      hsbc_wallet_utilization_pct: 41.7,
    },
  ];
}

/** Pie chart segments for customer-level wallet (`customer_level_wallet_chart` dataset). */
function demoPrCustomerLevelWalletRows(): Record<string, unknown>[] {
  return [
    { display_name: 'Only Competition (0%)', unique_cust_count: 42, total_utilization: 28.5 },
    { display_name: 'Low (>0 % - 25%)', unique_cust_count: 118, total_utilization: 95.2 },
    { display_name: 'Competitive (25.01% - 50%)', unique_cust_count: 86, total_utilization: 112.4 },
    { display_name: 'Strong (50.01% - 75%)', unique_cust_count: 64, total_utilization: 88.1 },
    { display_name: 'Dominant (75.01% - <100%)', unique_cust_count: 31, total_utilization: 52.3 },
    { display_name: 'Sole (100%)', unique_cust_count: 18, total_utilization: 40.6 },
  ];
}

/** Numeric + dimension fields aligned with `product-level-chart` columnMap (incl. competetion_sanction typo). */
function demoPrWalletOppNumericFields(i: number): Record<string, unknown> {
  const base = 50 + i * 12;
  return {
    unique_cust_count: 80 + i * 5,
    total_sanction: base * 2,
    competetion_sanction: base * 1.8,
    hsbc_sanction: base * 1.2,
    total_utilization: base * 1.5,
    competition_utilization: base * 1.3,
    hsbc_competition_utilization: base * 0.9,
    hsbc_utilization_pct: 42 + i,
    hsbc_wallet_utilization_pct: 38 + i * 0.5,
    hsbc_sanction_wallet_percent: 35 + i,
    cmr_score: 4 + (i % 5),
    seg_name: ['SME', 'Mid-Market', 'Corporate'][i % 3],
    city_name: ['Mumbai', 'Delhi', 'Bengaluru'][i % 3],
    employee_name: i % 2 === 0 ? 'Alex Morgan' : 'Sam Patel',
    classification: ['ETB', 'NTB'][i % 2],
    agri_psl_status: 'No',
    start_up_psl_status: 'No',
    msme_psl_status: i % 2 === 0 ? 'Yes' : 'No',
  };
}

function demoPrProductLevelOpportunityRows(): Record<string, unknown>[] {
  const names = ['Working Capital', 'Trade Finance', 'Term Loan', 'FX & Treasury'];
  return names.map((product_name, i) => ({
    product_id: i + 1,
    product_name,
    ...demoPrWalletOppNumericFields(i),
  }));
}

function demoPrCustomerLevelOpportunityRows(): Record<string, unknown>[] {
  const custNames = [
    'Acme Manufacturing Pvt Ltd',
    'Zenith Logistics Ltd',
    'Brightwave Retail Pvt Ltd',
    'Harbor Textiles India Pvt Ltd',
    'Indus Pharma Distributors',
  ];
  return custNames.map((cust_name, i) => ({
    cust_name,
    pan_no: ['AABCD1234E', 'BBBCE5678F', 'CCCFG9012G', 'DDDPH3456K', 'EEEPI7890L'][i],
    ...demoPrWalletOppNumericFields(i),
  }));
}

function demoPrParticularProductWiseCustomerRows(): Record<string, unknown>[] {
  return [0, 1, 2].map((i) => ({
    cust_name: ['Acme Manufacturing Pvt Ltd', 'Brightwave Retail Pvt Ltd', 'Harbor Textiles India Pvt Ltd'][i],
    pan_no: ['AABCD1234E', 'CCCFG9012G', 'DDDPH3456K'][i],
    ...demoPrWalletOppNumericFields(i + 1),
  }));
}

function demoPrParticularCustomerWiseProductRows(): Record<string, unknown>[] {
  return demoPrProductLevelOpportunityRows().map((row) => ({
    product_id: row.product_id,
    product_name: row.product_name,
    ...demoPrWalletOppNumericFields(Number(row.product_id) - 1),
  }));
}

/** Comparison analysis tab (`report_query`) — keys from comparison-analysis.component numericFields / setupTableHeaders. */
function demoPrReportQueryRows(): Record<string, unknown>[] {
  const labels = ['SME', 'Mid-Market', 'Corporate', 'Mumbai', 'Delhi', 'Bengaluru'];
  return labels.map((group_by_column, i) => ({
    group_by_column,
    unique_cust_count: 100 + i * 20,
    latest_total_sanction: 200 + i * 15,
    selected_total_sanction: 190 + i * 14,
    latest_hsbc_sanction: 80 + i * 6,
    selected_hsbc_sanction: 75 + i * 5,
    latest_total_utilization: 170 + i * 12,
    selected_total_utilization: 165 + i * 11,
    latest_hsbc_utilization: 65 + i * 5,
    selected_hsbc_utilization: 62 + i * 4,
    change_wallet: 8 + i,
    change_wallet_pct: 2.5 + i * 0.3,
    classification: 'ETB',
    pan_no: 'AABCD1234E',
  }));
}

/**
 * POST `/dashboard/getLendingAnalysis` and Lipisearch variant — branch on `dataset_id`
 * (and Lipisearch `queryKey` when `dataset_id` is missing).
 */
function demoPrLendingAnalysisPayload(reqBody?: any): unknown {
  if (reqBody?.queryKey === 'dropdown_filters') {
    return {
      status: 200,
      message: 'OK',
      data: {
        filters: demoPrFiltersMinimal(),
        datasets: demoPrDatasetList(),
      },
    };
  }

  let dsId = reqBody?.dataset_id as number | undefined;
  if (dsId == null && reqBody?.queryKey === 'lending_analysis_trend') {
    dsId = demoPrDatasetId('trends_of_lending');
  }
  if (dsId == null && reqBody?.queryKey === 'segment_level_analysis') {
    dsId = demoPrDatasetId('segment_level_opportunity');
  }

  const totalRows = [{ total_rows: 48 }];
  const lending = [demoPrLendingAnalysisRow()];
  const trends = [1, 2, 3, 4, 5, 6].map((n) => demoPrTrendsRow(n));
  const segments = [0, 1, 2].map((n) => demoPrSegmentRow(n));
  const table = demoGenericTableRows(8);

  if (
    dsId === demoPrDatasetId('customer_level_opportunity_total_rows') ||
    dsId === demoPrDatasetId('particular_product_wise_customer_level_total_rows') ||
    dsId === demoPrDatasetId('product_level_opportunity_total_rows') ||
    dsId === demoPrDatasetId('particular_customer_wise_product_level_total_rows') ||
    dsId === demoPrDatasetId('report_total_rows_query')
  ) {
    return { status: 200, message: 'OK', data: { data: totalRows } };
  }
  if (dsId === demoPrDatasetId('lending_analysis') || dsId === demoPrDatasetId('insights_analysis')) {
    return { status: 200, message: 'OK', data: { data: lending } };
  }
  if (dsId === demoPrDatasetId('trends_of_lending')) {
    return { status: 200, message: 'OK', data: { data: trends } };
  }
  if (dsId === demoPrDatasetId('segment_level_opportunity')) {
    return { status: 200, message: 'OK', data: { data: segments } };
  }
  if (dsId === demoPrDatasetId('product_level_chart')) {
    return { status: 200, message: 'OK', data: { data: demoPrProductLevelChartRows() } };
  }
  if (dsId === demoPrDatasetId('customer_level_wallet_chart')) {
    return { status: 200, message: 'OK', data: { data: demoPrCustomerLevelWalletRows() } };
  }
  if (dsId === demoPrDatasetId('product_level_opportunity')) {
    return { status: 200, message: 'OK', data: { data: demoPrProductLevelOpportunityRows() } };
  }
  if (dsId === demoPrDatasetId('customer_level_opportunity')) {
    return { status: 200, message: 'OK', data: { data: demoPrCustomerLevelOpportunityRows() } };
  }
  if (dsId === demoPrDatasetId('particular_product_wise_customer_level')) {
    return { status: 200, message: 'OK', data: { data: demoPrParticularProductWiseCustomerRows() } };
  }
  if (dsId === demoPrDatasetId('particular_customer_wise_product_level')) {
    return { status: 200, message: 'OK', data: { data: demoPrParticularCustomerWiseProductRows() } };
  }
  if (dsId === demoPrDatasetId('report_query')) {
    return { status: 200, message: 'OK', data: { data: demoPrReportQueryRows() } };
  }
  return { status: 200, message: 'OK', data: { data: table } };
}

/** Rich GET fallback: nested shapes many pages read (data.data, content, totalSize). */
function demoOmniGetResponse(): unknown {
  const rows = demoGenericTableRows(10);
  return {
    status: 200,
    message: 'OK',
    data: rows,
    listData: rows,
    content: rows,
    totalElements: rows.length,
    totalSize: rows.length,
    counts: rows.length,
    result: rows,
    body: { data: rows, totalSize: rows.length },
  };
}

/** Rich POST fallback for unmatched APIs. */
function demoOmniPostResponse(): unknown {
  const rows = demoGenericTableRows(12);
  const nested = {
    data: rows,
    content: rows,
    list: rows,
    records: rows,
    totalElements: rows.length,
    totalSize: rows.length,
    total_rows: rows.length,
  };
  return {
    status: 200,
    message: 'OK',
    flag: true,
    listData: rows,
    data: rows,
    summary: {},
    result: rows,
    content: rows,
    records: rows,
    rows,
    totalElements: rows.length,
    totalSize: rows.length,
    counts: rows.length,
    body: { data: rows, totalSize: rows.length },
    listdata: rows,
    responseDtos: rows,
    datasets: demoPrDatasetList(),
    filters: demoPrFiltersMinimal(),
    nested,
  };
}

/**
 * RM Existing Portfolio (and similar grids) format currency columns with DecimalPipe on
 * hsbcwallet, totalOpportunity, share, preApproved — values must be numeric or the UI shows blank.
 */
const dummyCustomers = () => {
  const rows = [
    {
      id: 1,
      panNo: 'AABCD1234E',
      name: 'Acme Manufacturing Pvt Ltd',
      customerId: 'CUST-1001',
      region: 'West',
      rmId: 'RM001',
      isMcaFetched: true,
      customerType: 1,
      cin: 'L25200MH1995PLC085963',
      globalRm: 'RM001',
      parentCompanyName: 'Acme Holdings',
      customerSegmentId: 1,
      crr: 'A',
      persona: 'ETB',
      preApproved: 1850000,
      share: 32,
      hsbcwallet: 4250000,
      totalOpportunity: 6200000,
    },
    {
      id: 2,
      panNo: 'BBBCE5678F',
      name: 'Zenith Logistics Ltd',
      customerId: 'CUST-1002',
      region: 'North',
      rmId: 'RM002',
      isMcaFetched: true,
      customerType: 1,
      cin: 'U01100DL2010PTC200001',
      globalRm: 'RM002',
      parentCompanyName: 'Zenith Group',
      customerSegmentId: 2,
      crr: 'B',
      persona: 'ETB',
      preApproved: 0,
      share: 18,
      hsbcwallet: 2100000,
      totalOpportunity: 3100000,
    },
    {
      id: 3,
      panNo: 'CCCFG9012G',
      name: 'Brightwave Retail Pvt Ltd',
      customerId: 'CUST-1003',
      region: 'South',
      rmId: 'RM001',
      isMcaFetched: false,
      customerType: 1,
      cin: 'U52399KA2018PTC112233',
      globalRm: 'RM001',
      parentCompanyName: '-',
      customerSegmentId: 1,
      crr: 'A',
      persona: 'ETB',
      preApproved: 2400000,
      share: 45,
      hsbcwallet: 8900000,
      totalOpportunity: 8125000,
    },
    {
      id: 4,
      panNo: 'DDDPH3456K',
      name: 'Harbor Textiles India Pvt Ltd',
      customerId: 'CUST-1004',
      region: 'East',
      rmId: 'RM002',
      isMcaFetched: true,
      customerType: 1,
      cin: 'U17120GJ2015PTC083421',
      globalRm: 'RM002',
      parentCompanyName: 'Harbor Global',
      customerSegmentId: 2,
      crr: 'A',
      persona: 'ETB',
      preApproved: 750000,
      share: 22,
      hsbcwallet: 980000,
      totalOpportunity: 2150000,
    },
    {
      id: 5,
      panNo: 'EEEPI7890L',
      name: 'Indus Pharma Distributors',
      customerId: 'CUST-1005',
      region: 'West',
      rmId: 'RM001',
      isMcaFetched: true,
      customerType: 1,
      cin: 'L24230MH2011PLC220011',
      globalRm: 'RM001',
      parentCompanyName: '-',
      customerSegmentId: 1,
      crr: 'B',
      persona: 'ETB',
      preApproved: 3200000,
      share: 40,
      hsbcwallet: 5600000,
      totalOpportunity: 5050000,
    },
  ];
  return { data: rows, counts: rows.length };
};

const topBarPayload = () => ({
  rmUsers: [
    { empCode: 'All', name: 'All RMs' },
    { empCode: 'RM001', name: 'Alex Morgan' },
    { empCode: 'RM002', name: 'Sam Patel' },
  ],
  filters: [
    {
      name: 'City',
      spKeyName: 'city',
      options: [
        { name: 'Mumbai', value: 'Mumbai' },
        { name: 'Delhi', value: 'Delhi' },
        { name: 'Bengaluru', value: 'Bengaluru' },
      ],
      isApiCallSearch: false,
    },
    {
      name: 'Segment',
      spKeyName: 'segment',
      options: [
        { name: 'SME', value: 'SME' },
        { name: 'Mid-Market', value: 'Mid-Market' },
      ],
      isApiCallSearch: false,
    },
    {
      name: 'Region',
      spKeyName: 'region',
      options: [
        { name: 'North', value: 'North' },
        { name: 'South', value: 'South' },
        { name: 'West', value: 'West' },
      ],
      isApiCallSearch: false,
    },
  ],
});

/** Shape matches `FilterMasterService.processFilterData`: filterName, count, insightTwoFilter[].json as stringified object with `keys` for checkbox UI. */
const insightFilterList = () => [
  {
    id: 'demo-insight-customer-type',
    filterName: 'Customer Type',
    count: 0,
    insightTwoFilter: [
      {
        type: 'checkbox',
        filterTwoName: 'Customer type',
        keyName: 'demoCustomerType',
        searchValue: '',
        isCollapsed: false,
        selected: [],
        noResultsFound: false,
        json: JSON.stringify({
          listName: 'DEMO_CUSTOMER_TYPE',
          isAllowSearch: true,
          isFetchFromAPi: false,
          count: 0,
          keys: [
            { sNo: -1, name: 'All', value: 'All', selected: false, isVisible: true },
            { sNo: 1, name: 'ETB (Existing to Bank)', value: 'ETB', selected: false, isVisible: true },
            { sNo: 2, name: 'NTB (New to Bank)', value: 'NTB', selected: false, isVisible: true },
            { sNo: 3, name: 'Target', value: 'TARGET', selected: false, isVisible: true },
            { sNo: 4, name: 'Prospect', value: 'PROSPECT', selected: false, isVisible: true },
            { sNo: 5, name: 'Corporate', value: 'CORPORATE', selected: false, isVisible: true },
            { sNo: 6, name: 'SME', value: 'SME', selected: false, isVisible: true },
          ],
        }),
      },
    ],
  },
  {
    id: 'demo-insight-region',
    filterName: 'Region',
    count: 0,
    insightTwoFilter: [
      {
        type: 'checkbox',
        filterTwoName: 'Geography',
        keyName: 'demoRegion',
        searchValue: '',
        isCollapsed: false,
        selected: [],
        noResultsFound: false,
        json: JSON.stringify({
          listName: 'DEMO_REGION',
          isAllowSearch: true,
          isFetchFromAPi: false,
          count: 0,
          keys: [
            { sNo: -1, name: 'All', value: 'All', selected: false, isVisible: true },
            { sNo: 1, name: 'North', value: 'North', selected: false, isVisible: true },
            { sNo: 2, name: 'South', value: 'South', selected: false, isVisible: true },
            { sNo: 3, name: 'East', value: 'East', selected: false, isVisible: true },
            { sNo: 4, name: 'West', value: 'West', selected: false, isVisible: true },
            { sNo: 5, name: 'Central', value: 'Central', selected: false, isVisible: true },
          ],
        }),
      },
    ],
  },
  {
    id: 'demo-insight-segment',
    filterName: 'Business segment',
    count: 0,
    insightTwoFilter: [
      {
        type: 'checkbox',
        filterTwoName: 'Segment',
        keyName: 'demoSegment',
        searchValue: '',
        isCollapsed: false,
        selected: [],
        noResultsFound: false,
        json: JSON.stringify({
          listName: 'DEMO_SEGMENT',
          isAllowSearch: true,
          isFetchFromAPi: false,
          count: 0,
          keys: [
            { sNo: -1, name: 'All', value: 'All', selected: false, isVisible: true },
            { sNo: 1, name: 'Mid-Market', value: 'MID_MARKET', selected: false, isVisible: true },
            { sNo: 2, name: 'Large Corporate', value: 'LARGE_CORP', selected: false, isVisible: true },
            { sNo: 3, name: 'Commercial Banking', value: 'COMMERCIAL', selected: false, isVisible: true },
            { sNo: 4, name: 'Institutional', value: 'INSTITUTIONAL', selected: false, isVisible: true },
          ],
        }),
      },
    ],
  },
  {
    id: 'demo-insight-crr',
    filterName: 'Risk profile',
    count: 0,
    insightTwoFilter: [
      {
        type: 'radioButton',
        filterTwoName: 'CRR band',
        searchValue: '',
        isCollapsed: false,
        selected: [],
        json: JSON.stringify({
          count: 0,
          value: null,
          keys: [
            { name: 'All', value: 'All' },
            { name: 'CMR 1', value: 'CMR1' },
            { name: 'CMR 2', value: 'CMR2' },
            { name: 'CMR 3', value: 'CMR3' },
            { name: 'CMR 4', value: 'CMR4' },
          ],
        }),
      },
    ],
  },
];

function demoRmDashboardListData() {
  return [
    {
      applicationCode: 'APP-2026-001',
      borrowerName: 'Acme Manufacturing Pvt Ltd',
      pan: 'AABCD1234E',
      displayName: 'Credit Processing',
      createdDate: '2026-01-10',
      modifiedDate: '2026-02-01',
      terminateReason: '-',
      breDashboardResList: JSON.stringify([
        {
          isMatched: true,
          fpProductName: 'Working Capital',
          finalEligibleAmount: 2500000,
          isRiskFlag: false,
        },
      ]),
    },
    {
      applicationCode: 'APP-2026-002',
      borrowerName: 'Zenith Logistics Ltd',
      pan: 'BBBCE5678F',
      displayName: 'Sanctioned',
      createdDate: '2026-01-15',
      modifiedDate: '2026-02-05',
      terminateReason: '-',
      breDashboardResList: JSON.stringify([
        {
          isMatched: true,
          fpProductName: 'Trade Finance',
          finalEligibleAmount: 1800000,
          isRiskFlag: true,
        },
      ]),
    },
    {
      applicationCode: 'APP-2026-003',
      borrowerName: 'Brightwave Retail Pvt Ltd',
      pan: 'CCCFG9012G',
      displayName: 'In Progress',
      createdDate: '2026-01-20',
      modifiedDate: '2026-02-08',
      terminateReason: '-',
      breDashboardResList: '[]',
    },
    {
      applicationCode: 'APP-2026-004',
      borrowerName: 'Harbor Textiles India Pvt Ltd',
      pan: 'DDDPH3456K',
      displayName: 'Pending Review',
      createdDate: '2026-01-22',
      modifiedDate: '2026-02-09',
      terminateReason: '-',
      breDashboardResList: '[]',
    },
    {
      applicationCode: 'APP-2026-005',
      borrowerName: 'Indus Pharma Distributors',
      pan: 'EEEPI7890L',
      displayName: 'Completed',
      createdDate: '2025-12-01',
      modifiedDate: '2026-01-28',
      terminateReason: '-',
      breDashboardResList: JSON.stringify([
        {
          isMatched: true,
          fpProductName: 'Overdraft',
          finalEligibleAmount: 500000,
          isRiskFlag: false,
        },
      ]),
    },
  ];
}

function demoAuditLogRows() {
  return [1, 2, 3, 4, 5, 6].map((i) => ({
    id: i,
    applicationNo: `1000${i}`,
    refId: `REF-2026-${i}`,
    apiName: 'demo.api.endpoint',
    request: JSON.stringify({ demo: true, index: i }),
    response: JSON.stringify({ status: 200 }),
    reqTime: '2026-02-01 10:00:00',
    resTime: '2026-02-01 10:00:02',
    statusCode: 200,
  }));
}

function demoBankUserRows() {
  return [
    {
      userId: 1,
      userName: 'demo.rm1',
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'alex.morgan@demo.hsbc',
      userType: 'RM',
      roleId: 1,
      isLocked: false,
      isActive: true,
    },
    {
      userId: 2,
      userName: 'demo.rm2',
      firstName: 'Sam',
      lastName: 'Patel',
      email: 'sam.patel@demo.hsbc',
      userType: 'RM',
      roleId: 1,
      isLocked: false,
      isActive: true,
    },
    {
      userId: 3,
      userName: 'demo.admin',
      firstName: 'Taylor',
      lastName: 'Admin',
      email: 'taylor.admin@demo.hsbc',
      userType: 'Admin',
      roleId: 2,
      isLocked: false,
      isActive: true,
    },
  ];
}

function demoCampaignDetails() {
  return [
    {
      campaignId: 0,
      campaignName: 'All',
      pmName: 'All PM',
      processingStatus: 'Completed',
      isCampaign: false,
    },
    {
      campaignId: 101,
      campaignName: 'Q1 Working Capital',
      pmName: 'Priya Mehta',
      processingStatus: 'Completed',
      isCampaign: true,
    },
    {
      campaignId: 102,
      campaignName: 'Trade Spring 2026',
      pmName: 'James Lee',
      processingStatus: 'Completed',
      isCampaign: true,
    },
  ];
}

function demoOpportunityDashboardInner() {
  const data = [1, 2, 3, 4, 5].map((i) => ({
    customerId: `OPP-CUST-${1000 + i}`,
    customerName: `Demo Opportunity Customer ${i}`,
    rmName: i % 2 === 0 ? 'Sam Patel' : 'Alex Morgan',
    campaignId: i === 1 ? 0 : 101,
    preApprovedStatus: i % 3 === 0 ? 'Eligible' : 'In Review',
    limitApproved: `${(i * 12.5).toFixed(1)} L`,
    allConvertedValue: 100000 * i,
    isFreshCir: true,
    statusRemark: 'Demo remark',
    campaignData: [
      {
        convertRejectStatus: i % 4 === 0 ? 'Rejected' : 'Converted',
        convertedValue: 50000 * i,
        campaignName: 'Q1 Working Capital',
      },
    ],
  }));
  return {
    data,
    totalElements: data.length,
    productNames: ['Working Capital', 'Trade Finance', 'Overdraft'],
    convertedCustomerCount: 2,
    rejectedCustomerCount: 1,
    inProcessCustomerCount: 1,
    awaitingActionCustomerCount: 1,
    convertedCustomerRevenue: 2500000,
    rejectedCustomerRevenue: 100000,
    inProcessCustomerRevenue: 750000,
    awaitingActionCustomerRevenue: 300000,
  };
}

function demoGenericTableRows(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    sNo: i + 1,
    name: `Demo row ${i + 1}`,
    description: 'Static demo data',
    status: 'Active',
    createdDate: '2026-01-15',
    amount: (i + 1) * 10000,
    refNo: `REF-DEMO-${i + 1}`,
  }));
}

/** Income dashboard: one row matching `IncomeDashboardComponent.mapResponseToModel` API field names. */
function demoIncomeVisualizationRow(
  id: string,
  label: string,
  nextLevel: string,
  r1Ic: number,
  r1Ib: number,
  r1Ob: number,
  r2Ic: number,
  r2Ib: number,
  r2Ob: number,
  gIc: number,
  gIb: number,
  gOb: number,
  gTot: number
) {
  const r1Tot = Math.round((r1Ic + r1Ib + r1Ob) * 10) / 10;
  const r2Tot = Math.round((r2Ic + r2Ib + r2Ob) * 10) / 10;
  return {
    id,
    label,
    nextLevel,
    range1Incountry: r1Ic,
    range1Inbound: r1Ib,
    range1Outbound: r1Ob,
    range1Total: r1Tot,
    range2Incountry: r2Ic,
    range2Inbound: r2Ib,
    range2Outbound: r2Ob,
    range2Total: r2Tot,
    growthInCountry: gIc,
    growthInBound: gIb,
    growthOutBound: gOb,
    growthTotal: gTot,
  };
}

function demoIncomeSumTotals(rows: any[]) {
  if (!rows.length) {
    return {
      label: 'Total',
      range1Incountry: 0,
      range1Inbound: 0,
      range1Outbound: 0,
      range1Total: 0,
      range2Incountry: 0,
      range2Inbound: 0,
      range2Outbound: 0,
      range2Total: 0,
      growthInCountry: 0,
      growthInBound: 0,
      growthOutBound: 0,
      growthTotal: 0,
    };
  }
  const z = rows.reduce(
    (acc, r) => ({
      range1Incountry: acc.range1Incountry + (Number(r.range1Incountry) || 0),
      range1Inbound: acc.range1Inbound + (Number(r.range1Inbound) || 0),
      range1Outbound: acc.range1Outbound + (Number(r.range1Outbound) || 0),
      range1Total: acc.range1Total + (Number(r.range1Total) || 0),
      range2Incountry: acc.range2Incountry + (Number(r.range2Incountry) || 0),
      range2Inbound: acc.range2Inbound + (Number(r.range2Inbound) || 0),
      range2Outbound: acc.range2Outbound + (Number(r.range2Outbound) || 0),
      range2Total: acc.range2Total + (Number(r.range2Total) || 0),
    }),
    {
      range1Incountry: 0,
      range1Inbound: 0,
      range1Outbound: 0,
      range1Total: 0,
      range2Incountry: 0,
      range2Inbound: 0,
      range2Outbound: 0,
      range2Total: 0,
    }
  );
  const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round(((a - b) / b) * 1000) / 10);
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    label: 'Total',
    range1Incountry: round1(z.range1Incountry),
    range1Inbound: round1(z.range1Inbound),
    range1Outbound: round1(z.range1Outbound),
    range1Total: round1(z.range1Total),
    range2Incountry: round1(z.range2Incountry),
    range2Inbound: round1(z.range2Inbound),
    range2Outbound: round1(z.range2Outbound),
    range2Total: round1(z.range2Total),
    growthInCountry: pct(z.range1Incountry, z.range2Incountry),
    growthInBound: pct(z.range1Inbound, z.range2Inbound),
    growthOutBound: pct(z.range1Outbound, z.range2Outbound),
    growthTotal: pct(z.range1Total, z.range2Total),
  };
}

function demoIncomeSegmentParentRows(): any[] {
  return [
    demoIncomeVisualizationRow('seg-retail', 'Retail Banking', 'GRO', 42.1, 18.4, 9.2, 38.6, 16.9, 8.1, 9.1, 8.9, 13.6, 9.4),
    demoIncomeVisualizationRow('seg-wpb', 'Wealth & Personal Banking', 'GRO', 31.5, 14.2, 6.8, 29.4, 13.1, 6.2, 7.1, 8.4, 9.7, 8.2),
    demoIncomeVisualizationRow('seg-global', 'Global Corporates', 'REGION', 88.3, 36.7, 22.4, 81.2, 33.5, 20.1, 8.7, 9.6, 11.4, 9.8),
    demoIncomeVisualizationRow('seg-commercial', 'Commercial Banking', 'GRO', 55.6, 22.3, 11.0, 51.8, 20.6, 10.2, 7.3, 8.3, 7.8, 7.9),
    demoIncomeVisualizationRow('seg-markets', 'Markets & Securities Services', 'GRO', 67.2, 28.9, 15.6, 62.5, 26.4, 14.0, 7.5, 9.5, 11.4, 8.6),
    demoIncomeVisualizationRow('seg-sme', 'SME / Business Banking', 'GRO', 24.8, 10.6, 5.4, 23.1, 9.8, 4.9, 7.4, 8.2, 10.2, 8.1),
    demoIncomeVisualizationRow('seg-private', 'Private Banking', 'GRO', 19.3, 9.1, 4.2, 18.0, 8.4, 3.9, 7.2, 8.3, 7.7, 7.8),
  ];
}

function demoIncomeBusinessLineParentRows(): any[] {
  return [
    demoIncomeVisualizationRow('bl-gbm', 'Global Banking & Markets', 'GRO', 72.4, 30.1, 16.2, 67.0, 27.8, 14.5, 8.1, 8.3, 11.7, 8.9),
    demoIncomeVisualizationRow('bl-wpb', 'Wealth & Personal Banking', 'GRO', 34.2, 15.5, 7.4, 31.6, 14.0, 6.6, 8.2, 10.7, 12.1, 9.4),
    demoIncomeVisualizationRow('bl-cmb', 'Commercial Banking', 'GRO', 48.9, 19.7, 9.8, 45.2, 18.1, 8.9, 8.2, 8.8, 10.1, 8.6),
    demoIncomeVisualizationRow('bl-gps', 'Global Payments Solutions', 'GRO', 26.1, 11.4, 5.9, 24.3, 10.6, 5.4, 7.4, 7.5, 9.3, 8.0),
    demoIncomeVisualizationRow('bl-am', 'Asset Management', 'GRO', 15.6, 6.8, 3.2, 14.4, 6.2, 2.9, 8.3, 9.7, 10.3, 9.1),
    demoIncomeVisualizationRow('bl-ins', 'Insurance & Other', 'GRO', 9.2, 4.1, 2.0, 8.6, 3.7, 1.8, 7.0, 10.8, 11.1, 8.5),
  ];
}

function demoIncomeRegionChildRows(): any[] {
  return [
    demoIncomeVisualizationRow('reg-apac', 'Asia Pacific', 'GRO', 28.4, 11.2, 6.8, 26.1, 10.1, 6.0, 8.8, 10.9, 13.3, 9.6),
    demoIncomeVisualizationRow('reg-emea', 'UK & Europe', 'GRO', 22.1, 9.5, 5.9, 20.4, 8.8, 5.4, 8.3, 8.0, 9.3, 8.4),
    demoIncomeVisualizationRow('reg-amer', 'Americas', 'GRO', 18.6, 7.8, 4.7, 17.2, 7.2, 4.3, 8.1, 8.3, 9.3, 8.2),
    demoIncomeVisualizationRow('reg-me', 'Middle East & Africa', 'GRO', 9.2, 4.2, 2.6, 8.5, 3.9, 2.4, 8.2, 7.7, 8.3, 8.0),
    demoIncomeVisualizationRow('reg-hk', 'Hong Kong', 'GRO', 6.5, 2.9, 1.8, 6.0, 2.7, 1.6, 8.3, 7.4, 12.5, 8.6),
    demoIncomeVisualizationRow('reg-in', 'India Subcontinent', 'GRO', 3.5, 1.1, 0.6, 3.0, 0.9, 0.5, 16.7, 22.2, 20.0, 17.2),
  ];
}

function demoIncomeGroChildRows(): any[] {
  const rms = ['Alex Morgan', 'Samira Khan', 'Jordan Lee', 'Priya Nair', "Chris O'Neill", 'Mei Tan', 'David Rossi', 'Ana Costa'];
  return rms.map((name, i) =>
    demoIncomeVisualizationRow(
      `gro-${i + 1}`,
      name,
      'MASTER_GROUP',
      8.2 + i * 0.7,
      3.4 + i * 0.3,
      1.6 + i * 0.2,
      7.5 + i * 0.6,
      3.1 + i * 0.25,
      1.4 + i * 0.15,
      8.0 + (i % 3),
      7.5 + (i % 4),
      9.0 + (i % 2),
      8.2 + (i % 5) * 0.3
    )
  );
}

function demoIncomeMasterGroupRows(): any[] {
  return [
    demoIncomeVisualizationRow('mg-1', 'Master Group — North', 'MASTER_GROUP', 4.2, 1.8, 0.9, 3.9, 1.6, 0.8, 7.7, 12.5, 12.5, 9.1),
    demoIncomeVisualizationRow('mg-2', 'Master Group — South', 'MASTER_GROUP', 3.6, 1.5, 0.7, 3.3, 1.4, 0.6, 9.1, 7.1, 16.7, 9.0),
    demoIncomeVisualizationRow('mg-3', 'Master Group — Key Clients', 'MASTER_GROUP', 5.1, 2.2, 1.1, 4.7, 2.0, 1.0, 8.5, 10.0, 10.0, 8.8),
  ];
}

function demoIncomeVisualizationPayload(reqBody?: any): unknown {
  const level = String(reqBody?.currentLevel || '');
  const page = Number(reqBody?.page) || 0;
  const size = Math.max(Number(reqBody?.size) || 5, 1);

  const pageSlice = (rows: any[]) => ({
    content: rows.slice(page * size, page * size + size),
    totalElements: rows.length,
  });

  if (level === 'SEGMENT') {
    const rows = demoIncomeSegmentParentRows();
    return { content: pageSlice(rows), totals: demoIncomeSumTotals(rows) };
  }
  if (level === 'BUSINESS_LINE') {
    const rows = demoIncomeBusinessLineParentRows();
    return { content: pageSlice(rows), totals: demoIncomeSumTotals(rows) };
  }
  if (level === 'REGION') {
    return { content: pageSlice(demoIncomeRegionChildRows()) };
  }
  if (level === 'GRO') {
    return { content: pageSlice(demoIncomeGroChildRows()) };
  }
  if (level === 'MASTER_GROUP') {
    return { content: pageSlice(demoIncomeMasterGroupRows()) };
  }

  return { content: { content: [], totalElements: 0 }, totals: demoIncomeSumTotals([]) };
}

function demoPortfolioRequestRows(): any[] {
  return [
    {
      id: 1,
      customerName: 'Acme Manufacturing Pvt Ltd',
      companyType: 'Private Limited',
      status: 'Pending',
      persona: 'ETB',
      hsbcWallet: 'High',
      totalOpportunity: 'CUACY',
      share: '32',
      receiverRmName: 'Sam Patel',
      rmName: 'Alex Morgan',
      rmEmailId: 'alex.morgan@demo.hsbc',
      rmId: 'RM001',
      requestedTimeDuration: '15',
      approvedTimeDuration: '-',
      pendingTime: '5',
      preApproved: 'Yes',
      isCompleted: false,
      approverRemarks: '',
    },
    {
      id: 2,
      customerName: 'Zenith Logistics Ltd',
      companyType: 'Limited',
      status: 'Approved',
      persona: 'ETB',
      hsbcWallet: 'Medium',
      totalOpportunity: 'CUAPY',
      share: '18',
      receiverRmName: 'Alex Morgan',
      rmName: 'Sam Patel',
      rmEmailId: 'sam.patel@demo.hsbc',
      rmId: 'RM002',
      requestedTimeDuration: '30',
      approvedTimeDuration: '3 days',
      pendingTime: '-1',
      preApproved: 'No',
      isCompleted: true,
      approverRemarks: 'Approved for demo',
    },
    {
      id: 3,
      customerName: 'Brightwave Retail Pvt Ltd',
      companyType: 'Private Limited',
      status: 'Rejected',
      persona: 'NTB',
      hsbcWallet: 'Low',
      totalOpportunity: 'CUACY',
      share: '10',
      receiverRmName: 'Taylor Admin',
      rmName: 'Alex Morgan',
      rmEmailId: 'alex.morgan@demo.hsbc',
      rmId: 'RM001',
      requestedTimeDuration: '15',
      approvedTimeDuration: '-',
      pendingTime: 'null',
      preApproved: 'No',
      isCompleted: false,
      approverRemarks: 'Insufficient data',
    },
    {
      id: 4,
      customerName: 'Harbor Textiles India Pvt Ltd',
      companyType: 'Private Limited',
      status: 'Pending',
      persona: 'ETB',
      hsbcWallet: 'High',
      totalOpportunity: 'CUAPY',
      share: '40',
      receiverRmName: 'Sam Patel',
      rmName: 'Alex Morgan',
      rmEmailId: 'alex.morgan@demo.hsbc',
      rmId: 'RM001',
      requestedTimeDuration: '7',
      approvedTimeDuration: '-',
      pendingTime: '2',
      preApproved: 'Yes',
      isCompleted: false,
      approverRemarks: '',
    },
    {
      id: 5,
      customerName: 'Indus Pharma Distributors',
      companyType: 'Partnership',
      status: 'Revoked',
      persona: 'ETB',
      hsbcWallet: 'Medium',
      totalOpportunity: 'CUACY',
      share: '22',
      receiverRmName: 'Alex Morgan',
      rmName: 'Sam Patel',
      rmEmailId: 'sam.patel@demo.hsbc',
      rmId: 'RM002',
      requestedTimeDuration: '15',
      approvedTimeDuration: '-',
      pendingTime: 'null',
      preApproved: 'No',
      isCompleted: false,
      approverRemarks: '',
    },
  ];
}

function demoMyPortfolioStatsPayload(): any[] {
  return [
    {
      group: 'Regulatory',
      totalCount: 8,
      subgroups: [
        { subgroup: 'RBI', count: 5 },
        { subgroup: 'SEBI', count: 3 },
      ],
    },
    {
      group: 'Corporate Actions',
      totalCount: 5,
      subgroups: [{ subgroup: 'Dividend', count: 5 }],
    },
    {
      group: 'Credit',
      totalCount: 4,
      subgroups: [{ subgroup: 'Rating change', count: 4 }],
    },
  ];
}

function demoMyPortfolioAnnouncementsPage(): any {
  const content = [1, 2, 3, 4, 5].map((i) => ({
    id: 100 + i,
    runCIN: `L25200MH1995PLC08596${i}`,
    companyName: `Demo Listed Co ${i}`,
    headline: `Demo corporate headline ${i}`,
    corporateAction: `Demo corporate headline ${i}`,
    details: 'Static demo announcement summary.',
    sourceDate: '2026-02-01T12:00:00',
    announcementDate: '2026-02-01',
    category: 'Regulatory',
    group: 'Regulatory',
    subcategory: 'RBI',
    subgroup: 'RBI',
    summary: 'Static demo announcement summary.',
  }));
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    page: 0,
    size: 10,
  };
}

function demoIndustryNewsMetadataPayload(): any {
  return {
    industries: [
      {
        id: 1,
        name: 'Manufacturing',
        sectors: [
          {
            id: 11,
            name: 'Auto',
            subSectors: [{ id: 111, name: 'Components' }],
          },
        ],
      },
    ],
    developments: [{ id: 1, name: 'Expansion', categories: [{ id: 1, name: 'Domestic' }] }],
    sectors: [{ id: 11, name: 'Auto' }],
    subSectors: [{ id: 111, name: 'Components' }],
    categories: [{ id: 1, name: 'Domestic' }],
  };
}

function demoIndustryNewsFetchPayload(): any {
  const news = [1, 2, 3].map((i) => ({
    id: i,
    title: `Demo industry article ${i}`,
    summary: 'Summary for static demo.',
    publishedDate: '2026-02-05',
    industry: 'Manufacturing',
    isSaved: false,
  }));
  return {
    industries: [],
    totalCount: 3,
    newCount: 1,
    news,
    sectorCounts: {},
    subSectorCounts: {},
    totalElements: 3,
    totalPages: 1,
    page: 0,
    savedArticlesCount: 0,
    savedArticleIds: [],
  };
}

function demoUploadHistoryShort(): any[] {
  return [
    {
      id: 1,
      mstId: 9001,
      fileName: 'demo-upload-1.xlsx',
      uploadedDate: '2026-01-10',
      status: 'Completed',
      totalRecords: 120,
      successCount: 118,
      failCount: 2,
    },
    {
      id: 2,
      mstId: 9002,
      fileName: 'demo-upload-2.xlsx',
      uploadedDate: '2026-01-18',
      status: 'Completed',
      totalRecords: 45,
      successCount: 45,
      failCount: 0,
    },
  ];
}

/** CRIF Commercial PR — `CrifDataUploadComponent` expects `res.data` = `{ data, totalRecords }`. */
function demoCrifCommercialPrHistoryPage(): { data: any[]; totalRecords: number } {
  const base = '2026-03-';
  const rows = [
    {
      fileId: 501,
      fileName: 'commercial_pr_inquiry_batch_001.csv',
      statusCode: 2,
      inputDownloadDate: `${base}12T09:15:00`,
      fileUploadDate: `${base}12T10:42:18`,
      successEntries: 448,
      dataNotReceived: 7,
      totalCustomer: 455,
      completed: true,
      fileWiseData: [
        {
          id: 9001,
          fileType: 'Account',
          createdDate: `${base}12T10:40:02`,
          stageId: 2,
          successEntries: 455,
          failEntries: 0,
          totalEntries: 455,
        },
        {
          id: 9002,
          fileType: 'Inquiry',
          createdDate: `${base}12T10:41:10`,
          stageId: 2,
          successEntries: 448,
          failEntries: 0,
          totalEntries: 448,
        },
        {
          id: 9003,
          fileType: 'Summary',
          createdDate: `${base}12T10:41:55`,
          stageId: 2,
          successEntries: 450,
          failEntries: 0,
          totalEntries: 450,
        },
        {
          id: 9004,
          fileType: 'IOI',
          createdDate: `${base}12T10:42:18`,
          stageId: 2,
          successEntries: 440,
          failEntries: 0,
          totalEntries: 440,
        },
      ],
    },
    {
      fileId: 502,
      fileName: 'crif_pr_summary_oct2026_v2.xlsx',
      statusCode: 2,
      inputDownloadDate: `${base}11T14:20:00`,
      fileUploadDate: `${base}11T15:05:33`,
      successEntries: 312,
      dataNotReceived: 0,
      totalCustomer: 312,
      completed: false,
      fileWiseData: [
        {
          id: 9011,
          fileType: 'Summary',
          createdDate: `${base}11T15:05:33`,
          stageId: 2,
          successEntries: 312,
          failEntries: 0,
          totalEntries: 312,
        },
      ],
    },
    {
      fileId: 503,
      fileName: 'ioi_commercial_registry_20260310.xlsx',
      statusCode: 1,
      inputDownloadDate: `${base}10T08:00:00`,
      fileUploadDate: `${base}10T08:12:44`,
      successEntries: 0,
      dataNotReceived: 0,
      totalCustomer: 0,
      completed: false,
      fileWiseData: [
        {
          id: 9021,
          fileType: 'IOI',
          createdDate: `${base}10T08:12:44`,
          stageId: 1,
          successEntries: 0,
          failEntries: 0,
          totalEntries: 0,
        },
      ],
    },
    {
      fileId: 504,
      fileName: 'inquiry_mismatch_pr_upload.csv',
      statusCode: 3,
      inputDownloadDate: `${base}08T11:30:00`,
      fileUploadDate: `${base}08T11:45:09`,
      successEntries: 0,
      dataNotReceived: 22,
      totalCustomer: 22,
      completed: false,
      fileWiseData: [
        {
          id: 9031,
          fileType: 'Inquiry',
          createdDate: `${base}08T11:45:09`,
          stageId: 3,
          successEntries: 0,
          failEntries: 22,
          totalEntries: 22,
          fileUploadFailureReason: 'Header row did not match CRIF commercial template v3.2.',
        },
      ],
    },
    {
      fileId: 505,
      fileName: 'pr_combined_feed_20260305.zip',
      statusCode: 2,
      inputDownloadDate: `${base}05T16:45:00`,
      fileUploadDate: `${base}05T17:22:01`,
      successEntries: 1205,
      dataNotReceived: 14,
      totalCustomer: 1219,
      completed: true,
      fileWiseData: [],
    },
    {
      fileId: 506,
      fileName: 'account_only_remediation.xlsx',
      statusCode: 2,
      inputDownloadDate: `${base}03T10:00:00`,
      fileUploadDate: `${base}03T10:18:27`,
      successEntries: 88,
      dataNotReceived: 2,
      totalCustomer: 90,
      completed: false,
      fileWiseData: [
        {
          id: 9041,
          fileType: 'Account',
          createdDate: `${base}03T10:18:27`,
          stageId: 2,
          successEntries: 88,
          failEntries: 2,
          totalEntries: 90,
        },
      ],
    },
  ];
  return { data: rows, totalRecords: rows.length };
}

function demoCrifCommercialPrInputMasterIds(): { listData: any[] } {
  return {
    listData: [
      { fileId: 601, fileName: 'PR-INPUT-2026-Q1-001 (Full refresh)', reqType: 1 },
      { fileId: 602, fileName: 'PR-INPUT-2026-Q1-002 (Delta)', reqType: 1 },
      { fileId: 603, fileName: 'PR-STATUS-WEEK-11', reqType: 2 },
    ],
  };
}

const DEMO_BS_TABLE_ROW_COUNT = 10;

/** Counterparty rows for portfolio bank-statement analysis (self / supplier / customer / opportunity inner tables). */
function demoPortfolioAnalysisCustRows(): any[] {
  return Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => {
    const id = `DEMO-CUST-${String(i + 1).padStart(3, '0')}`;
    const amt = 2500000 - i * 75000;
    return {
      custId: id,
      cust_id: id,
      cust_name: `HSBC Demo Customer ${i + 1}`,
      matched_name: `Matched entity ${i + 1}`,
      pan: `AAAPN${String(1000 + i)}E`,
      totalAmount: amt,
      total_amount: amt,
      totalRows: 3 + (i % 4),
      interactionCount: 18 - i,
    };
  });
}

/** One row for Net Self Transfer outer grid (`cust_name`, `net_amount`, `yearWise` for expand). */
function demoPortfolioNetSelfTransferRow(i: number): any {
  const net = 880000 - i * 52000;
  const monthAmount = (m: number) => 12000 + m * 900 + i * 700;
  return {
    cust_name: `Net self-transfer customer ${i + 1}`,
    net_amount: net,
    pan: `AAAPN${String(1300 + i)}E`,
    cust_id: `NET-SELF-${500 + i}`,
    yearWise: [2024, 2025, 2026].map((year) => ({
      year,
      monthWise: Array.from({ length: 12 }, (_, m) => ({
        totalAmount: monthAmount(m),
        totalCount: null,
      })),
    })),
  };
}

/**
 * Expanded-row / pagination child calls (`isSubData: 1`) — shapes must match
 * `updateChildListByPartyType` (e.g. `opportunityReport.data[0].custIdWise`, not the outer company list).
 */
function demoPortfolioAnalysisChildPayload(reqBody: any): any | null {
  if (Number(reqBody?.isSubData) !== 1) {
    return null;
  }
  const rt = String(reqBody?.reportType ?? '');
  const sub = String(reqBody?.subDataValue ?? '').trim();
  const inner = demoPortfolioAnalysisCustRows();

  const mapInner = (perJ: number) =>
    inner.map((c, j) => {
      const amt = Math.round(c.totalAmount - j * perJ);
      return { ...c, totalAmount: amt, total_amount: amt };
    });

  if (rt === '6') {
    return {
      opportunityReport: {
        data: [{ company_name: sub || 'Opportunity Demo Co 1', custIdWise: mapInner(650) }],
        totalRows: DEMO_BS_TABLE_ROW_COUNT,
      },
    };
  }
  if (rt === '4') {
    return {
      statutoryReport: {
        data: [{ category_name: sub || 'GST / TDS', custIdWise: mapInner(520) }],
      },
    };
  }
  if (rt === '2') {
    return {
      supplierList: {
        counterPartyList: [{ partyName: sub || 'Supplier Demo 1 Pvt Ltd', custIdWise: mapInner(560) }],
      },
    };
  }
  if (rt === '3') {
    return {
      customerList: {
        counterPartyList: [{ partyName: sub || 'Customer Demo 1 Ltd', custIdWise: mapInner(590) }],
      },
    };
  }
  if (rt === '1') {
    const bankName = sub || 'Demo Bank Ltd';
    return {
      selfTransfer: {
        debit: [
          {
            bankName,
            custIdList: mapInner(480),
            totalRows: DEMO_BS_TABLE_ROW_COUNT,
            totalAmount: mapInner(480).reduce((s, r) => s + (r.totalAmount ?? 0), 0),
          },
        ],
        credit: [],
        totalRowsDebit: 1,
        totalRowsCredit: 0,
      },
    };
  }
  return null;
}

function demoPortfolioAnalysisPayload(reqBody: any): any {
  const childPayload = demoPortfolioAnalysisChildPayload(reqBody);
  if (childPayload) {
    return childPayload;
  }
  const reportType = String(reqBody?.reportType ?? '1');
  const inner = demoPortfolioAnalysisCustRows();
  const selfBank = (name: string, amountScale: number) => ({
    bankName: name,
    totalAmount: Math.round(5000000 * amountScale),
    totalRows: DEMO_BS_TABLE_ROW_COUNT,
    custIdList: inner.map((c, j) => ({
      ...c,
      totalAmount: c.totalAmount - j * 12000,
    })),
  });

  switch (reportType) {
    case '1':
      return {
        selfTransfer: {
          debit: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) =>
            selfBank(`Demo portfolio bank ${i + 1}`, Math.max(0.35, 1 - i * 0.045)),
          ),
          credit: [selfBank('Inward Demo Bank', 0.55), selfBank('Inward secondary', 0.42)],
          totalRowsDebit: DEMO_BS_TABLE_ROW_COUNT,
          totalRowsCredit: 2,
        },
      };
    case '2':
      return {
        supplierList: {
          totalRows: DEMO_BS_TABLE_ROW_COUNT,
          counterPartyList: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => ({
            partyName: `Supplier Demo ${i + 1} Pvt Ltd`,
            totalRows: DEMO_BS_TABLE_ROW_COUNT,
            totalAmount: 3200000 - i * 90000,
            custIdWise: inner.map((c, j) => ({
              ...c,
              totalAmount: c.totalAmount - i * 5000 - j * 3000,
            })),
          })),
        },
      };
    case '3':
      return {
        customerList: {
          totalRows: DEMO_BS_TABLE_ROW_COUNT,
          counterPartyList: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => ({
            partyName: `Customer Demo ${i + 1} Ltd`,
            totalRows: DEMO_BS_TABLE_ROW_COUNT,
            totalAmount: 4100000 - i * 110000,
            custIdWise: inner.map((c, j) => ({
              ...c,
              totalAmount: c.totalAmount - i * 4000 - j * 2500,
            })),
          })),
        },
      };
    case '4':
      return {
        statutoryReport: {
          totalRows: DEMO_BS_TABLE_ROW_COUNT,
          data: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => ({
            category_name: i % 2 === 0 ? 'GST / TDS' : 'PF / Statutory',
            totalRows: DEMO_BS_TABLE_ROW_COUNT,
            totalAmount: 900000 + i * 45000,
            custIdWise: inner.map((c, j) => ({
              ...c,
              totalAmount: c.totalAmount - i * 2000 - j * 1000,
            })),
          })),
        },
      };
    case '5':
      return {
        netSelfTransfer: {
          totalRows: DEMO_BS_TABLE_ROW_COUNT,
          data: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => demoPortfolioNetSelfTransferRow(i)),
        },
      };
    case '6':
      return {
        opportunityReport: {
          data: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => {
            const custIdWise = inner.map((c, j) => ({
              ...c,
              totalAmount: c.totalAmount - i * 2500 - j * 800,
              total_amount: c.totalAmount - i * 2500 - j * 800,
            }));
            const companyWise = custIdWise.reduce((s, r) => s + (r.totalAmount ?? 0), 0);
            return {
              company_name: `Opportunity Demo Co ${i + 1}`,
              totalRows: DEMO_BS_TABLE_ROW_COUNT,
              interactions: 14 + (i % 9),
              company_wise_total_amount: companyWise,
              totalAmount: 600000 + i * 40000,
              custIdWise,
            };
          }),
          totalRows: DEMO_BS_TABLE_ROW_COUNT,
        },
      };
    default:
      return {
        selfTransfer: { debit: [], credit: [], totalRowsDebit: 0, totalRowsCredit: 0 },
      };
  }
}

function demoSupplierCustomerNameWise(): any[] {
  return Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => ({
    name: `Partner ${i + 1}`,
    total_amount: 200000 - i * 8000,
  }));
}

function demoSupplierCustomerCustBlock(): any[] {
  const names = demoSupplierCustomerNameWise();
  return Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, c) => ({
    cust_id: `DEMO-${200 + c}`,
    cust_total_rows: DEMO_BS_TABLE_ROW_COUNT,
    cust_total_amount: 3000000 - c * 90000,
    nameWise: names.map((n, k) => ({
      ...n,
      total_amount: n.total_amount - c * 500 - k * 200,
    })),
    cust_name: null,
    pan: null,
  }));
}

/** Supplier/customer nested report — API returns JSON strings in data.supplierList | data.customerList. */
function demoSupplierCustomerLevelPayload(reqBody: any): any {
  const rt = String(reqBody?.reportType ?? '1');
  const bankRow = (idx: number, label: string) => ({
    bank: `${label} ${idx + 1}`,
    bank_total_rows: DEMO_BS_TABLE_ROW_COUNT,
    bank_total_amount: 8000000 + idx * 250000,
    custIdWise: demoSupplierCustomerCustBlock().map((cw, c) => ({
      ...cw,
      cust_total_amount: cw.cust_total_amount - idx * 10000 - c * 5000,
    })),
  });
  if (rt === '2') {
    return {
      customerList: JSON.stringify({
        customerList: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => bankRow(i, 'Demo Customer Bank')),
        totalRows: DEMO_BS_TABLE_ROW_COUNT,
      }),
    };
  }
  return {
    supplierList: JSON.stringify({
      supplierList: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => bankRow(i, 'Demo Supplier Bank')),
      totalRows: DEMO_BS_TABLE_ROW_COUNT,
    }),
  };
}

function demoBsMonthDetailsOneMonth(seed: number): any {
  const base = 120000 + seed * 6000;
  return {
    snLimit: base * 4,
    dpLimit: base * 3.5,
    credits: 18 + (seed % 7),
    totalCredit: base * 2.2,
    debits: 14 + (seed % 5),
    totalDebit: base * 1.8,
    cashDeposits: 2 + (seed % 4),
    totalCashDeposit: base * 0.35,
    cashWithdrawals: 2,
    totalCashWithdrawal: base * 0.22,
    chqDeposits: 3,
    totalChqDeposit: base * 0.4,
    chqIssues: 2,
    totalChqIssue: base * 0.25,
    inwChqBounces: 0,
    totalInwChqBounce: 0,
    outwChqBounces: seed % 6 === 0 ? 1 : 0,
    totalOutwChqBounce: seed % 6 === 0 ? 4000 : 0,
    debitsSelf: 1,
    totalDebitSelf: base * 0.12,
    creditSelf: 1,
    totalCreditSelf: base * 0.1,
    debitsSC: 4,
    totalDebitSC: base * 0.45,
    creditsSC: 3,
    totalCreditSC: base * 0.42,
    overdrawnInstances: 0,
    overdrawnDays: 0,
    avgUtilization: 42 + (seed % 20),
    totalInvExpense: base * 0.02,
    totalInvIncome: base * 0.03,
    businessCredit: base * 1.1,
    emiOrLoans: 2,
    totalEmiOrLoan: base * 0.18,
    loanDisbursals: base * 0.05,
    totalLoanDisbursal: 1,
    inwChqBouncePercent: 0,
    outwChqBouncePercent: seed % 6 === 0 ? 0.4 : 0,
    neftCredits: 12,
    totalNeftCredit: base * 0.5,
    neftCreditsDebits: 10,
    totalNeftDebit: base * 0.48,
    rtgsCredits: 2,
    totalRtgsCredit: base * 1.6,
    rtgsDebits: 1,
    totalRtgsDebit: base * 1.4,
    upiCredits: 40,
    totalUpiCredit: base * 0.15,
    upiDebits: 35,
    totalUpiDebit: base * 0.12,
    balMin: base * 3,
    balMax: base * 5.5,
    balAvg: base * 4.2,
  };
}

function demoBsMultiGetAnalysisData(): any {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const topRow = (i: number, amountBase: number) => ({
    date: new Date(2026, 0, 5 + (i % 25)).toISOString(),
    narration: `Demo counterparty ${i + 1}`,
    category: 'Trade',
    modeOfPayment: 'RTGS',
    amount: amountBase + i * 3500,
  });
  return {
    accountList: [
      { bankName: 'ICICI Bank', accountNo: '1234567890123', acId: '101', accholderName: 'Demo Account Holder' },
      { bankName: 'HDFC Bank', accountNo: '9988776655443', acId: '102', accholderName: 'Demo Account Holder' },
    ],
    summaryInfo: {
      name: 'Demo Account Holder',
      bank: 'ICICI Bank',
      accountNo: '1234567890123',
      accountType: 'Current',
      ifsc: 'ICIC0001234',
      micr: '400229123',
      mobile: '+91-9876543210',
      address: 'Demo Tower, Bandra Kurla Complex, Mumbai',
      timeperiod: '01-Apr-2025 to 31-Mar-2026',
      bankBalanceSummary: { balAvg: 652000, balMin: 318000, balMax: 1180000 },
      creditSummary: { credits: 228, totalCredit: 18250000, totalAvgCredit: 1520000 },
      debitSummary: { debits: 205, totalDebit: 16080000, totalDebitAvg: 1340000 },
      bounceDetail: { checkBounceForLast1Month: 1, checkBounceForLast6Month: 3, chequeBounce: 5 },
    },
    monthWiseDetails: months.map((m, i) => ({
      monthName: `${m}-26`,
      details: demoBsMonthDetailsOneMonth(i),
    })),
    topTransaction: {
      topDebits: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => topRow(i, 95000)),
      topCredits: Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => topRow(i, 128000)),
    },
    eodBalances: {
      monthWiseEod: months.map((m, idx) => ({
        monthName: `${m}-26`,
        eodMondto: {
          five: 498000 + idx * 800,
          onefive: 516000 + idx * 800,
          twofive: 505000 + idx * 800,
          balMin: 475000 + idx * 500,
          balMax: 548000 + idx * 500,
          balAvg: 512000 + idx * 600,
        },
      })),
      dayWiseEod: months.map((m, col) => ({
        monthYear: `${m}-26`,
        monthBalance: Array.from({ length: 31 }, (_, d) => ({
          day: d + 1,
          balance: 420000 + col * 1800 + d * 420,
        })),
      })),
    },
  };
}

function demoBsTxnRows(): any[] {
  return Array.from({ length: DEMO_BS_TABLE_ROW_COUNT }, (_, i) => ({
    id: i + 1,
    date: new Date(2026, 1, 1 + (i % 26)).toISOString(),
    chqNo: i % 4 === 0 ? String(620000 + i) : '-',
    narration: `Demo bank narration ${i + 1}`,
    amount: 22000 + i * 1800,
    category: i % 2 === 0 ? 'Transfer' : 'Payment',
    balance: 1180000 - i * 17000,
    modeOfPayment: 'NEFT',
    type: i % 3 === 0 ? 'Debit' : 'Credit',
  }));
}

/** RM single- and multi-account bank statement analysis (`/bsAnalysis/...`). */
function demoRmBankStatementAnalysisStaticMocks(u: string, _method: string, reqBody?: any): unknown | undefined {
  if (u.includes('bsanalysis/multi/getanalysisdata')) {
    return { status: 200, message: 'OK', data: demoBsMultiGetAnalysisData() };
  }
  if (u.includes('bsanalysis/getanalysisdata') && !u.includes('/multi/')) {
    return { status: 200, message: 'OK', data: demoBsMultiGetAnalysisData() };
  }
  if (u.includes('bsanalysis/gettransactiondata')) {
    const pageIndex = Number(reqBody?.pageIndex ?? 0);
    const pageSize = Math.max(1, Number(reqBody?.size ?? 10));
    const all = demoBsTxnRows();
    const slice = all.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    return {
      status: 200,
      message: 'OK',
      data: {
        content: slice,
        totalElements: all.length,
        totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
        last: pageIndex * pageSize + slice.length >= all.length,
        first: pageIndex === 0,
        size: pageSize,
        number: pageIndex,
      },
    };
  }
  if (u.includes('bsanalysis/getbouncecheqdata')) {
    const pageIndex = Number(reqBody?.pageIndex ?? 0);
    const pageSize = Math.max(1, Number(reqBody?.size ?? 10));
    const all = demoBsTxnRows().map((r, i) => ({
      ...r,
      narration: `Returned — ${r.narration}`,
      category: 'Cheque bounce',
    }));
    const slice = all.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    return {
      status: 200,
      message: 'OK',
      data: {
        content: slice,
        totalElements: all.length,
        totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
        last: pageIndex * pageSize + slice.length >= all.length,
        first: pageIndex === 0,
        size: pageSize,
        number: pageIndex,
      },
    };
  }
  return undefined;
}

function demoGstHistoryRows(): any[] {
  return [
    { nameOfCompany: 'Acme Manufacturing Pvt Ltd', gstId: 120001, rmName: 'Demo Banker', dateOfReport: '2026-04-16', projectedSale: 12000000 },
    { nameOfCompany: 'Zenith Textiles Pvt Ltd', gstId: 120002, rmName: 'Demo Banker', dateOfReport: '2026-04-15', projectedSale: 9800000 },
    { nameOfCompany: 'Bluepeak Logistics LLP', gstId: 120003, rmName: 'Demo Banker', dateOfReport: '2026-04-14', projectedSale: 7600000 },
    { nameOfCompany: 'Nova Agro Industries', gstId: 120004, rmName: 'Demo Banker', dateOfReport: '2026-04-13', projectedSale: 8400000 },
    { nameOfCompany: 'Aster Components Ltd', gstId: 120005, rmName: 'Demo Banker', dateOfReport: '2026-04-12', projectedSale: 11300000 },
    { nameOfCompany: 'Orion Plastics Private Limited', gstId: 120006, rmName: 'Demo Banker', dateOfReport: '2026-04-11', projectedSale: 5600000 },
    { nameOfCompany: 'Silverline Foods LLP', gstId: 120007, rmName: 'Demo Banker', dateOfReport: '2026-04-10', projectedSale: 6900000 },
    { nameOfCompany: 'Vertex Auto Parts', gstId: 120008, rmName: 'Demo Banker', dateOfReport: '2026-04-09', projectedSale: 10100000 },
    { nameOfCompany: 'Prime Cables & Wires', gstId: 120009, rmName: 'Demo Banker', dateOfReport: '2026-04-08', projectedSale: 9100000 },
    { nameOfCompany: 'Northstar Chemicals', gstId: 120010, rmName: 'Demo Banker', dateOfReport: '2026-04-07', projectedSale: 7900000 },
  ];
}

function demoGstinListRows(): any[] {
  return [
    { nameOfCompany: 'Acme Manufacturing Pvt Ltd', gstin: '27AABCA1111A1Z1', constitution: 'Private Limited', username: 'acme.user', state: 'Maharashtra', otpVerificationStatus: 'Success', mstId: 120001, detailId: 1 },
    { nameOfCompany: 'Zenith Textiles Pvt Ltd', gstin: '29AAACZ2222B1Z2', constitution: 'Private Limited', username: 'zenith.user', state: 'Karnataka', otpVerificationStatus: 'Success', mstId: 120002, detailId: 2 },
    { nameOfCompany: 'Bluepeak Logistics LLP', gstin: '07AACCB3333C1Z3', constitution: 'LLP', username: 'bluepeak.user', state: 'Delhi', otpVerificationStatus: 'Pending', mstId: 120003, detailId: 3 },
    { nameOfCompany: 'Nova Agro Industries', gstin: '24AACCN4444D1Z4', constitution: 'Partnership', username: 'nova.user', state: 'Gujarat', otpVerificationStatus: null, mstId: 120004, detailId: 4 },
    { nameOfCompany: 'Aster Components Ltd', gstin: '33AACCA5555E1Z5', constitution: 'Public Limited', username: 'aster.user', state: 'Tamil Nadu', otpVerificationStatus: 'Success', mstId: 120005, detailId: 5 },
    { nameOfCompany: 'Orion Plastics Private Limited', gstin: '06AACCO6666F1Z6', constitution: 'Private Limited', username: 'orion.user', state: 'Haryana', otpVerificationStatus: null, mstId: 120006, detailId: 6 },
    { nameOfCompany: 'Silverline Foods LLP', gstin: '19AACCS7777G1Z7', constitution: 'LLP', username: 'silverline.user', state: 'West Bengal', otpVerificationStatus: 'Pending', mstId: 120007, detailId: 7 },
    { nameOfCompany: 'Vertex Auto Parts', gstin: '32AACCV8888H1Z8', constitution: 'Proprietorship', username: 'vertex.user', state: 'Kerala', otpVerificationStatus: null, mstId: 120008, detailId: 8 },
    { nameOfCompany: 'Prime Cables & Wires', gstin: '10AACCP9999J1Z9', constitution: 'Private Limited', username: 'prime.user', state: 'Bihar', otpVerificationStatus: 'Success', mstId: 120009, detailId: 9 },
    { nameOfCompany: 'Northstar Chemicals', gstin: '36AACCN1010K1ZA', constitution: 'Private Limited', username: 'northstar.user', state: 'Telangana', otpVerificationStatus: null, mstId: 120010, detailId: 10 },
  ];
}

/** Child Customer ID Mapping grid on RM Existing Portfolio → firm profile (static demo). */
function demoChildCustomerMappingsForFirmProfile(): any[] {
  const firstRows = [
    { parentCustomerId: '002-220032', childCustomerId: '002-220089', childCustomerName: 'Hang Seng Bank Limited' },
    {
      parentCustomerId: '002-220033',
      childCustomerId: '002-220078',
      childCustomerName: 'Bank Middle East Limited and branches',
    },
    { parentCustomerId: '002-220034', childCustomerId: '002-229001', childCustomerName: 'Bank Markets (USA) Inc.' },
    { parentCustomerId: '002-220035', childCustomerId: '002-220037', childCustomerName: 'Bank Singapore Limited' },
    {
      parentCustomerId: '002-220036',
      childCustomerId: '002-220095',
      childCustomerName: 'Bank Middle East Limited and branches',
    },
  ];
  const namePool = [
    'Hang Seng Bank Limited',
    'Bank Middle East Limited and branches',
    'Bank Markets (USA) Inc.',
    'Bank Singapore Limited',
    'HSBC Bank plc',
    'HSBC UK Bank plc',
    'The Hongkong and Shanghai Banking Corporation Limited',
    'HSBC France SA',
    'HSBC Innovation Banking Limited',
  ];
  const rows = [...firstRows];
  for (let i = firstRows.length; i < 50; i++) {
    rows.push({
      parentCustomerId: `002-${String(220032 + i).padStart(6, '0')}`,
      childCustomerId: `002-${String(220090 + i * 17).padStart(6, '0')}`,
      childCustomerName: namePool[i % namePool.length],
    });
  }
  return rows;
}

function demoRmPortfolioFirmProfile(pan: string, cin: string) {
  const opt = (name: string, value: string, selected = false) => ({
    optionName: name,
    optionValue: value,
    selected,
  });
  return {
    cin,
    pan,
    customerTypeId: 1,
    tradingNameFromCustomer: 'Acme Manufacturing Pvt Ltd',
    dateOfIncorporation: '15-Mar-2010',
    constitution: 'Private Limited',
    persona: 'SME',
    noOfEmployees: '250',
    displayPan: pan,
    leiNumber: '529900DEMO0000000001',
    leiExpiry: '31-Dec-2026',
    activeGSTIN: '27AABCA1111A1Z1',
    inactiveAndCancelledGSTIN: '—',
    activeGstInList: ['27AABCA1111A1Z1'],
    inAtiveGstInList: [],
    udyamNoCertificate: 'UDYAM-MH-12-0001234',
    iecNumber: 'IECDEMO01',
    msme: 'Yes',
    udyamMsmeStatus: 'Active',
    udyamCategory: 'Small',
    udyamFetchDate: null,
    udhyamCertificateRefId: 'REF-DEMO-1',
    existingLenders: '3',
    ratingDate: '01-Nov-2024',
    ratingAgency: 'CRISIL',
    creditRatingProxy: [],
    mcaTurnoverUnit: ' INR Cr',
    mcaTurnoverFY: ' FY24',
    agriPSL: 'No',
    startupPSL: 'No',
    alertCountData: JSON.stringify({ active: 2, closed: 5 }),
    timeWithHsbc: '4',
    cddRating: 'Low',
    cddReviewDate: '01-Jun-2025',
    limitReviewDate: '01-Dec-2025',
    crr: '3.2',
    latestCreditRating: 'A-',
    bureauCmrScore: '650',
    lastApprovalDate: '10-Jan-2025',
    customerId: 'CUST-1001',
    rmName: 'Demo RM',
    efillingStatus: 'Compliant',
    childCustomers: demoChildCustomerMappingsForFirmProfile(),
    turnover: [
      opt('MCA', '125.5', true),
      opt('GST', '118.0', false),
    ],
    industry: [opt('MCA', 'Manufacturing', true), opt('GST', 'Manufacturing', false)],
    sector: [opt('MCA', 'Industrial Machinery', true), opt('GST', 'Machinery', false)],
    tradingNames: [opt('MCA', 'Acme Manufacturing Pvt Ltd', true), opt('GST', 'Acme Mfg', false)],
    businessAddress: [
      opt('MCA', 'MIDC Industrial Area, Mumbai, Maharashtra 400001', true),
      opt('GST', 'Same as MCA', false),
    ],
    constitutions: [opt('GST', 'Private Limited', true), opt('MCA', 'Private Limited', false)],
    contactPersonName: [
      {
        selectType: 'MCA',
        contactPersonName: 'Ravi Kumar',
        mobile: '9876543210',
        email: 'ravi.kumar@acme-demo.example',
        selected: true,
      },
    ],
  };
}

function demoRmPortfolioOpportunity(pan: string, cin: string) {
  return {
    cin,
    pan,
    hsbcRevenueCurrentYear: 1250.75,
    hsbcRevenueLastYear: 980.25,
    hsbcPreApprovedProd: [
      {
        applicationId: 9001,
        eligibilityType: 1,
        name: 'Working Capital Loan',
        amount: 5000000,
        dateOfApproval: '2024-08-12',
        status: 'Pre-qualified',
        riskFlag: 'Green',
        camReport: 'Available',
      },
      {
        applicationId: 9002,
        eligibilityType: 2,
        name: 'Export Finance',
        amount: 2500000,
        dateOfApproval: '2024-06-01',
        status: 'In review',
        riskFlag: 'Amber',
        camReport: 'Pending',
      },
    ],
    opportunityList: { data: [] },
    crilcLenderData: [],
  };
}

/** MCA-Financial → Standalone (and minimal consolidated) — matches `FinancialDataModel` / firm view tab. */
function demoRmPortfolioFinancials() {
  const fy2021 = {
    salesRevenue: '194763630',
    grossProfitMarginPer: '20.95',
    ebitda: '18163800',
    ebitdaMarginPer: '10.00',
    operatingProfitMarginPer: '7.56',
    financeCost: '12873470',
    depriciation: 8000298.15,
    profitBeforeTax: '1292180',
    netProfit: '866460',
    netWorth: '32193180',
    longTermBorrowings: '33054900',
    totalNoncurrentliabilities: '33054900',
    shortTermborrowing: '55511200',
    tradePayable: '21817600',
    totalCurrentLiabilities: '87598900',
    totalNoncurrentSssets: '49759300',
    currentInvestments: 'NA',
    inventories: '38873200',
    tradeReceivables: '56617100',
    cashAndCashBalance: '3595940',
    totalCurrentAssets: '99086240',
    daysOfSalesOutstanding: 110,
    payableDays: 43,
    inventoryDays: 76,
    cashConversionCycle: 144,
    interestCoverageRatio: 1.1,
    netDebitBookEntity: 8.5,
    netDebitEbitda: 4.68,
    dscr: 0.16,
    currentRatio: 1.18,
  };
  const fy2022 = {
    salesRevenue: '249760000',
    grossProfitMarginPer: '22.54',
    ebitda: '33497260',
    ebitdaMarginPer: '14.00',
    operatingProfitMarginPer: '12.61',
    financeCost: '9300470',
    depriciation: 6121099.02,
    profitBeforeTax: '21137770',
    netProfit: '15767160',
    netWorth: '47960330',
    longTermBorrowings: '5947240',
    totalNoncurrentliabilities: '5947240',
    shortTermborrowing: '82878800',
    tradePayable: '10617500',
    totalCurrentLiabilities: '105741000',
    totalNoncurrentSssets: '51305200',
    currentInvestments: 'NA',
    inventories: '43179600',
    tradeReceivables: '49999400',
    cashAndCashBalance: '9122080',
    totalCurrentAssets: '102301080',
    daysOfSalesOutstanding: 76,
    payableDays: 16,
    inventoryDays: 65,
    cashConversionCycle: 125,
    interestCoverageRatio: 3.27,
    netDebitBookEntity: 7.97,
    netDebitEbitda: 2.38,
    dscr: 0.34,
    currentRatio: 1.02,
  };
  const fy2023 = {
    salesRevenue: '257740000',
    grossProfitMarginPer: '15.58',
    ebitda: '20782800',
    ebitdaMarginPer: '8.00',
    operatingProfitMarginPer: '6.64',
    financeCost: '9077870',
    depriciation: 8319777.81,
    profitBeforeTax: '7547120',
    netProfit: '4635230',
    netWorth: '52595570',
    longTermBorrowings: '9718490',
    totalNoncurrentliabilities: '9718490',
    shortTermborrowing: '73362300',
    tradePayable: '14531700',
    totalCurrentLiabilities: '97074700',
    totalNoncurrentSssets: '50067500',
    currentInvestments: 'NA',
    inventories: '51796700',
    tradeReceivables: '48689000',
    cashAndCashBalance: '3454310',
    totalCurrentAssets: '103940010',
    daysOfSalesOutstanding: 71,
    payableDays: 21,
    inventoryDays: 75,
    cashConversionCycle: 125,
    interestCoverageRatio: 1.83,
    netDebitBookEntity: 7.96,
    netDebitEbitda: 3.83,
    dscr: 0.2,
    currentRatio: 1.13,
  };
  const standaloneFinancialYear: Record<string, any> = {
    '2020-21': fy2021,
    '2021-22': fy2022,
    '2022-23': fy2023,
  };
  return {
    nameOfAuditor: 'M P Singh & Associates',
    gstTurnoverBucket: '257740000',
    gstTurnoverBucketUnit: 'Rs.',
    dateOfBalanceSheet: '31 March, 2024',
    balanceSheetUnit: 'Rs.',
    profitAndLossUnit: 'Rs. Thousand',
    gstTurnoverFY: '2022-23',
    spreadDownloadUrl: '',
    consolidatedGstTurnoverFY: '2022-23',
    consolidatedDateOfBalSheet: '31 March, 2024',
    consolidatedGstTurnoverBucket: '257740000',
    consolidatedGstTurnoverBucketUnit: 'Rs.',
    standaloneFinancialYear,
    consolidatedFinancialYear: { ...standaloneFinancialYear },
  };
}

/** Directors & Directors Contact Details (Network tab 1) — field names match `DirectorDetails` / template `directorDetails.name`. */
function demoDirectorDetailsNetwork(pan: string, cin: string): any[] {
  const p = pan || 'AABCD1234E';
  const rows = [
    {
      name: 'SUILKARIM MADATHUMPADY ABDULKARIM',
      contactNo: '9198765722',
      email: 'sijilkarim@valueingredients.com',
      din: '07210321',
    },
    {
      name: 'RAHUL GOSWAMI',
      contactNo: '9199999952',
      email: 'rgoswami@greenstoneadvisory.com',
      din: '07210322',
    },
    {
      name: 'THYAGARAJAN KARTHIKEYAN',
      contactNo: '9198888552',
      email: '',
      din: '07210323',
    },
    {
      name: 'MEENAKSHI KARTHIKEYAN',
      contactNo: '9197777360',
      email: '',
      din: '07210324',
    },
    {
      name: 'PARESH SURENDRA THAKKER',
      contactNo: '9196666200',
      email: 'pareshthakker@yahoo.com',
      din: '07210325',
    },
  ];
  return rows.map((r, i) => ({
    id: i + 1,
    cin,
    din: r.din,
    age: String(48 + i),
    pan: p,
    displayPan: p,
    name: r.name,
    designation: 'Director',
    dateOfAppointment: `${10 + i}-Jun-201${5 + i}`,
    disqualifiedUs164Pdf: '',
    disqualifiedUs164Din: '',
    stakePercent: String(8 + i * 2),
    stakeYear: 'FY24',
    noOfDirectorships: 2,
    contactNo: r.contactNo,
    email: r.email,
    presentResidentialAddress: 'Mumbai, Maharashtra',
    directorships: [],
    isCollapsed: true,
    bureuFetchDate: '2025-01-15',
  }));
}

function demoRmPortfolioNetwork(tabType: number, pan: string, cin: string) {
  const base: any = { cin, pan };
  switch (tabType) {
    case 1:
      return {
        ...base,
        directorDetails: demoDirectorDetailsNetwork(pan, cin),
        connectedLendingDetails: [
          {
            lenderName: 'Demo Bank Ltd',
            sanctionedAmount: '₹ 8 Cr',
            outstanding: '₹ 5 Cr',
            dateOfReport: '2024-12-01',
          },
        ],
        customData: {},
      };
    case 2:
      return {
        ...base,
        shareholding: [
          { name: 'Promoter Group', stakePercent: 62.5 },
          { name: 'Public Float', stakePercent: 37.5 },
        ],
        shareHoldingYear: 'FY2024',
        detailedShareholdingProxies: [
          { FY: 'FY2024', shareholderName: 'Acme Holdings Pvt Ltd', shareholdingPercent: 45.0 },
          { FY: 'FY2024', shareholderName: 'Retail & Others', shareholdingPercent: 55.0 },
        ],
        relatedEntities: [
          { Relation_Source: 'Subsidiary', entityName: 'Acme Logistics Pvt Ltd', pan: 'AABCL9999K' },
          { Relation_Source: 'Parent', entityName: 'Acme Global Ltd', pan: 'AABCG8888J' },
        ],
      };
    case 4:
      return {
        ...base,
        industryPeers: [
          { peerName: 'Peer Alpha Ltd', revenue: 150, metricLabel: 'Revenue (Cr)' },
          { peerName: 'Peer Beta Ltd', revenue: 98, metricLabel: 'Revenue (Cr)' },
        ],
      };
    case 5:
      return {
        ...base,
        counterparties: {
          top5ExportParties: [{ name: 'Export Buyer EU', amount: 1200000 }],
          top5ImportParties: [{ name: 'Import Supplier APAC', amount: 980000 }],
        },
        topFiveBuyersList: [{ name: 'Buyer One', amount: 500000 }],
        topFiveSalesList: [{ name: 'Sales Channel A', amount: 750000 }],
        counterpartiesFromBs: {
          bankDetailsListRes: {
            topFundsReceipts: [],
            topFundPayments: [],
          },
        },
      };
    default:
      return { ...base, directorDetails: [], connectedLendingDetails: [] };
  }
}

function demoRmPortfolioAlerts(tabType: number, pan: string, cin: string) {
  /** Jan–Dec 2024: risk score timeline uses y-axis 0–4 (No Risk → Critical), not 0–100. */
  const riskAlertMonthLabels = [
    'Jan 24',
    'Feb 24',
    'Mar 24',
    'Apr 24',
    'May 24',
    'Jun 24',
    'Jul 24',
    'Aug 24',
    'Sep 24',
    'Oct 24',
    'Nov 24',
    'Dec 24',
  ];
  const riskTimeLineGraph12 = riskAlertMonthLabels.map((displayValue, i) => ({
    displayValue,
    percentage: [0.08, 0.92, 1.18, 1.48, 1.88, 2.38, 3.52, 3.62, 3.48, 3.38, 3.12, 2.98][i],
  }));
  const severityTimelineGraph12 = riskAlertMonthLabels.map((month, i) => {
    const t = i / 11;
    return {
      month,
      lowAlert: Math.round(1 + 1 * t),
      mediumAlert: Math.round(1 + 2 * t),
      highAlert: Math.round(1 + 6 * t),
      criticalAlert: Math.round(1 + 8 * t),
    };
  });
  severityTimelineGraph12[11] = {
    month: 'Dec 24',
    lowAlert: 2,
    mediumAlert: 3,
    highAlert: 7,
    criticalAlert: 9,
  };
  const categoryTimelineGraph12 = riskAlertMonthLabels.map((month, i) => ({
    month,
    'Credit&Financial': 2 + (i % 4),
    Opportunity: 1 + ((i + 1) % 3),
    'Business&Operations': 1 + (i % 2),
    'Legal&Compliance': i % 4 === 0 ? 1 : 0,
    Regulatory: (i % 3) + 1,
    Reputation: i % 2,
    'Media&News': i % 5 === 0 ? 1 : 0,
  }));
  if (tabType === 0) {
    return {
      activeAlertCountWithStatus: {
        pending: 12,
        submitted: 1,
        complete: 2,
        totalRemarks: 15,
      },
      activeAlertCountWithType: {
        'NCLT Cases': 12,
        'Defaulter List': 2,
        'AML Sanctions': 1,
        'Bureau Default': 1,
      },
      riskScoreGraph: { percentage: 75 },
      riskTimeLineGraph: riskTimeLineGraph12,
      severityTimelineGraph: severityTimelineGraph12,
      categoryTimelineGraph: categoryTimelineGraph12,
      categoryWiseAlert: [
        { displayValue: 'Credit & Financial', count: 7, typeId: 1 },
        { displayValue: 'Opportunity', count: 5, typeId: 2 },
        { displayValue: 'Business & Operations', count: 3, typeId: 3 },
        { displayValue: 'Legal & Compliance', count: 3, typeId: 4 },
        { displayValue: 'Regulatory', count: 2, typeId: 5 },
      ],
      severityWiseAlert: [
        { displayValue: 'Low', count: 10, typeId: 1 },
        { displayValue: 'Medium', count: 4, typeId: 2 },
        { displayValue: 'High', count: 1, typeId: 3 },
        { displayValue: 'Severe', count: 5, typeId: 4 },
      ],
      alertsCount: '20',
    };
  }
  const nf = {
    id: 1,
    CIN: cin,
    Score: '620',
    Date: '2024-11-20',
    Subject: 'Demo alert: periodic compliance review',
    URL: '',
    Type: 'Regulatory',
    Comment: 'Static demo row — no backend call.',
    actionRequired: false,
    actionedClosed: false,
    ragStatus: false,
    isActionRequired: false,
    isActionedClosed: false,
    alertModuleMasterName: 'Compliance  ',
    alertModuleMasterId: 1,
    alertParameterMasterId: 1,
    category: 'Legal&Compliance',
    categoryId: 4,
    status: 1,
    pan,
    severity: 'Medium',
    severityId: 2,
    alertCategoryMasterList: [],
    alertSeverityMasterList: [],
    submittedRemark: '',
    submittedByName: '',
    submittedDate: null as any,
    completedRemark: '',
    completedByName: '',
    completedDate: null as any,
  };
  return {
    nonFinancialData: [nf, { ...nf, id: 2, Subject: 'Demo alert: cashflow variance', Type: 'Financial' }],
    alertCategoryMasterList: [
      { id: 0, type: 'All' },
      { id: 1, type: 'Credit&Financial' },
      { id: 4, type: 'Legal&Compliance' },
    ],
    alertSeverityMasterList: [
      { id: 0, type: 'All' },
      { id: 1, type: 'Low' },
      { id: 2, type: 'Medium' },
      { id: 3, type: 'High' },
    ],
    activeAlertCount: '2',
    inActiveAlertCount: '14',
  };
}

function demoRmPortfolioViewMcaTabDetails(reqBody: any) {
  const pan = String(reqBody?.pan ?? 'AABCD1234E');
  const cin = String(reqBody?.cin ?? 'L25200MH1995PLC085963');
  const tab = String(reqBody?.tabType ?? 'FIRM_PROFILE').toUpperCase();
  if (tab === 'OPPORTUNITY') {
    return { status: 200, message: 'OK', data: demoRmPortfolioOpportunity(pan, cin) };
  }
  if (tab === 'FINANCIALS') {
    return { status: 200, message: 'OK', data: demoRmPortfolioFinancials() };
  }
  return { status: 200, message: 'OK', data: demoRmPortfolioFirmProfile(pan, cin) };
}

function demoRmPortfolioViewNetworkDetails(reqBody: any) {
  const pan = String(reqBody?.pan ?? 'AABCD1234E');
  const cin = String(reqBody?.cin ?? 'L25200MH1995PLC085963');
  const tab = Number(reqBody?.tabType ?? 1);
  return { status: 200, message: 'OK', data: demoRmPortfolioNetwork(tab, pan, cin) };
}

function demoRmPortfolioViewAlertsDetails(reqBody: any) {
  const pan = String(reqBody?.pan ?? 'AABCD1234E');
  const cin = String(reqBody?.cin ?? 'L25200MH1995PLC085963');
  const tab = Number(reqBody?.tabType ?? 0);
  return { status: 200, message: 'OK', data: demoRmPortfolioAlerts(tab, pan, cin) };
}

function demoRmPortfolioViewApiAuditList() {
  return {
    status: 200,
    message: 'OK',
    data: [
      { apiId: 1, apiName: 'MCA Company Master', status: 'Success' },
      { apiId: 2, apiName: 'GST Returns', status: 'Success' },
      { apiId: 3, apiName: 'CRILC Summary', status: 'Success' },
      { apiId: 4, apiName: 'Bureau CMR', status: 'Success' },
    ],
  };
}

function demoRmPortfolioViewOrderFinancialStatus() {
  return { status: 200, message: 'OK', data: { status: 'Success', apiName: 'MCA Order Financial' } };
}

function demoRmPortfolioCrilcLendersResponse() {
  return {
    status: 200,
    message: 'OK',
    totalCount: 1,
    data: [
      {
        calendar_year: 2024,
        month_name: 'November',
        months: {
          data: {
            count: 3,
            existing_banks: ['HSBC', 'Demo Bank A'],
            included_banks: ['New Lender X'],
            excluded_banks: ['Old Bank Y'],
          },
        },
      },
    ],
  };
}

/** HSBC API Audit Log (`/get_audit_data`) — `HSBCAPIAuditLogComponent` reads `response.data.data`. */
function demoHsbcGetAuditDataResponse(reqBody?: any) {
  const pan = String(reqBody?.pan ?? 'AABCD1234E');
  const reqDemo = JSON.stringify({ pan, source: 'static-demo' });
  const resDemo = JSON.stringify({ status: 'SUCCESS', demo: true });
  const baseRow = (i: number, name: string, status: string, http: string) => ({
    applicationId: `DEMO-APP-${1000 + i}`,
    refId: `DEMO-REF-${i}`,
    name,
    apiName: name,
    description: `Static demo audit row ${i} for ${name}`,
    createdDate: `2026-04-${String(17 - i).padStart(2, '0')} 1${i}:30:00`,
    status,
    statusCode: http,
    serverIp: '10.0.0.12',
    httpCode: http,
    request: reqDemo,
    response: resDemo,
  });
  const rows = [
    {
      ...baseRow(1, 'UDYAM_MASTER', 'SUCCESS', '200'),
      totalEntries: 12,
    },
    { ...baseRow(2, 'GST_PROFILE', 'SUCCESS', '200') },
    { ...baseRow(3, 'MCA_COMPANY_MASTER', 'SUCCESS', '200') },
    { ...baseRow(4, 'CRISIL_AGGREGATION', 'SUCCESS', '200'), refType: 'PAN', refValue: pan },
    { ...baseRow(5, 'SAVE_RISK_SEARCH', 'FAILED', '500') },
  ];
  return {
    status: 200,
    message: 'OK',
    data: {
      data: rows,
    },
  };
}

/** CCN ids aligned with `getSummaryDetailsByEximId` demo payload for peer / product sorting. */
const DEMO_EXIM_SHIPPER_CCNS = [20101, 20102];
const DEMO_EXIM_CONSIGNEE_CCNS = [10101, 10102];

function demoEximMonthlyAnalysis(): any[] {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  return months.map((month, i) => ({
    month,
    numberOfShipments: 2 + (i % 5),
    shipmentValue: 15000 + i * 4000,
  }));
}

function demoEximFYearResList(): any[] {
  return [
    {
      financialYear: '2023-2024',
      totalNumberOfShipments: 80,
      totalShipmentValue: 520000,
      eximMonthlyAnalysis: demoEximMonthlyAnalysis(),
    },
    {
      financialYear: '2022-2023',
      totalNumberOfShipments: 72,
      totalShipmentValue: 445000,
      eximMonthlyAnalysis: demoEximMonthlyAnalysis(),
    },
  ];
}

function demoEximWalletYearRows(): any[] {
  return [
    {
      financialYear: '2023-24',
      totalExportWalletSum: 250000,
      totalExport: 1000000,
      totalImportWalletSum: 180000,
      totalImport: 720000,
    },
    {
      financialYear: '2022-23',
      totalExportWalletSum: 200000,
      totalExport: 880000,
      totalImportWalletSum: 150000,
      totalImport: 650000,
    },
  ];
}

function demoEximMappingLine(i: number, ccnId: number): any {
  return {
    name: `Demo party ${i}`,
    noOfShipments: 20 + i * 3,
    valueUsd: 125000 + i * 15000,
    address: `${100 + i} Industrial Area, Mumbai`,
    ccnId,
    hsnData: [{ hsnCode: '84713000', description: 'Portable automatic data processing machines' }],
  };
}

function demoEximBuyerSellerPeerRow(tab: 'buyer' | 'seller', idx: number): any {
  const ccnList = tab === 'buyer' ? DEMO_EXIM_SHIPPER_CCNS : DEMO_EXIM_CONSIGNEE_CCNS;
  return {
    buyerName: tab === 'buyer' ? `Global consignee ${idx}` : `Global shipper ${idx}`,
    totalShipmentValue: 350000 - idx * 20000,
    address: `${idx} Harbour View, Singapore`,
    mappingDataList: [
      demoEximMappingLine(1, ccnList[0]),
      demoEximMappingLine(2, 99999),
      demoEximMappingLine(3, 88888),
    ],
  };
}

function demoEximProductPeerRow(kind: 'export' | 'import', idx: number): any {
  const c1 = {
    ccnId: kind === 'export' ? DEMO_EXIM_SHIPPER_CCNS[0] : DEMO_EXIM_CONSIGNEE_CCNS[0],
    name: 'Acme Manufacturing Pvt Ltd',
    totalNoOfShipment: 120,
    totalShipmentValue: 280000,
    address: 'SEZ Unit 12, Chennai',
  };
  const c2 = {
    ccnId: 77777,
    name: 'Peer Industries Ltd',
    totalNoOfShipment: 95,
    totalShipmentValue: 210000,
    address: 'Plot 4, Pune',
  };
  const totalValueUsd = c1.totalShipmentValue + c2.totalShipmentValue;
  return {
    hsnCode: `84713${idx}`,
    description:
      kind === 'export' ? 'Automatic data-processing machines and units thereof' : 'Electronic integrated circuits',
    totalValueUsd,
    customerShare: 12.5 + idx,
    companyDataList: [c1, c2],
  };
}

function demoEximExportImportRow(overrides: Record<string, unknown>): any {
  return {
    buyerName: 'Demo Global Trading LLC',
    country: 'United States',
    address: '100 Commerce Ave, New York, NY',
    parentCompany: 'Demo Parent Holdings',
    parentCompanyAddress: '1 Canary Wharf, London',
    dunsId: '987654321',
    isHsbcPresence: true,
    hsbcBanking: 'Active',
    walletShareLast3M: '28.5%',
    eximId: 10001,
    mappingId: 9001,
    isCollapsed: true,
    eximFYearResList: demoEximFYearResList(),
    ...overrides,
  };
}

function demoEximCountryExposureRows(tabId: number): any[] {
  const isExport = tabId === 12;
  return [
    {
      countryName: isExport ? 'United States' : 'China',
      sanctionStatus: 'Blank',
      totalNumberOfShipments: 240,
      totalShipmentValue: 890000,
      exposurePercent: 32.5,
    },
    {
      countryName: isExport ? 'Germany' : 'Viet Nam',
      sanctionStatus: 'Selective Sanctions',
      totalNumberOfShipments: 120,
      totalShipmentValue: 410000,
      exposurePercent: 18.2,
    },
  ];
}

/**
 * Structured payloads for `RmEximAnalysisViewComponent` (summary, wallets, import/export, peers, HSN, anchor search).
 * Returns `undefined` when the URL is not one of these EXIM analysis APIs (other `/exim/` routes keep generic mocks).
 */
function demoEximAnalysisStaticMocks(u: string, _method: string, reqBody?: any): unknown | undefined {
  const tabId = Number(reqBody?.tabId);

  if (u.includes('getsummarydetailsbyeximid')) {
    return {
      status: 200,
      message: 'OK',
      data: {
        eximId: 10001,
        pan: 'AABCD1234E',
        companyName: 'Acme Manufacturing Pvt Ltd',
        address: 'Mumbai, Maharashtra, India',
        reportFetchedDate: '2026-04-17T10:30:00',
        consigneeCompanyCcnIdList: [...DEMO_EXIM_CONSIGNEE_CCNS],
        shipperCompanyCcnIdList: [...DEMO_EXIM_SHIPPER_CCNS],
      },
      listData: [
        {
          financial_year_start: '2023-24',
          totalExportSum: 1200000,
          totalImportSum: 800000,
          totalEximSum: 2000000,
        },
        {
          financial_year_start: '2022-23',
          totalExportSum: 950000,
          totalImportSum: 700000,
          totalEximSum: 1650000,
        },
      ],
    };
  }

  if (u.includes('exim-internal-data/analysis-data')) {
    return { status: 200, message: 'OK', data: demoEximWalletYearRows() };
  }

  if (u.includes('geteximwalletdata')) {
    return { status: 200, message: 'OK', data: demoEximWalletYearRows() };
  }

  if (u.includes('getimportexportanalysis')) {
    const importRows = [
      demoEximExportImportRow({
        buyerName: 'Shanghai Components Ltd',
        country: 'China',
        mappingId: 9101,
        walletShareLast3M: '19%',
      }),
      demoEximExportImportRow({
        buyerName: 'Hanoi Packaging Co',
        country: 'Viet Nam',
        mappingId: 9102,
        eximId: 10001,
      }),
    ];
    const exportRows = [
      demoEximExportImportRow({
        buyerName: 'Atlantic Retail Corp',
        country: 'United States',
        mappingId: 9201,
      }),
      demoEximExportImportRow({
        buyerName: 'EU Foods SA',
        country: 'Germany',
        mappingId: 9202,
        isHsbcPresence: false,
        hsbcBanking: 'Prospect',
      }),
    ];
    const rows = tabId === 1 ? importRows : exportRows;
    return { status: 200, message: 'OK', listData: rows, data: rows.length };
  }

  if (u.includes('getsamebuyersellerpeer')) {
    const peers =
      tabId === 4
        ? [demoEximBuyerSellerPeerRow('buyer', 1), demoEximBuyerSellerPeerRow('buyer', 2)]
        : [demoEximBuyerSellerPeerRow('seller', 1), demoEximBuyerSellerPeerRow('seller', 2)];
    return { status: 200, message: 'OK', listData: peers, data: peers.length };
  }

  if (u.includes('getproductimportexportpeer')) {
    const products =
      tabId === 6
        ? [demoEximProductPeerRow('export', 0), demoEximProductPeerRow('export', 1)]
        : [demoEximProductPeerRow('import', 0), demoEximProductPeerRow('import', 1)];
    return { status: 200, message: 'OK', listData: products, data: products.length };
  }

  if (u.includes('get-new-buyer-seller')) {
    const rows =
      tabId === 8
        ? [
            {
              buyerName: 'Prospect export buyer Alpha',
              totalNumberOfShipments: 44,
              totalShipmentValue: 188000,
              address: 'Phase 2, MIDC, Pune',
            },
            {
              buyerName: 'Prospect export buyer Beta',
              totalNumberOfShipments: 31,
              totalShipmentValue: 142000,
              address: 'SIDCO Industrial Estate, Chennai',
            },
          ]
        : [
            {
              buyerName: 'Prospect import seller Gamma',
              totalNumberOfShipments: 58,
              totalShipmentValue: 256000,
              address: 'NH-8, Gurgaon',
            },
            {
              buyerName: 'Prospect import seller Delta',
              totalNumberOfShipments: 22,
              totalShipmentValue: 98000,
              address: 'EM Bypass, Kolkata',
            },
          ];
    return { status: 200, message: 'OK', listData: rows, data: rows.length };
  }

  if (u.includes('get-anchor')) {
    return {
      status: 200,
      message: 'OK',
      listData: [
        { name: 'Demo Anchor Global Ltd', ccn_id: 50001 },
        { name: 'Second Anchor Corp', ccn_id: 50002 },
      ],
      data: 2,
    };
  }

  if (u.includes('get-ccn-anchor')) {
    return {
      status: 200,
      message: 'OK',
      listData: [
        { nameOfCompetitor: 'Indian Logistics Pvt Ltd', ccnId: 20101, noOfShipment: 88, shipmentValue: 265000 },
        { nameOfCompetitor: 'Coastal Traders Ltd', ccnId: 20102, noOfShipment: 62, shipmentValue: 198000 },
      ],
      data: 2,
    };
  }

  if (u.includes('get-country-exposure')) {
    const rows = demoEximCountryExposureRows(tabId);
    const response =
      tabId === 12
        ? {
            exportSanctionPercentage: '4.1',
            exportSelectiveSanctionPercentage: '2.3',
            totalExportSanctionValue: 12000,
            totalExportSelectiveSanctionValue: 8000,
          }
        : {
            importSanctionPercentage: '3.5',
            importSelectiveSanctionPercentage: '1.8',
            totalImportSanctionValue: 9000,
            totalImportSelectiveSanctionValue: 5000,
          };
    return { status: 200, message: 'OK', listData: rows, data: rows.length, response };
  }

  if (u.includes('getsearchbyproduct')) {
    const payload = {
      searchByProductId: 88001,
      buyerName: 'Demo buyer network (search)',
      totalNumberOfShipments: 150,
      totalShipmentValue: 420000,
      address: 'Sector 18, Gurgaon',
      mappingDataList: [
        {
          name: 'Peer One Ltd',
          noOfShipments: 60,
          valueUsd: 180000,
          address: 'Ahmedabad',
          hsnData: [{ hsnCode: '8471', qty: '1' }],
        },
        {
          name: 'Peer Two Ltd',
          noOfShipments: 45,
          valueUsd: 120000,
          address: 'Indore',
          hsnData: [{ hsnCode: '8517', qty: '2' }],
        },
      ],
    };
    return {
      status: 200,
      message: 'OK',
      listData: [JSON.stringify(payload)],
      data: 1,
    };
  }

  if (u.includes('geteximcountrymasterlist')) {
    return {
      status: 200,
      message: 'OK',
      data: [
        { countryName: 'India', countryCode: 'IN' },
        { countryName: 'United States', countryCode: 'US' },
        { countryName: 'China', countryCode: 'CN' },
        { countryName: 'Germany', countryCode: 'DE' },
        { countryName: 'Singapore', countryCode: 'SG' },
      ],
    };
  }

  if (u.includes('gethsncodebyeximid')) {
    return {
      status: 200,
      message: 'OK',
      data: {
        exportHsnData: [
          { code: '84713000', description: 'Portable automatic data-processing machines' },
          { code: '85176200', description: 'Machines for reception, conversion and transmission of voice/data' },
        ],
        importHsnData: [{ code: '85423100', description: 'Processors and controllers, whether or not with memory' }],
      },
    };
  }

  if (u.includes('get-hsn-code')) {
    return {
      status: 200,
      message: 'OK',
      data: [
        { code: '84713000', description: 'Portable automatic data-processing machines', value: 125000 },
        { code: '84714900', description: 'Other automatic data-processing machines', value: 98000 },
      ],
    };
  }

  if (u.includes('download-country-exposure')) {
    return {
      status: 200,
      message: 'OK',
      data: 'RGVtbw==',
      fileName: 'CountryExposure_demo.xlsx',
    };
  }

  return undefined;
}

function extraStaticDemoMocks(u: string, method: string, reqBody?: any): unknown | undefined {
  const ok = (data: unknown, extra: Record<string, unknown> = {}) => ({
    status: 200,
    message: 'OK',
    data,
    ...extra,
  });

  if (u.includes('getmcatabdetails')) {
    return demoRmPortfolioViewMcaTabDetails(reqBody);
  }
  if (u.includes('getmcanetworktabdetais')) {
    return demoRmPortfolioViewNetworkDetails(reqBody);
  }
  if (u.includes('getalertstabdetais')) {
    return demoRmPortfolioViewAlertsDetails(reqBody);
  }
  if (u.includes('getapiauditdata')) {
    return demoRmPortfolioViewApiAuditList();
  }
  if (u.includes('get_audit_data')) {
    return demoHsbcGetAuditDataResponse(reqBody);
  }
  if (u.includes('getstatusfororderfinancial')) {
    return demoRmPortfolioViewOrderFinancialStatus();
  }
  if (u.includes('get-crilc-lender-details')) {
    return demoRmPortfolioCrilcLendersResponse();
  }
  if (u.includes('corporate-announcements/stats')) {
    return [
      {
        group: 'Results',
        totalCount: 5,
        subgroups: [
          { subgroup: 'Quarterly Results', count: 3 },
          { subgroup: 'Annual Report', count: 2 },
        ],
      },
      {
        group: 'AGM / EGM',
        totalCount: 2,
        subgroups: [{ subgroup: 'AGM Notice', count: 2 }],
      },
      {
        group: 'Corporate Actions',
        totalCount: 1,
        subgroups: [{ subgroup: 'Dividend', count: 1 }],
      },
    ];
  }
  if (u.includes('corporate-announcements/categories/all')) {
    return ['All', 'Results', 'AGM / EGM', 'Corporate Actions', 'Insider Trading'];
  }
  if (u.includes('corporate-announcements/categories/subcategories')) {
    return ['Board Meeting', 'Dividend', 'Quarterly Results', 'Annual Report'];
  }

  if (u.includes('getportfolioinitdata')) {
    return ok({
      customerIdList: ['DEMO-CUST-001', 'DEMO-CUST-002'],
      customerMap: {
        'DEMO-CUST-001': 'Acme Manufacturing Pvt Ltd',
        'DEMO-CUST-002': 'Zenith Logistics Ltd',
      },
      customerPanMap: {
        'DEMO-CUST-001': 'AABCD1234E',
        'DEMO-CUST-002': 'AABCD5678F',
      },
    });
  }

  if (u.includes('getportfolioanalysisdata')) {
    return ok(demoPortfolioAnalysisPayload(reqBody));
  }

  if (u.includes('get-supplier-customer-level-report')) {
    return ok(demoSupplierCustomerLevelPayload(reqBody));
  }

  if (u.includes('get-request-customer-portfolio')) {
    return ok(demoPortfolioRequestRows());
  }
  if (u.includes('get-total-company-list')) {
    return ok(demoPortfolioRequestRows().filter((r) => r.status === 'Approved' || r.status === 'Pending'));
  }
  if (u.includes('search-request-customer-portfolio') || u.includes('search-customer-data')) {
    return ok([
      {
        customerName: 'Acme Manufacturing Pvt Ltd',
        companyType: 'Private Limited',
        pan: 'AABCD1234E',
        cin: 'L25200MH1995PLC085963',
      },
    ]);
  }
  if (u.includes('search-rm-data')) {
    return ok([
      { employeeName: 'Alex Morgan', rmId: 'RM001', rmEmailId: 'alex.morgan@demo.hsbc' },
      { employeeName: 'Sam Patel', rmId: 'RM002', rmEmailId: 'sam.patel@demo.hsbc' },
    ]);
  }
  if (u.includes('search-by-rmid')) {
    const rows = demoPortfolioRequestRows().slice(0, 4);
    return {
      status: 200,
      message: 'Success',
      data: {
        responseDtos: rows.map((r) => ({ ...r, selected: false, timeFrame: null })),
      },
    };
  }
  if (u.includes('save-request-customer-portfolio') || u.includes('save-request-by-rm')) {
    return { status: 200, message: 'Request processed successfully', data: [] };
  }
  if (u.includes('search-history-by-rm')) {
    return ok(demoPortfolioRequestRows().slice(0, 3));
  }
  if (u.includes('update-request-rm-by-uuid') || u.includes('update-request-rm-by-ids')) {
    return { status: 200, message: 'Updated', data: true };
  }

  if (u.includes('/gstanalysis/tpbypan')) {
    return {
      status: 200,
      isDisplayStatus: 1,
      message: 'OK',
      data: 120001,
    };
  }

  if (u.includes('/gstanalysis/gettpbypandata')) {
    const rows = demoGstinListRows();
    const pageFrom = Number(reqBody?.filterJSON ? JSON.parse(reqBody.filterJSON)?.paginationFROM : 0) || 0;
    const pageSize = Number(reqBody?.filterJSON ? JSON.parse(reqBody.filterJSON)?.paginationTO : 10) || 10;
    const safeStart = Math.max(0, pageFrom);
    const pageRows = rows.slice(safeStart, safeStart + pageSize);
    const states = Array.from(new Set(rows.map((r) => r.state)));
    return {
      status: 200,
      message: 'OK',
      data: rows.length,
      listData: pageRows,
      dataList: states,
    };
  }

  if (u.includes('/gstanalysis/get_gst_history')) {
    const rows = demoGstHistoryRows();
    // Keep GST demo stable: always return full history rows so table rendering
    // stays consistent and does not fluctuate with transient filter/paging state.
    return {
      status: 200,
      message: 'OK',
      data: {
        status: 200,
        message: 'OK',
        listData: rows,
        data: rows.length,
      },
    };
  }

  if (u.includes('/api/my-portfolio/categories/all')) {
    return ok(['All', 'Regulatory', 'Corporate Actions', 'Credit']);
  }
  if (u.includes('/api/my-portfolio/stats')) {
    return ok(demoMyPortfolioStatsPayload());
  }
  if (u.includes('/api/my-portfolio/announcements')) {
    return ok(demoMyPortfolioAnnouncementsPage());
  }
  if (u.includes('/api/my-portfolio/subscription/counts')) {
    return ok({ all: 12, subscribed: 5, notSubscribed: 7 });
  }
  if (u.includes('/api/my-portfolio/subscription/status')) {
    return ok({
      subscribed: ['L25200MH1995PLC085961'],
      unsubscribed: ['L25200MH1995PLC085962'],
    });
  }
  if (u.includes('/api/my-portfolio/subscription/save') || u.includes('/api/my-portfolio/subscription/get')) {
    return ok({ success: true });
  }
  if (u.includes('/api/my-portfolio/companies')) {
    const rows = demoGenericTableRows(6).map((r, i) => ({
      ...r,
      cin: `L25200MH1995PLC08596${i}`,
      companyName: r.name,
    }));
    return ok({ content: rows, totalElements: rows.length });
  }
  if (u.includes('/api/my-portfolio/companies/by-cins')) {
    return ok(demoGenericTableRows(4));
  }

  if (u.includes('industry-news/metadata')) {
    return ok(demoIndustryNewsMetadataPayload());
  }
  if (u.includes('industry-news/fetch')) {
    return ok(demoIndustryNewsFetchPayload());
  }
  if (u.includes('industry-news/save-article') || u.includes('industry-news/delete-article')) {
    return { status: 200, message: 'OK', data: {} };
  }
  if (u.includes('industry-news/saved-articles')) {
    return ok({ content: [], totalElements: 0 });
  }

  if (u.includes('corporate-announcements/fetch') || u.includes('corporate-announcements/fetchfiltered')) {
    return ok({
      content: demoMyPortfolioAnnouncementsPage().content,
      totalElements: 5,
      page: 0,
      size: 10,
    });
  }
  if (u.includes('/api/v1/msme/announcements')) {
    return ok([]);
  }
  if (u.includes('corporate-announcements/subscription/')) {
    return ok({ saved: true });
  }

  if (u.includes('filter/top-bar/getcitylocationpincode')) {
    return ok([
      { city: 'Mumbai', pincode: '400001' },
      { city: 'Mumbai', pincode: '400051' },
    ]);
  }
  if (u.includes('filter/get-schedular')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('filter/get-rm-hierarchy-by-role-and-type')) {
    return ok([
      { empCode: 'RM001', name: 'Alex Morgan', level: 1 },
      { empCode: 'RM002', name: 'Sam Patel', level: 2 },
    ]);
  }
  if (u.includes('filter/getassignmentsource')) {
    return ok([{ id: 1, name: 'Campaign' }, { id: 2, name: 'Referral' }]);
  }

  if (u.includes('opl/bucket/deseriablizefile') || u.includes('getstreamdatabybucketrefid')) {
    return ok({ fileName: 'demo.txt', content: 'RGVtbw==' });
  }

  if (u.includes('admin/dashboard/getbulkapidashboard') || u.includes('getmigrationapi')) {
    return ok(demoGenericTableRows(8));
  }
  if (u.includes('admin/dashboard/getapistatus')) {
    return ok({ healthy: 42, degraded: 2, down: 0, rows: demoGenericTableRows(5) });
  }
  if (u.includes('getbulkapisyncasyncdashboard')) {
    return ok({ sync: 10, async: 4, details: demoGenericTableRows(6) });
  }
  if (u.includes('api-history/getapihistory')) {
    return ok(demoAuditLogRows());
  }

  if (u.includes('rejected-portfolio/')) {
    return ok(demoPortfolioRequestRows().map((r) => ({ ...r, rejectionReason: 'Demo' })));
  }

  if (u.includes('abb_account/')) {
    return ok(demoGenericTableRows(10));
  }

  if (u.includes('tracxn/')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('newgccann/')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('fdiodiandecbwallet')) {
    return ok(demoUploadHistoryShort());
  }

  const bsAnalysisDemo = demoRmBankStatementAnalysisStaticMocks(u, method, reqBody);
  if (bsAnalysisDemo !== undefined) {
    return bsAnalysisDemo;
  }

  if (u.includes('bsanalysis/')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('prescreen/')) {
    return ok(demoUploadHistoryShort());
  }

  const eximAnalysisMock = demoEximAnalysisStaticMocks(u, method, reqBody);
  if (eximAnalysisMock !== undefined) {
    return eximAnalysisMock;
  }

  if (u.includes('/exim/') || u.includes('eximdashboard/') || u.includes('exim-internal-data/')) {
    return ok(demoUploadHistoryShort());
  }

  if (u.includes('commercial/cibil') || u.includes('consumer/cibil')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('crif-commercial-pr/history')) {
    return ok(demoCrifCommercialPrHistoryPage());
  }
  if (u.includes('crif-commercial-pr/input-master-ids')) {
    return ok(demoCrifCommercialPrInputMasterIds());
  }
  if (u.includes('commercial/crif') || u.includes('crif-commercial-pr')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('crilc/')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('commercial/cibilpr')) {
    return ok(demoGenericTableRows(6));
  }

  if (u.includes('/matching/')) {
    return ok(demoUploadHistoryShort());
  }

  if (u.includes('customer-rm-mapping/')) {
    return ok(demoGenericTableRows(8));
  }

  if (u.includes('country-master/')) {
    return ok(demoUploadHistoryShort());
  }

  if (u.includes('data-stream/')) {
    return ok({ bronze: 100, silver: 80, audit: demoAuditLogRows().slice(0, 3) });
  }

  if (u.includes('staffhierarchyrole')) {
    return ok(demoBankUserRows());
  }

  if (u.includes('notification-transactions/') || u.includes('notification-master/')) {
    return ok(demoGenericTableRows(5));
  }

  if (
    u.includes('loansinternalbs') &&
    !u.includes('getportfolioinitdata') &&
    !u.includes('getportfolioanalysisdata')
  ) {
    return ok(demoGenericTableRows(7));
  }

  if (u.includes('dashboard/getprdashboardfilterdata')) {
    return ok({
      filters: demoPrFiltersMinimal(),
      datasets: demoPrDatasetList(),
    });
  }

  if (u.includes('dashboard/getprdashboarddependentfilterlist')) {
    return ok({
      dependent_filters: {
        options: [
          { key: '0–25%', value: '1' },
          { key: '25–50%', value: '2' },
          { key: '50–75%', value: '3' },
          { key: '75–100%', value: '4' },
        ],
      },
    });
  }

  if (u.includes('dashboard/getprdashboarddependentfilterdata')) {
    const depRows = [
      { key: 'Mumbai', value: 'LOC-MUM' },
      { key: 'Delhi NCR', value: 'LOC-DEL' },
      { key: 'Bengaluru', value: 'LOC-BLR' },
      { key: 'Chennai', value: 'LOC-CHN' },
    ];
    return ok({ data: depRows });
  }

  if (u.includes('dashboard/getlendinganalysisfromlipisearch')) {
    return demoPrLendingAnalysisPayload(reqBody);
  }

  if (u.includes('dashboard/getlendinganalysis') && !u.includes('lipisearch')) {
    return demoPrLendingAnalysisPayload(reqBody);
  }
  if (u.includes('dashboard/getdecpan')) {
    return ok({ pan: 'AABCD1234E', masked: 'AABCD****E' });
  }
  if (u.includes('dashboard/downloadexcelpr')) {
    return ok({ fileId: 'demo' });
  }

  if (u.includes('clientupdate/')) {
    return ok([{ id: 1, reason: 'Documentation' }, { id: 2, reason: 'Policy' }]);
  }

  if (u.includes('fct/')) {
    return ok(demoUploadHistoryShort());
  }

  if (u.includes('bulk/getexchangerateuploadedfiledata') || u.includes('bulk/exchange-master-upload')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('bulk/get-exch-data-by-mst-id')) {
    return ok(demoGenericTableRows(5));
  }

  if (u.includes('api/dashboard/order-crisil-data') || u.includes('api/dashboard/get-crisil-data')) {
    return ok({ orderId: 'DEMO-1', status: 'Ready' });
  }

  if (u.includes('filter/user-filter')) {
    return ok(demoGenericTableRows(4));
  }

  if (u.includes('getpanfromdinfordirector')) {
    return ok([{ din: '123', pan: 'AABCD1234E' }]);
  }

  if (u.includes('insta/finance/getdirectorcontact')) {
    // Component assigns `directorDetails.contactNo = response.data` (full number for `maskContactNo`).
    return ok('+919876543210');
  }

  if (u.includes('income-dashboard/filter-options')) {
    return ok({ years: ['2026', '2025', '2024', '2023'] });
  }
  if (u.includes('income-dashboard/visualization')) {
    return ok(demoIncomeVisualizationPayload(reqBody));
  }
  if (u.includes('income-dashboard/')) {
    return ok(demoGenericTableRows(6));
  }

  if (u.includes('hsn-bulk-upload/')) {
    return ok(demoUploadHistoryShort());
  }

  if (u.includes('api/report-status')) {
    return ok({ status: 'Idle', lastRun: '2026-02-01' });
  }

  if (u.includes('get-agri-exim-hsn-detail')) {
    return ok(demoGenericTableRows(5));
  }

  if (u.includes('customer/getallactivecustomertypes')) {
    return ok([{ id: 1, name: 'MSME' }, { id: 2, name: 'Corporate' }]);
  }

  if (u.includes('approvallevel/') || u.includes('api/config-cache')) {
    return ok(demoGenericTableRows(4));
  }

  if (u.includes('help-and-support/')) {
    return ok(demoUploadHistoryShort());
  }

  if (u.includes('loansmca/') || u.includes('/customer/') || u.includes('/bulk/')) {
    return ok(demoGenericTableRows(10));
  }

  return undefined;
}
