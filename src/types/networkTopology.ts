export interface NetworkTopologyNode {
  Name: string;
  Alias: string;
  Active: boolean;
  IPAddress: string;
  PhysAddress: string;
  Tags: string;
  Parent: string;
  Level: number;
  NodeType: 'self' | 'device' | 'interface' | 'upnp' | 'unknown';
  MediaType: 'Ethernet' | 'Wi-Fi' | 'Bridge' | '';
}

export interface NetworkTopologyResponse {
  NetworkTopology: {
    nodes: NetworkTopologyNode[];
    textView: string;
  };
}
