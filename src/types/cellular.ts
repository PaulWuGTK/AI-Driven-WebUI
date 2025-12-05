export interface CellularInfo {
  RoamingEnabled: number;
  RoamingStatus: string;
  ConnectionStatus: string;
  ConnectionTime: number;
  InterfaceEnable: number;
  PreferredAccessTechnology: string;
  SupportedAccessTechnologies: string;
  IMEI: string;
  IMSI: string;
  ICCID: string;
  USIMStatus: string;
  PLMN: string;
  OperatorName: string;
  PIN: string;
  PINCheck: string;
  PINRemain: string;
  PUKRemain: string;
  APN: string;
  Username: string;
  Password: string;
  X_PRPLWARE_COM_IPType: string;
  RSSI: number;
  RSRP: number;
  RSRQ: number;
  SINR: string;
  PCI: string;
  CellID: string;
  ConnectedBand: string;
  DLEarfcn: string;
  UplinkCurrentSpeed: string;
  DownlinkCurrentSpeed: string;
  VoiceUplinkTraffic: string;
  VoiceDownlinkTraffic: string;
  PacketsReceived: number;
  PacketsSent: number;
  BytesReceived: number;
  BytesSent: number;
}

export interface CellularResponse {
  Cellular: CellularInfo;
}
