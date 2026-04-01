import type { DnsRouteResponse, DnsRouteUpdateRequest } from '../../types/dnsRoute';

const mockDnsRouteData: DnsRouteResponse = {
  DNSRoute: [
    {
      Enable: 1,
      Alias: 'dnsroute1',
      DomainName: 'ims1.cht.com.tw',
      ResolvIP: '',
      ResolvIPv6: '',
      SubMask: '255.255.0.0',
      WanIf: 'IPoE'
    },
    {
      Enable: 1,
      Alias: 'dnsroute2',
      DomainName: 'chtmod.intra',
      ResolvIP: '',
      ResolvIPv6: '',
      SubMask: '255.255.255.255',
      WanIf: 'IPoE'
    }
  ],
  WanIfList: ['IPoE', 'PPPoE']
};

const clone = (data: DnsRouteResponse): DnsRouteResponse => JSON.parse(JSON.stringify(data));

export const getDnsRouteMockData = (): DnsRouteResponse => clone(mockDnsRouteData);

export const updateDnsRouteMockData = (data: DnsRouteUpdateRequest): DnsRouteResponse => {
  mockDnsRouteData.DNSRoute = data.DNSRoute.map((rule) => ({ ...rule }));
  return clone(mockDnsRouteData);
};
