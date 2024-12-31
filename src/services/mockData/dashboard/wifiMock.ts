export const getWifiMockData = () => {
  const generateStats = () => ({
    BytesReceived: Math.floor(Math.random() * 1000000),
    BytesSent: Math.floor(Math.random() * 1000000),
    PacketsReceived: Math.floor(Math.random() * 1000),
    PacketsSent: Math.floor(Math.random() * 1000)
  });

  return [
    {
      parameters: generateStats(),
      path: "WiFi.SSID.1.Stats."
    },
    {
      parameters: generateStats(),
      path: "WiFi.SSID.2.Stats."
    }
  ];
};