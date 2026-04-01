export interface DnsRouteRule {
  Enable: 0 | 1;
  Alias: string;
  DomainName: string;
  SubMask: string;
  WanIf: string;
}

export interface DnsRouteResponse {
  DNSRoute: DnsRouteRule[];
  WanIfList?: string[];
}

export interface DnsRouteUpdateRequest {
  DNSRoute: DnsRouteRule[];
}
