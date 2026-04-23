import type { LanBasicResponse, LanBasicUpdateRequest, DeviceConnectedResponse } from '../../types/lanBasic';
import { callApi } from '../apiClient';
import { toFlag01 } from '../flag01';

const isDevelopment = import.meta.env.DEV;

const DEFAULT_IPV4_PROTOCOL_LIST = ['DHCP', 'Static'];
const DEFAULT_IPV6_PROTOCOL_LIST = ['AutoConfigured', 'Static'];
const DEFAULT_IPV6_PREFIX_PROTOCOL_LIST = ['AutoConfigured', 'Static'];

const normalizeLanBasicResponse = (response: any): LanBasicResponse => {
  const lan = response?.LanBasic ?? {};
  const lanIp = lan?.LANIPSetting ?? {};
  const dhcp = lan?.DHCPv4Setting ?? {};
  const reservations = Array.isArray(lan?.IPAddressReservation) ? lan.IPAddressReservation : [];

  return {
    LanBasic: {
      LANIPSetting: {
        IPv4Enable: toFlag01(lanIp.IPv4Enable ?? lanIp.Enable, 1),
        IPv4Protocol: String(lanIp.IPv4Protocol ?? 'Static'),
        IPv4IPAddress: String(lanIp.IPv4IPAddress ?? lanIp.IPAddress ?? '192.168.1.1'),
        SubnetMask: String(lanIp.SubnetMask ?? '255.255.255.0'),
        IPv6Enable: toFlag01(lanIp.IPv6Enable, 0),
        IPv6Protocol: String(lanIp.IPv6Protocol ?? 'AutoConfigured'),
        IPv6Address: String(lanIp.IPv6Address ?? ''),
        IPv6PrefixProtocol: String(lanIp.IPv6PrefixProtocol ?? 'AutoConfigured'),
        IPv6Prefix: String(lanIp.IPv6Prefix ?? ''),
        ListIPv4Protocol: Array.isArray(lanIp.ListIPv4Protocol) && lanIp.ListIPv4Protocol.length > 0
          ? lanIp.ListIPv4Protocol
          : DEFAULT_IPV4_PROTOCOL_LIST,
        ListIPv6Protocol: Array.isArray(lanIp.ListIPv6Protocol) && lanIp.ListIPv6Protocol.length > 0
          ? lanIp.ListIPv6Protocol
          : DEFAULT_IPV6_PROTOCOL_LIST,
        ListIPv6PrefixProtocol: Array.isArray(lanIp.ListIPv6PrefixProtocol) && lanIp.ListIPv6PrefixProtocol.length > 0
          ? lanIp.ListIPv6PrefixProtocol
          : DEFAULT_IPV6_PREFIX_PROTOCOL_LIST,
      },
      DHCPv4Setting: {
        Enable: toFlag01(dhcp.Enable, 1),
        DNSServers: String(dhcp.DNSServers ?? '192.168.1.1'),
        BeginAddress: String(dhcp.BeginAddress ?? '192.168.1.2'),
        EndAddress: String(dhcp.EndAddress ?? '192.168.1.254'),
        SubnetMask: String(dhcp.SubnetMask ?? '255.255.255.0'),
        LeaseTime: Number(dhcp.LeaseTime ?? 43200),
      },
      IPAddressReservation: reservations.map((item: any) => ({
        MACAddress: String(item?.MACAddress ?? ''),
        IPAddress: String(item?.IPAddress ?? ''),
        Enable: toFlag01(item?.Enable, 1),
      }))
    }
  };
};

export const getLanBasic = async (): Promise<LanBasicResponse> => {
  if (isDevelopment) {
    return normalizeLanBasicResponse({
      LanBasic: {
        LANIPSetting: {
          IPv4Enable: 1,
          IPv4Protocol: 'Static',
          IPv4IPAddress: '192.168.1.1',
          SubnetMask: '255.255.255.0',
          IPv6Enable: 0,
          IPv6Protocol: 'AutoConfigured',
          IPv6Address: '',
          IPv6PrefixProtocol: 'AutoConfigured',
          IPv6Prefix: '',
          ListIPv4Protocol: DEFAULT_IPV4_PROTOCOL_LIST,
          ListIPv6Protocol: DEFAULT_IPV6_PROTOCOL_LIST,
          ListIPv6PrefixProtocol: DEFAULT_IPV6_PREFIX_PROTOCOL_LIST,
        },
        DHCPv4Setting: {
          Enable: 1,
          DNSServers: '192.168.1.1',
          BeginAddress: '192.168.1.2',
          EndAddress: '192.168.1.254',
          SubnetMask: '255.255.255.0',
          LeaseTime: 43200
        },
        IPAddressReservation: [
          {
            MACAddress: '68:05:CA:00:ED:33',
            IPAddress: '192.168.1.168',
            Enable: 1
          }
        ]
      }
    });
  }
  const response = await callApi<any>('/API/info?list=LanBasic');
  return normalizeLanBasicResponse(response);
};

export const getDeviceConnected = async (): Promise<DeviceConnectedResponse> => {
  if (isDevelopment) {
    return {
      LanDeviceConnected: [
        {
          Host: "PC-ID-b8e2b3f2-d76e-49a1-aee8-20e8f0743f4c",
          IPAddress: "192.168.101.3",
          MACAddress: "CE:E7:61:ED:D6:15"
        },
        {
          Host: "PC-ID-74091540-2c22-4b92-89a5-ef67d75656d5",
          IPAddress: "192.168.101.2",
          MACAddress: "B0:0C:D1:52:A5:DE"
        }
      ]
    };
  }
  return callApi<DeviceConnectedResponse>('/API/info?list=LanDeviceConnected');
};

export const updateLanBasic = async (data: LanBasicUpdateRequest): Promise<LanBasicResponse> => {
  if (isDevelopment) {
    console.log('Update LAN Basic:', data);
    return getLanBasic();
  }

  const normalized: LanBasicUpdateRequest = {
    LanBasic: {
      LANIPSetting: {
        IPv4Enable: toFlag01(data.LanBasic.LANIPSetting.IPv4Enable),
        IPv4Protocol: data.LanBasic.LANIPSetting.IPv4Protocol,
        IPv4IPAddress: data.LanBasic.LANIPSetting.IPv4IPAddress,
        SubnetMask: data.LanBasic.LANIPSetting.SubnetMask,
        IPv6Enable: toFlag01(data.LanBasic.LANIPSetting.IPv6Enable),
        IPv6Protocol: data.LanBasic.LANIPSetting.IPv6Protocol,
        IPv6Address: data.LanBasic.LANIPSetting.IPv6Address,
        IPv6PrefixProtocol: data.LanBasic.LANIPSetting.IPv6PrefixProtocol,
        IPv6Prefix: data.LanBasic.LANIPSetting.IPv6Prefix
      },
      DHCPv4Setting: {
        ...data.LanBasic.DHCPv4Setting,
        Enable: toFlag01(data.LanBasic.DHCPv4Setting.Enable),
        LeaseTime: Number(data.LanBasic.DHCPv4Setting.LeaseTime)
      },
      IPAddressReservation: (data.LanBasic.IPAddressReservation ?? []).map(item => ({
        ...item,
        Enable: toFlag01(item.Enable)
      }))
    }
  };

  return callApi<LanBasicResponse>('/API/info?list=LanBasic', {
    method: 'POST',
    body: JSON.stringify(normalized),
  });
};
