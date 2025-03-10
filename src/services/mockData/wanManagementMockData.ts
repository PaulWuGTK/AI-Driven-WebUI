import type { WanModeManagementResponse } from '../../types/wanManagement';

export const wanManagementMockData: WanModeManagementResponse = {
  WanModeManagement: [
    {
      WANMode: "demo_wanmode",
      Status: "Enabled",
      PhysicalType: "Ethernet",
      Interfaces: [
        { 
          Interface: "wan",
          IPv4Mode: "DHCP",
          IPv6Mode: "DHCP",
          PPPoEUserName: "",
          PPPoEPassword: "",
          VLANType: "untagged",
          VLANID: "100",
          VLANPriority: "0"
        }
      ]
    },
    {
      WANMode: "demo_ppp",
      Status: "Enabled",
      PhysicalType: "Ethernet",
      Interfaces: [
        { 
          Interface: "wan",
          IPv4Mode: "PPPoE",
          IPv6Mode: "None",
          PPPoEUserName: "username",
          PPPoEPassword: "password",
          VLANType: "untagged",
          VLANID: "100",
          VLANPriority: "0"
        }
      ]
    },
    {
      WANMode: "demo_static",
      Status: "Enabled",
      PhysicalType: "Ethernet",
      Interfaces: [
        { 
          Interface: "wan",
          IPv4Mode: "Static",
          IPv6Mode: "None",
          PPPoEUserName: "",
          PPPoEPassword: "",
          VLANType: "untagged",
          VLANID: "100",
          VLANPriority: "0",
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
            PrefixLength: ""
          }
        }
      ]
    }
  ]
};