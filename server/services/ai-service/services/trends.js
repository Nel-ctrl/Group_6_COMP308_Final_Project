const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function detectTrends(posts) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const postsText = posts
    .map((p) => `Title: ${p.title}\nContent: ${p.content}\nTags: ${(p.tags || []).join(', ')}`)
    .join('\n---\n');

  const prompt = `Analyze the following community posts and identify the top 5 trending topics.

Posts:
${postsText}

Respond in this exact JSON format (no markdown, no code blocks):
[
  {"topic": "Topic Name", "count": <estimated number of related posts>, "sentiment": "positive|neutral|negative"},
  ...
]`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  try {
    // Strip markdown code blocks if present
    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI trends response:', responseText);
    return [];
  }
}

module.exports = { detectTrends };
