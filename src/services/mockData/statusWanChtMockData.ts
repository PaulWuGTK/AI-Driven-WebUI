import type { StatusWanChtResponse } from '../../types/statusWanCht';

export const statusWanChtMockData: StatusWanChtResponse = {
  StatusWanCht: {
    PPPoE: {
      Interface: "WAN1",
      Protocol: "PPPoE",
      Status: "Enabled",
      IPv4Address: "11.0.0.101",
      IPv4Gateway: "11.0.0.1",
      SubnetMask: "255.255.255.0",
      IPv4PrimaryDNS: "11.0.0.1",
      IPv4SecondaryDNS: "",
      MACAddress: "",
      IPv6Address: "",
      IPv6Gateway: "",
      IPv6Prefix: "",
      IPv6PrimaryDNS: "",
      IPv6SecondaryDNS: ""
    },
    IPoE: {
      Interface: "WAN2",
      Protocol: "DHCP",
      Status: "Enabled",
      IPv4Address: "172.16.1.131",
      IPv4Gateway: "172.16.1.1",
      SubnetMask: "255.255.255.0",
      IPv4PrimaryDNS: "172.16.1.1",
      IPv4SecondaryDNS: "",
      MACAddress: "",
      IPv6Address: "",
      IPv6Gateway: "",
      IPv6Prefix: "",
      IPv6PrimaryDNS: "",
      IPv6SecondaryDNS: ""
    },
    Bridge: {
      Interface: "WAN3",
      Protocol: "Bridge",
      Status: "Disabled"
    }
  }
};
