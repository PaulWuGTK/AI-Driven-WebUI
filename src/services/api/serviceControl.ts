import type { ServiceControlResponse, ServiceControlUpdateRequest } from '../../types/serviceControl';
import { handleApiResponse } from '../../utils/apiUtils';

const isDevelopment = import.meta.env.DEV;

// Mock data for development
const mockServiceControlData: ServiceControlResponse = {
  AdvancedServiceControl: {
    Rules: [
      {
        DestPort: "80",
        Protocol: "6",
        Action: "Accept",
        Enable: true,
        Service: "HTTP",
        Interface: "Device.IP.Interface.3.",
        IPVersion: 4
      },
      {
        DestPort: "443",
        Protocol: "6",
        Action: "Accept",
        Enable: true,
        Service: "HTTPS",
        Interface: "Device.IP.Interface.3.",
        IPVersion: 4
      },
      {
        DestPort: "53",
        Protocol: "17",
        Action: "Accept",
        Enable: true,
        Service: "DNS",
        Interface: "Device.IP.Interface.3.",
        IPVersion: 4
      }
    ],
    ACLAvailableOptions: {
      Protocols: [
        { value: "6", label: "TCP" },
        { value: "17", label: "UDP" },
        { value: "1", label: "ICMPv4" },
        { value: "58", label: "ICMPv6" }
      ],
      IPVersions: [
        { value: "4", label: "IPv4" },
        { value: "6", label: "IPv6" }
      ],
      Interfaces: [
        { value: "Device.IP.Interface.3.", label: "br-lan" },
        { value: "Device.IP.Interface.5.", label: "br-lcm" },
        { value: "Device.IP.Interface.4.", label: "br-guest" },
        { value: "Device.IP.Interface.2.", label: "eth0" },
        { value: "Device.Logical.Interface.1.", label: "wan" }
      ],
      Services: [
        { value: "SSH", port: "22", protocol: "6" },
        { value: "HTTPS", port: "443", protocol: "6" },
        { value: "HTTP", port: "80", protocol: "6" },
        { value: "DNS", port: "53", protocol: "17,6" },
        { value: "ICMP", port: "-1", protocol: "1" }
      ]
    }
  }
};

export const getServiceControl = async (): Promise<ServiceControlResponse> => {
  if (isDevelopment) {
    return mockServiceControlData;
  }

  const response = await fetch('/API/info?list=AdvancedServiceControl');
  return handleApiResponse<ServiceControlResponse>(response);
};

export const updateServiceControl = async (data: ServiceControlUpdateRequest): Promise<ServiceControlResponse> => {
  if (isDevelopment) {
    console.log('Update Service Control:', data);
    
    // Update mock data
    mockServiceControlData.AdvancedServiceControl.Rules = data.AdvancedServiceControl.Rules;
    
    return mockServiceControlData;
  }

  const response = await fetch('/API/info?list=AdvancedServiceControl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<ServiceControlResponse>(response);
};