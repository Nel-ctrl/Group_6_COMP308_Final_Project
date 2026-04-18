const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeSentiment(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Analyze the sentiment of the following text.
Respond with EXACTLY one word: "positive", "neutral", or "negative".

Text:
${text}`;

  const result = await model.generateContent(prompt);
  const sentiment = result.response.text().trim().toLowerCase();

  // Validate the response is one of the expected values
  if (['positive', 'neutral', 'negative'].includes(sentiment)) {
    return sentiment;
  }
  return 'neutral'; // fallback
}

module.exports = { analyzeSentiment };
