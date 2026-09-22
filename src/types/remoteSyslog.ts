/**
 * Remote Syslog Configuration Types
 * API: /API/info?list=DeviceSyslogAction
 *
 * Table-based configuration for remote syslog destinations.
 * Action types are dynamic — enumerated from Device.Syslog.Action.* on the DUT.
 */

// Single remote syslog entry (for table display)
export interface RemoteSyslogEntry {
  Type: string;              // Action alias (e.g., "wifi", "messages_remote", "tr069")
  TypeLabel: string;         // Formatted display name
  Enable: 0 | 1;
  Address: string;
  Port: number;
  Protocol: 'UDP' | 'TCP';
  Status: string;            // "Active" | "Disabled" | "Error"
  LogFileEnabled: boolean;   // Whether LogFile.Enable = 1 for this type
}

// Action configuration (from backend)
export interface RemoteSyslogActionConfig {
  LogFile: {
    Enable: 0 | 1;
  };
  LogRemote: {
    Enable: 0 | 1;
    Address: string;
    Port: number;
    Protocol: string;
    Status: string;
  };
}

// GET Response - dynamic action keys
export interface RemoteSyslogResponse {
  DeviceSyslogAction: Record<string, RemoteSyslogActionConfig>;
}

// POST Request - single action update
export interface RemoteSyslogUpdateRequest {
  [actionName: string]: {
    LogRemote: {
      Enable: 0 | 1;
      Address: string;
      Port: number;
      Protocol: string;
    };
  };
}

// POST Response (unwrapped, follows Ddns.lua pattern) - dynamic action keys
export interface RemoteSyslogApiResponse {
  [key: string]: RemoteSyslogActionConfig | string | undefined;
  NOK?: string;
}

// Form data
export interface RemoteSyslogFormData {
  Type: string;
  Enable: 0 | 1;
  Address: string;
  Port: number;
  Protocol: 'UDP' | 'TCP';
}

// Protocol options
export const PROTOCOL_OPTIONS = [
  { value: 'UDP' as const, label: 'UDP' },
  { value: 'TCP' as const, label: 'TCP' }
];

/**
 * Format an action alias into a human-readable label.
 * e.g., "messages_remote" → "Messages Remote", "wpa_supplicant" → "Wpa Supplicant"
 */
export const formatActionLabel = (alias: string): string => {
  return alias
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};
