import type { OperationModeResponse, OperationModeUpdateRequest } from '../../types/operationMode';

export const operationModeMockData: OperationModeResponse = {
  "OperationMode": {
    "ListModes": [
      "Gateway",
      "Extender",
      "Bridge"
    ],
    "Mode": "Gateway"
  }
};

export const getOperationModeMockData = (): OperationModeResponse => operationModeMockData;

export const updateOperationModeMockData = (
  data: OperationModeUpdateRequest
): OperationModeResponse => {
  return {
    OperationMode: {
      ...operationModeMockData.OperationMode,
      Mode: data.OperationMode.Mode
    }
  };
};
