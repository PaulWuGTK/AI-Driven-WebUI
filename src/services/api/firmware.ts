import type { FirmwareResponse, FirmwareUpgradeRequest } from '../../types/firmware';
import { AuthService } from '../auth';
import { extractNokMessage } from '../../utils/apiUtils';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

interface FirmwareUpgradeCommandResult {
  outputArgs?: {
    Status?: string;
    [key: string]: unknown;
  };
  failure?: {
    errcode?: unknown;
    errmsg?: unknown;
  };
  [key: string]: unknown;
}

function extractCommandResult(payload: unknown): FirmwareUpgradeCommandResult | null {
  if (Array.isArray(payload)) {
    const first = payload[0];
    return first && typeof first === 'object'
      ? (first as FirmwareUpgradeCommandResult)
      : null;
  }

  if (payload && typeof payload === 'object') {
    return payload as FirmwareUpgradeCommandResult;
  }

  return null;
}

function hasErrorStatus(status: string): boolean {
  const normalized = status.trim().toUpperCase();
  return (
    normalized.includes('NOK') ||
    normalized.includes('FAIL') ||
    normalized.includes('ERROR')
  );
}

function normalizeErrorValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const message = value.trim();
    return message ? message : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return null;
}

function isAsyncDownloadTimeout(failureCode: string | null, failureMessage: string | null): boolean {
  // Some targets return errcode 27 while firmware validation/upgrade keeps running asynchronously.
  return failureCode === '27' && !failureMessage;
}

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

  const rawBody = await response.text();
  let resultPayload: unknown = null;
  if (rawBody.trim()) {
    try {
      resultPayload = JSON.parse(rawBody);
    } catch {
      resultPayload = null;
    }
  }

  const commandResult = extractCommandResult(resultPayload);
  const nokMessage = extractNokMessage(resultPayload);
  const failureCode = normalizeErrorValue(commandResult?.failure?.errcode);
  const failureMessage = normalizeErrorValue(commandResult?.failure?.errmsg);
  const isTimeoutInProgress = isAsyncDownloadTimeout(failureCode, failureMessage);
  const status = commandResult?.outputArgs?.Status;
  const statusMessage = typeof status === 'string' ? status.trim() : '';
  const fallbackBodyMessage = rawBody.trim();

  if (!response.ok) {
    throw new Error(
      failureMessage ||
      failureCode ||
      nokMessage ||
      (fallbackBodyMessage
        ? `Firmware upgrade failed (${response.status}): ${fallbackBodyMessage}`
        : `Firmware upgrade failed (${response.status})`)
    );
  }

  if (failureMessage || (failureCode && !isTimeoutInProgress)) {
    throw new Error(
      failureMessage ||
      (failureCode ? `Firmware upgrade failed (errcode: ${failureCode})` : 'Firmware upgrade failed')
    );
  }

  if (nokMessage) {
    throw new Error(nokMessage);
  }

  if (statusMessage && hasErrorStatus(statusMessage)) {
    throw new Error(statusMessage);
  }

  if (resultPayload == null) {
    throw new Error('Firmware upgrade failed: empty response from device');
  }
}
