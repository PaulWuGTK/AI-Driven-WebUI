export interface SpeedTestPingData {
  packet_loss: number;
  min_echo_time: number;
  mean_echo_time: number;
  max_echo_time: number;
}

export interface SpeedTestData {
  download_udp: {
    throughput: number;
  };
  upload_udp: {
    throughput: number;
  };
  ping: SpeedTestPingData;
}

export interface SpeedTestResponse {
  AppXperienceControl: {
    status_code: number;
    data: SpeedTestData;
  };
}