const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizeText(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a community discussion summarizer.
Summarize the following community discussion into 3-5 key bullet points.
Be concise and focus on actionable takeaways.

Discussion:
${text}

Respond with ONLY the bullet points, no introduction or conclusion.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { summarizeText };
