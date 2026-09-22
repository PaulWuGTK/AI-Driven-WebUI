// Basic Config Types
export interface WlanBasicConfig {
  Password: string;
  SecurityMode: string;
  SSID: string;
  Enable: number;
  SecurityModeAvailable?: string;  // Changed from SecurityModeSupport
}

export interface WlanBasicResponse {
  WlanBasic: {
    MLOEnable: number;
    CommonSSIDEnable: number;
    MeshEnable?: number;  // Added MeshEnable parameter
    wifimlo: WlanBasicConfig & { Enable: number };  // Added Enable property
    wifi2g: WlanBasicConfig;
    wifi5g: WlanBasicConfig;
    wifi6g: WlanBasicConfig;
  };
}

// Advanced Config Types
export interface WlanAdvancedConfig {
  Alias?: string;
  InstanceIndex?: number;
  OperatingFrequencyBand?: string;
  RadioEnable: number;
  Mode: string;
  Channel: string | number;
  ChannelBandwidth: string;
  AutoChannelEnable: number;
  MultiUserMIMOEnabled?: number;
  // Keep these for UI display only
  ModeList?: string;
  ChannelBandwidthList?: string;
  ChannelList?: string;
}

export interface WlanAdvancedResponse {
  WlanAdvanced: {
    MLOEnable?: number;
    MLOEnabledGroups?: string[];
    Radios: WlanAdvancedConfig[];
  };
}

// WPS Types
export interface WlanWpsInterface {
  InstanceIndex?: number;
  Alias?: string;
  OperatingFrequencyBand: string;
  SSID: string;
  AuthType: string;
  ConnectStatus: string;
  EncryType: string;
  Configured: string;
}

/** @deprecated Use WlanWpsInterface instead */
export type WlanWpsBand = WlanWpsInterface;

export interface WlanWpsResponse {
  WlanWps: {
    Enable: number;
    PINCode: string;
    Interfaces: WlanWpsInterface[];
    PairingResult?: "NotExecute" | "PairingInprogress" | "Success" | "NotSuccess";
  };
}

// Mesh Types
export interface WlanMeshInterface {
  InstanceIndex?: number;
  Alias?: string;
  OperatingFrequencyBand?: string;
  Enable: number;
  SSID: string;
  KeyPassPhrase?: string;
  SecurityMode?: string;
  SecurityModeAvailable?: string;
  MFPConfig?: string | number;
  SSIDAdvertisementEnabled?: number;
  IsolationEnable?: number;
}

export interface WlanMeshIntfGroup {
  InstanceIndex?: number;
  Alias?: string;
  Enable: number;
  SSID: string;
  KeyPassPhrase: string;
  SecurityMode: string;
  SecurityModeAvailable?: string;
  SSIDAdvertisementEnabled?: number;
  IsolationEnable?: number;
  CommonSSIDEnable: number;
  MLOEnable: number;
  BridgeInterface?: string;
  MFPConfig?: string | number;
  Interface: WlanMeshInterface[];
}

export interface WlanMeshResponse {
  WlanMesh: {
    MeshEnable: number;
    IntfGroup: WlanMeshIntfGroup[];
  };
}