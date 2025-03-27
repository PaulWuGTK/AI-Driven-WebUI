export interface TR369Controller {
  Enable: number;
  Alias: string;
  Status?: string;
  ControllerEndpointID: string;
  ControllerTopic: string;
  AgentTopic: string;
  BrokerAddress: string;
  BrokerPort: number;
  Username: string;
  Password: string;
  ClientID: string;
  PeriodicNotify: number;
  KeepAliveTime: number;
  ProtocolVersion: string;
  TransportProtocol: string;
}

export interface TR369Config {
  AgentEndpointID: string;
  Controller: TR369Controller[];
}

export interface TR369Response {
  TR369: TR369Config;
}

export interface TR369UpdateRequest {
  TR369: TR369Config;
}