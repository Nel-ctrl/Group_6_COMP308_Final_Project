const express = require('express');
const { summarizeText } = require('../services/summarization');
const { analyzeSentiment } = require('../services/sentiment');
const { detectTrends } = require('../services/trends');
const { matchVolunteers } = require('../services/matching');
const { optimizeEventTime } = require('../services/eventOptimizer');

const router = express.Router();

// POST /api/summarize
router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error.message);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

// POST /api/sentiment
router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const sentiment = await analyzeSentiment(text);
    res.json({ sentiment });
  } catch (error) {
    console.error('Sentiment analysis error:', error.message);
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

// POST /api/trends
router.post('/trends', async (req, res) => {
  try {
    const { posts } = req.body;
    if (!posts || !posts.length) return res.status(400).json({ error: 'Posts are required' });

    const trends = await detectTrends(posts);
    res.json({ trends });
  } catch (error) {
    console.error('Trend detection error:', error.message);
    res.status(500).json({ error: 'Trend detection failed' });
  }
});

// POST /api/match-volunteers
router.post('/match-volunteers', async (req, res) => {
  try {
    const { event } = req.body;
    if (!event) return res.status(400).json({ error: 'Event data is required' });

    const matches = await matchVolunteers(event);
    res.json({ matches });
  } catch (error) {
    console.error('Volunteer matching error:', error.message);
    res.status(500).json({ error: 'Volunteer matching failed' });
  }
});

// POST /api/optimize-event-time
router.post('/optimize-event-time', async (req, res) => {
  try {
    const { category, location, pastEvents } = req.body;
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const suggestedTime = await optimizeEventTime(category, location, pastEvents || []);
    res.json({ suggestedTime });
  } catch (error) {
    console.error('Event optimization error:', error.message);
    res.status(500).json({ error: 'Event optimization failed' });
  }
});

module.exports = router;
