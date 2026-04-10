import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MsmeService } from './msme.service';
import { CommonService } from '../CommoUtils/common-services/common.service';
import {
  HierarchyNode,
  HierarchyFilterState,
  RmRoleConfig,
  createDefaultFilterState
} from '../CommoUtils/model/hierarchy-node';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {

  // Cache for hierarchy data - avoids repeated API calls
  private hierarchyCache: HierarchyNode[] = [];
  private isCacheValid: boolean = false;

  // Filter state management using BehaviorSubject for reactive updates
  private filterState$ = new BehaviorSubject<HierarchyFilterState>(createDefaultFilterState());

  // RM Role configs loaded from API
  private rmRoleConfigs: RmRoleConfig[] = [];
  private isRoleConfigsLoaded: boolean = false;

  // Track which role and customer type the cache is for
  private currentCacheRoleId: number | null = null;
  private currentCacheCustomerTypeId: number | null = null;
  private currentCacheRoleTypeId: number | null = null;

  constructor(private msmeService: MsmeService, private commonService: CommonService) {}

  /**
   * Get hierarchy data by role ID and customer type ID
   * Uses GET_RM_HIERARCHY_BY_ROLE_AND_TYPE API
   * @param roleId The user's role ID from session
   * @param customerTypeId The customer type ID (1=ETB, 2=TARGET)
   * @param roleTypeId The selected RM role type ID from dropdown
   * @param forceRefresh Force refresh from API even if cached
   */
  getHierarchyData(roleId: number, customerTypeId: number, roleTypeId: number, forceRefresh: boolean = false): Observable<HierarchyNode[]> {
    // Return cached data if valid and not forcing refresh
    if (this.isCacheValid && !forceRefresh && this.hierarchyCache.length > 0
        && this.currentCacheRoleId === roleId && this.currentCacheCustomerTypeId === customerTypeId
        && this.currentCacheRoleTypeId === roleTypeId) {
      return of(this.deepCloneHierarchy(this.hierarchyCache));
    }

    // Fetch from API with roleId, customerTypeId and rmRoleTypeId
    const requestData = { roleId: roleId, customerTypeId: customerTypeId, rmRoleTypeId: roleTypeId };

    return this.msmeService.getRmHierarchyByRoleAndType(requestData).pipe(
      map((response: any) => {
        // Check for error response (status 500 or non-200)
        if (response && response.status && response.status !== 200) {
          console.error('Hierarchy API error:', response.message);
          throw new Error(response.message || 'Failed to load hierarchy data');
        }
        if (response && response.data) {
          return this.mapResponseToHierarchy(response.data);
        }
        return [];
      }),
      tap((data: HierarchyNode[]) => {
        // Cache the data with role, customer type and role type context
        this.hierarchyCache = data;
        this.isCacheValid = true;
        this.currentCacheRoleId = roleId;
        this.currentCacheCustomerTypeId = customerTypeId;
        this.currentCacheRoleTypeId = roleTypeId;
      })
    );
  }

  /**
   * Get cached hierarchy data without API call (for popup reopen)
   */
  getCachedHierarchyData(): HierarchyNode[] {
    return this.isCacheValid ? this.deepCloneHierarchy(this.hierarchyCache) : [];
  }

  /**
   * Check if cache has valid data
   */
  hasCachedData(): boolean {
    return this.isCacheValid && this.hierarchyCache.length > 0;
  }

  /**
   * Clear the cache (e.g., on logout or role change)
   */
  clearCache(): void {
    this.hierarchyCache = [];
    this.isCacheValid = false;
    this.currentCacheRoleId = null;
    this.currentCacheCustomerTypeId = null;
    this.currentCacheRoleTypeId = null;
  }

  /**
   * Get RM Role configurations for dropdown
   * Returns cached configs if already loaded
   */
  getRmRoleConfigs(): RmRoleConfig[] {
    return [...this.rmRoleConfigs];
  }

  /**
   * Load RM Role configurations from API
   * Fetches active roles from staff_hierarchy_role_master table
   */
  loadRmRoleConfigs(): Observable<RmRoleConfig[]> {
    if (this.isRoleConfigsLoaded && this.rmRoleConfigs.length > 0) {
      return of([...this.rmRoleConfigs]);
    }

    return this.msmeService.getStaffHierarchyRoleList().pipe(
      map((response: any) => {
        if (response && response.status === 200 && response.data) {
          // Filter only active roles and map to RmRoleConfig
          const activeRoles = response.data
            .filter((role: any) => role.isActive)
            .map((role: any, index: number) => ({
              roleId: role.id,
              roleCode: role.rmType || '',
              roleName: role.rmRole || '',
              description: role.rmRole || '',
              isDefault: index === 0,
              sortOrder: index + 1
            }));
          return activeRoles;
        }
        return [];
      }),
      tap((configs: RmRoleConfig[]) => {
        this.rmRoleConfigs = configs;
        this.isRoleConfigsLoaded = true;
      })
    );
  }

  /**
   * Check if role configs are loaded
   */
  hasRoleConfigs(): boolean {
    return this.isRoleConfigsLoaded && this.rmRoleConfigs.length > 0;
  }

  /**
   * Get current filter state as Observable
   */
  getFilterState$(): Observable<HierarchyFilterState> {
    return this.filterState$.asObservable();
  }

  /**
   * Get current filter state value
   */
  getFilterState(): HierarchyFilterState {
    return { ...this.filterState$.value };
  }

  /**
   * Update filter state
   */
  updateFilterState(partialState: Partial<HierarchyFilterState>): void {
    const currentState = this.filterState$.value;
    this.filterState$.next({ ...currentState, ...partialState });
  }

  /**
   * Apply filter - marks filter as applied and notifies subscribers
   */
  applyFilter(pageKey: string, selectedNodeIds: string[], selectedEmployeeCodes: string[], rmRoleType: string, rmRoleId: number = 1): void {
    const filterState: HierarchyFilterState = {
      selectedNodeIds,
      selectedEmployeeCodes,
      rmRoleType,
      rmRoleId,
      searchQuery: '',
      isApplied: selectedEmployeeCodes.length > 0
    };
    this.commonService.setStorageAesEncryption(pageKey, JSON.stringify(filterState));
    this.filterState$.next(filterState);
  }

  /**
   * Save complete filter state for a specific page
   */
  saveFilterState(pageKey: string, filterState: HierarchyFilterState): void {
    this.commonService.setStorageAesEncryption(pageKey, JSON.stringify(filterState));
    this.filterState$.next({ ...filterState });
  }

  /**
   * Get saved filter state for a specific page
   */
  getSavedFilterState(pageKey: string): HierarchyFilterState | null {
    const storedState = this.commonService.getStorageAesEncryption(pageKey);
    if (storedState && storedState !== 'undefined') {
      try {
        const state = JSON.parse(JSON.parse(storedState));
        return state && state.isApplied ? state : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Clear filter state for a specific page
   */
  clearFilterState(pageKey: string): void {
    this.commonService.removeStorage(pageKey);
  }

  /**
   * Reset filter to default state
   */
  resetFilter(): void {
    this.filterState$.next(createDefaultFilterState());
  }

  /**
   * Get selected employee IDs from current filter state
   */
  getSelectedEmployeeIds(): string[] {
    return [...this.filterState$.value.selectedNodeIds];
  }

  /**
   * Check if filter is currently applied
   */
  isFilterApplied(): boolean {
    return this.filterState$.value.isApplied;
  }

  /**
   * Filter hierarchy by search query (case-insensitive)
   * Marks matching nodes and their ancestors as visible
   */
  filterHierarchyBySearch(nodes: HierarchyNode[], query: string): HierarchyNode[] {
    if (!query || query.trim() === '') {
      this.resetVisibility(nodes);
      return nodes;
    }

    const lowerQuery = query.toLowerCase();
    this.filterNodes(nodes, lowerQuery);
    return nodes;
  }

  /**
   * Calculate customer counts recursively
   * Parent count = direct count + sum of all children counts
   */
  calculateCustomerCounts(nodes: HierarchyNode[]): void {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        // First calculate children counts
        this.calculateCustomerCounts(node.children);

        // Then calculate this node's total
        const childrenTotal = node.children.reduce((sum, child) => sum + child.customerCount, 0);
        node.customerCount = node.directCustomerCount + childrenTotal;
      } else {
        // Leaf node - customer count equals direct count
        node.customerCount = node.directCustomerCount;
      }
    });
  }

  // ==================== Private Helper Methods ====================

  /**
   * Deep clone hierarchy to avoid mutating cached data
   */
  private deepCloneHierarchy(nodes: HierarchyNode[]): HierarchyNode[] {
    return nodes.map(node => ({
      ...node,
      selected: false,
      visible: true,
      children: node.children ? this.deepCloneHierarchy(node.children) : []
    }));
  }

  /**
   * Map API response to HierarchyNode array
   */
  private mapResponseToHierarchy(data: any[]): HierarchyNode[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data.map(node => this.mapNodeRecursive(node, null));
  }

  /**
   * Recursively map node and its children
   */
  private mapNodeRecursive(node: any, parentId: string | null): HierarchyNode {
    const mappedNode: HierarchyNode = {
      id: node.id?.toString() || '',
      employeeCode: node.employeeCode || '',
      name: node.name || '',
      role: node.role || '',
      customerCount: node.customerCount || 0,
      directCustomerCount: node.directCustomerCount || 0,
      reporteeCount: node.reporteeCount || 0,
      parentId: parentId,
      expanded: node.expanded ?? true,
      selected: false,
      visible: true,
      children: []
    };

    if (node.children && Array.isArray(node.children)) {
      mappedNode.children = node.children.map((child: any) =>
        this.mapNodeRecursive(child, mappedNode.id)
      );
    }

    return mappedNode;
  }

  /**
   * Filter nodes by search query - returns true if any match found
   */
  private filterNodes(nodes: HierarchyNode[], query: string): boolean {
    let hasMatch = false;

    nodes.forEach(node => {
      const nameMatch = node.name.toLowerCase().includes(query);
      const childMatch = node.children.length > 0 ? this.filterNodes(node.children, query) : false;

      node.visible = nameMatch || childMatch;
      if (childMatch) {
        node.expanded = true; // Auto-expand parent of matching child
      }
      if (node.visible) {
        hasMatch = true;
      }
    });

    return hasMatch;
  }

  /**
   * Reset visibility of all nodes
   */
  private resetVisibility(nodes: HierarchyNode[]): void {
    nodes.forEach(node => {
      node.visible = true;
      if (node.children.length > 0) {
        this.resetVisibility(node.children);
      }
    });
  }
}
