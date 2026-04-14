require('dotenv').config({ path: '../../../.env' });
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');

const PORT = process.env.AI_SERVICE_PORT || 4004;

const app = express();
app.use(cors());
app.use(express.json());

// Mount AI routes
app.use('/api', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service' });
});

app.listen(PORT, () => {
  console.log(`AI Service running at http://localhost:${PORT}`);
});
