// Basic Config Types
export interface WlanBasicConfig {
  Password: string;
  SecurityMode: string;
  SSID: string;
  Enable: number;
  SecurityModeAvailable: string;  // Changed from SecurityModeSupport
}

export interface WlanBasicResponse {
  WlanBasic: {
    wifi2g: WlanBasicConfig;
    wifi5g: WlanBasicConfig;
    wifi6g: WlanBasicConfig;
  };
}

// Advanced Config Types
export interface WlanAdvancedConfig {
  RadioEnable: number;
  Mode: string;
  Channel: string | number;
  ChannelBandwidth: string;
  AutoChannelEnable: number;
  // Keep these for UI display only
  ModeList?: string;
  ChannelBandwidthList?: string;
  ChannelList?: string;
  Band?: string;
}

export interface WlanAdvancedResponse {
  WlanAdvanced: {
    wifi2g: WlanAdvancedConfig;
    wifi5g: WlanAdvancedConfig;
    wifi6g: WlanAdvancedConfig;
  };
}

// WPS Types
export interface WlanWpsBand {
  Band: string;
  SSID: string;
  AuthType: string;
  ConnectStatus: string;
  EncryType: string;
  Configured: string;
}

export interface WlanWpsResponse {
  WlanWps: {
    Enable: number;
    PINCode: string;
    Band: WlanWpsBand[];
    PairingResult?: "NotExecute" | "PairingInprogress" | "Success" | "NotSuccess";
  };
}

// Mesh Types
export interface WlanMeshResponse {
  WlanMesh: {
    MeshEnable: number;
    CommonSSID: string;
  };
}