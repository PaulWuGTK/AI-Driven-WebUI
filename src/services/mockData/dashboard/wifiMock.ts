export const getWifiMockData = () => {
  const generateStats = () => ({
    BytesReceived: Math.floor(Math.random() * 1000000),
    BytesSent: Math.floor(Math.random() * 1000000),
    PacketsReceived: Math.floor(Math.random() * 1000),
    PacketsSent: Math.floor(Math.random() * 1000)
  });

  const generateAccessPoint = (clients: number) => ({
    Enable: Math.random() > 0.5 ? 1 : 0,  // 1 表示啟用，0 表示禁用
    ActiveAssociatedDeviceNumberOfEntries: clients
  });

  return [
    {
      parameters: generateStats(),
      path: "Device.WiFi.SSID.1.Stats."
    },
    {
      parameters: generateStats(),
      path: "Device.WiFi.SSID.2.Stats."
    },
    {
      parameters: generateAccessPoint(Math.floor(Math.random() * 5)),  // 模擬連線裝置數
      path: "Device.WiFi.AccessPoint.1."
    },
    {
      parameters: generateAccessPoint(Math.floor(Math.random() * 3)),  // 模擬連線裝置數
      path: "Device.WiFi.AccessPoint.2."
    }
  ];
};
