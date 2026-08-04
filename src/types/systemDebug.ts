/**
 * System Debug Information Types
 * Hidden debug page for fetching system information
 */

export type SystemCategory = 'WAN' | 'LAN' | 'Mesh' | 'WLAN' | 'System' | 'Firewall' | 'Routing';

export interface SystemDebugRequest {
  category: SystemCategory;
  action?: string;
}

export interface SystemDebugResponse {
  success: boolean;
  category: SystemCategory;
  timestamp: string;
  data: Record<string, unknown>;
  error?: string;
}

export interface CategoryOption {
  value: SystemCategory;
  label: string;
  description?: string;
}

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
