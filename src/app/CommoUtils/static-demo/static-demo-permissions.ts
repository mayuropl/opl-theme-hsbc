import { Constants } from '../constants';

/**
 * Synthetic `actionName` for static demo so pages that parse permissions from
 * `action.actionName.split('_').pop()` (e.g. Existing Portfolio Search by) still
 * receive tokens like CITY / SEGMENT / REGION matching `topBarFilters[].name`.
 */
function staticDemoActionName(actionId: number): string {
  const pa = Constants.PageActions as Record<string, number>;
  const topBarKey = Object.keys(pa).find(
    (k) => k.startsWith('TOPBAR_FILTER_') && pa[k] === actionId
  );
  if (topBarKey) {
    return topBarKey;
  }
  return `PAGE_PERM_${actionId}`;
}

/** Every PageActions id so *ngIf="isActionAvail(...)" passes in static demo. */
export function allDemoPageActions(): { actionId: number; actionName: string }[] {
  return Object.values(Constants.PageActions)
    .filter((v): v is number => typeof v === 'number')
    .map((actionId) => ({ actionId, actionName: staticDemoActionName(actionId) }));
}

/** Covers isActionAvailforSubpage(subPageId, ...) for any pageMaster id. */
export function demoSubSubpagesAll(): { subpageId: number; actions: { actionId: number; actionName: string }[] }[] {
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
        demoGroup(
          'sd_campaign_dash',
          'Campaign Dashboard',
          [
            demoLeaf('hsbc/opportunity-dashboard', 'ETB Dashboard'),
            demoLeaf('hsbc/opportunity-dashboard-ntb', 'NTB Dashboard'),
          ],
          true
        ),
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
      demoLeaf('hsbc/rmEXIMAnalysis', 'EXIM Analysis'),
      demoLeaf('hsbc/rmCommercialBureau', 'Commercial Bureau'),
      demoLeaf('hsbc/newRmBankStatementAnalysis', 'New Bank Statement Analysis'),
    ]),
    section('sd_bulk', 'Bulk Upload', 'fi fi-sr-file-upload', [
      demoLeaf('hsbc/country-master-bulk-upload', 'Country Master'),
      demoLeaf('hsbc/new-gcc-upload', 'New GCC Upload'),
      demoLeaf('hsbc/new-age-economy-upload', 'New-age Economy'),
      demoLeaf('hsbc/commercial-crif-pr-data', 'Commercial CRIF PR'),
    ]),
    section('sd_misc', 'Tools & Other', 'fi fi-sr-settings', [
      demoLeaf('hsbc/login-img-upload', 'Login Image Upload'),
      demoLeaf('hsbc/help-and-support-upload', 'Help Support Upload'),
    ]),
  ];
}
