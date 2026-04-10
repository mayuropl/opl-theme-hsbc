import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HierarchyNode, RmRoleConfig, HierarchyFilterState, createDefaultFilterState } from 'src/app/CommoUtils/model/hierarchy-node';
import { HierarchyService } from 'src/app/services/hierarchy.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { forkJoin } from 'rxjs';

// Interface for dialog data
export interface TeamStructureDialogData {
  previousFilterState?: HierarchyFilterState;  // Previous filter state to restore
  roleId?: number;  // Optional roleId passed from parent component
  customerTypeId?: number;  // Optional customerTypeId (1=ETB, 2=TARGET) passed from parent component
  pageKey?: string;  // Unique page identifier for filter state persistence
  primaryOnly?: boolean;  // Show only PRIMARY_RM in dropdown (for TARGET page)
}

@Component({
  selector: 'app-team-structure-popup',
  templateUrl: './team-structure-popup.component.html',
  styleUrl: './team-structure-popup.component.scss'
})
export class TeamStructurePopupComponent implements OnInit {
  // Hierarchy tree data
  hierarchyTree: HierarchyNode[] = [];
  filteredTree: HierarchyNode[] = [];

  // RM Role dropdown options
  rmRoleConfigs: RmRoleConfig[] = [];
  selectedRmRole: string = null;
  rmRoleTypeId: number = 1;  // Selected RM role ID for API calls

  // Search
  searchQuery: string = '';

  // Selection tracking
  selectedNodes: Set<string> = new Set();

  // Loading state
  isLoading: boolean = false;

  // Whether any node is visible after search
  hasVisibleNodes: boolean = true;

  // Whether any node is selected (for Apply button state)
  get hasSelection(): boolean {
    return this.selectedNodes.size > 0;
  }

  // Current user's role ID from session
  currentRoleId: number = 0;

  // Current customer type ID (1=ETB, 2=TARGET)
  currentCustomerTypeId: number = 0;

  // Page key for filter state persistence
  pageKey: string = '';

  constructor(
    private dialogRef: MatDialogRef<TeamStructurePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TeamStructureDialogData,
    private hierarchyService: HierarchyService,
    private commonService: CommonService
  ) {
    // Get roleId from dialog data or session storage
    this.currentRoleId = data?.roleId
      ? Number(data.roleId)
      : Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true)) || 0;

    // Get customerTypeId from dialog data (1=ETB, 2=TARGET)
    this.currentCustomerTypeId = data?.customerTypeId ? Number(data.customerTypeId) : 0;

    // Get pageKey from dialog data
    this.pageKey = data?.pageKey || '';
  }

  ngOnInit(): void {
    this.loadDataParallel();
  }

  /**
   * Load RM Role configs and hierarchy data in parallel for faster popup open
   */
  private loadDataParallel(): void {
    this.isLoading = true;

    // Set rmRoleTypeId from previous state if reopening (default is already 1 = PRIMARY_RM)
    this.rmRoleTypeId = this.data?.previousFilterState?.rmRoleId || this.rmRoleTypeId;

    forkJoin({
      configs: this.hierarchyService.loadRmRoleConfigs(),
      hierarchy: this.hierarchyService.getHierarchyData(this.currentRoleId, this.currentCustomerTypeId, this.rmRoleTypeId)
    }).subscribe({
      next: ({ configs, hierarchy }) => {
        // Process role configs — show only primary for TARGET page
        // Show only primary for TARGET page, all roles for other pages
        if (this.data?.primaryOnly && configs.length > 0) {
          const primaryConfigs = configs.filter(c => c.roleCode?.toLowerCase().includes('primary') || c.roleName?.toLowerCase().includes('primary'));
          this.rmRoleConfigs = primaryConfigs.length > 0 ? primaryConfigs : [configs[0]];
        } else {
          this.rmRoleConfigs = configs;
        }
        if (this.rmRoleConfigs.length > 0) {
          // Only set default role if no previous state — don't override user's selection
          if (!this.data?.previousFilterState) {
            const defaultRole = this.rmRoleConfigs[0];
            this.selectedRmRole = defaultRole.roleCode;
            this.rmRoleTypeId = defaultRole.roleId;
          }
        }

        // Process hierarchy data
        this.hierarchyTree = hierarchy;
        this.filteredTree = this.hierarchyTree;
        this.restorePreviousState();
        this.isLoading = false;

        if (hierarchy.length === 0) {
          this.commonService.warningSnackBar('No hierarchy data available');
        }
      },
      error: (error) => {
        console.error('Error loading team structure data:', error);
        this.rmRoleConfigs = [];
        this.hierarchyTree = [];
        this.filteredTree = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Restore previous filter state if available
   */
  private restorePreviousState(): void {
    if (this.data?.previousFilterState) {
      this.selectedRmRole = this.data.previousFilterState.rmRoleType || this.rmRoleConfigs[0]?.roleCode;
      this.rmRoleTypeId = this.data.previousFilterState.rmRoleId || 1;
      this.searchQuery = this.data.previousFilterState.searchQuery || '';

      // Restore selections
      this.data.previousFilterState.selectedNodeIds?.forEach(id => {
        this.selectedNodes.add(id);
        this.setNodeSelected(this.hierarchyTree, id, true);
      });
    }
  }

  /**
   * Set node selected state by ID
   */
  private setNodeSelected(nodes: HierarchyNode[], id: string, selected: boolean): void {
    nodes.forEach(node => {
      if (node.id === id) {
        node.selected = selected;
      }
      if (node.children.length > 0) {
        this.setNodeSelected(node.children, id, selected);
      }
    });
  }

  /**
   * Load hierarchy data from API via service
   */
  loadHierarchyData(): void {
    this.isLoading = true;
    // Use selectedRmRoleId from dropdown for roleTypeId
    this.hierarchyService.getHierarchyData(this.currentRoleId, this.currentCustomerTypeId, this.rmRoleTypeId).subscribe({
      next: (data: HierarchyNode[]) => {
        this.hierarchyTree = data;
        this.filteredTree = this.hierarchyTree;
        this.isLoading = false;
        if (data.length === 0) {
          this.commonService.warningSnackBar('No hierarchy data available');
        }
      },
      error: (error: any) => {
        console.error('Error loading hierarchy data:', error);
        this.hierarchyTree = [];
        this.filteredTree = [];
        this.isLoading = false;
        this.commonService.warningSnackBar(error?.message || 'Failed to load hierarchy data');
      }
    });
  }

  /**
   * Handle RM role dropdown change
   */
  onRmRoleChange(roleCode: string): void {
    this.selectedRmRole = roleCode;
    // Find and set the roleId for the selected role
    const selectedRole = this.rmRoleConfigs.find(r => r.roleCode === roleCode);
    this.rmRoleTypeId = selectedRole ? selectedRole.roleId : 0;
    this.clearSelections();
    this.loadHierarchyData()
  }

  /**
   * Handle search input
   */
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.filteredTree = this.hierarchyService.filterHierarchyBySearch(this.hierarchyTree, query);
    this.hasVisibleNodes = this.checkHasVisibleNodes(this.filteredTree);
  }

  /**
   * Check if any node in the tree is visible
   */
  private checkHasVisibleNodes(nodes: HierarchyNode[]): boolean {
    return nodes.some(node => node.visible || (node.children?.length > 0 && this.checkHasVisibleNodes(node.children)));
  }

  /**
   * Toggle node expansion
   */
  toggleExpand(node: HierarchyNode): void {
    if (this.hasChildren(node)) {
      node.expanded = !node.expanded;
    }
  }

  /**
   * Toggle node selection
   */
  toggleSelection(node: HierarchyNode, event: Event): void {
    event.stopPropagation();
    node.selected = !node.selected;

    if (node.selected) {
      this.selectedNodes.add(node.id);
    } else {
      this.selectedNodes.delete(node.id);
    }
  }

  /**
   * Recursively select/deselect all children nodes
   */
  private selectAllChildren(children: HierarchyNode[], selected: boolean): void {
    if (!children || children.length === 0) return;

    children.forEach(child => {
      child.selected = selected;
      if (selected) {
        this.selectedNodes.add(child.id);
      } else {
        this.selectedNodes.delete(child.id);
      }
      // Recursively handle grandchildren
      if (child.children && child.children.length > 0) {
        this.selectAllChildren(child.children, selected);
      }
    });
  }

  /**
   * Check if all children are selected and auto-select parent
   */
  private checkAndSelectParents(nodes: HierarchyNode[], childId: string): boolean {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        // Check if child is direct child of this node
        const isDirectParent = node.children.some(child => child.id === childId);
        // Check recursively in grandchildren
        const isAncestor = this.checkAndSelectParents(node.children, childId);

        if (isDirectParent || isAncestor) {
          // Check if all children of this node are selected
          const allChildrenSelected = node.children.every(child => child.selected);
          if (allChildrenSelected && !node.selected) {
            node.selected = true;
            this.selectedNodes.add(node.id);
          }
          return true; // Continue to check grandparents
        }
      }
    }
    return false;
  }

  /**
   * Deselect all parent nodes when a child is deselected
   */
  private deselectParents(nodes: HierarchyNode[], childId: string): boolean {
    for (const node of nodes) {
      // Check if this node is the parent of the deselected child
      if (node.children && node.children.length > 0) {
        // Check if child is direct child of this node
        const isDirectParent = node.children.some(child => child.id === childId);
        // Check recursively in grandchildren
        const isAncestor = this.deselectParents(node.children, childId);

        if (isDirectParent || isAncestor) {
          // Deselect this parent node
          node.selected = false;
          this.selectedNodes.delete(node.id);
          return true; // Continue to deselect grandparents
        }
      }
    }
    return false;
  }

  /**
   * Check if node has children
   */
  hasChildren(node: HierarchyNode): boolean {
    return node.children && node.children.length > 0;
  }

  /**
   * Get selected employee IDs
   */
  getSelectedEmployeeIds(): string[] {
    return Array.from(this.selectedNodes);
  }

  /**
   * Clear all selections
   */
  private clearSelections(): void {
    this.selectedNodes.clear();
    this.clearNodeSelections(this.hierarchyTree);
  }

  private clearNodeSelections(nodes: HierarchyNode[]): void {
    nodes.forEach(node => {
      node.selected = false;
      if (node.children.length > 0) {
        this.clearNodeSelections(node.children);
      }
    });
  }

  /**
   * Apply filter and close modal
   */
  onApply(): void {
    const selectedIds = this.getSelectedEmployeeIds();
    const selectedEmployeeCodes = this.getSelectedEmployeeCodes();

    const filterState: HierarchyFilterState = {
      selectedNodeIds: selectedIds,
      selectedEmployeeCodes: selectedEmployeeCodes,
      rmRoleType: this.selectedRmRole,
      rmRoleId: this.rmRoleTypeId,
      searchQuery: this.searchQuery,
      isApplied: true
    };

    // Save filter state in service for persistence across navigation (per page)
    if (this.pageKey) {
      this.hierarchyService.saveFilterState(this.pageKey, filterState);
    }

    this.dialogRef.close({ filterState });
  }

  /**
   * Get selected employee codes from selected nodes
   */
  private getSelectedEmployeeCodes(): string[] {
    const employeeCodes: string[] = [];
    this.collectEmployeeCodes(this.hierarchyTree, employeeCodes);
    return employeeCodes;
  }

  /**
   * Recursively collect employee codes from selected nodes
   */
  private collectEmployeeCodes(nodes: HierarchyNode[], codes: string[]): void {
    nodes.forEach(node => {
      if (node.selected && node.employeeCode) {
        codes.push(node.employeeCode);
      }
      if (node.children && node.children.length > 0) {
        this.collectEmployeeCodes(node.children, codes);
      }
    });
  }

  /**
   * Reset all selections and close
   */
  onReset(): void {
    this.clearSelections();
    this.searchQuery = '';
    // this.selectedRmRole = 'PRIMARY_RM';
    this.selectedRmRole = null;
    this.resetVisibility(this.hierarchyTree);
    this.collapseAll(this.hierarchyTree, true);

    // Reset service filter state
    this.hierarchyService.resetFilter();

    // Close with reset state so parent clears the hierarchy filter
    this.dialogRef.close({ filterState: null, isReset: true });
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

  /**
   * Collapse all nodes except root
   */
  private collapseAll(nodes: HierarchyNode[], isRoot: boolean = false): void {
    nodes.forEach((node, index) => {
      node.expanded = isRoot && index === 0;
      if (node.children.length > 0) {
        this.collapseAll(node.children, false);
      }
    });
  }

  /**
   * Close modal without applying
   */
  onClose(): void {
    this.dialogRef.close();
  }
}
