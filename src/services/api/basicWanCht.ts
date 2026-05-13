import apiClient from '../apiClient';
import type { BasicWanChtResponse, BasicWanChtConfig } from '../../types/basicWanCht';
import { basicWanChtMockData } from '../mockData/basicWanChtMockData';
import { toFlag01 } from '../flag01';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

const normalizeBasicWanChtConfig = (config: BasicWanChtConfig): BasicWanChtConfig => ({
  PPPoE: {
    Enable: toFlag01(config.PPPoE.Enable),
    Protocol: config.PPPoE.Protocol,
    UserName: config.PPPoE.UserName,
    Password: config.PPPoE.Password,
    ServiceName: config.PPPoE.ServiceName,
    ConnectionTrigger: config.PPPoE.ConnectionTrigger,
    IdleTime: config.PPPoE.IdleTime,
    MTU: config.PPPoE.MTU,
    DefaultGateway: toFlag01(config.PPPoE.DefaultGateway),
    PassthroughEnable: toFlag01(config.PPPoE.PassthroughEnable),
    IPv4Enable: toFlag01(config.PPPoE.IPv4Enable),
    IPv6Enable: toFlag01(config.PPPoE.IPv6Enable),
    DNSMode: config.PPPoE.DNSMode,
    PrimaryDNS: config.PPPoE.PrimaryDNS,
    SecondaryDNS: config.PPPoE.SecondaryDNS,
    NATEnable: toFlag01(config.PPPoE.NATEnable),
    IGMPEnable: toFlag01(config.PPPoE.IGMPEnable),
    VLANEnable: toFlag01(config.PPPoE.VLANEnable),
    VLANPriority: config.PPPoE.VLANPriority,
    VLANID: config.PPPoE.VLANID,
    ListConnectionTrigger: config.PPPoE.ListConnectionTrigger,
    ListDNSMode: config.PPPoE.ListDNSMode
  },
  IPoE: {
    Enable: toFlag01(config.IPoE.Enable),
    Protocol: config.IPoE.Protocol,
    MTU: config.IPoE.MTU,
    DefaultGateway: toFlag01(config.IPoE.DefaultGateway),
    IPv4Enable: toFlag01(config.IPoE.IPv4Enable),
    IPv6Enable: toFlag01(config.IPoE.IPv6Enable),
    DHCPv4Option60Enable: toFlag01(config.IPoE.DHCPv4Option60Enable),
    DHCPv4Option60Value: config.IPoE.DHCPv4Option60Value,
    DHCPv4Option61Enable: toFlag01(config.IPoE.DHCPv4Option61Enable),
    IAID: config.IPoE.IAID,
    DUIDType: config.IPoE.DUIDType,
    EnterpriseNumber: config.IPoE.EnterpriseNumber,
    Identifier: config.IPoE.Identifier,
    DNSMode: config.IPoE.DNSMode,
    PrimaryDNS: config.IPoE.PrimaryDNS,
    SecondaryDNS: config.IPoE.SecondaryDNS,
    NATEnable: toFlag01(config.IPoE.NATEnable),
    IGMPEnable: toFlag01(config.IPoE.IGMPEnable),
    VLANEnable: toFlag01(config.IPoE.VLANEnable),
    VLANPriority: config.IPoE.VLANPriority,
    VLANID: config.IPoE.VLANID,
    IPAddress: config.IPoE.IPAddress,
    SubnetMask: config.IPoE.SubnetMask,
    Gateway: config.IPoE.Gateway,
    ListProtocol: config.IPoE.ListProtocol,
    ListDNSMode: config.IPoE.ListDNSMode
  },
  Bridge: {
    Enable: toFlag01(config.Bridge.Enable),
    Protocol: config.Bridge.Protocol,
    MTU: config.Bridge.MTU,
    VLANEnable: toFlag01(config.Bridge.VLANEnable),
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
        Enable: toFlag01(config.PPPoE.Enable),
        Protocol: config.PPPoE.Protocol,
        UserName: config.PPPoE.UserName,
        Password: config.PPPoE.Password,
        ServiceName: config.PPPoE.ServiceName,
        ConnectionTrigger: config.PPPoE.ConnectionTrigger,
        IdleTime: config.PPPoE.IdleTime,
        MTU: config.PPPoE.MTU,
        DefaultGateway: toFlag01(config.PPPoE.DefaultGateway),
        PassthroughEnable: toFlag01(config.PPPoE.PassthroughEnable),
        IPv4Enable: toFlag01(config.PPPoE.IPv4Enable),
        IPv6Enable: toFlag01(config.PPPoE.IPv6Enable),
        DNSMode: config.PPPoE.DNSMode,
        PrimaryDNS: config.PPPoE.PrimaryDNS,
        SecondaryDNS: config.PPPoE.SecondaryDNS,
        NATEnable: toFlag01(config.PPPoE.NATEnable),
        IGMPEnable: toFlag01(config.PPPoE.IGMPEnable),
        VLANEnable: toFlag01(config.PPPoE.VLANEnable),
        VLANPriority: config.PPPoE.VLANPriority,
        VLANID: config.PPPoE.VLANID
      },
      IPoE: {
        Enable: toFlag01(config.IPoE.Enable),
        Protocol: config.IPoE.Protocol,
        MTU: config.IPoE.MTU,
        DefaultGateway: toFlag01(config.IPoE.DefaultGateway),
        IPv4Enable: toFlag01(config.IPoE.IPv4Enable),
        IPv6Enable: toFlag01(config.IPoE.IPv6Enable),
        DHCPv4Option60Enable: toFlag01(config.IPoE.DHCPv4Option60Enable),
        DHCPv4Option60Value: config.IPoE.DHCPv4Option60Value,
        DHCPv4Option61Enable: toFlag01(config.IPoE.DHCPv4Option61Enable),
        IAID: config.IPoE.IAID,
        DUIDType: config.IPoE.DUIDType,
        EnterpriseNumber: config.IPoE.EnterpriseNumber,
        Identifier: config.IPoE.Identifier,
        DNSMode: config.IPoE.DNSMode,
        PrimaryDNS: config.IPoE.PrimaryDNS,
        SecondaryDNS: config.IPoE.SecondaryDNS,
        NATEnable: toFlag01(config.IPoE.NATEnable),
        IGMPEnable: toFlag01(config.IPoE.IGMPEnable),
        VLANEnable: toFlag01(config.IPoE.VLANEnable),
        VLANPriority: config.IPoE.VLANPriority,
        VLANID: config.IPoE.VLANID,
        IPAddress: config.IPoE.IPAddress,
        SubnetMask: config.IPoE.SubnetMask,
        Gateway: config.IPoE.Gateway
      },
      Bridge: {
        Enable: toFlag01(config.Bridge.Enable),
        Protocol: config.Bridge.Protocol,
        MTU: config.Bridge.MTU,
        VLANEnable: toFlag01(config.Bridge.VLANEnable),
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
