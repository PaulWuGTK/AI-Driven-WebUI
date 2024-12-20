import type { WanStatusResponse } from '../types/wan';
import type { LanStatusResponse } from '../types/lan';

export const getMockWanStatus = (): WanStatusResponse => ({
  StatusWan: {
    SensingPolicy: "AtBoot",
    OperationMode: "Manual",
    WANModeConfig: {
      Interfaces: [{
        Duplex: "Full",
        Type: "untagged",
        PPPoEUserName: "",
        VlanPriority: "0",
        MACAddress: "86:D5:7F:63:17:98",
        ipv6: [{
          IPv6Address: "fe80::84d5:7fff:fe63:1798",
          Prefix: "",
          Gateway: "",
          IPv6Type: "LLA",
          Status: "Enabled",
          DNSServer: ""
        }, {
          IPv6Address: "",
          Prefix: "",
          Gateway: "",
          IPv6Type: "GUA_STATIC",
          Status: "Error",
          DNSServer: ""
        }],
        Name: "eth0",
        ipv4: [{
          DNSServer: "192.168.11.1",
          Gateway: "192.168.11.1",
          Status: "Enabled",
          SubnetMask: "255.255.255.0",
          IPv4Address: "192.168.11.3",
          IPv4Mode: "DHCP"
        }],
        Speed: "1000",
        VlanID: "100",
        PPPoEPassword: "",
        WanPort: "wan"
      }],
      DNSMode: "Dynamic",
      Status: "Enabled",
      PhysicalType: "Ethernet",
      Origin: "user",
      EnableSensing: "1"
    },
    WANMode: "demo_wanmode",
    SensingTimeout: "8"
  }
});

export const getMockLanStatus = (): LanStatusResponse => ({
  StatusLan: [
    {
      MACAddress: "AE:19:FF:BC:D1:4D",
      ipv6: [
        {
          IPv6Address: "fe80::ac19:ffff:febc:d14d",
          Name: "LLA",
          Status: "Enabled"
        }
      ],
      Name: "br-lan",
      MTU: "1500",
      ipv4: [
        {
          Status: "Enabled",
          IPv4Netmask: "255.255.255.0",
          IPv4Address: "192.168.101.1",
          Name: "lan"
        }
      ]
    },
    {
      MACAddress: "AE:19:FF:BC:D1:4E",
      ipv6: [],
      Name: "br-guest",
      MTU: "1500",
      ipv4: [
        {
          Status: "Enabled",
          IPv4Netmask: "255.255.255.0",
          IPv4Address: "192.168.2.1",
          Name: "guest"
        }
      ]
    },
    {
      MACAddress: "AE:19:FF:BC:D1:4F",
      ipv6: [
        {
          IPv6Address: "fe80::ac19:ffff:febc:d14f",
          Name: "LLA",
          Status: "Enabled"
        }
      ],
      Name: "br-lcm",
      MTU: "1500",
      ipv4: [
        {
          Status: "Enabled",
          IPv4Netmask: "255.255.255.0",
          IPv4Address: "192.168.3.1",
          Name: "lcm"
        }
      ]
    }
  ]
});