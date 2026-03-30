export interface StaticRouteIPv4 {
  Enable: 0 | 1;
  Alias: string;
  DestIp: string;
  DestMask: string;
  GatewayIp: string;
  UsedGWIp: boolean;
  WanIf: string;
}

export interface StaticRouteIPv6 {
  Enable: 0 | 1;
  Alias: string;
  DestIp: string;
  PrefixLen: number;
  GatewayIp: string;
  UsedGWIp: boolean;
  WanIf: string;
}

export interface StaticRouteData {
  IPv4: StaticRouteIPv4[];
  IPv6: StaticRouteIPv6[];
  WanIfList?: string[];
}


export interface StaticRouteResponse {
  StaticRoute: StaticRouteData;
}

export interface StaticRouteUpdateRequest {
  StaticRoute: StaticRouteData;
}
