export const getWanMockData = () => ({
  EthernetStatus: [
    {
      Port: "Port0",
      Role: "wan",
      Status: Math.random() > 0.5 ? "Up" : "Down",
      Speed: "1000",
      Duplex: "Full",
      MACAddreess: "00:03:7F:BA:DB:AE"  // 模擬拼錯情況
    }
  ]
});