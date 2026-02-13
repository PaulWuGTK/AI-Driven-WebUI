export interface BasicBridgeLanConfig {
  IPv4Enable: boolean;
  IPv4Protocol: string;
  IPv4Address: string;
  SubnetMask: string;
  IPv6Enable: boolean;
  IPv6Protocol: string;
  IPv6Address: string;
  IPv6Prefix: string;
  ListIPv4Protocol: string[];
  ListIPv6Protocol: string[];
}

export interface BasicBridgeLanResponse {
  BasicBridgeLan: BasicBridgeLanConfig;
}

export interface BasicBridgeLanUpdateRequest {
  BasicBridgeLan: {
    IPv4Enable: boolean;
    IPv4Protocol: string;
    IPv4Address: string;
    SubnetMask: string;
    IPv6Enable: boolean;
    IPv6Protocol: string;
    IPv6Address: string;
    IPv6Prefix: string;
  };
}
