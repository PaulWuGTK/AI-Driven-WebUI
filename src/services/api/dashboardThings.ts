import type { DashboardThingsResponse, DashboardThingsUpdateRequest } from '../../types/dashboardThings';
import { handleApiResponse } from '../../utils/apiUtils';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;

// Mock data for development
const mockDashboardThingsData: DashboardThingsResponse = {
  DashboardThings: {
    Devices: [
      {
        Name: "Device_switch_2490",
        NodeId: 1,
        Type: "On/Off Light Switch",
        Onoff: 1
      },
      {
        Name: "Device_switch_2491",
        NodeId: 10,
        Type: "On/Off Light Switch",
        Onoff: 0
      },
      {
        Name: "Device_light_1234",
        NodeId: 5,
        Type: "Dimmable Light",
        Onoff: 1
      },
      {
        Name: "Device_outlet_5678",
        NodeId: 8,
        Type: "Smart Outlet",
        Onoff: 0
      },
      {
        Name: "Device_plug_1444",
        NodeId: 9,
        Type: "Smart Plug",
        Onoff: 0
      }
    ]
  }
};

export const getDashboardThings = async (): Promise<DashboardThingsResponse> => {
  if (isDevelopment) {
    // Simulate some random state changes for demo
    mockDashboardThingsData.DashboardThings.Devices.forEach(device => {
      if (Math.random() < 0.1) { // 10% chance to change state
        device.Onoff = device.Onoff === 1 ? 0 : 1;
      }
    });
    return mockDashboardThingsData;
  }

  return callApi<DashboardThingsResponse>('/API/info?list=DashboardThings');
};

export const updateDashboardThing = async (data: DashboardThingsUpdateRequest): Promise<DashboardThingsResponse> => {
  if (isDevelopment) {
    console.log('Update Dashboard Thing:', data);
    
    // Update mock data
    const device = mockDashboardThingsData.DashboardThings.Devices.find(
      d => d.NodeId === data.DashboardThings.NodeId
    );
    if (device) {
      device.Onoff = data.DashboardThings.Onoff;
    }
    
    return mockDashboardThingsData;
  }

  const response = await fetch('/API/info?list=DashboardThings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<DashboardThingsResponse>(response);
};