import type { TR069Config, ManagementServerLogData } from '../../types/device';
import { tr069MockData, managementServerLogMockData } from '../mockData/deviceMockData';
import { AuthService } from '../auth';

const isDevelopment = import.meta.env.DEV;

const getAuthHeaders = (): Record<string, string> => {
  const sessionId = AuthService.getInstance().getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }
  return { Authorization: `bearer ${sessionId}` };
};

const normalizeTR069Config = (raw: Partial<TR069Config>): TR069Config => ({
  URL: raw.URL ?? '',
  EnableCWMP: Number(raw.EnableCWMP ?? 0),
  ConnectionRequestUsername: raw.ConnectionRequestUsername ?? '',
  Password: raw.Password ?? '',
  ConnectionRequestPassword: raw.ConnectionRequestPassword ?? '',
  PeriodicInformEnable: Number(raw.PeriodicInformEnable ?? 0),
  PeriodicInformInterval: Number(raw.PeriodicInformInterval ?? 0),
  Username: raw.Username ?? '',
  ConnectionRequestURL: raw.ConnectionRequestURL ?? '',
  SessionStatus: raw.SessionStatus ?? 'Idle',
  PrimaryURL: raw.PrimaryURL ?? raw.URL ?? '',
  PrimaryUsername: raw.PrimaryUsername ?? raw.Username ?? '',
  PrimaryPassword: raw.PrimaryPassword ?? raw.Password ?? '',
  BackupURL: raw.BackupURL ?? raw.URL ?? '',
  BackupUsername: raw.BackupUsername ?? raw.Username ?? '',
  BackupPassword: raw.BackupPassword ?? raw.Password ?? ''
});

export const getTR069Config = async (): Promise<{ ManagementServer: TR069Config }> => {
  if (isDevelopment) {
    return { ManagementServer: normalizeTR069Config({ ...tr069MockData }) };
  }
  
  const response = await fetch('/API/info?list=ManagementServer', {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch TR-069 configuration');
  }
  const data = await response.json();
  return {
    ManagementServer: normalizeTR069Config(data?.ManagementServer ?? {})
  };
};

export const updateTR069Config = async (config: TR069Config): Promise<{ ManagementServer: string }> => {
  if (isDevelopment) {
    // Update mock data
    Object.assign(tr069MockData, config);
    return { ManagementServer: 'OK' };
  }

  const configToSend = {
    EnableCWMP: Number(config.EnableCWMP),
    PrimaryURL: config.PrimaryURL ?? '',
    PrimaryUsername: config.PrimaryUsername ?? '',
    PrimaryPassword: config.PrimaryPassword ?? '',
    PeriodicInformEnable: Number(config.PeriodicInformEnable),
    PeriodicInformInterval: Number(config.PeriodicInformInterval),
    BackupURL: config.BackupURL ?? '',
    BackupUsername: config.BackupUsername ?? '',
    BackupPassword: config.BackupPassword ?? ''
  };

  const response = await fetch('/API/info?list=ManagementServer', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ManagementServer: configToSend
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update TR-069 configuration');
  }
  return response.json();
};

export const sendInformToACS = async (): Promise<{ ManagementServer: { OK: string } }> => {
  if (isDevelopment) {
    return {
      ManagementServer: {
        OK: "sendInformMessage executed successfully"
      }
    };
  }

  const response = await fetch('/API/info?list=ManagementServer', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ManagementServer: {
        events: "6 CONNECTION REQUEST",
        immediately: true,
        source: "UserInterface"
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send inform message');
  }
  return response.json();
};

export const sendBootstrapToACS = async (): Promise<{ ManagementServer: { OK: string } }> => {
  if (isDevelopment) {
    return {
      ManagementServer: {
        OK: "sendInformMessage executed successfully"
      }
    };
  }

  const response = await fetch('/API/info?list=ManagementServer', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ManagementServer: {
        events: "0 BOOTSTRAP",
        immediately: true,
        source: "UserInterface"
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send bootstrap message');
  }
  return response.json();
};

export const getManagementServerLog = async (): Promise<{ ManagementServerLog: ManagementServerLogData }> => {
  if (isDevelopment) {
    return { ManagementServerLog: { ...managementServerLogMockData } };
  }

  const response = await fetch('/API/info?list=ManagementServerLog', {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to fetch management server log');
  }

  return response.json();
};
