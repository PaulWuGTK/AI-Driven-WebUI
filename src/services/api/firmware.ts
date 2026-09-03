import type { FirmwareResponse, FirmwareUpgradeRequest } from '../../types/firmware';
import { AuthService } from '../auth';

const isDevelopment = import.meta.env.DEV;

export const FAILURE_STATUSES = ['DownloadFailed', 'ValidationFailed', 'InstallationFailed', 'ActivationFailed'];

function sanitizeFirmwareFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function buildRemoteFirmwareFileName(file: File): string {
  const safeName = sanitizeFirmwareFileName(file.name);
  return `${Date.now()}_${safeName}`;
}

export async function getFirmwareStatus(): Promise<FirmwareResponse> {
  if (isDevelopment) {
    return {
      UpgradeFw: {
        UpgradeFw: {
          "1": {
            Min_Allowed_Ver: "3.0.0.0",
            BootFailureLog: "",
            Switch_Status: "Available",
            FW_UG_Status: "Available",
            PRPL_Ver: "prplOS4.0",
            BSP_Ver: "ath13.0",
            Rollback: 0,
            Name: "",
            Available: 1,
            Version: "1.0.0",
            GTK_FW_Ver: "3.8.5",
            Alias: "active",
            Status: "Active"
          },
          "2": {
            Min_Allowed_Ver: "3.0.0.0",
            BootFailureLog: "",
            Switch_Status: "Downgrade_not_allowed",
            FW_UG_Status: "Available",
            PRPL_Ver: "prplOS4.0",
            BSP_Ver: "ath13.0",
            Rollback: 0,
            Name: "",
            Available: 0,
            Version: "",
            GTK_FW_Ver: "2.8.5",
            Alias: "inactive",
            Status: "Available"
          }
        }
      }
    };
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }

  const response = await fetch('/API/info?list=UpgradeFw', {
    headers: {
      'Authorization': `bearer ${sessionId}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch firmware status');
  }
  return response.json();
}

export async function uploadFirmware(file: File): Promise<string> {
  const remoteFileName = buildRemoteFirmwareFileName(file);

  if (isDevelopment) {
    console.log('Mock firmware upload:', remoteFileName);
    return remoteFileName;
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }

  const url = `/upload/${encodeURIComponent(remoteFileName)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${sessionId}`,
      'Accept': 'application/json,text/javascript',
    },
    body: file
  });

  if (response.status !== 202) {
    throw new Error(`Firmware upload failed (Status: ${response.status})`);
  }

  return remoteFileName;
}

export async function activateFirmware(bankNumber: number): Promise<void> {
  if (isDevelopment) {
    console.log('Mock firmware activation for bank:', bankNumber);
    return;
  }
  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }

  const response = await fetch('/API/info?list=UpgradeFw', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${sessionId}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      UpgradeFw: {
        BankNumber: bankNumber
      }
    })
  });

  if (!response.ok) {
    throw new Error('Firmware activation failed');
  }
}

export async function upgradeFirmware(firmwareFile: string, autoActivate: boolean): Promise<void> {
  if (isDevelopment) {
    console.log('Mock firmware upgrade:', { firmwareFile, autoActivate });
    return;
  }

  // Device.DeviceInfo.FirmwareImage.[Alias=='active'].Download() rejects the
  // call (amxd_status_invalid_function_argument) unless AutoActivate=true.
  if (!autoActivate) {
    throw new Error('AutoActivate must be true when upgrading the active firmware image');
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }

  const payload: FirmwareUpgradeRequest = {
    command: "Device.DeviceInfo.FirmwareImage.[Alias=='active'].Download()",
    commandKey: `webui_fw_${Date.now()}`,
    sendresp: true,
    inputArgs: {
      URL: `file:///tmp/upload/${firmwareFile}`,
      AutoActivate: autoActivate
    }
  };

  const response = await fetch('/commands', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${sessionId}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  // With a non-empty commandKey, amx-fcgi dispatches the call asynchronously
  // (amxb_async_call) instead of blocking on a 5s amxb_call(). 201 means the
  // device accepted and queued the operation; it says nothing about whether
  // the upgrade itself will succeed, so the body is not parsed for a result.
  if (response.status !== 201) {
    const rawBody = await response.text();
    throw new Error(`Firmware upgrade request was not accepted (status ${response.status}): ${rawBody}`);
  }
  // 201 means the device accepted and queued the operation. The actual
  // upgrade progress is tracked by the Vue component via fixed countdowns
  // + error-detection polling on getFirmwareStatus().
}
