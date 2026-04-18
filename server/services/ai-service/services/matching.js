const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function matchVolunteers(event) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a volunteer matching assistant for a community platform.

Given this event:
- Title: ${event.title}
- Description: ${event.description}
- Category: ${event.category}
- Location: ${event.location}

Suggest the ideal volunteer profile for this event. What skills, interests, and availability would make someone a great match?

Respond in this exact JSON format (no markdown, no code blocks):
[
  {"userId": "suggested", "name": "Ideal Volunteer Profile", "matchScore": 0.95, "reason": "Explanation of why this profile is a good match"}
]

Note: In a real system, this would match against actual user profiles. For now, describe the ideal volunteer characteristics.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  try {
    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI matching response:', responseText);
    return [];
  }
}

module.exports = { matchVolunteers };
