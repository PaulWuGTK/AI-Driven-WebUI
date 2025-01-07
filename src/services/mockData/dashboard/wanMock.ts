export const getWanMockData = () => ({
  PacketsSent: Math.floor(Math.random() * 15000),
  PacketsReceived: Math.floor(Math.random() * 13000),
  BytesSent: Math.floor(Math.random() * 3000000),
  BytesReceived: Math.floor(Math.random() * 2500000),
});