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
