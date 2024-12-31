export const getMemoryMockData = () => ({
  parameters: {
    Total: 256704512, // ~244.81 MB
    Free: Math.floor(Math.random() * 23015424) // Random free memory up to ~21.95 MB
  },
  path: "DeviceInfo.MemoryStatus."
});