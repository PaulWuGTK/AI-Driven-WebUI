import type {
  ServiceControlResponse,
  ServiceControlRule,
  ServiceControlUpdateRequest
} from '../../types/serviceControl';

const mockServiceControlData: ServiceControlResponse = {
  AdvancedServiceControl: {
    Rules: [
      {
        DestPort: '80',
        Protocol: '6',
        Action: 'Accept',
        Enable: 1,
        Service: 'HTTP',
        Interface: 'Device.IP.Interface.3.',
        IPVersion: 6
      },
      {
        DestPort: '443',
        Protocol: '6',
        Action: 'Accept',
        Enable: 1,
        Service: 'HTTPS',
        Interface: 'Device.IP.Interface.3.',
        IPVersion: 4
      },
      {
        DestPort: '53',
        Protocol: '17',
        Action: 'Accept',
        Enable: 1,
        Service: 'DNS',
        Interface: 'Device.IP.Interface.3.',
        IPVersion: 0
      }
    ],
    ACLAvailableOptions: {
      Protocols: [
        { value: '6', label: 'TCP' },
        { value: '17', label: 'UDP' },
        { value: '1', label: 'ICMPv4' },
        { value: '58', label: 'ICMPv6' }
      ],
      IPVersions: [
        { value: '4', label: 'IPv4' },
        { value: '6', label: 'IPv6' }
      ],
      Interfaces: [
        { value: 'Device.IP.Interface.3.', label: 'br-lan' },
        { value: 'Device.IP.Interface.5.', label: 'br-lcm' },
        { value: 'Device.IP.Interface.4.', label: 'br-guest' },
        { value: 'Device.IP.Interface.2.', label: 'eth0' },
        { value: 'Device.Logical.Interface.1.', label: 'wan' }
      ],
      Services: [
        { value: 'SSH', port: '22', protocol: '6' },
        { value: 'HTTPS', port: '443', protocol: '6' },
        { value: 'HTTP', port: '80', protocol: '6' },
        { value: 'DNS', port: '53', protocol: '17,6' },
        { value: 'ICMP', port: '-1', protocol: '1' }
      ]
    }
  }
};

const withInterfaceOriginal = (rules: ServiceControlRule[]): ServiceControlRule[] =>
  rules.map((rule) => ({
    ...rule,
    InterfaceOriginal: (rule as ServiceControlRule & { InterfaceOriginal?: string }).InterfaceOriginal ?? rule.Interface
  }));

export const getServiceControlMockData = (): ServiceControlResponse => {
  mockServiceControlData.AdvancedServiceControl.Rules = withInterfaceOriginal(
    mockServiceControlData.AdvancedServiceControl.Rules || []
  );
  return mockServiceControlData;
};

export const updateServiceControlMockData = (
  data: ServiceControlUpdateRequest
): ServiceControlResponse => {
  mockServiceControlData.AdvancedServiceControl.Rules = withInterfaceOriginal(
    data.AdvancedServiceControl.Rules
  );
  return mockServiceControlData;
};
