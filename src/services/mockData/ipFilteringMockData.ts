import type { IpFilteringRequest, IpFilteringResponse } from '../../types/ipFiltering';

const mockIpFilteringData: IpFilteringResponse = {
  IPFiltering: {
    Enable: false,
    ProtoList: ['TCP', 'UDP', 'Both'],
    BlackList: [
      {
        No: 1,
        IPStart: '192.168.1.100',
        IPEnd: '192.168.1.120',
        Protocol: 'Both',
        Comment: 'Blocked local range'
      }
    ],
    WhiteList: []
  }
};

const clone = (data: IpFilteringResponse): IpFilteringResponse =>
  JSON.parse(JSON.stringify(data));

export const getIpFilteringMockData = (): IpFilteringResponse => clone(mockIpFilteringData);

export const updateIpFilteringMockData = (config: IpFilteringRequest): IpFilteringResponse => {
  mockIpFilteringData.IPFiltering = {
    Enable: config.IPFiltering.Enable,
    ProtoList: [...mockIpFilteringData.IPFiltering.ProtoList],
    BlackList: config.IPFiltering.BlackList.map((entry) => ({ ...entry })),
    WhiteList: config.IPFiltering.WhiteList.map((entry) => ({ ...entry }))
  };

  return clone(mockIpFilteringData);
};
