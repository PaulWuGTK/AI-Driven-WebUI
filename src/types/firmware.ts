export interface FirmwareBank {
  Name: string;
  Available: number;
  BootFailureLog: string;
  Version: string;
  Alias: string;
  Status: string;
}

export interface FirmwareResponse {
  UpgradeFw: {
    UpgradeFw: {
      [key: string]: FirmwareBank;
    };
  };
}

export interface FirmwareUpgradeRequest {
  command: string;
  commandKey: string;
  sendresp: boolean;
  inputArgs: {
    URL: string;
    AutoActivate: boolean;
  };
}