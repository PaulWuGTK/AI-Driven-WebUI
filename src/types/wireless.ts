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
  ModeList: string;
  ChannelBandwidthList: string;
  ChannelBandwidth: string;
  Channel: number;
  ChannelList: string;
  Mode: string;
  AutoChannelEnable: number;
  Band: string;
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
  };
}

// Mesh Types
export interface WlanMeshResponse {
  WlanMesh: {
    MeshEnable: string;
    CommonSSID: string;
  };
}