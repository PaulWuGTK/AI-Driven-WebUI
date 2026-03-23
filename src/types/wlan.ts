export type Flag01 = 0 | 1;

export interface WlanInterface {
  Alias: string;
  Password: string;
  Authentication: string;
  Encryption: string;
  BSSID: string;
  Enable: Flag01;
  SSID: string;
  Name: string;
}

export interface WlanAssociatedDevice {
  MACAddress: string;
  BSSID: string;
  ConnectionDuration: number;
  SignalStrength: number;
  LastDataDownlinkRate: number;
  LastDataUplinkRate: number;
}

export interface WlanBand {
  Band: string;
  Channel: number;
  AutoChannel: Flag01;
  Bandwidth: string;
  MACAddress: string;
  Enable: Flag01;
  Interface: WlanInterface[];
  AssociatedDevice?: WlanAssociatedDevice[];
}

export interface WlanStatusResponse {
  StatusWlan: WlanBand[];
}
