import type { MeshMapResponse } from '../../types/mesh';
import { getMeshMockData } from './dashboard/meshMock';

export const getMeshMapMockData = (): MeshMapResponse => ({
  MeshMap: getMeshMockData()
});
