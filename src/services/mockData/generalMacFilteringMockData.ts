import type {
  GeneralMacFilteringResponse,
  GeneralMacFilteringUpdateRequest
} from '../../types/generalMacFiltering';

const mockGeneralMacFilteringData: GeneralMacFilteringResponse = {
  MACFiltering: {
    Enable: true,
    WhiteList: [
      {
        No: 1,
        Comment: '012349',
        MACAddress: '00:11:22:33:44:99'
      },
      {
        No: 2,
        Comment: '88',
        MACAddress: '00:11:22:33:44:88'
      }
    ],
    BlackList: [
      {
        No: 1,
        Comment: '012345',
        MACAddress: '00:11:22:33:44:55'
      }
    ]
  }
};

export const getGeneralMacFilteringMockData = (): GeneralMacFilteringResponse =>
  mockGeneralMacFilteringData;

export const updateGeneralMacFilteringMockData = (
  data: GeneralMacFilteringUpdateRequest
): GeneralMacFilteringResponse => {
  mockGeneralMacFilteringData.MACFiltering = {
    Enable: data.MACFiltering.Enable,
    WhiteList: [...data.MACFiltering.WhiteList],
    BlackList: [...data.MACFiltering.BlackList]
  };

  return mockGeneralMacFilteringData;
};
