import type { NewsCategory } from '@ai-news/shared';

// 关键词分类规则（LLM 未接入时的兜底方案）
const RULES: Array<{ cat: NewsCategory; kw: string[] }> = [
  { cat: '模型更新', kw: ['gpt', 'llama', 'claude', 'gemini', 'glm', 'qwen', 'deepseek', 'mistral', 'grok', 'model', 'llm', 'foundation model', 'release', 'open source', '开源', '发布模型', '参数', 'benchmark', '评测'] },
  { cat: '产品上新', kw: ['launch', 'feature', 'product', 'app', 'tool', 'enterprise', 'cursor', 'copilot', 'studio', 'platform', '上线', '推出', '产品', '工具', '发布功能', '上新'] },
  { cat: '学术论文', kw: ['paper', 'arxiv', 'research', 'study', 'proof', 'theorem', 'alpha', 'deepmind', '论文', '研究', '证明', 'arxiv'] },
  { cat: '投融资', kw: ['funding', 'series', 'raise', 'investment', 'valuation', 'acquire', 'merger', 'ipo', 'billion', '融资', '估值', '收购', '并购', '上市', '亿', '美元'] },
  { cat: '行业新闻', kw: ['regulation', 'act', 'law', 'policy', 'eu', '中国', '美国', '法案', '监管', '政策', '行业', 'market', 'report', 'survey', '白皮书', 'standard'] },
];

export class Classifier {
  classify(title: string, summary: string, sourceDomain?: string): NewsCategory {
    const text = `${title} ${summary}`.toLowerCase();
    let best: NewsCategory = '行业新闻';
    let bestScore = 0;
    for (const r of RULES) {
      let score = 0;
      for (const k of r.kw) {
        if (text.includes(k)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = r.cat;
      }
    }
    return best;
  }
}
