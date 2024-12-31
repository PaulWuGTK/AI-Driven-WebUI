export const getCpuMockData = () => ({
  parameters: {
    CPUUsage: Math.floor(Math.random() * 100),
    ProcessNumberOfEntries: 97
  },
  path: "DeviceInfo.ProcessStatus."
});