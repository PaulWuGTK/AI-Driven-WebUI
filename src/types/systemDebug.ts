/**
 * System Debug Download Types
 * Hidden debug page for downloading system debug information
 */

// Download types
export type DebugDownloadCategory = 'all' | 'network' | 'wifi' | 'process' | 'memory' | 'log' | 'service';

export interface DebugDownloadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

export interface DownloadCategoryOption {
  value: DebugDownloadCategory;
  label: string;
  description?: string;
}
