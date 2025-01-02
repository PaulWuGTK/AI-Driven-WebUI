import type { MeshMapResponse } from '../../types/mesh';
import { handleApiResponse } from '../../utils/apiUtils';

const isDevelopment = import.meta.env.DEV;

const mockMeshData: MeshMapResponse = {
  MeshMap: [
    {
      Name: "Device-5d01",
      Mode: "Controller",
      ipv4: "192.168.1.1",
      MACAddress: "76:e2:f9:a5:5d:01",
      MediaType: "-",
      Upstream: "-",
      SupportedBand: "2.4G/5G/6G"
    },
    {
      Name: "Device-5d02",
      Mode: "Agent",
      ipv4: "192.168.1.2",
      MACAddress: "76:e2:f9:a5:5d:02",
      MediaType: "Wi-Fi",
      Upstream: "76:e2:f9:a5:5d:01",
      SupportedBand: "2.4G/5G"
    },
    {
      Name: "Device-5d03",
      Mode: "Agent",
      ipv4: "192.168.1.3",
      MACAddress: "76:e2:f9:a5:5d:03",
      MediaType: "Ethernet",
      Upstream: "76:e2:f9:a5:5d:01",
      SupportedBand: "5G/6G"
    },
    {
      Name: "Device-5da1",
      Mode: "Client",
      ipv4: "192.168.1.101",
      MACAddress: "76:e2:f9:a5:5d:a1",
      MediaType: "Wi-Fi",
      Upstream: "76:e2:f9:a5:5d:02"
    },
    {
      Name: "Device-5da2",
      Mode: "Client",
      ipv4: "192.168.1.102",
      MACAddress: "76:e2:f9:a5:5d:a2",
      MediaType: "Ethernet",
      Upstream: "76:e2:f9:a5:5d:02"
    }
  ]
};

export async function getMeshMap(): Promise<MeshMapResponse> {
  if (isDevelopment) {
    return mockMeshData;
  }
  const response = await fetch('/API/info?list=MeshMap');
  return handleApiResponse<MeshMapResponse>(response);
}