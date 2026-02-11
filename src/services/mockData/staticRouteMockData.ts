import type { StaticRouteResponse } from '../../types/staticRoute';

export const staticRouteMockData: StaticRouteResponse = {
  StaticRoute: {
    IPv4: [
      {
        Enable: true,
        Alias: "RULE1",
        DestIp: "10.10.10.100",
        DestMask: "255.255.255.0",
        GatewayIp: "10.10.10.1",
        UsedGWIp: true,
        WanIf: "IPoE"
      },
      {
        Enable: false,
        Alias: "RULE2",
        DestIp: "20.20.20.100",
        DestMask: "255.255.255.0",
        GatewayIp: "10.10.10.1",
        UsedGWIp: true,
        WanIf: "PPPoE"
      }
    ],
    IPv6: [
      {
        Enable: true,
        Alias: "RULE6_1",
        DestIp: "2001:db8:100::",
        PrefixLen: 64,
        GatewayIp: "fe80::1",
        UsedGWIp: true,
        WanIf: "PPPoE"
      }
    ],
    WanIfList: ["IPoE", "PPPoE"]
  }
};
