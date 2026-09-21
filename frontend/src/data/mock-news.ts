import { CategoryFilter, NewsCluster } from '@/types/news';

export const categories: CategoryFilter[] = [
  '전체',
  '정치',
  '경제',
  '사회',
  '문화',
  '세계',
  '기술/IT',
  '연예',
];

export const newsClusters: NewsCluster[] = [
  {
    id: 'budget-review',
    representativeTitle: '여야, 내년 예산안 심사 본격 착수… 민생·복지가 최대 쟁점',
    summary:
      '국회가 내년도 예산안 심사에 들어갔습니다. 여야는 민생 지원과 복지 예산의 규모, 재정 건전성 등을 두고 의견 차이를 보이고 있어 심사 과정에서 치열한 논의가 예상됩니다.',
    category: '정치',
    imageUrl:
      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    articleCount: 42,
    publisherCount: 9,
    publishedLabel: '3분 전',
    ageInHours: 0.05,
    articles: [
      {
        id: 'budget-yonhap',
        title: '국회, 내년도 예산안 심사 돌입… 여야 공방 예고',
        description: '민생과 복지 예산을 중심으로 여야가 본격적인 심사에 들어갔습니다.',
        publisher: '연합뉴스',
        publishedLabel: '8분 전',
        url: 'https://www.yna.co.kr/',
      },
      {
        id: 'budget-sbs',
        title: '예산안 심사 시작… 민생 지원 규모가 쟁점',
        description: '내년도 예산안의 주요 쟁점과 여야의 입장을 살펴봅니다.',
        publisher: 'SBS',
        publishedLabel: '15분 전',
        url: 'https://news.sbs.co.kr/',
      },
      {
        id: 'budget-donga',
        title: '여야, 복지 예산 놓고 격돌… 심사 일정은',
        description: '복지 확대와 재정 건전성을 두고 여야의 시각차가 이어지고 있습니다.',
        publisher: '동아일보',
        publishedLabel: '26분 전',
        url: 'https://www.donga.com/',
      },
    ],
  },
  {
    id: 'capital-flood',
    representativeTitle: '수도권 집중호우… 출근길 곳곳 침수 피해 속출',
    summary:
      '수도권에 시간당 60mm가 넘는 집중호우가 쏟아지며 출근길 곳곳에서 침수 피해가 발생했습니다. 일부 지하차도와 저지대 도로가 통제됐고, 지하철 일부 구간 운행이 지연됐습니다. 기상청은 오후까지 강한 비가 이어질 것으로 내다봤습니다.',
    category: '사회',
    imageUrl:
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    articleCount: 57,
    publisherCount: 11,
    publishedLabel: '1분 전',
    ageInHours: 0.02,
    articles: [
      {
        id: 'flood-newsis',
        title: '지하차도 3곳 통제… 시청 “불필요한 외출 자제”',
        description: '집중호우로 수도권 지하차도 3곳이 통제되고 안전 안내 문자가 발송됐습니다.',
        publisher: '뉴시스',
        publishedLabel: '12분 전',
        url: 'https://www.newsis.com/',
      },
      {
        id: 'flood-sbs',
        title: '지하철 일부 구간 운행 지연… 출근길 혼잡',
        description: '호우로 인한 선로 침수로 일부 구간의 열차 운행이 지연되고 있습니다.',
        publisher: 'SBS',
        publishedLabel: '26분 전',
        url: 'https://news.sbs.co.kr/',
      },
      {
        id: 'flood-yonhap',
        title: '기상청 “오후까지 시간당 60mm 이상 강한 비”',
        description: '기상청이 수도권에 대한 호우 특보를 유지하며 추가 강수 가능성을 알렸습니다.',
        publisher: '연합뉴스',
        publishedLabel: '40분 전',
        url: 'https://www.yna.co.kr/',
      },
    ],
  },
  {
    id: 'interest-rate',
    representativeTitle: '한국은행 기준금리 동결… “물가 둔화 흐름 더 지켜볼 것”',
    summary:
      '한국은행이 기준금리를 현 수준으로 유지했습니다. 물가 상승률은 둔화하고 있지만 가계부채와 환율 변동성이 남아 있어 향후 지표를 추가로 확인하겠다는 입장입니다.',
    category: '경제',
    imageUrl:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    articleCount: 31,
    publisherCount: 8,
    publishedLabel: '8분 전',
    ageInHours: 0.13,
    articles: [
      {
        id: 'rate-maekyung',
        title: '한은 기준금리 동결… 시장은 연내 인하 시점 주목',
        description: '금융통화위원회가 기준금리를 유지하면서 향후 인하 가능성에 관심이 쏠립니다.',
        publisher: '매일경제',
        publishedLabel: '18분 전',
        url: 'https://www.mk.co.kr/',
      },
      {
        id: 'rate-hankyung',
        title: '물가와 가계부채 사이… 기준금리 다시 동결',
        description: '물가 안정과 금융 불균형을 함께 고려한 결정으로 분석됩니다.',
        publisher: '한국경제',
        publishedLabel: '29분 전',
        url: 'https://www.hankyung.com/',
      },
    ],
  },
  {
    id: 'ai-investment',
    representativeTitle: '국산 AI 반도체 스타트업, 대규모 투자 유치',
    summary:
      '국내 AI 반도체 스타트업이 차세대 추론 칩 개발과 양산을 위한 신규 투자를 유치했습니다. 회사는 전력 효율을 높인 설계를 앞세워 데이터센터 시장 진출을 확대할 계획입니다.',
    category: '기술/IT',
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    articleCount: 18,
    publisherCount: 6,
    publishedLabel: '24분 전',
    ageInHours: 0.4,
    articles: [
      {
        id: 'ai-hankyung',
        title: 'AI 반도체 스타트업 투자 유치… 데이터센터 공략',
        description: '신규 자금은 차세대 칩 연구개발과 양산 준비에 활용됩니다.',
        publisher: '한국경제',
        publishedLabel: '31분 전',
        url: 'https://www.hankyung.com/',
      },
    ],
  },
  {
    id: 'global-summit',
    representativeTitle: '주요국 정상회의 개막… 공급망·기후 대응 논의',
    summary:
      '주요국 정상들이 공급망 안정과 기후변화 공동 대응을 논의하기 위해 한자리에 모였습니다. 공동성명에는 핵심 광물 협력과 탄소 감축 이행 방안이 담길 전망입니다.',
    category: '세계',
    imageUrl:
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
    articleCount: 22,
    publisherCount: 7,
    publishedLabel: '3일 전',
    ageInHours: 72,
    articles: [
      {
        id: 'summit-yonhap',
        title: '정상회의 첫날… 공급망 협력 방안 집중 논의',
        description: '각국 정상들이 경제안보와 기후 대응을 주요 의제로 논의를 시작했습니다.',
        publisher: '연합뉴스',
        publishedLabel: '48분 전',
        url: 'https://www.yna.co.kr/',
      },
    ],
  },
  {
    id: 'k-content',
    representativeTitle: 'K-콘텐츠 신작, 글로벌 공개 첫 주 흥행',
    summary:
      '국내 제작 콘텐츠가 글로벌 공개 첫 주 주요 지역 순위 상위권에 올랐습니다. 제작진은 지역별 시청자 반응과 후속 시즌 가능성을 검토하고 있습니다.',
    category: '연예',
    imageUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    articleCount: 14,
    publisherCount: 5,
    publishedLabel: '9일 전',
    ageInHours: 216,
    articles: [
      {
        id: 'content-mbn',
        title: 'K-콘텐츠 신작 글로벌 순위 상위권 진입',
        description: '공개 첫 주부터 여러 지역에서 높은 시청 지표를 기록했습니다.',
        publisher: 'MBN',
        publishedLabel: '1시간 전',
        url: 'https://www.mbn.co.kr/',
      },
    ],
  },
];

export function getCluster(clusterId: string | undefined) {
  return newsClusters.find((cluster) => cluster.id === clusterId);
}

export function getArticle(articleId: string | undefined) {
  for (const cluster of newsClusters) {
    const article = cluster.articles.find((item) => item.id === articleId);
    if (article) {
      return { article, cluster };
    }
  }

  return undefined;
}
