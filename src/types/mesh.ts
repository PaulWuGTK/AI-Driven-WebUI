export interface MeshNode {
  Name: string;
  Mode: 'Controller' | 'Agent' | 'Client';
  ipv4: string;
  MACAddress: string;
  MediaType: string;
  Upstream: string;
  SupportedBand?: string;
}

export interface MeshMapResponse {
  MeshMap: MeshNode[];
}

export interface SteeringControlData {
  selectedNode: MeshNode;
  destination: string;
  band: string;
}