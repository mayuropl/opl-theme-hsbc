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
    announcementDate: '2026-02-01',
    category: 'Regulatory',
    subcategory: 'RBI',
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

/** Counterparty rows for portfolio bank-statement analysis (self / supplier / customer tables). */
function demoPortfolioAnalysisCustRows(): any[] {
  return [
    {
      custId: 'DEMO-CUST-001',
      pan: 'AABCD1234E',
      totalAmount: 2500000,
      totalRows: 3,
      interactionCount: 12,
    },
    {
      custId: 'DEMO-CUST-002',
      pan: 'AABCD5678F',
      totalAmount: 1800000,
      totalRows: 2,
      interactionCount: 8,
    },
  ];
}

function demoPortfolioAnalysisPayload(reqBody: any): any {
  const reportType = String(reqBody?.reportType ?? '1');
  const selfBank = {
    bankName: 'Demo Bank Ltd',
    totalAmount: 5000000,
    totalRows: 2,
    custIdList: demoPortfolioAnalysisCustRows(),
  };
  const inner = demoPortfolioAnalysisCustRows();

  switch (reportType) {
    case '1':
      return {
        selfTransfer: {
          debit: [selfBank],
          credit: [{ ...selfBank, bankName: 'Inward Demo Bank', totalAmount: 1200000 }],
          totalRowsDebit: 1,
          totalRowsCredit: 1,
        },
      };
    case '2':
      return {
        supplierList: {
          totalRows: 1,
          counterPartyList: [
            {
              partyName: 'Supplier Alpha Pvt Ltd',
              totalRows: 2,
              totalAmount: 3200000,
              custIdWise: inner,
            },
          ],
        },
      };
    case '3':
      return {
        customerList: {
          totalRows: 1,
          counterPartyList: [
            {
              partyName: 'Customer Beta Ltd',
              totalRows: 2,
              totalAmount: 4100000,
              custIdWise: inner,
            },
          ],
        },
      };
    case '4':
      return {
        statutoryReport: {
          data: [
            {
              category_name: 'GST / TDS',
              totalRows: 1,
              totalAmount: 900000,
              custIdWise: inner,
            },
          ],
        },
      };
    case '5':
      return {
        netSelfTransfer: {
          data: [
            {
              partyName: 'Net Demo Party',
              totalAmount: 750000,
              totalRows: 1,
              custIdWise: inner.slice(0, 1),
            },
          ],
        },
      };
    case '6':
      return {
        opportunityReport: {
          data: [
            {
              company_name: 'Opportunity Demo Co',
              totalRows: 1,
              totalAmount: 600000,
              custIdWise: inner,
            },
          ],
          totalRows: 1,
        },
      };
    default:
      return {
        selfTransfer: { debit: [], credit: [], totalRowsDebit: 0, totalRowsCredit: 0 },
      };
  }
}

/** Supplier/customer nested report — API returns JSON strings in data.supplierList | data.customerList. */
function demoSupplierCustomerLevelPayload(reqBody: any): any {
  const rt = String(reqBody?.reportType ?? '1');
  const bankRow = (bank: string) => ({
    bank,
    bank_total_rows: 1,
    bank_total_amount: 5000000,
    custIdWise: [
      {
        cust_id: 'DEMO-CUST-001',
        cust_total_rows: 2,
        cust_total_amount: 3000000,
        nameWise: [
          { name: 'Partner One', total_amount: 1500000 },
          { name: 'Partner Two', total_amount: 1500000 },
        ],
        cust_name: null,
        pan: null,
      },
    ],
  });
  if (rt === '2') {
    return {
      customerList: JSON.stringify({
        customerList: [bankRow('Demo Customer Bank')],
        totalRows: 1,
      }),
    };
  }
  return {
    supplierList: JSON.stringify({
      supplierList: [bankRow('Demo Supplier Bank')],
      totalRows: 1,
    }),
  };
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

function extraStaticDemoMocks(u: string, method: string, reqBody?: any): unknown | undefined {
  const ok = (data: unknown, extra: Record<string, unknown> = {}) => ({
    status: 200,
    message: 'OK',
    data,
    ...extra,
  });

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

  if (u.includes('corporate-announcements/stats')) {
    return ok({ total: 17, byCategory: { Regulatory: 8, Credit: 4, Other: 5 } });
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
  if (u.includes('corporate-announcements/categories/all')) {
    return ok([{ id: 1, name: 'Regulatory' }, { id: 2, name: 'Credit' }]);
  }
  if (u.includes('corporate-announcements/categories/subcategories')) {
    return ok([{ id: 10, name: 'RBI' }, { id: 11, name: 'SEBI' }]);
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

  if (u.includes('bsanalysis/')) {
    return ok(demoUploadHistoryShort());
  }
  if (u.includes('prescreen/')) {
    return ok(demoUploadHistoryShort());
  }

  if (u.includes('/exim/') || u.includes('eximdashboard/') || u.includes('exim-internal-data/')) {
    return ok(demoUploadHistoryShort());
  }

  if (u.includes('commercial/cibil') || u.includes('consumer/cibil')) {
    return ok(demoUploadHistoryShort());
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
    return ok([{ name: 'Director One', phone: '+91-9000000001' }]);
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
