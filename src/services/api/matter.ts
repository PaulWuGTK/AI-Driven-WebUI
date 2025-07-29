import axios from 'axios';

const API_ENDPOINT = '/API/info?list=matterProxy';
const isDevelopment = import.meta.env.DEV;

// Mock data for development
const mockStatusData = {
  MatterProxy: {
    result: "successful",
    status: {
      "Light1": "1",
      "Switch1": "2",
      "Sensor1": "3"
    }
  }
};

const mockOnOffResponse = {
  MatterProxy: {
    status: 'success',
    message: 'Command executed successfully',
    data: {
      state: true
    }
  }
};

// Mock data for MultiAdmin
const mockMultiAdminResponse = {
  MatterProxy: {
    result: "successful",
    message: "Commissioning window opened successfully"
  }
};

// Mock data for Subscribe
const mockSubscribeResponse = {
  MatterProxy: {
    result: "successful",
    message: "Subscribe operation successful"
  }
};

// Mock data for Binding
const mockBindingResponse = {
  MatterProxy: {
    result: "successful",
    message: "Binding operation successful"
  }
};

// Mock data for Media Control
const mockMediaResponse = {
  MatterProxy: {
    result: "successful",
    message: "Media control operation successful"
  }
};

// Mock data for EEVSE Control
const mockEevseResponse = {
  MatterProxy: {
    result: "successful",
    message: "EEVSE control operation successful"
  }
};

// Mock data for reports
const mockReportResponse = {
  MatterProxy: {
    result: "successful",
    report: "Sample report data",
    message: "Report retrieved successfully"
  }
};

// Mock data for delete node
const mockDeleteNodeResponse = {
  MatterProxy: {
    result: "successful",
    status: {
      "Light1": "1",
      "Switch1": "2"
    },
    message: "Node deleted successfully"
  }
};

// OnOff API
export interface OnOffRequest {
  nodeId: string;
  endPointId: number;
  type: 'on' | 'off' | 'toggle' | 'read';
}

export interface OnOffResponse {
  MatterProxy: {
    status: string;
    message?: string;
    data?: {
      state: boolean;
    }
    result?:string;
  };
}

// Get Status API
export interface GetStatusResponse {
  MatterProxy: {
    result: string;
    status: Record<string, string>;
  };
}

// MultiAdmin API
export interface MultiAdminRequest {
  nodeId: string;
  option: string;
  windowTimeout: number;
  iteration: string;
  discriminator: string;
}

export interface MultiAdminResponse {
  MatterProxy: {
    result: string;
    message?: string;
  };
}

// Subscribe API
export interface SubscribeRequest {
  subscribe_cluster: string;
  minInterval: string;
  maxInterval: string;
  nodeAlias: string;
  nodeId: string;
  endPointId: number;
}

export interface SubscribeResponse {
  MatterProxy: {
    result: string;
    message?: string;
  };
}

// Delete Node API
export interface DeleteNodeRequest {
  nodeAlias: string;
  nodeId: string;
}

export interface DeleteNodeResponse {
  MatterProxy: {
    result: string;
    status: Record<string, string>;
    message?: string;
  };
}

// Binding API
export interface ACLConfig {
  fabricIndex: string;
  privilege: string;
  authMode: string;
  subjects: string;
  targets: string;
}

export interface BindingConfig {
  fabricIndex: string;
  node: string;
  endPointId: number;
  cluster: string;
}

export interface WriteACLRequest {
  aclConf1: ACLConfig;
  aclConf2: ACLConfig;
  lightNodeId: string;
  aclEndpointId: number;
}

export interface WriteBindingRequest {
  bindingConf: BindingConfig;
  switchNodeId: string;
  switchEndpointId: number;
}

export interface BindingResponse {
  MatterProxy: {
    result: string;
    message?: string;
  };
}

// Media Control API
export interface LaunchConfig {
  catalogVendorID: string;
  applicationID: string;
}

export interface LauncherRequest {
  nodeId: string;
  endPointId: number;
  type: 'launch' | 'stop';
  launchConf: LaunchConfig;
}

export interface MediaControlRequest {
  nodeId: string;
  endPointId: number;
  type: 'play' | 'pause' | 'stop' | 'startover' | 'previous' | 'next' | 'rewind' | 'fastforward';
}

export interface MediaReadRequest {
  nodeAlias: string;
  nodeId: string;
  endPointId: number;
  type: 'currentstate' | 'starttime' | 'duration' | 'playbackspeed';
}

export interface MediaResponse {
  MatterProxy: {
    result: string;
    message?: string;
    report?: string;
    status?: string;
  };
}

// EEVSE Control API
export interface EevseEventRequest {
  nodeAlias: string;
  nodeId: string;
  key: string;
  type: 'triggerBasic' | 'triggerBasicClear' | 'triggerPluggedin' | 'triggerPluggedinClear' | 'triggerChargeDemand' | 'triggerChargeDemandClear';
}

export interface EevseControlRequest {
  nodeAlias: string;
  nodeId: string;
  endPointId: number;
  type: 'enablecharging' | 'write' | 'disable';
  chargingEnabledUntil?: string;
  minimumChargeCurrent?: string;
  maximumChargeCurrent?: string;
  userMaximumChargeCurrent?: string;
}

export interface EevseReadRequest {
  nodeAlias: string;
  nodeId: string;
  endPointId: number;
  type: 'state' | 'supplystate' | 'faultstate' | 'chargingenableduntil' | 'minimumchargecurrent' | 'maximumchargecurrent' | 'sessionid' | 'sessionduration';
}

export interface EevseResponse {
  MatterProxy: {
    result: string;
    message?: string;
    report?: string;
  };
}
export const getMatterStatus = async (): Promise<GetStatusResponse> => {
  if (isDevelopment) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockStatusData;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {
      MatterProxy: {
        method: "GET",
        action: "get_status"
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting Matter status:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as GetStatusResponse;
    }
    return {
      MatterProxy: {
        result: 'error',
        status: {}
      }
    };
  }
};

export const sendOnOffCommand = async (params: OnOffRequest): Promise<OnOffResponse> => {
  if (isDevelopment) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return different responses based on command type
    if (params.type === 'read') {
      return {
        MatterProxy: {
          status: 'success',
          message: 'Read command successful',
          data: {
            state: Math.random() > 0.5 // Random state for demo
          }
        }
      };
    } else {
      return {
        MatterProxy: {
          status: 'success',
          message: `${params.type.toUpperCase()} command sent successfully`
        }
      };
    }
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "onoff",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending OnOff command:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as OnOffResponse;
    }
    return {
      MatterProxy: {
        status: 'error',
        message: 'Failed to send command'
      }
    };
  }
};

// MultiAdmin API
export const sendMultiAdminCommand = async (params: MultiAdminRequest): Promise<MultiAdminResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockMultiAdminResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "multiadmin",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending MultiAdmin command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send MultiAdmin command'
      }
    };
  }
};

// Subscribe API (WebSocket based)
export const sendSubscribeCommand = async (params: SubscribeRequest): Promise<SubscribeResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSubscribeResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "subscribe",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending Subscribe command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send Subscribe command'
      }
    };
  }
};

// Delete Node API
export const deleteStorageNode = async (params: DeleteNodeRequest): Promise<DeleteNodeResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockDeleteNodeResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "delete_storageNode",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error deleting storage node:', error);
    return {
      MatterProxy: {
        result: 'error',
        status: {},
        message: 'Failed to delete storage node'
      }
    };
  }
};

// Binding APIs
export const writeACL = async (params: WriteACLRequest): Promise<BindingResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockBindingResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "write_acl",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error writing ACL:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to write ACL'
      }
    };
  }
};

export const writeBinding = async (params: WriteBindingRequest): Promise<BindingResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockBindingResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "write_binding",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error writing binding:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to write binding'
      }
    };
  }
};

// Media Control APIs
export const sendLauncherCommand = async (params: LauncherRequest): Promise<MediaResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockMediaResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "launcher",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending launcher command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send launcher command'
      }
    };
  }
};

export const sendMediaControlCommand = async (params: MediaControlRequest): Promise<MediaResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockMediaResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "media_control",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending media control command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send media control command'
      }
    };
  }
};

export const sendMediaReadCommand = async (params: MediaReadRequest): Promise<MediaResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockReportResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "media_read",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending media read command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send media read command'
      }
    };
  }
};

// EEVSE Control APIs
export const sendEevseEventCommand = async (params: EevseEventRequest): Promise<EevseResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockEevseResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "event_trigger",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending EEVSE event command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send EEVSE event command'
      }
    };
  }
};

export const sendEevseControlCommand = async (params: EevseControlRequest): Promise<EevseResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockEevseResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "eevse_control",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending EEVSE control command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send EEVSE control command'
      }
    };
  }
};

export const sendEevseReadCommand = async (params: EevseReadRequest): Promise<EevseResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockReportResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "eevse_read",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending EEVSE read command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send EEVSE read command'
      }
    };
  }
};

// QR Scanner API
export interface QRScannerRequest {
  MatterQRScanner: {
    ScanResult: string;
  };
}

export interface QRScannerResponse {
  MatterQRScanner: {
    result: string;
    message?: string;
  };
}

export const sendQRScanResult = async (scanResult: string): Promise<QRScannerResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Mock QR scan result sent:', scanResult);
    return {
      MatterQRScanner: {
        result: 'successful',
        message: 'QR scan result processed successfully'
      }
    };
  }

  try {
    const response = await fetch('/API/Info?list=MatterQRScanner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        MatterQRScanner: {
          ScanResult: scanResult
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending QR scan result:', error);
    return {
      MatterQRScanner: {
        result: 'error',
        message: error instanceof Error ? error.message : 'Failed to send QR scan result'
      }
    };
  }
};
// OnOff Report API
export const sendOnOffReportCommand = async (params: {
  attr: string;
  nodeAlias: string;
  nodeId: string;
  endPointId: number;
  type: string;
}): Promise<MediaResponse> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockReportResponse;
  }

  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "onoff_report",
      data: params
    }});
    return response.data;
  } catch (error) {
    console.error('Error sending OnOff report command:', error);
    return {
      MatterProxy: {
        result: 'error',
        message: 'Failed to send OnOff report command'
      }
    };
  }
};