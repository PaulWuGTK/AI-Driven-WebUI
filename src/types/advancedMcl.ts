export type AdvancedMclWanAccessMode = 'AnyWAN' | 'MultipleWAN';

export type AdvancedMclServiceName =
  | 'HTTP'
  | 'HTTPS'
  | 'FTP'
  | 'TELNET'
  | 'SSH'
  | 'PING'
  | 'TFTP';

export type AdvancedMclServiceField = 'LAN' | 'WAN' | 'TrustDomain' | 'Port';

export interface AdvancedMclServiceConfig {
  LAN: boolean;
  WAN: boolean;
  TrustDomain: boolean;
  Port: string;
}

export type AdvancedMclReadOnlyMap = Record<AdvancedMclServiceName, AdvancedMclServiceField[]>;
export type AdvancedMclServiceMap = Record<AdvancedMclServiceName, AdvancedMclServiceConfig>;

export interface AdvancedMclMGMT {
  WanAccessMode: AdvancedMclWanAccessMode;
  WanAccessInterfaces: string[];
  Services: AdvancedMclServiceMap;
  ReadOnly: AdvancedMclReadOnlyMap;
}

export interface AdvancedMclMGMTResponse {
  AdvancedMclMGMT: AdvancedMclMGMT;
}

export interface AdvancedMclMGMTUpdateRequest {
  AdvancedMclMGMT: {
    WanAccessMode: AdvancedMclWanAccessMode;
    WanAccessInterfaces: string[];
    Services: AdvancedMclServiceMap;
  };
}

export interface AdvancedMclTrustDomainResponse {
  AdvancedMclTrustDomain: string[];
}

export interface AdvancedMclTrustDomainUpdateRequest {
  AdvancedMclTrustDomain: string[];
}
