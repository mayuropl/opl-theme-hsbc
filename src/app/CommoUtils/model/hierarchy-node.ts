/**
 * Hierarchy Node representing an RM or Line Manager in the tree
 * Used for displaying the team structure hierarchy
 */
export interface HierarchyNode {
  id: string;                      // Employee ID
  employeeCode: string;            // Employee code from HRMS
  name: string;                    // Full name of RM/Line Manager
  role: string;                    // Role type (Primary RM, Line Manager, etc.)
  customerCount: number;           // Number of companies mapped (aggregated)
  directCustomerCount: number;     // Companies directly mapped to this RM
  reporteeCount: number;           // Number of direct reportees
  children: HierarchyNode[];       // Child nodes (reportees)
  parentId: string | null;         // Parent employee ID
  expanded: boolean;               // UI state for tree expansion
  selected: boolean;               // UI state for checkbox selection
  visible: boolean;                // UI state for search filtering
}

/**
 * Request payload for fetching hierarchy data from backend
 */
export interface HierarchyRequest {
  userId: number;                  // Logged-in user ID
  roleId: number;                  // User's role ID
  rmRoleType?: string;             // Selected RM role type filter
  includeInactive?: boolean;       // Include inactive employees
}

/**
 * Response from hierarchy API
 */
export interface HierarchyResponse {
  status: number;
  message: string;
  data: HierarchyData;
}

/**
 * Data structure within hierarchy response
 */
export interface HierarchyData {
  rootNodes: HierarchyNode[];      // Top-level nodes for the user
  totalCustomerCount: number;      // Total customers in hierarchy
}

/**
 * RM Role configuration item for dropdown
 */
export interface RmRoleConfig {
  roleId: number;
  roleCode: string;
  roleName: string;                // Display name from RT01
  description: string;
  isDefault: boolean;              // True for Primary RM
  sortOrder: number;
}

/**
 * Filter state for hierarchy selection - used for state management
 */
export interface HierarchyFilterState {
  selectedNodeIds: string[];       // Selected node IDs (for UI state)
  selectedEmployeeCodes: string[]; // Selected employee codes (for API filter)
  rmRoleType: string;              // Selected RM role code
  rmRoleId: number;                // Selected RM role ID for API calls
  searchQuery: string;             // Current search text
  isApplied: boolean;              // Whether filter is currently applied
}

/**
 * Helper function to create a default HierarchyNode
 */
export function createDefaultHierarchyNode(partial?: Partial<HierarchyNode>): HierarchyNode {
  return {
    id: '',
    employeeCode: '',
    name: '',
    role: '',
    customerCount: 0,
    directCustomerCount: 0,
    reporteeCount: 0,
    children: [],
    parentId: null,
    expanded: false,
    selected: false,
    visible: true,
    ...partial
  };
}

/**
 * Helper function to create default filter state
 */
export function createDefaultFilterState(): HierarchyFilterState {
  return {
    selectedNodeIds: [],
    selectedEmployeeCodes: [],
    rmRoleType: null,
    rmRoleId: null,
    searchQuery: '',
    isApplied: false
  };
}


/**
 * Represents a staff hierarchy role entity
 */
export interface StaffHierarchyRole {
  id: number;           // Unique identifier
  rmType: string;       // RM Type classification
  rmRole: string;       // RM Role name
  isActive: boolean;    // Active status flag
  createdDate?: Date;   // Optional: creation timestamp
  modifiedDate?: Date;  // Optional: last modification timestamp
}

/**
 * Response from GET /staffHierarchyRole/list
 */
export interface HierarchyRoleListResponse {
  status: number;
  message: string;
  data: StaffHierarchyRole[];
}

/**
 * Request payload for POST /staffHierarchyRole/update
 */
export interface StaffHierarchyRoleUpdateRequest {
  id: number;
  rmType: string;
  rmRole: string;
  isActive: boolean;
}

/**
 * Response from POST /staffHierarchyRole/update
 */
export interface HierarchyRoleUpdateResponse {
  status: number;
  message: string;
  data?: StaffHierarchyRole;
}
