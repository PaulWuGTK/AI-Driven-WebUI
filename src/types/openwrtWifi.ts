export type OpenWrtWifiBandName = '2.4GHz' | '5GHz' | '6GHz' | string;
export type OpenWrtAuthentication = 'none' | 'owe' | 'psk2' | 'sae' | 'sae-mixed' | string;

export interface OpenWrtWifiBandConfig {
  Band: OpenWrtWifiBandName;
  Radio: string;
  Iface: string;
  Enable: number;
  SSID: string;
  Authentication: OpenWrtAuthentication;
  Password: string;
  HideSSID: number;
  IsolationEnable: number;
  AuthOptions?: OpenWrtAuthentication[];
}

export interface OpenWrtWifiBasicPayload {
  Bands: OpenWrtWifiBandConfig[];
}

export interface OpenWrtWifiBasicResponse {
  WifiBasic: OpenWrtWifiBasicPayload;
}

export interface OpenWrtWifiBasicRequest {
  WifiBasic: OpenWrtWifiBasicPayload;
}

export interface OpenWrtWifiApplyRequest {
  Apply: {
    Target: 'wireless' | string;
  };
}

export interface OpenWrtActionResult {
  result: 'Success' | 'Fail' | string;
  reason: string;
  applyRequired?: number;
}

export type OpenWrtWifiApplyResponse = OpenWrtActionResult;
