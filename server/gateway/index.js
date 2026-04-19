require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');

const PORT = process.env.GATEWAY_PORT || 4000;

async function startGateway() {
  const app = express();

  // The gateway discovers each subgraph (microservice) by its URL.
  // IntrospectAndCompose polls each service for its schema at startup.
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'auth', url: `http://localhost:${process.env.AUTH_SERVICE_PORT || 4001}/graphql` },
        { name: 'community', url: `http://localhost:${process.env.COMMUNITY_SERVICE_PORT || 4002}/graphql` },
        { name: 'business-events', url: `http://localhost:${process.env.BUSINESS_EVENTS_SERVICE_PORT || 4003}/graphql` },
      ],
    }),
    buildService({ url }) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest({ request, context }) {
          const authHeader = context?.headers?.authorization;
          if (authHeader) {
            request.http.headers.set('authorization', authHeader);
          }
        },
      });
    },
  });

  const server = new ApolloServer({ gateway });
  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json({ limit: '5mb' }),
    express.urlencoded({ limit: '5mb', extended: true }),
    expressMiddleware(server, {
      // Forward the Authorization header to subgraph services
      context: async ({ req }) => ({
        headers: req.headers,
      }),
    })
  );

  app.listen(PORT, () => {
    console.log(`API Gateway running at http://localhost:${PORT}/graphql`);
  });
}

startGateway().catch(console.error);
