import { updateCentroid } from './centroid';

describe('Cluster centroid', () => {
  it('기존 기사 수를 가중치로 평균 벡터를 갱신한다', () => {
    expect(updateCentroid([1, 3], 2, [4, 6])).toEqual([2, 4]);
  });
});
