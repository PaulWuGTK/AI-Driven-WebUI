import axios from 'axios';

const API_ENDPOINT = '/API/info?list=matterProxy';

// OnOff API
export interface OnOffRequest {
  nodeId: string;
  endPointId: number;
  type: 'on' | 'off' | 'toggle' | 'read';
}

export interface OnOffResponse {
  status: string;
  message?: string;
  data?: {
    state: boolean;
  };
}

export const sendOnOffCommand = async (params: OnOffRequest): Promise<OnOffResponse> => {
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
      status: 'error',
      message: 'Failed to send command'
    };
  }
};

// Add other Matter API functions here as needed