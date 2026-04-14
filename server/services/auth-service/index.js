require('dotenv').config({ path: '../../../.env' });
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { connectDB } = require('../../shared/db');
const { buildContext } = require('../../shared/authMiddleware');
const typeDefs = require('./schemas/authSchema');
const resolvers = require('./resolvers/authResolvers');

const PORT = process.env.AUTH_SERVICE_PORT || 4001;

async function start() {
  // Connect to the "auth_db" database
  await connectDB('community_app_auth');

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
    console.log(`Auth Service running at http://localhost:${PORT}/graphql`);
  });
}

start().catch(console.error);
