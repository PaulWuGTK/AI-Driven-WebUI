export const getEthernetMockData = () => ({
  EthernetStatus: [
    {
      Port: "Port0",
      Role: "wan",
      Status: Math.random() > 0.5 ? "Up" : "Down",
      Speed: "1000",
      Duplex: "Full",
      MACAddress: "00:03:7F:BA:DB:AE"
    },
    {
      Port: "Port1",
      Role: "lan",
      Status: "Up",
      Speed: "1000",
      Duplex: "Full",
      MACAddress: "22:5A:05:14:A6:2D"
    },
    {
      Port: "Port2",
      Role: "lan",
      Status: "Up",
      Speed: "1000",
      Duplex: "Full",
      MACAddress: "22:5A:05:14:A6:2D"
    }
  ]
});