export interface WlanInterface {
  Alias: string;
  Password: string;
  Authentication: string;
  Encryption: string;
  BSSID: string;
  Enable: number;
  SSID: string;
  Name: string;
}

export interface WlanBand {
  Band: string;
  Channel: number;
  AutoChannel: number;
  Bandwidth: string;
  MACAddress: string;
  Interface: WlanInterface[];
}

export interface WlanStatusResponse {
  StatusWlan: WlanBand[];
}