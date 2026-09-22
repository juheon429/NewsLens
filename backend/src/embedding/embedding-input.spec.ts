import { buildEmbeddingInput } from './embedding-input';
import { normalizeVector } from './vector';

describe('Embedding 입력', () => {
  it('description이 있으면 제목과 내용을 함께 구성한다', () => {
    expect(buildEmbeddingInput('제목', '설명')).toBe('제목: 제목\n내용: 설명');
  });

  it('description이 없으면 제목만 사용한다', () => {
    expect(buildEmbeddingInput(' 제목 ', null)).toBe('제목');
  });

  it('벡터를 단위 벡터로 정규화한다', () => {
    expect(normalizeVector([3, 4])).toEqual([0.6, 0.8]);
  });
});
