import type { WanModeManagementResponse } from '../../types/wanManagement';

export const wanManagementMockData: WanModeManagementResponse = {
  WanModeManagement: {
    ListPhysicalType: ['Ethernet'],
    ListInterface: ['wan', 'voip', 'mgmt', 'iptv'],
    ListDNSMode: ['Static', 'Dynamic'],
    ListIPv6DNSMode: ['Static', 'Dynamic'],
    ListIPv4Mode: ['dhcp4', 'ppp4', 'none', 'static'],
    ListIPv6Mode: ['dhcp6', 'ppp6', 'none', 'static'],
    ListVLANType: ['untagged', 'vlan'],
    ListConnectionTrigger: ['OnDemand', 'AlwaysOn', 'Manual'],
    ListDHCPv6Mode: ['SLAAC', 'Stateless', 'Stateful', 'PrefixDelegation', 'StatefulPrefixDelegation', 'DHCPv6Only'],
    Profiles: [
      {
        WANMode: "demo_wanmode",
        Status: "Enabled",
        PhysicalType: "Ethernet",
        EnableSensing: 1,
        DNSMode: "Dynamic",
        IPv6DNSMode: "Dynamic",
        Interfaces: [
          {
            Interface: "wan",
            IPv4Mode: "dhcp4",
            IPv6Mode: "dhcp6",
            DHCPv6Mode: "StatefulPrefixDelegation",
            PPPoEUserName: "",
            PPPoEPassword: "",
            ConnectionTrigger: "AlwaysOn",
            ServiceName: "",
            IdleTime: 0,
            VLANType: "untagged",
            VLANID: 100,
            VLANPriority: 0,
            MTU: 1500
          }
        ]
      },
      {
        WANMode: "demo_ppp",
        Status: "Enabled",
        PhysicalType: "Ethernet",
        EnableSensing: 1,
        DNSMode: "Dynamic",
        IPv6DNSMode: "Dynamic",
        Interfaces: [
          {
            Interface: "wan",
            IPv4Mode: "ppp4",
            IPv6Mode: "none",
            DHCPv6Mode: "",
            PPPoEUserName: "username",
            PPPoEPassword: "password",
            ConnectionTrigger: "AlwaysOn",
            ServiceName: "",
            IdleTime: 0,
            VLANType: "untagged",
            VLANID: 100,
            VLANPriority: 0,
            MTU: 1500
          }
        ]
      },
      {
        WANMode: "demo_static",
        Status: "Enabled",
        PhysicalType: "Ethernet",
        EnableSensing: 1,
        DNSMode: "Static",
        IPv6DNSMode: "Dynamic",
        Interfaces: [
          {
            Interface: "wan",
            IPv4Mode: "static",
            IPv6Mode: "none",
            DHCPv6Mode: "",
            PPPoEUserName: "",
            PPPoEPassword: "",
            ConnectionTrigger: "AlwaysOn",
            ServiceName: "",
            IdleTime: 0,
            VLANType: "untagged",
            VLANID: 100,
            VLANPriority: 0,
            MTU: 1500,
            StaticIPv4Address: {
              DNSServers: "192.168.101.1",
              DefaultRouter: "192.168.101.1",
              IPv4Address: "192.168.101.1",
              SubnetMask: "255.255.255.0"
            },
            StaticIPv6Address: {
              DNSServers: "",
              DefaultRouter: "",
              IPv6Address: "",
              PrefixLength: 0
            }
          }
        ]
      },
      {
        WANMode: "demo_bridged",
        Status: "Enabled",
        PhysicalType: "Ethernet",
        EnableSensing: 1,
        DNSMode: "Dynamic",
        IPv6DNSMode: "Dynamic",
        Interfaces: [
          {
            Interface: "wan",
            IPv4Mode: "none",
            IPv6Mode: "none",
            DHCPv6Mode: "",
            PPPoEUserName: "",
            PPPoEPassword: "",
            ConnectionTrigger: "AlwaysOn",
            ServiceName: "",
            IdleTime: 0,
            VLANType: "untagged",
            VLANID: 100,
            VLANPriority: 0,
            MTU: 1500
          }
        ]
      }
    ]
  }
};
