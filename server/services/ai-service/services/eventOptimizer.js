const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function optimizeEventTime(category, location, pastEvents) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const eventsData = pastEvents
    .map((e) => `Date: ${e.date}, Attendees: ${e.attendeeCount}`)
    .join('\n');

  const prompt = `You are an event optimization AI for a community platform.

Based on the following past event data for "${category}" events in "${location}":

${eventsData || 'No past event data available.'}

Suggest the optimal day of week and time to host this type of event to maximize attendance.

Consider:
- Day of week patterns
- Time of day patterns
- Seasonal patterns
- Community engagement patterns

Respond with a single, concise suggestion like: "Saturday at 2:00 PM - Based on past attendance data, weekend afternoons see 40% higher turnout for ${category} events."`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

module.exports = { optimizeEventTime };
