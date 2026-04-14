require('dotenv').config({ path: '../../../.env' });
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { connectDB } = require('../../shared/db');
const { buildContext } = require('../../shared/authMiddleware');
const typeDefs = require('./schemas/businessEventsSchema');
const resolvers = require('./resolvers/businessEventsResolvers');

const PORT = process.env.BUSINESS_EVENTS_SERVICE_PORT || 4003;

async function start() {
  await connectDB('community_app_business_events');

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  await server.start();

  const app = express();
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, { context: buildContext })
  );

  app.listen(PORT, () => {
    console.log(`Business & Events Service running at http://localhost:${PORT}/graphql`);
  });
}

start().catch(console.error);
