require('dotenv').config({ path: '../../../.env' });
const http = require('http');
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/use/ws');
const { connectDB } = require('../../shared/db');
const { buildContext } = require('../../shared/authMiddleware');
const typeDefs = require('./schemas/communitySchema');
const resolvers = require('./resolvers/communityResolvers');

const PORT = process.env.COMMUNITY_SERVICE_PORT || 4002;

async function start() {
  await connectDB('community_app_community');

  const schema = buildSubgraphSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = http.createServer(app);

  // WebSocket server for subscriptions (connects directly, bypasses gateway)
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
  useServer({ schema }, wsServer);

  const server = new ApolloServer({ schema });
  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, { context: buildContext })
  );

  httpServer.listen(PORT, () => {
    console.log(`Community Service running at http://localhost:${PORT}/graphql`);
  });
}

start().catch(console.error);
