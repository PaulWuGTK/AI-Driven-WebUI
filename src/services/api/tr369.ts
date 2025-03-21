import type { TR369Response, TR369UpdateRequest } from '../../types/tr369';
import { handleApiResponse } from '../../utils/apiUtils';

const isDevelopment = import.meta.env.DEV;

export const getTR369Config = async (): Promise<TR369Response> => {
  if (isDevelopment) {
    return {
      TR369: {
        AgentEndpointID: "gemtek::prplos-SN4CBA7DC75961",
        Controller: [
          {
            Alias: "friendly-tech",
            Status: "Connected",
            ControllerEndpointID: "self:ft:1",
            ControllerTopic: "/controller",
            AgentTopic: "/agent",
            BrokerAddress: "acs-dev.genixnetworks.cloud",
            BrokerPort: "18881",
            Username: "gemtek",
            Password: "gemtek1",
            ClientID: "",
            PeriodicNotify: 300,
            KeepAliveTime: 60,
            ProtocolVersion: "3.1.1",
            TransportProtocol: "TCP/IP"
          },
          {
            Alias: "dcms",
            Status: "Connected",
            ControllerEndpointID: "GenixController",
            ControllerTopic: "Genix/v1/controller",
            AgentTopic: "Genix/v1/agent/gemtek::prplos-SN4CBA7DC75961",
            BrokerAddress: "10.5.88.149",
            BrokerPort: "1883",
            Username: "mqttuser",
            Password: "",
            ClientID: "gemtek::prplos-SN4CBA7DC75961",
            PeriodicNotify: 30,
            KeepAliveTime: 5,
            ProtocolVersion: "5.0",
            TransportProtocol: "TCP/IP"
          }
        ]
      }
    };
  }

  const response = await fetch('/API/info?list=TR369');
  return handleApiResponse<TR369Response>(response);
};

export const updateTR369Config = async (data: TR369UpdateRequest): Promise<TR369Response> => {
  if (isDevelopment) {
    console.log('Update TR-369 config:', data);
    return getTR369Config();
  }

  const response = await fetch('/API/info?list=TR369', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<TR369Response>(response);
};