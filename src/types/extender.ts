export interface ExtenderConnectionStatus {
  Status: string;
  SSID: string;
  Security: string;
}

export interface ExtenderNeighbor {
  SSID: string;
  Channel: number;
  Band: string;
  Signal: string;
  Security: string;
}

export interface ExtenderResponse {
  Extender: {
    ExtenderEnabled: {
      Enabled: number;
    };
    ExtenderRole: {
      Role: "MeshAgent" | "Repeater";
    };
    ConnectionStatus: {
      "2.4GHz": ExtenderConnectionStatus;
      "5GHz": ExtenderConnectionStatus;
      "6GHz": ExtenderConnectionStatus;
    };
    Wps: {
      WpsPinCode: string;
    };
    ip_address?: string;
    message?: string;
  };
}

export interface ExtenderScanResponse {
  Extender: ExtenderNeighbor[];
}

export interface ExtenderUpdateRequest {
  Extender: {
    Action: "ExtenderEnable" | "WPSbtn" | "trigger_scan";
    Enabled?: number;
    Role?: "MeshAgent" | "Repeater";
  };
}

export interface ExtenderConnectRequest {
  Extender: {
    Action: "connection_setting";
    Band: string;
    SSID: string;
    Security: string;
    Password: string;
  };
}