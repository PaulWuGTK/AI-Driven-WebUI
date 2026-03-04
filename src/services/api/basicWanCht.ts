import apiClient from '../apiClient';
import type { BasicWanChtResponse, BasicWanChtConfig } from '../../types/basicWanCht';
import { basicWanChtMockData } from '../mockData/basicWanChtMockData';

const isDevelopment = import.meta.env.DEV;

const normalizeBasicWanChtConfig = (config: BasicWanChtConfig): BasicWanChtConfig => ({
  PPPoE: {
    Enable: config.PPPoE.Enable,
    Protocol: config.PPPoE.Protocol,
    UserName: config.PPPoE.UserName,
    Password: config.PPPoE.Password,
    ServiceName: config.PPPoE.ServiceName,
    ConnectionTrigger: config.PPPoE.ConnectionTrigger,
    IdleTime: config.PPPoE.IdleTime,
    MTU: config.PPPoE.MTU,
    DefaultGateway: config.PPPoE.DefaultGateway,
    PassthroughEnable: config.PPPoE.PassthroughEnable,
    IPv4Enable: config.PPPoE.IPv4Enable,
    IPv6Enable: config.PPPoE.IPv6Enable,
    DNSMode: config.PPPoE.DNSMode,
    PrimaryDNS: config.PPPoE.PrimaryDNS,
    SecondaryDNS: config.PPPoE.SecondaryDNS,
    NATEnable: config.PPPoE.NATEnable,
    IGMPEnable: config.PPPoE.IGMPEnable,
    VLANEnable: config.PPPoE.VLANEnable,
    VLANPriority: config.PPPoE.VLANPriority,
    VLANID: config.PPPoE.VLANID,
    ListConnectionTrigger: config.PPPoE.ListConnectionTrigger,
    ListDNSMode: config.PPPoE.ListDNSMode
  },
  IPoE: {
    Enable: config.IPoE.Enable,
    Protocol: config.IPoE.Protocol,
    MTU: config.IPoE.MTU,
    DefaultGateway: config.IPoE.DefaultGateway,
    IPv4Enable: config.IPoE.IPv4Enable,
    IPv6Enable: config.IPoE.IPv6Enable,
    DHCPv4Option60Enable: config.IPoE.DHCPv4Option60Enable,
    DHCPv4Option60Value: config.IPoE.DHCPv4Option60Value,
    DHCPv4Option61Enable: config.IPoE.DHCPv4Option61Enable,
    IAID: config.IPoE.IAID,
    DUIDType: config.IPoE.DUIDType,
    EnterpriseNumber: config.IPoE.EnterpriseNumber,
    Identifier: config.IPoE.Identifier,
    DNSMode: config.IPoE.DNSMode,
    PrimaryDNS: config.IPoE.PrimaryDNS,
    SecondaryDNS: config.IPoE.SecondaryDNS,
    NATEnable: config.IPoE.NATEnable,
    IGMPEnable: config.IPoE.IGMPEnable,
    VLANEnable: config.IPoE.VLANEnable,
    VLANPriority: config.IPoE.VLANPriority,
    VLANID: config.IPoE.VLANID,
    IPAddress: config.IPoE.IPAddress,
    SubnetMask: config.IPoE.SubnetMask,
    Gateway: config.IPoE.Gateway,
    ListProtocol: config.IPoE.ListProtocol,
    ListDNSMode: config.IPoE.ListDNSMode
  },
  Bridge: {
    Enable: config.Bridge.Enable,
    Protocol: config.Bridge.Protocol,
    MTU: config.Bridge.MTU,
    VLANEnable: config.Bridge.VLANEnable,
    VLANPriority: config.Bridge.VLANPriority,
    VLANID: config.Bridge.VLANID,
    ListSupportedLANInterfaces: config.Bridge.ListSupportedLANInterfaces,
    ListLANInterfaces: config.Bridge.ListLANInterfaces
  }
});

export const basicWanChtApi = {
  async getConfig(): Promise<BasicWanChtConfig> {
    if (isDevelopment) {
      return normalizeBasicWanChtConfig(basicWanChtMockData.BasicWanCht);
    }
    const response = await apiClient.get<BasicWanChtResponse>('/API/info?list=BasicWanCht');
    return normalizeBasicWanChtConfig(response.BasicWanCht);
  },

  async updateConfig(config: BasicWanChtConfig): Promise<void> {
    if (isDevelopment) {
      console.log('Mock: Updated BasicWanCht config:', config);
      return Promise.resolve();
    }

    const postData = {
      PPPoE: {
        Enable: config.PPPoE.Enable,
        Protocol: config.PPPoE.Protocol,
        UserName: config.PPPoE.UserName,
        Password: config.PPPoE.Password,
        ServiceName: config.PPPoE.ServiceName,
        ConnectionTrigger: config.PPPoE.ConnectionTrigger,
        IdleTime: config.PPPoE.IdleTime,
        MTU: config.PPPoE.MTU,
        DefaultGateway: config.PPPoE.DefaultGateway,
        PassthroughEnable: config.PPPoE.PassthroughEnable,
        IPv4Enable: config.PPPoE.IPv4Enable,
        IPv6Enable: config.PPPoE.IPv6Enable,
        DNSMode: config.PPPoE.DNSMode,
        PrimaryDNS: config.PPPoE.PrimaryDNS,
        SecondaryDNS: config.PPPoE.SecondaryDNS,
        NATEnable: config.PPPoE.NATEnable,
        IGMPEnable: config.PPPoE.IGMPEnable,
        VLANEnable: config.PPPoE.VLANEnable,
        VLANPriority: config.PPPoE.VLANPriority,
        VLANID: config.PPPoE.VLANID
      },
      IPoE: {
        Enable: config.IPoE.Enable,
        Protocol: config.IPoE.Protocol,
        MTU: config.IPoE.MTU,
        DefaultGateway: config.IPoE.DefaultGateway,
        IPv4Enable: config.IPoE.IPv4Enable,
        IPv6Enable: config.IPoE.IPv6Enable,
        DHCPv4Option60Enable: config.IPoE.DHCPv4Option60Enable,
        DHCPv4Option60Value: config.IPoE.DHCPv4Option60Value,
        DHCPv4Option61Enable: config.IPoE.DHCPv4Option61Enable,
        IAID: config.IPoE.IAID,
        DUIDType: config.IPoE.DUIDType,
        EnterpriseNumber: config.IPoE.EnterpriseNumber,
        Identifier: config.IPoE.Identifier,
        DNSMode: config.IPoE.DNSMode,
        PrimaryDNS: config.IPoE.PrimaryDNS,
        SecondaryDNS: config.IPoE.SecondaryDNS,
        NATEnable: config.IPoE.NATEnable,
        IGMPEnable: config.IPoE.IGMPEnable,
        VLANEnable: config.IPoE.VLANEnable,
        VLANPriority: config.IPoE.VLANPriority,
        VLANID: config.IPoE.VLANID,
        IPAddress: config.IPoE.IPAddress,
        SubnetMask: config.IPoE.SubnetMask,
        Gateway: config.IPoE.Gateway
      },
      Bridge: {
        Enable: config.Bridge.Enable,
        Protocol: config.Bridge.Protocol,
        MTU: config.Bridge.MTU,
        VLANEnable: config.Bridge.VLANEnable,
        VLANPriority: config.Bridge.VLANPriority,
        VLANID: config.Bridge.VLANID,
        ListLANInterfaces: config.Bridge.ListLANInterfaces
      }
    };

    await apiClient.post('/API/info?list=BasicWanCht', {
      BasicWanCht: postData
    });
  }
};
