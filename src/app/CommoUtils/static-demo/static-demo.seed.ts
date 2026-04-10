import { Constants } from '../constants';

/**
 * Session keys use the same encoding as CommonService.setStorage (btoa).
 */
function btoaUtf8(value: string): string {
  return btoa(value);
}

/** Minimal menu + permissions for sidebar and portfolio filters. */
function buildUsPrJson(): string {
  const portfolioActions = [
    { actionId: 'DEMO_CITY', actionName: 'PORTFOLIO_CITY' },
    { actionId: 'DEMO_SEG', actionName: 'PORTFOLIO_SEGMENT' },
    { actionId: 'DEMO_REG', actionName: 'PORTFOLIO_REGION' },
  ];

  const pages = [
    {
      pageId: Constants.pageMaster.PORTFOLIO_ANALYSIS,
      pageName: 'Dashboard',
      subpages: [
        {
          subpageId: Constants.pageMaster.OPPORTUNITY,
          subpageName: 'RM Dashboard',
          routeLink: 'hsbc/rmDashboard',
        },
        {
          subpageId: Constants.pageMaster.SELECT_BANKER_DASHBOARD,
          subpageName: 'Opportunity Dashboard',
          routeLink: 'hsbc/opportunity-dashboard',
        },
      ],
    },
    {
      pageId: Constants.pageMaster.PORTFOLIO_NEW,
      pageName: 'Portfolio',
      subpages: [
        {
          subpageId: Constants.pageMaster.EXISTING_PORTFOLIO,
          subpageName: 'Existing Portfolio',
          routeLink: 'hsbc/rmExisitingPortfolio',
          pageName: 'Existing Portfolio',
          actions: portfolioActions,
          isCustomerTypeInActive: false,
        },
        {
          subpageId: Constants.pageMaster.TARGETS_AND_PROSPECTS,
          subpageName: 'Targets & Prospects',
          routeLink: 'hsbc/rmTargetsProspects',
          pageName: 'Targets & Prospects',
          actions: portfolioActions,
          isCustomerTypeInActive: false,
        },
        {
          subpageId: Constants.pageMaster.FIND_PROSPECT,
          subpageName: 'Find Prospects',
          routeLink: 'hsbc/rmTargetsProspectsFind',
          actions: portfolioActions,
        },
        {
          subpageId: Constants.pageMaster.REQUESTED_PORTFOLIO,
          subpageName: 'Requested Portfolio',
          routeLink: 'hsbc/requested-portfolio',
        },
      ],
    },
    {
      pageId: Constants.pageMaster.ANALYTICS2,
      pageName: 'Analytics',
      subpages: [
        {
          subpageId: Constants.pageMaster.GST_ANALYSIS2,
          subpageName: 'GST Analysis',
          routeLink: 'hsbc/rmGSTAnalysis',
        },
        {
          subpageId: Constants.pageMaster.BANK_STATEMENT_ANALYSIS2,
          subpageName: 'Bank Statement',
          routeLink: 'hsbc/rmBankStatementAnalysis',
        },
        {
          subpageId: Constants.pageMaster.EXIM_ANALYSIS2,
          subpageName: 'EXIM Analysis',
          routeLink: 'hsbc/rmEXIMAnalysis',
        },
      ],
    },
    {
      pageId: Constants.pageMaster.BULK_UPLOAD,
      pageName: 'Bulk Upload',
      subpages: [
        {
          subpageId: Constants.pageMaster.CUSTOMER_MASTER,
          subpageName: 'Customer Master',
          routeLink: 'hsbc/Customer-Master-Bulk-Upload',
        },
        {
          subpageId: Constants.pageMaster.COMMERCIAL_CIBIL,
          subpageName: 'Commercial CIBIL',
          routeLink: 'hsbc/Commercial-Cibil-Bulk-Upload',
        },
      ],
    },
  ];

  return JSON.stringify(pages);
}

export function seedStaticDemoLocalStorage(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const cookies = {
    [Constants.httpAndCookies.USNM]: 'demo.user@hsbc.demo',
    [Constants.httpAndCookies.LGTK]: 'demo-login-token',
    [Constants.httpAndCookies.ORGID]: '80',
    [Constants.httpAndCookies.PLATFORM_ID]: '1',
  };

  localStorage.setItem(Constants.httpAndCookies.COOKIES_OBJ, btoaUtf8(JSON.stringify(cookies)));
  localStorage.setItem(Constants.httpAndCookies.USER_ID, btoaUtf8('1'));
  localStorage.setItem(Constants.httpAndCookies.EMP_CODE, btoaUtf8('RM001'));
  localStorage.setItem(Constants.httpAndCookies.ROLEID, btoaUtf8('1'));
  localStorage.setItem(Constants.httpAndCookies.ROLE_TYPE, btoaUtf8('1'));
  localStorage.setItem(Constants.httpAndCookies.USER_NAME, btoaUtf8('Demo Banker'));
  localStorage.setItem(Constants.httpAndCookies.USERTYPE, btoaUtf8('1'));
  localStorage.setItem(Constants.httpAndCookies.ORGID, btoaUtf8('80'));
  localStorage.setItem(Constants.httpAndCookies.US_PR, btoaUtf8(buildUsPrJson()));

  // Drop cached filter master / page copies so Advanced Filters loads `insightFilterList()` from the static mock.
  localStorage.removeItem(Constants.CLEAN_FILTER_LIST_MASTER);
  localStorage.removeItem(Constants.FILTER_LIST_MASTER_EXISTING);
  localStorage.removeItem(Constants.FILTER_LIST_MASTER_TARGET);
  localStorage.removeItem(Constants.FILTER_LIST_MASTER_PROSPECTS);

  // PR wallet dashboard caches filter shape in AES storage; clear so `demoPrFiltersMinimal()` (with `options`) is always loaded.
  localStorage.removeItem(Constants.httpAndCookies.PR_DASHBOARD_FILTER_DATA_SUMMARY);
  localStorage.removeItem(Constants.httpAndCookies.PR_DASHBOARD_FILTER_DATA_COMPARISON);
}
