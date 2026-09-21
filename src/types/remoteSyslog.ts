// Remote Syslog Configuration Types
// API: /API/info?list=DeviceSyslogAction

export interface LogRemoteConfig {
  Enable: 0 | 1;
  Address: string;
  Port: number;
  Protocol: 'UDP' | 'TCP' | 'TLS';
  Status: string; // "Disabled" | "Enabled" | "Error" (read-only)
}

export interface RemoteSyslogResponse {
  DeviceSyslogAction: {
    messages_remote: {
      LogRemote: LogRemoteConfig;
    };
    wifi: {
      LogRemote: LogRemoteConfig;
    };
    hostapd: {
      LogRemote: LogRemoteConfig;
    };
  };
}

export interface RemoteSyslogUpdateRequest {
  DeviceSyslogAction: {
    messages_remote?: {
      LogRemote: Partial<LogRemoteConfig>;
    };
    wifi?: {
      LogRemote: Partial<LogRemoteConfig>;
    };
    hostapd?: {
      LogRemote: Partial<LogRemoteConfig>;
    };
  };
}

// POST response follows Ddns.lua pattern:
// - Success: unwrapped data { messages_remote: {...}, wifi: {...}, hostapd: {...} }
// - Error: { NOK: "error message" }
export interface RemoteSyslogApiResponse {
  messages_remote?: {
    LogRemote: LogRemoteConfig;
  };
  wifi?: {
    LogRemote: LogRemoteConfig;
  };
  hostapd?: {
    LogRemote: LogRemoteConfig;
  };
  NOK?: string;
}
