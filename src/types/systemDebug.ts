/**
 * System Debug Download Types
 * Hidden debug page for downloading system debug information
 */

// Category value — dynamic from backend, no longer a fixed union
export type DebugDownloadCategory = string;

// Category info returned by backend GET
export interface DebugCategoryInfo {
  value: string;
  label: string;
}

// GET response: available categories
export interface DebugCategoriesResponse {
  categories: DebugCategoryInfo[];
}

// POST response: download result
export interface DebugDownloadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

// Dropdown option for BaseSelect
export interface DownloadCategoryOption {
  value: DebugDownloadCategory;
  label: string;
  description?: string;
}
