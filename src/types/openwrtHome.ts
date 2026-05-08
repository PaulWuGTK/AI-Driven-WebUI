import type { OpenWrtWifiBandName } from './openwrtWifi';

export interface OpenWrtHomeWifiStatus {
  Band: OpenWrtWifiBandName;
  Radio: string;
  Enable: number;
  SSID: string;
  Encryption: string;
}

export interface OpenWrtHomeSummary {
  FirmwareVersion: string;
  FirmwareRevision: string;
  ModelName: string;
  BoardName: string;
  LanIPv4: string;
  WanLinkUp: boolean;
  UptimeSec: number;
  WifiStatus: OpenWrtHomeWifiStatus[];
}

export interface OpenWrtHomeSummaryResponse {
  HomeSummary: OpenWrtHomeSummary;
}
