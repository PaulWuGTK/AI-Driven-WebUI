export interface IpFilterEntry {
  No: number;
  IPStart: string;
  IPEnd: string;
  Protocol: 'TCP' | 'UDP' | 'Both';
  Comment: string;
}

export interface IpFilteringConfig {
  Enable: boolean;
  ProtoList: string[];
  BlackList: IpFilterEntry[];
  WhiteList: IpFilterEntry[];
}

export interface IpFilteringResponse {
  IPFiltering: IpFilteringConfig;
}

export interface IpFilteringRequest {
  IPFiltering: {
    Enable: boolean;
    BlackList: IpFilterEntry[];
    WhiteList: IpFilterEntry[];
  };
}

export type IpFilterMode = 'Blacklist' | 'Whitelist';
export type IpVersion = 'IPv4' | 'IPv6';
