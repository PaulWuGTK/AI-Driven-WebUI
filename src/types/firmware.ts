export interface FirmwareBank {
  Name: string;
  Available: number;
  BootFailureLog: string;
  Version: string;
  Alias: string;
  Status: string;
  Switch_Status?: string;
  FW_UG_Status?: string;
  Min_Allowed_Ver?: string;
  PRPL_Ver?: string;
  BSP_Ver?: string;
  GTK_FW_Ver?: string;
  Rollback?: number;
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