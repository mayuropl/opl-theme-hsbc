import { Constants } from '../constants';

/** Every PageActions id so *ngIf="isActionAvail(...)" passes in static demo. */
export function allDemoPageActions(): { actionId: number }[] {
  return Object.values(Constants.PageActions)
    .filter((v): v is number => typeof v === 'number')
    .map((actionId) => ({ actionId }));
}

/** Covers isActionAvailforSubpage(subPageId, ...) for any pageMaster id. */
export function demoSubSubpagesAll(): { subpageId: number; actions: { actionId: number }[] }[] {
  const actions = allDemoPageActions();
  return Object.values(Constants.pageMaster)
    .filter((v): v is number => typeof v === 'number')
    .map((subpageId) => ({ subpageId, actions }));
}

function hashPath(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 900000 + 1;
}

function demoLeaf(routePath: string, label: string): any {
  const subpageId = hashPath(routePath);
  const actions = allDemoPageActions();
  const subSubpages = demoSubSubpagesAll();
  return {
    id: 'sd_' + routePath.replace(/[^a-zA-Z0-9]/g, '_'),
    label,
    routeLink: routePath.startsWith('/') ? routePath : '/' + routePath,
    data: {
      subpageId,
      subpageName: label,
      routeLink: routePath.replace(/^\//, ''),
      tabKey: 'sd_tab_' + subpageId,
      actions,
      subSubpages,
    },
    tabKey: 'sd_tab_' + subpageId,
    children: [],
    expanded: false,
    visible: true,
  };
}

function section(id: string, label: string, icon: string, children: any[], expanded = false): any {
  return {
    id,
    label,
    icon,
    visible: true,
    expanded,
    children,
  };
}

/** Parent row with nested children (e.g. Campaign Dashboard → ETB / NTB / Bulk). */
function demoGroup(id: string, label: string, children: any[], expanded = false): any {
  return {
    id,
    label,
    visible: true,
    expanded,
    children,
  };
}

/** Full HSBC sidebar: all major routes, no permission filtering. */
export function buildStaticDemoFullMenu(): any[] {
  return [
    section(
      'sd_dash',
      'Dashboard',
      'fi fi-sr-chart-pie',
      [
        demoLeaf('hsbc/bank-statement-analysis', 'HSBC Bank Statement Payment Analysis'),
        demoLeaf('hsbc/average-bank-balance-analysis', 'Average Bank Balance Analysis'),
        demoLeaf('hsbc/walllet-dashboard', 'Lending Wallet Dashboard'),
        demoLeaf('hsbc/income-dashboard', 'Income Dashboard'),
        demoLeaf('hsbc/walllet-dashboard-structured', 'PR-Dashboard-Structured'),
        demoGroup(
          'sd_campaign_dash',
          'Campaign Dashboard',
          [
            demoLeaf('hsbc/opportunity-dashboard', 'ETB Dashboard'),
            demoLeaf('hsbc/opportunity-dashboard-ntb', 'NTB Dashboard'),
            demoLeaf('hsbc/campaign-through-bulk-upload', 'Campaign Through Bulk Upload'),
          ],
          true
        ),
        demoLeaf('hsbc/walllet-dashboard-lipisearch', 'Lipisearch Lending Wallet Dashboard'),
      ],
      true
    ),
    section(
      'sd_port',
      'Portfolio',
      'fas fa-tasks',
      [
        demoLeaf('hsbc/rmExisitingPortfolio', 'Existing Portfolio'),
        demoLeaf('hsbc/rmTargetsProspects', 'Targets and prospects'),
        demoLeaf('hsbc/rmDashboard', 'Pre-Qualified Products'),
        demoLeaf('hsbc/requested-portfolio', 'Requested Portfolio'),
        demoLeaf('hsbc/my-portfolio', 'My Portfolio'),
      ],
      true
    ),
    section('sd_an', 'Analytics', 'fi fi-rr-chat-arrow-grow', [
      demoLeaf('hsbc/rmGSTAnalysis', 'GST Analysis'),
      demoLeaf('hsbc/rmGSTAnalysisView', 'GST Analysis View'),
      demoLeaf('hsbc/rmEXIMAnalysis', 'EXIM Analysis'),
      demoLeaf('hsbc/rmEXIMAnalysisView', 'EXIM Analysis View'),
      demoLeaf('hsbc/rmBankStatementAnalysis', 'Bank Statement Analysis'),
      demoLeaf('hsbc/rmCommercialBureau', 'Commercial Bureau'),
      demoLeaf('hsbc/rmCommercialBureauDetails', 'Commercial Bureau Details'),
      demoLeaf('hsbc/rmConsumerBureau', 'Consumer Bureau'),
      demoLeaf('hsbc/rmConsumerBureauDetail', 'Consumer Bureau Detail'),
      demoLeaf('hsbc/newRmBankStatementAnalysis', 'New Bank Statement Analysis'),
      demoLeaf('hsbc/rmApiAuditLogs', 'RM API Audit Logs'),
    ]),
    section('sd_bulk', 'Bulk Upload', 'fi fi-sr-file-upload', [
      demoLeaf('hsbc/Bulk-Upload', 'Bulk Upload PABL'),
      demoLeaf('hsbc/Customer-Master-Bulk-Upload', 'Customer Master'),
      demoLeaf('hsbc/Customer-Bulk-Upload', 'Customer Bulk (EXIM)'),
      demoLeaf('hsbc/customer_seg_bulk_upload', 'Customer Seg Bulk'),
      demoLeaf('hsbc/Hrms-Bulk-Upload', 'HRMS Bulk'),
      demoLeaf('hsbc/Commercial-Cibil-Bulk-Upload', 'Commercial CIBIL'),
      demoLeaf('hsbc/consumer-cibil-bulk-upload', 'Consumer CIBIL'),
      demoLeaf('hsbc/bank-portfolio-upload', 'Bank Portfolio'),
      demoLeaf('hsbc/region-master-bulk-upload', 'Region Master'),
      demoLeaf('hsbc/country-master-bulk-upload', 'Country Master'),
      demoLeaf('hsbc/customer-income-bulk-upload', 'Customer Income'),
      demoLeaf('hsbc/customer-rm-mapping-bulk-upload', 'Customer RM Mapping'),
      demoLeaf('hsbc/hsbc-banking-bulk-data', 'HSBC Banking Bulk'),
      demoLeaf('hsbc/pre-screen-data-upload', 'Pre-Screen Data'),
      demoLeaf('hsbc/avgBankBalanceUpload', 'Avg Bank Balance Upload'),
      demoLeaf('hsbc/tracxn-lending-indicators-bulk-data', 'Tracxn Lending'),
      demoLeaf('hsbc/new-gcc-upload', 'New GCC Upload'),
      demoLeaf('hsbc/new-age-economy-upload', 'New-age Economy'),
      demoLeaf('hsbc/bank-protfolio-upload-one-time', 'Bank Portfolio One-time'),
      demoLeaf('hsbc/exim-external-data-upload', 'EXIM External'),
      demoLeaf('hsbc/hsn-bulk-data-upload', 'HSN Bulk'),
      demoLeaf('hsbc/exim-exchange-rate-upload', 'EXIM Exchange Rate'),
      demoLeaf('hsbc/exim-internal-bulk-upload', 'EXIM Internal'),
      demoLeaf('hsbc/commercial-crif-pr-data', 'Commercial CRIF PR'),
      demoLeaf('hsbc/crilic-data-upload', 'Crilic Upload'),
      demoLeaf('hsbc/upload-bank-statement/DEMO_PAN', 'Upload Bank Statement'),
    ]),
    section('sd_misc', 'Tools & Other', 'fi fi-sr-settings', [
      demoLeaf('hsbc/bureauConfig', 'Bureau Configuration'),
      demoLeaf('hsbc/apiAuditLog', 'API Audit Log'),
      demoLeaf('hsbc/trailLog', 'Trail Log'),
      demoLeaf('hsbc/encrypt-decrypt', 'Encrypt / Decrypt'),
      demoLeaf('hsbc/matching-tool-cue-data', 'Matching Tool CUE'),
      demoLeaf('hsbc/notification-configuration', 'Notification Dashboard'),
      demoLeaf('hsbc/help-and-support', 'Help and Support'),
      demoLeaf('hsbc/hsbc-facility-file', 'Facility File'),
      demoLeaf('hsbc/crilic-data-fetch-processing', 'Crilic Fetch Processing'),
      demoLeaf('hsbc/my-saved-articles', 'My Saved Articles'),
      demoLeaf('hsbc/login-img-upload', 'Login Image Upload'),
      demoLeaf('hsbc/help-and-support-upload', 'Help Support Upload'),
    ]),
  ];
}
