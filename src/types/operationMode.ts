export interface OperationModeResponse {
  OperationMode: {
    ListModes: string[];
    Mode: string;
  };
}

export interface OperationModeUpdateRequest {
  OperationMode: {
    Mode: string;
  };
}
