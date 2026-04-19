import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const fallbackSummarize = (text) => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const preview = normalized.slice(0, 220);
  const sentences = normalized.split(/[.!?]/).filter(Boolean);
  return {
    title: sentences[0]?.slice(0, 50) || 'Lecture Notes',
    shortSummary: `${preview}${normalized.length > 220 ? '...' : ''}`,
    detailedSummary: sentences.slice(0, 6).map((sentence, index) => `${index + 1}. ${sentence.trim()}`).join('\n'),
    keywords: [...new Set(normalized.toLowerCase().split(/\W+/).filter((word) => word.length > 5))].slice(0, 8)
  };
};

export const summarizeContent = async ({ content, summaryType }) => {
  if (!client) {
    return fallbackSummarize(content);
  }

  const prompt = `Create ${summaryType} educational notes from this content. Include title, shortSummary, detailedSummary with bullet points and keywords array: ${content}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are SilentClass AI. Return strict JSON with keys title, shortSummary, detailedSummary, keywords.'
      },
      { role: 'user', content: prompt }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
};
