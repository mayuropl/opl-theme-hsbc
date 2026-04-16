import { LeftMenuStateService } from '../left-menu-state.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener, ChangeDetectorRef, Input } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../core/services/auth.service';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { buildStaticDemoFullMenu } from 'src/app/CommoUtils/static-demo/static-demo-permissions';

export interface MenuNode {
  id: string;
  label: string;
  icon?: string;
  routeLink?: string;
  children?: MenuNode[];
  expanded?: boolean;
  visible?: boolean;
  pageId?: number;
  subPageId?: number;
  tabKey?: string;
  data?: any; // To store original page/subpage data
}

@Component({
  selector: 'app-sidemenubar',
  templateUrl: './sidemenubar.component.html',
  styleUrl: './sidemenubar.component.scss'
})
export class SidemenubarComponent implements OnInit, OnDestroy {
  @Input() closeLeftmenu = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    public commonMethod: CommonMethods,
    private msmeService: MsmeService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private leftMenuState: LeftMenuStateService
  ) { }

  get iscloseLeftmenu(): boolean {
    return typeof document !== 'undefined' && document.body.classList.contains('closeLeftmenu');
  }

  hoveredLabel: string | null = null;
  hoveredTop = 0;

  // New Menu Structure
  menuStructure: MenuNode[] = [];

  // Helper to safely toggle expansion
  toggleNode(node: MenuNode): void {
    // While the bar is collapsed, sub-menus are hidden in CSS but `expanded` flags stay true.
    // Clicking the section icon then toggles expanded → false and collapses the tree, hiding the
    // active child even though the URL did not change. Re-sync from the current route instead.
    const wasMenuCollapsed =
      typeof document !== 'undefined' && document.body.classList.contains('closeLeftmenu');

    if (typeof document !== 'undefined') {
      document.body.classList.remove('closeLeftmenu');
      this.leftMenuState.notifyStateChanged();
    }

    if (wasMenuCollapsed && this.findActiveNode(node)) {
      this.onChange();
      return;
    }

    // Recursive helper to collapse all children
    const collapseRecursive = (n: MenuNode) => {
      n.expanded = false;
      if (n.children) {
        n.children.forEach(child => collapseRecursive(child));
      }
    };

    // If opening a top-level node, close others recursively
    const isTopLevel = this.menuStructure.includes(node);
    if (isTopLevel && !node.expanded) {
      this.menuStructure.forEach(n => {
        if (n !== node) {
          collapseRecursive(n);
        }
      });
    }

    node.expanded = !node.expanded;

    // If we just collapsed the current node, also collapse its children
    if (!node.expanded) {
      if (node.children) {
        node.children.forEach(child => collapseRecursive(child));
      }
    }
  }

  isExpanded(node: MenuNode): boolean {
    return !!node.expanded;
  }

  onSectionHover(label: string, event: MouseEvent): void {
    if (!this.iscloseLeftmenu) return;
    this.hoveredLabel = label;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.hoveredTop = rect.top + rect.height / 2;
  }

  onSectionLeave(): void {
    this.hoveredLabel = null;
  }
   onMenuContainerMouseEnter(): void {
    if (typeof document === 'undefined' || this.leftMenuState.openedByButton) return;
    document.body.classList.remove('closeLeftmenu');
    this.leftMenuState.notifyStateChanged();
  }

   onMenuContainerMouseLeave(): void {
    if (typeof document === 'undefined' || this.leftMenuState.openedByButton) return;
    document.body.classList.add('closeLeftmenu');
    this.leftMenuState.notifyStateChanged();
  }
  scrolled: boolean = false;
  private leftMenuStateSub?: Subscription;
  private routerSub?: Subscription;

  notificationItems: Array<{}>;
  lender: string;
  userDetails: any = {};
  userName: string;
  roleId: any;
  languages: Array<{
    id: number,
    flag?: string,
    name: string
  }>;
  selectedLanguage: {
    id: number,
    flag?: string,
    name: string
  };

  openMobileMenu: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  // Analytics logic variables (preserved for backward compatibility with html logic if any leftovers)
  isCommercialActive: boolean = false;
  isConsumerActive: boolean = false;
  isGstTabActive: boolean = false;
  isBsTabActive: boolean = false;
  isEximTabActive: boolean = false;
  isCommCibilBulkShow: boolean = false;

  userId: any;
  pageData: any = [];
  constants: any = [];

  // Mapping for Analytics icons/tabKeys
  menuItems = [
    { id: Constants.pageMaster.GST_ANALYSIS2, icon: 'fas fa-percent', tabKey: 'isGstTabActive' },
    { id: Constants.pageMaster.BANK_STATEMENT_ANALYSIS2, icon: 'fas fa-university', tabKey: 'isBsTabActive' },
    { id: Constants.pageMaster.EXIM_ANALYSIS2, icon: 'fas fa-boxes', tabKey: 'isEximTabActive' },
    { id: Constants.pageMaster.COMMERCIAL_BUREAU2, icon: 'fas fa-building', tabKey: 'isCommercialActive' },
    { id: Constants.pageMaster.CONSUMER_BUREAU2, icon: 'fas fa-shopping-basket', tabKey: 'isConsumerActive' }
  ];
  menuMap = new Map(this.menuItems.map(menu => [menu.id, menu]));
  activeTab: any;

  ngOnInit() {
    this.leftMenuStateSub = this.leftMenuState.onLeftMenuStateChanged.subscribe(() => this.cdr.detectChanges());
    this.constants = Constants;
    this.roleId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.getUserDetails();
    this.getcommercialCibilBulkUploadShowFlag();
    const storageData = this.commonService.getStorage(Constants.httpAndCookies.US_PR, true);
    if (storageData) {
      this.pageData = JSON.parse(storageData);
    }
    this.getUserPermissionData();
    this.openMobileMenu = false;
    this.onChange();

    // Subscribe to router events to update active state on navigation
    this.routerSub = this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onChange(event.urlAfterRedirects);
      }
    });

    this.initJQueryLogic();
  }

  initJQueryLogic() {
    (function ($) {
      $(document).ready(function () {
        // Any legacy jQuery logic if really needed, but mostly replaced by Angular logic.
        // Keeping dropdown hover logic might interfere with click, so relying on Angular click handlers.
      });
    })(jQuery);
  }

  changeLanguage(language) {
    this.selectedLanguage = language;
  }

  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  logout() {
    this.commonMethod.logoutUser();
  }

  getUserDetails() {
    this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
  }

  getcommercialCibilBulkUploadShowFlag() {
    this.msmeService.getcommercialCibilBulkUploadShowFlag().subscribe(response => {
      if (response?.status == 200) {
        this.isCommCibilBulkShow = response?.flag;
      } else {
        this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
      }
    });
  }

  getUserPermissionData() {
    if (environment.staticDemo) {
      this.menuStructure = buildStaticDemoFullMenu();
      return;
    }

    if (!this.roleId || !this.userId) {
      console.log("User id and Role Should Exist");
      return;
    }

    // Initialize Base Structure
    this.menuStructure = [
      { id: 'dashboard', label: 'Dashboard', icon: 'fi fi-sr-chart-pie', visible: false, children: [] },
      { id: 'portfolio', label: 'Portfolio', icon: 'fas fa-tasks', visible: false, children: [] },
      { id: 'analytics', label: 'Analytics', icon: 'fi fi-rr-chat-arrow-grow', visible: false, children: [] },
      { id: 'bulkUpload', label: 'Bulk Upload', icon: 'fi fi-sr-file-upload', visible: false, children: [] },
      { id: 'productApproval', label: 'Product Approval Journeys', icon: 'fi fi-sr-memo-circle-check', visible: false, children: [] }
    ];

    let response: any = this.pageData;
    const pageOrderMap = new Map([
      { pageId: 125 }, { pageId: 320 }, { pageId: 39 }, { pageId: 51 },
      { pageId: 165 }
    ].map((item, index) => [item.pageId, index]));

    if (response) {
      response.sort((a, b) => {
        const orderA = pageOrderMap.get(a.pageId) ?? Infinity;
        const orderB = pageOrderMap.get(b.pageId) ?? Infinity;
        return orderA - orderB;
      });

      for (let data of response) {
        // --- Dashboard Mapping ---
        if (data.pageId == Constants.pageMaster.PORTFOLIO_ANALYSIS) {
          const dashboardNode = this.menuStructure.find(n => n.id === 'dashboard');
          if (dashboardNode && data.subpages) {
            data.subpages.forEach(sub => {
              const allowDeep = (sub.subpageName == 'Campaign Dashboard');
              const node = this.createMenuNodeFromSubpage(sub, 'dash_', true, allowDeep);
              dashboardNode.children?.push(node);
            });
            dashboardNode.visible = true;
          }
        }

        // --- Portfolio Mapping ---
        if (data.pageId == Constants.pageMaster.PORTFOLIO_NEW) {
          const portfolioNode = this.menuStructure.find(n => n.id === 'portfolio');
          if (portfolioNode && data.subpages) {
            // Define explicit order for Portfolio sub-items
            const portOrderMap = new Map([
              { pageId: Constants.pageMaster.EXISTING_PORTFOLIO },
              { pageId: Constants.pageMaster.TARGETS_AND_PROSPECTS },
              { pageId: Constants.pageMaster.PRE_APPROVED_PRODUCTS },
              { pageId: Constants.pageMaster.REQUESTED_PORTFOLIO }
            ].map((item, index) => [item.pageId, index]));

            data.subpages.sort((a, b) => {
              const orderA = portOrderMap.get(a.subpageId) ?? Infinity;
              const orderB = portOrderMap.get(b.subpageId) ?? Infinity;
              return orderA - orderB;
            });

            data.subpages.forEach(sub => {
              portfolioNode?.children?.push(this.createMenuNodeFromSubpage(sub, 'port_new_', true));
            });
            portfolioNode.visible = true;
          }
        }

        // --- Analytics Mapping ---
        if (data.pageId == Constants.pageMaster.ANALYTICS2) {
          const analyticsNode = this.menuStructure.find(n => n.id === 'analytics');
          if (analyticsNode && data.subpages) {
            data.subpages.forEach(sub => {
              // Recursively map subpages (handles Financial Analysis, Credit & Bureau, etc.)
              const node = this.createMenuNodeFromSubpage(sub, 'ana_', true, true);
              analyticsNode.children?.push(node);
            });
            analyticsNode.visible = true;
          }
        }

        // --- Bulk Upload ---
        if (data.pageId == Constants.pageMaster.BULK_UPLOAD) {
          const bulkNode = this.menuStructure.find(n => n.id === 'bulkUpload');
          if (bulkNode && data.subpages) {
            data.subpages.forEach(sub => {
              const allowDeep = (sub.subpageName == 'Exim Uploads') || (sub.subpageName == 'Crilc Uploads');
              const node = this.createMenuNodeFromSubpage(sub, 'bulk_', true, allowDeep);
              bulkNode.children?.push(node);
            });
            bulkNode.visible = true;
          }
        }

        // --- Product Approval Journeys ---
        if (data.pageId == Constants.pageMaster.PRODUCT_APPROVAL_JOURNEY) {
          const pajNode = this.menuStructure.find(n => n.id === 'productApproval');
          if (pajNode && data.subpages) {
            data.subpages.forEach(sub => {
              pajNode.children?.push(this.createMenuNodeFromSubpage(sub, 'paj_'));
            });
            pajNode.visible = true;
          }
        }
      }
    }
  }

  // Helper to create menu nodes recursively
  createMenuNodeFromSubpage(sub: any, prefix: string, recursive: boolean = false, allowSubSubpages: boolean = false): MenuNode {
    const meta = this.menuMap.get(sub.subpageId);
    const node: MenuNode = {
      id: prefix + sub.subpageId,
      label: sub.subpageName,
      routeLink: (sub.routeLink && !sub.routeLink.startsWith('/')) ? '/' + sub.routeLink : sub.routeLink,
      data: sub,
      icon: meta?.icon, // For known leaf nodes
      tabKey: meta?.tabKey || (prefix + sub.subpageId),
      children: [],
      expanded: false,
      visible: true
    };

    // If recursive check for further subpages (if the API returns them like that)
    if (recursive) {
      if (sub.subpages && sub.subpages.length > 0) {
        sub.subpages.forEach(nestedSub => {
          // Pass false for allowSubSubpages to stop deeper recursion into internal tabs
          node.children?.push(this.createMenuNodeFromSubpage(nestedSub, prefix, true, false));
        });
      }
      // Check for subSubpages ONLY if allowed
      else if (allowSubSubpages && sub.subSubpages && sub.subSubpages.length > 0) {
        sub.subSubpages.forEach(nestedSub => {
          // Pass false for allowSubSubpages to stop deeper recursion into internal tabs
          node.children?.push(this.createMenuNodeFromSubpage(nestedSub, prefix, true, false));
        });
      }
    }

    return node;
  }

  // Handle navigation
  onNodeClick(node: MenuNode, event?: MouseEvent) {
    if (event) event.stopPropagation();

    if (node.children && node.children.length > 0) {
      this.toggleNode(node);
      return;
    }

    this.resetActiveFlags(node);
  }


  resetActiveFlags(node: MenuNode) {
    // If passed a raw link object (backward compat), handle it
    const link = node.data || node;

    // Legacy logic for tabs
    const activeTab = node.tabKey || (link.tabKey);
    if (activeTab) {
      this.activeTab = activeTab;
      this.isGstTabActive = (activeTab === 'isGstTabActive');
      this.isBsTabActive = (activeTab === 'isBsTabActive');
      this.isEximTabActive = (activeTab === 'isEximTabActive');
      this.isCommercialActive = (activeTab === 'isCommercialActive');
      this.isConsumerActive = (activeTab === 'isConsumerActive');
    }

    // Clear storage
    this.commonService.removeStorage("commrcial_pan");
    this.commonService.removeStorage("consumer_pan");
    this.commonService.removeStorage("gst_pan");
    this.commonService.removeStorage("bs_pan");
    this.commonService.removeStorage("exim_pan");
    this.commonService.removeStorage("exim_search_by");
    this.commonService.removeStorage("existing_pan");

    if (link.routeLink) {
      if (link.subpageName && link.subpageName == "GTS - OneRF") {
        this.commonService.redirectToBankerModule(link.routeLink);
      } else {
        // Absolute path so navigation works from any page (routeLink from menu data is often "hsbc/..." without leading "/")
        const path = link.routeLink.startsWith('/') ? link.routeLink : '/' + link.routeLink;
        this.router.navigateByUrl(path, {
          state: { data: link }
        });
      }

      // Also close sidebar on mobile if needed
      if (window.innerWidth <= 768) {
        this.closeLeftmenu = true; // Assuming this Input controls visibility or we emit event
      }
    }
  }

  onChange(url?: string) {
    if (!url) {
      url = this.router.url;
    }

    // Strip query params for matching
    let urlPath = url?.split('?')[0];

    // Global sub-pages that are navigated to from multiple different parent pages.
    // We want the sidebar to retain the exact active state of the parent that called it.
    const preserveStateUrls = [
      '/hsbc/rmExisitingPortfolioView'
    ];

    if (preserveStateUrls.some(pUrl => urlPath?.includes(pUrl))) {
      // Use router navigation state first (handles race condition where component hasn't saved to sessionStorage yet)
      const currentNav = this.router.getCurrentNavigation();
      const stateData = currentNav?.extras?.state || history?.state;

      let parentData = null;

      // Extract from live angular state
      if (stateData && stateData.isFromParentPage) {
        parentData = stateData.dataFrom || stateData.data;
      }
      // Fallback: extract from session storage
      else {
        const routerLinkStr = this.commonService.getStorage('routerLink', true);
        if (routerLinkStr) {
          try {
            const routerLink = JSON.parse(routerLinkStr);
            parentData = routerLink?.dataFrom || routerLink?.data;
          } catch (e) {
            // Ignore parse errors
            console.error("Error parsing routerLink from session storage: ", e);
            return;
          }
        }
      }

      if (parentData && parentData.routeLink) {
        urlPath = parentData.routeLink;
        if (!urlPath.startsWith('/')) {
          urlPath = '/' + urlPath;
        }
      } else {
        return; // Do nothing, keep the previous sidebar active state intact
      }
    }

    // Reset all flags first so if no match is found, sidebar highlighting is cleared (e.g. Help & Support)
    // this.activeTab = null;
    // this.isCommercialActive = false;
    // this.isConsumerActive = false;
    // this.isGstTabActive = false;
    // this.isBsTabActive = false;
    // this.isEximTabActive = false;

    // Collapse all if we navigate to an external page
    // this.collapseAll(this.menuStructure);

    // 1. Find the best matching node (Longest matching route wins)
    // This handles overlapping routes (e.g. walllet-dashboard vs walllet-dashboard-structured) automatically
    // without hardcoded exceptions.
    let bestMatch: MenuNode | null = null;
    let maxMatchLen = -1;

    const findBestMatch = (nodes: MenuNode[]) => {
      for (const node of nodes) {
        if (node.routeLink && urlPath?.includes(node.routeLink)) {
          // Found a potential match. Is it better (longer/more specific) than current best?
          if (node.routeLink.length > maxMatchLen) {
            maxMatchLen = node.routeLink.length;
            bestMatch = node;
          }
        }
        if (node.children && node.children.length > 0) {
          findBestMatch(node.children);
        }
      }
    };

    findBestMatch(this.menuStructure);

    // 2. Activate the best match found
    if (bestMatch) {
      const node = bestMatch as MenuNode; // TS cast
      if (node.tabKey) {
        this.activeTab = node.tabKey;
      }

      // Set flags based on tabKey
      if (node.tabKey) {
        this.isGstTabActive = (node.tabKey === 'isGstTabActive');
        this.isBsTabActive = (node.tabKey === 'isBsTabActive');
        this.isEximTabActive = (node.tabKey === 'isEximTabActive');
        this.isCommercialActive = (node.tabKey === 'isCommercialActive');
        this.isConsumerActive = (node.tabKey === 'isConsumerActive');
      }

      // 3. Collapse all other menus first (Accordion behavior)
      this.collapseAll(this.menuStructure);

      // 4. Expand the menu to show this node
      // We need a helper to find the path to this node and expand parents
      this.expandPathToNode(this.menuStructure, node);
    }
  }

  // Helper to collapse all nodes
  collapseAll(nodes: MenuNode[]) {
    for (const node of nodes) {
      node.expanded = false;
      if (node.children) {
        this.collapseAll(node.children);
      }
    }
  }

  // Helper to expand parents of the active node
  expandPathToNode(nodes: MenuNode[], targetArg: MenuNode): boolean {
    for (const node of nodes) {
      if (node === targetArg) {
        node.visible = true; // Ensure target is visible
        return true;
      }
      if (node.children && node.children.length > 0) {
        const found = this.expandPathToNode(node.children, targetArg);
        if (found) {
          node.expanded = true; // Expand parent
          node.visible = true; // Ensure parent is visible
          return true;
        }
      }
    }
    return false;
  }

  // header fixed S
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 100;
  }
  // header fixed S

  ngOnDestroy(): void {
    this.leftMenuStateSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  toggleLeftMen(event: any): void {
    event.preventDefault();
    document.body.classList.toggle('closeLeftmenu');
    this.leftMenuState.notifyStateChanged();
  }

  // Helper to determine if a node should look active (expanded OR contains active child)
  isNodeActive(node: MenuNode): boolean {
    // if (node.expanded) return true; // Removed to avoid conflict when multiple menus are open
    return this.findActiveNode(node);
  }

  findActiveNode(node: MenuNode): boolean {
    if (node.tabKey && node.tabKey === this.activeTab) return true;
    if (node.children) {
      return node.children.some(child => this.findActiveNode(child));
    }
    return false;
  }
}
