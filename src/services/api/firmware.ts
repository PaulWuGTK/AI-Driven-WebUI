import type { FirmwareResponse, FirmwareUpgradeRequest } from '../../types/firmware';
import { AuthService } from '../auth';

const isDevelopment = import.meta.env.DEV;

export async function getFirmwareStatus(): Promise<FirmwareResponse> {
  if (isDevelopment) {
    return {
      UpgradeFw: {
        UpgradeFw: {
          "1": {
            Name: "",
            Available: 1,
            BootFailureLog: "",
            Version: "1.0.0",
            Alias: "active",
            Status: "Active"
          },
          "2": {
            Name: "",
            Available: 0,
            BootFailureLog: "",
            Version: "",
            Alias: "inactive",
            Status: "NoImage"
          }
        }
      }
    };
  }

  const response = await fetch('/API/info?list=UpgradeFw');
  if (!response.ok) {
    throw new Error('Failed to fetch firmware status');
  }
  return response.json();
}

export async function uploadFirmware(file: File): Promise<string> {
  if (isDevelopment) {
    console.log('Mock firmware upload:', file.name);
    return file.name;
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }

  const url = `/upload/${file.name}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${sessionId}`,
      'Accept': 'application/json,text/javascript', // ✅ 和 Ember.js 一致
    },
    body: file // ✅ 不要設置 Content-Type，讓瀏覽器自動處理
  });

  if (response.status !== 202) {
    throw new Error(`Firmware upload failed (Status: ${response.status})`);
  }

  return file.name;
}


export async function upgradeFirmware(firmwareFile: string, autoActivate: boolean): Promise<void> {
  if (isDevelopment) {
    console.log('Mock firmware upgrade:', { firmwareFile, autoActivate });
    return;
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  if (!sessionId) {
    throw new Error('No active session');
  }

  const payload: FirmwareUpgradeRequest = {
    command: "Device.DeviceInfo.FirmwareImage.[Alias=='active'].Download()",
    commandKey: "",
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

  if (!response.ok) {
    throw new Error('Firmware upgrade failed');
  }

  const result = await response.json();
  if (result[0]?.failure?.errcode) {
    throw new Error(`Firmware upgrade failed: ${result[0].failure.errcode}`);
  }
}