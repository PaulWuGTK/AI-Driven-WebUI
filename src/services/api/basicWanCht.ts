import apiClient from '../apiClient';
import type { BasicWanChtResponse, BasicWanChtConfig } from '../../types/basicWanCht';
import { basicWanChtMockData } from '../mockData/basicWanChtMockData';

const isDevelopment = import.meta.env.DEV;

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '1' || normalized === 'true') return true;
    if (normalized === '0' || normalized === 'false') return false;
  }
  return fallback;
};

const toNumberFlag = (value: boolean): 0 | 1 => (value ? 1 : 0);

const normalizeBasicWanChtConfig = (config: BasicWanChtConfig): BasicWanChtConfig => ({
  PPPoE: {
    Enable: toBoolean(config.PPPoE.Enable),
    Protocol: config.PPPoE.Protocol,
    UserName: config.PPPoE.UserName,
    Password: config.PPPoE.Password,
    ServiceName: config.PPPoE.ServiceName,
    ConnectionTrigger: config.PPPoE.ConnectionTrigger,
    IdleTime: config.PPPoE.IdleTime,
    MTU: config.PPPoE.MTU,
    DefaultGateway: toBoolean(config.PPPoE.DefaultGateway),
    PassthroughEnable: toBoolean(config.PPPoE.PassthroughEnable),
    IPv4Enable: toBoolean(config.PPPoE.IPv4Enable),
    IPv6Enable: toBoolean(config.PPPoE.IPv6Enable),
    DNSMode: config.PPPoE.DNSMode,
    PrimaryDNS: config.PPPoE.PrimaryDNS,
    SecondaryDNS: config.PPPoE.SecondaryDNS,
    NATEnable: toBoolean(config.PPPoE.NATEnable),
    IGMPEnable: toBoolean(config.PPPoE.IGMPEnable),
    VLANEnable: toBoolean(config.PPPoE.VLANEnable),
    VLANPriority: config.PPPoE.VLANPriority,
    VLANID: config.PPPoE.VLANID,
    ListConnectionTrigger: config.PPPoE.ListConnectionTrigger,
    ListDNSMode: config.PPPoE.ListDNSMode
  },
  IPoE: {
    Enable: toBoolean(config.IPoE.Enable),
    Protocol: config.IPoE.Protocol,
    MTU: config.IPoE.MTU,
    DefaultGateway: toBoolean(config.IPoE.DefaultGateway),
    IPv4Enable: toBoolean(config.IPoE.IPv4Enable),
    IPv6Enable: toBoolean(config.IPoE.IPv6Enable),
    DHCPv4Option60Enable: toBoolean(config.IPoE.DHCPv4Option60Enable),
    DHCPv4Option60Value: config.IPoE.DHCPv4Option60Value,
    DHCPv4Option61Enable: toBoolean(config.IPoE.DHCPv4Option61Enable),
    IAID: config.IPoE.IAID,
    DUIDType: config.IPoE.DUIDType,
    EnterpriseNumber: config.IPoE.EnterpriseNumber,
    Identifier: config.IPoE.Identifier,
    DNSMode: config.IPoE.DNSMode,
    PrimaryDNS: config.IPoE.PrimaryDNS,
    SecondaryDNS: config.IPoE.SecondaryDNS,
    NATEnable: toBoolean(config.IPoE.NATEnable),
    IGMPEnable: toBoolean(config.IPoE.IGMPEnable),
    VLANEnable: toBoolean(config.IPoE.VLANEnable),
    VLANPriority: config.IPoE.VLANPriority,
    VLANID: config.IPoE.VLANID,
    IPAddress: config.IPoE.IPAddress,
    SubnetMask: config.IPoE.SubnetMask,
    Gateway: config.IPoE.Gateway,
    ListProtocol: config.IPoE.ListProtocol,
    ListDNSMode: config.IPoE.ListDNSMode
  },
  Bridge: {
    Enable: toBoolean(config.Bridge.Enable),
    Protocol: config.Bridge.Protocol,
    MTU: config.Bridge.MTU,
    VLANEnable: toBoolean(config.Bridge.VLANEnable),
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
        Enable: toNumberFlag(config.PPPoE.Enable),
        Protocol: config.PPPoE.Protocol,
        UserName: config.PPPoE.UserName,
        Password: config.PPPoE.Password,
        ServiceName: config.PPPoE.ServiceName,
        ConnectionTrigger: config.PPPoE.ConnectionTrigger,
        IdleTime: config.PPPoE.IdleTime,
        MTU: config.PPPoE.MTU,
        DefaultGateway: toNumberFlag(config.PPPoE.DefaultGateway),
        PassthroughEnable: toNumberFlag(config.PPPoE.PassthroughEnable),
        IPv4Enable: toNumberFlag(config.PPPoE.IPv4Enable),
        IPv6Enable: toNumberFlag(config.PPPoE.IPv6Enable),
        DNSMode: config.PPPoE.DNSMode,
        PrimaryDNS: config.PPPoE.PrimaryDNS,
        SecondaryDNS: config.PPPoE.SecondaryDNS,
        NATEnable: toNumberFlag(config.PPPoE.NATEnable),
        IGMPEnable: toNumberFlag(config.PPPoE.IGMPEnable),
        VLANEnable: toNumberFlag(config.PPPoE.VLANEnable),
        VLANPriority: config.PPPoE.VLANPriority,
        VLANID: config.PPPoE.VLANID
      },
      IPoE: {
        Enable: toNumberFlag(config.IPoE.Enable),
        Protocol: config.IPoE.Protocol,
        MTU: config.IPoE.MTU,
        DefaultGateway: toNumberFlag(config.IPoE.DefaultGateway),
        IPv4Enable: toNumberFlag(config.IPoE.IPv4Enable),
        IPv6Enable: toNumberFlag(config.IPoE.IPv6Enable),
        DHCPv4Option60Enable: toNumberFlag(config.IPoE.DHCPv4Option60Enable),
        DHCPv4Option60Value: config.IPoE.DHCPv4Option60Value,
        DHCPv4Option61Enable: toNumberFlag(config.IPoE.DHCPv4Option61Enable),
        IAID: config.IPoE.IAID,
        DUIDType: config.IPoE.DUIDType,
        EnterpriseNumber: config.IPoE.EnterpriseNumber,
        Identifier: config.IPoE.Identifier,
        DNSMode: config.IPoE.DNSMode,
        PrimaryDNS: config.IPoE.PrimaryDNS,
        SecondaryDNS: config.IPoE.SecondaryDNS,
        NATEnable: toNumberFlag(config.IPoE.NATEnable),
        IGMPEnable: toNumberFlag(config.IPoE.IGMPEnable),
        VLANEnable: toNumberFlag(config.IPoE.VLANEnable),
        VLANPriority: config.IPoE.VLANPriority,
        VLANID: config.IPoE.VLANID,
        IPAddress: config.IPoE.IPAddress,
        SubnetMask: config.IPoE.SubnetMask,
        Gateway: config.IPoE.Gateway
      },
      Bridge: {
        Enable: toNumberFlag(config.Bridge.Enable),
        Protocol: config.Bridge.Protocol,
        MTU: config.Bridge.MTU,
        VLANEnable: toNumberFlag(config.Bridge.VLANEnable),
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
