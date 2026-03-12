import type { 
  SshServerResponse, 
  SshAuthorizedKeyResponse, 
  SshSessionResponse,
  SshServer,
  SshAuthorizedKey 
} from '../../types/ssh';
import { callApi } from '../apiClient';
import { sshServerData, sshAuthorizedKeyData, sshSessionData } from '../mockData/sshData';

const isDevelopment = import.meta.env.DEV;

export async function getSshServers(): Promise<SshServerResponse> {
  if (isDevelopment) {
    return sshServerData;
  }
  return callApi<SshServerResponse>('/API/info?list=SshServer');
}

export async function updateSshServers(servers: SshServer[]): Promise<SshServerResponse> {
  if (isDevelopment) {
    sshServerData.SshServer.SshServers = servers;
    return sshServerData;
  }
  return callApi<SshServerResponse>('/API/info?list=SshServer', {
    method: 'POST',
    body: JSON.stringify({ SshServer: servers }),
  });
}

export async function getSshAuthorizedKeys(): Promise<SshAuthorizedKeyResponse> {
  if (isDevelopment) {
    return sshAuthorizedKeyData;
  }
  return callApi<SshAuthorizedKeyResponse>('/API/info?list=SshAuthorizedKey');
}

export async function updateSshAuthorizedKeys(keys: SshAuthorizedKey[]): Promise<SshAuthorizedKeyResponse> {
  if (isDevelopment) {
    sshAuthorizedKeyData.SshAuthorizedKey = keys;
    return sshAuthorizedKeyData;
  }
  return callApi<SshAuthorizedKeyResponse>('/API/info?list=SshAuthorizedKey', {
    method: 'POST',
    body: JSON.stringify({ SshAuthorizedKey: keys }),
  });
}

export async function getSshSessions(): Promise<SshSessionResponse> {
  if (isDevelopment) {
    return sshSessionData;
  }
  return callApi<SshSessionResponse>('/API/info?list=SshSession');
}
