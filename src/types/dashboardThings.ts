export interface DashboardDevice {
  Name: string;
  NodeId: number;
  Type: string;
  Onoff: number;
}

export interface DashboardThingsResponse {
  DashboardThings: {
    Devices: DashboardDevice[];
  };
}

export interface DashboardThingsUpdateRequest {
  DashboardThings: {
    Name: string;
    NodeId: number;
    Type: string;
    Onoff: number;
  };
}