import type { UpnpResponse, UpnpUpdateRequest, UpnpUpdateResponse } from '../../types/upnp';

const mockUpnpData: UpnpResponse = {
  ApplicationUpnp: {
    Enable: true,
    InterfaceOptions: [
      { value: 'Device.Logical.Interface.1.', label: 'wan' },
      { value: 'Device.Logical.Interface.3.', label: 'guest' },
      { value: 'Device.Logical.Interface.7.', label: 'iptv' },
      { value: 'Device.Logical.Interface.2.', label: 'lan' },
      { value: 'Device.Logical.Interface.4.', label: 'lcm' },
      { value: 'Device.Logical.Interface.6.', label: 'mgmt' },
      { value: 'Device.Logical.Interface.5.', label: 'voip' },
      { value: 'Device.Logical.Interface.8.', label: 'wan-cellular' }
    ],
    Interface: 'Device.Logical.Interface.1.',
    PortMappings: [
      {
        Path: 'Device.NAT.PortMapping.1.',
        Description: 'UPnP-Test',
        ExternalPort: 18080,
        Id: 1,
        Origin: 'UPnP',
        InternalPort: 8080,
        RemainingLeaseTime: 604199,
        LeaseDuration: 604800,
        RemoteHost: '',
        Enable: true,
        Interface: 'Device.Logical.Interface.1',
        Status: 'Enabled',
        InternalClient: '192.168.101.168',
        Protocol: 'TCP',
        ExternalPortEnd: 0
      }
    ],
    PortMappingStats: {
      total: 1
    }
  }
};

export const getUpnpMockData = (): UpnpResponse => ({
  ApplicationUpnp: {
    ...mockUpnpData.ApplicationUpnp,
    InterfaceOptions: [...(mockUpnpData.ApplicationUpnp.InterfaceOptions || [])],
    PortMappings: [...(mockUpnpData.ApplicationUpnp.PortMappings || [])],
    PortMappingStats: mockUpnpData.ApplicationUpnp.PortMappingStats
      ? { ...mockUpnpData.ApplicationUpnp.PortMappingStats }
      : undefined
  }
});

export const updateUpnpMockData = (data: UpnpUpdateRequest): UpnpUpdateResponse => {
  mockUpnpData.ApplicationUpnp.Enable = data.ApplicationUpnp.Enable;
  mockUpnpData.ApplicationUpnp.Interface = data.ApplicationUpnp.Interface;

  return {
    ApplicationUpnp: {
      status: 'success'
    }
  };
};

