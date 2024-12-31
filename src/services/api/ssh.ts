import type { 
  SshServerResponse, 
  SshAuthorizedKeyResponse, 
  SshSessionResponse,
  SshServer,
  SshAuthorizedKey 
} from '../../types/ssh';
import { handleApiResponse } from '../../utils/apiUtils';
import { sshServerData, sshAuthorizedKeyData, sshSessionData } from '../mockData/sshData';

const isDevelopment = import.meta.env.DEV;

export async function getSshServers(): Promise<SshServerResponse> {
  if (isDevelopment) {
    return sshServerData;
  }
  const response = await fetch('/API/info?list=SshServer');
  return handleApiResponse<SshServerResponse>(response);
}

export async function updateSshServers(servers: SshServer[]): Promise<SshServerResponse> {
  if (isDevelopment) {
    sshServerData.SshServer.SshServers = servers;
    return sshServerData;
  }
  const response = await fetch('/API/info?list=SshServer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ SshServer: servers }),
  });
  return handleApiResponse<SshServerResponse>(response);
}

export async function getSshAuthorizedKeys(): Promise<SshAuthorizedKeyResponse> {
  if (isDevelopment) {
    return sshAuthorizedKeyData;
  }
  const response = await fetch('/API/info?list=SshAuthorizedKey');
  return handleApiResponse<SshAuthorizedKeyResponse>(response);
}

export async function updateSshAuthorizedKeys(keys: SshAuthorizedKey[]): Promise<SshAuthorizedKeyResponse> {
  if (isDevelopment) {
    sshAuthorizedKeyData.SshAuthorizedKey = keys;
    return sshAuthorizedKeyData;
  }
  const response = await fetch('/API/info?list=SshAuthorizedKey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ SshAuthorizedKey: keys }),
  });
  return handleApiResponse<SshAuthorizedKeyResponse>(response);
}

export async function getSshSessions(): Promise<SshSessionResponse> {
  if (isDevelopment) {
    return sshSessionData;
  }
  const response = await fetch('/API/info?list=SshSession');
  return handleApiResponse<SshSessionResponse>(response);
}