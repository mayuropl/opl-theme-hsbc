/** Request payload for saving or updating a user filter. */
export interface UserFilterRequest {
  /** Display name for the filter */
  filterName: string;
  /** JSON-serialized filter configuration */
  filterJson: string;
  /** Customer type the filter applies to */
  customerTypeId: number;
}

/** Response payload returned from the user filter API. */
export interface UserFilterResponse {
  id: number;
  filterName: string;
  filterJson: string;
  customerTypeId: number;
  userId: number;
  createdDate: string;
  modifiedDate: string;
  isActive: boolean;
}

/** Extended filter item with client-side editing state. */
export interface FilterListItem extends UserFilterResponse {
  /** Whether the filter is currently in inline-edit mode */
  isEditing?: boolean;
  /** Temporary name value while editing */
  editedName?: string;
}
