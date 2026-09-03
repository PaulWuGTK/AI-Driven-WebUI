import type { NetworkTopologyResponse } from '../../types/networkTopology';

export const networkTopologyMockData: NetworkTopologyResponse = {
  NetworkTopology: {
    nodes: [
      {
        Name: 'HGW',
        Alias: 'self',
        Active: true,
        IPAddress: '',
        PhysAddress: '',
        Tags: 'self protected physical hgw',
        Parent: '',
        Level: 0,
        NodeType: 'self',
        MediaType: ''
      },
      {
        Name: 'bridge-lan_bridge',
        Alias: 'bridge-lan_bridge',
        Active: true,
        IPAddress: '192.168.1.1',
        PhysAddress: '4C:BA:7D:0F:2F:39',
        Tags: 'self lan protected mac interface bridge ipv4 ipv6',
        Parent: 'self',
        Level: 1,
        NodeType: 'interface',
        MediaType: 'Bridge'
      },
      {
        Name: 'ethIntf-ETH1',
        Alias: 'ethIntf-ETH1',
        Active: true,
        IPAddress: '',
        PhysAddress: '4C:BA:7D:0F:2F:39',
        Tags: 'self lan protected mac eth interface',
        Parent: 'bridge-lan_bridge',
        Level: 2,
        NodeType: 'interface',
        MediaType: 'Ethernet'
      },
      {
        Name: 'PC-Workstation',
        Alias: 'ID-01648275-3ca5-4560-83cc-39b366328467',
        Active: true,
        IPAddress: '192.168.1.168',
        PhysAddress: 'D8:CB:8A:7F:BB:ED',
        Tags: 'lan edev mac physical ipv6 ipv4 eth',
        Parent: 'ethIntf-ETH1',
        Level: 3,
        NodeType: 'device',
        MediaType: 'Ethernet'
      },
      {
        Name: 'ethIntf-ETH2',
        Alias: 'ethIntf-ETH2',
        Active: true,
        IPAddress: '',
        PhysAddress: '4C:BA:7D:0F:2F:39',
        Tags: 'self lan protected mac eth interface',
        Parent: 'bridge-lan_bridge',
        Level: 2,
        NodeType: 'interface',
        MediaType: 'Ethernet'
      },
      {
        Name: 'ssid-VAP2G0PRIV',
        Alias: 'ssid-VAP2G0PRIV',
        Active: true,
        IPAddress: '',
        PhysAddress: '4E:BA:7D:0F:32:3D',
        Tags: 'self lan protected mac wifi vap interface',
        Parent: 'bridge-lan_bridge',
        Level: 2,
        NodeType: 'interface',
        MediaType: 'Wi-Fi'
      },
      {
        Name: 'ssid-VAP5G0PRIV',
        Alias: 'ssid-VAP5G0PRIV',
        Active: true,
        IPAddress: '',
        PhysAddress: '4E:BA:7D:0F:31:3E',
        Tags: 'self lan protected mac wifi vap interface',
        Parent: 'bridge-lan_bridge',
        Level: 2,
        NodeType: 'interface',
        MediaType: 'Wi-Fi'
      },
      {
        Name: 'ssid-VAP6G0PRIV',
        Alias: 'ssid-VAP6G0PRIV',
        Active: true,
        IPAddress: '',
        PhysAddress: '4C:BA:7D:0F:2F:39',
        Tags: 'self lan protected mac wifi vap interface',
        Parent: 'bridge-lan_bridge',
        Level: 2,
        NodeType: 'interface',
        MediaType: 'Wi-Fi'
      },
      {
        Name: 'bridge-guest_bridge',
        Alias: 'bridge-guest_bridge',
        Active: true,
        IPAddress: '192.168.2.1',
        PhysAddress: '4C:BA:7D:0F:2F:3A',
        Tags: 'self lan protected mac interface bridge ipv4 ipv6',
        Parent: 'self',
        Level: 1,
        NodeType: 'interface',
        MediaType: 'Bridge'
      },
      {
        Name: 'ssid-VAP2G0GUEST',
        Alias: 'ssid-VAP2G0GUEST',
        Active: false,
        IPAddress: '',
        PhysAddress: '4E:BA:7D:0F:32:3E',
        Tags: 'self lan protected mac wifi vap interface',
        Parent: 'bridge-guest_bridge',
        Level: 2,
        NodeType: 'interface',
        MediaType: 'Wi-Fi'
      }
    ],
    textView: '   * HGW  { Active = true, Tags = "self protected physical hgw" }\n     +--[bridge-lan_bridge] { Active = true, IPAddress = "192.168.1.1" }\n         +--[ethIntf-ETH1] { Active = true }\n         |   +-- PC-Workstation  { Active = true, IPAddress = "192.168.1.168", PhysAddress = "D8:CB:8A:7F:BB:ED" }\n         +--[ethIntf-ETH2] { Active = true }\n         +--[ssid-VAP2G0PRIV] { Active = true }\n         +--[ssid-VAP5G0PRIV] { Active = true }\n         +--[ssid-VAP6G0PRIV] { Active = true }\n     +--[bridge-guest_bridge] { Active = true, IPAddress = "192.168.2.1" }\n         +--[ssid-VAP2G0GUEST] { Active = false }\n'
  }
};
