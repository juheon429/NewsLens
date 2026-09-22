import { normalizeDescription } from './description-normalizer';

describe('RSS description 정규화', () => {
  it('CDATA, HTML 이미지와 태그, 기자 서명을 제거한다', () => {
    const value = '<![CDATA[<img src="a.jpg">[서울=뉴시스] 홍길동 기자 = <b>핵심 내용</b>&nbsp;입니다.]]>';
    expect(normalizeDescription(value)).toBe('핵심 내용 입니다.');
  });

  it('빈 결과는 null로 반환한다', () => {
    expect(normalizeDescription('<img src="a.jpg">')).toBeNull();
  });
});
