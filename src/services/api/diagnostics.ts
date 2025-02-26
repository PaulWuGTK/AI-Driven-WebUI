import type { 
  DiagnosticsResponse,
  PingRequest,
  TraceRouteRequest,
  DNSLookupRequest
} from '../../types/diagnostics';
import { diagnosticsMockData } from '../mockData/diagnosticsMockData';
import { AuthService } from '../auth';

const isDevelopment = import.meta.env.DEV;

export const getDiagnostics = async (): Promise<DiagnosticsResponse> => {
  if (isDevelopment) {
    return diagnosticsMockData;
  }

  const response = await fetch('/API/info?list=ManagementDiagnostic');
  if (!response.ok) {
    throw new Error('Failed to fetch diagnostics data');
  }
  return response.json();
};

export const startPing = async (params: PingRequest): Promise<{ SetNSubscribe: string }> => {
  if (isDevelopment) {
    return { SetNSubscribe: 'OK' };
  }
  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }
  const response = await fetch('/API/info?list=SetNSubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to start ping');
  }
  return response.json();
};

export const startTraceRoute = async (params: TraceRouteRequest): Promise<{ SetNSubscribe: string }> => {
  if (isDevelopment) {
    return { SetNSubscribe: 'OK' };
  }
  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }
  const response = await fetch('/API/info?list=SetNSubscribe', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${sessionId}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to start trace route');
  }
  return response.json();
};

export const startDNSLookup = async (params: DNSLookupRequest): Promise<{ SetNSubscribe: string }> => {
  if (isDevelopment) {
    return { SetNSubscribe: 'OK' };
  }
  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }
  const response = await fetch('/API/info?list=SetNSubscribe', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${sessionId}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to start DNS lookup');
  }
  return response.json();
};