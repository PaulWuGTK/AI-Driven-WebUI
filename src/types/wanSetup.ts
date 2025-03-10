export interface WanModeSetup {
  OperationMode: string;
  WANMode: string;
  WANModeList?: string[];
}

export interface WanModeSetupResponse {
  WanModeSetup: WanModeSetup;
}

export interface WanModeSetupUpdateRequest {
  WanModeSetup: {
    OperationMode: string;
    WANMode: string;
  };
}