export interface StaticRouteIPv4 {
  Enable: boolean;
  Alias: string;
  DestIp: string;
  DestMask: string;
  GatewayIp: string;
  UsedGWIp: boolean;
  WanIf: string;
  WanIfList?: string[];
}

export interface StaticRouteIPv6 {
  Enable: boolean;
  Alias: string;
  DestIp: string;
  DestMask: string;
  GatewayIp: string;
  UsedGWIp: boolean;
  WanIf: string;
  WanIfList?: string[];
}

export interface StaticRouteData {
  IPv4: StaticRouteIPv4[];
  IPv6: StaticRouteIPv6[];
}

export interface StaticRouteResponse {
  StaticRoute: StaticRouteData;
}

export interface StaticRouteUpdateRequest {
  StaticRoute: StaticRouteData;
}
