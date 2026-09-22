import { parseNewsGenerationResponse } from './news-generation.response';

describe('parseNewsGenerationResponse', () => {
  it('한국어 분야명을 Prisma 분야 값으로 변환한다', () => {
    expect(
      parseNewsGenerationResponse(
        JSON.stringify({
          title: '한국 남자 핸드볼 대표팀 이란과 무승부',
          briefing: '한국 대표팀이 국제대회 조별리그에서 이란과 비겼습니다.',
          category: '스포츠',
        }),
      ),
    ).toEqual({
      title: '한국 남자 핸드볼 대표팀 이란과 무승부',
      briefing: '한국 대표팀이 국제대회 조별리그에서 이란과 비겼습니다.',
      category: 'SPORTS',
    });
  });

  it('허용되지 않은 분야를 거부한다', () => {
    expect(() =>
      parseNewsGenerationResponse(
        JSON.stringify({ title: '제목', briefing: '브리핑', category: '지역' }),
      ),
    ).toThrow('유효한 뉴스 분야');
  });

  it('분야가 없는 응답을 거부한다', () => {
    expect(() =>
      parseNewsGenerationResponse(JSON.stringify({ title: '제목', briefing: '브리핑' })),
    ).toThrow('유효한 뉴스 분야');
  });
});
