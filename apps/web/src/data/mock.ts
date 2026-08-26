import type { NewsItem } from '@ai-news/shared';

// 后端未启动时的降级数据，与设计稿保持一致
export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'OpenAI发布GPT-5模型，性能提升显著',
    summary:
      '据知情人士透露，OpenAI正在加紧推进GPT-5的研发工作，新模型在推理能力和多模态理解方面取得重大突破。',
    url: 'https://36kr.com/p/gpt-5',
    source: '36氪',
    sourceDomain: '36kr.com',
    authorityScore: 4,
    category: '行业新闻',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    publishedMinutesAgo: 120,
  },
  {
    id: 'n2',
    title: 'Meta开源Llama 4系列',
    summary:
      'Meta今日宣布正式开源Llama 4系列大语言模型，包含多个参数规模的版本，支持中英双语及代码生成。',
    url: 'https://theverge.com/llama4',
    source: 'The Verge',
    sourceDomain: 'theverge.com',
    authorityScore: 4,
    category: '模型更新',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    publishedMinutesAgo: 300,
  },
  {
    id: 'n3',
    title: 'Cursor推出企业版，强化代码协作',
    summary:
      'AI编程工具Cursor发布企业版，新增团队代码同步、私有模型接入和企业级权限管理，主打安全合规。',
    url: 'cursor.com/enterprise',
    source: 'Product Hunt',
    sourceDomain: 'producthunt.com',
    authorityScore: 3,
    category: '产品上新',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    publishedMinutesAgo: 480,
  },
  {
    id: 'n4',
    title: 'DeepMind发布AlphaProof 2',
    summary:
      'DeepMind团队发布新一代数学证明系统AlphaProof 2，在IMO奥数题集上首次超越人类金牌选手平均水平。',
    url: 'arxiv.org/abs/alphaproof2',
    source: 'ArXiv',
    sourceDomain: 'arxiv.org',
    authorityScore: 5,
    category: '学术论文',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    publishedMinutesAgo: 720,
  },
  {
    id: 'n5',
    title: 'Anthropic完成新一轮20亿美元融资',
    summary:
      '据彭博社报道，AI安全公司Anthropic已完成新一轮20亿美元融资，估值突破600亿美元，参与方包括多家顶级风投。',
    url: 'bloomberg.com/anthropic-funding',
    source: 'Bloomberg',
    sourceDomain: 'bloomberg.com',
    authorityScore: 5,
    category: '投融资',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    publishedMinutesAgo: 1440,
  },
  {
    id: 'n6',
    title: 'xAI发布Grok 4，主打实时联网',
    summary:
      '马斯克的xAI发布Grok 4，强调实时联网信息整合与X平台数据接入，主打信息时效性。',
    url: 'x.ai/grok4',
    source: 'TechCrunch',
    sourceDomain: 'techcrunch.com',
    authorityScore: 4,
    category: '模型更新',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    publishedMinutesAgo: 1800,
  },
  {
    id: 'n7',
    title: '欧盟AI法案正式生效',
    summary:
      '全球首部全面AI监管法规今日正式生效，对高风险AI系统实施严格合规要求，影响范围覆盖全球科技企业。',
    url: 'eur-lex.europa.eu/ai-act',
    source: 'Reuters',
    sourceDomain: 'reuters.com',
    authorityScore: 5,
    category: '行业新闻',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    publishedMinutesAgo: 2880,
  },
];
