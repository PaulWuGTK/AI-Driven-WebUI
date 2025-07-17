import axios from 'axios';

const MATTER_API_BASE_URL = 'http://192.168.101.1:8889';

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
    const response = await axios.post(`${MATTER_API_BASE_URL}/onoff`, params);
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