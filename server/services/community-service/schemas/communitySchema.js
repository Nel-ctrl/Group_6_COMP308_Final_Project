const gql = require('graphql-tag');

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  # Reference the User type owned by auth-service
  type User @key(fields: "id") {
    id: ID!
  }

  type Reply {
    authorId: ID!
    content: String!
    createdAt: String
  }

  type Post @key(fields: "id") {
    id: ID!
    title: String!
    content: String!
    category: String!
    author: User!
    aiSummary: String
    aiSentiment: String
    tags: [String]
    status: String
    isUrgent: Boolean
    replies: [Reply]
    createdAt: String
    updatedAt: String
  }

  type TrendingTopic {
    topic: String!
    count: Int!
    sentiment: String
  }

  type Query {
    getPosts(category: String, limit: Int, offset: Int): [Post]
    getPost(id: ID!): Post
    getPostsByAuthor(authorId: ID!): [Post]
    getHelpRequests(status: String): [Post]
    getEmergencyAlerts: [Post]
    getTrendingTopics: [TrendingTopic]
  }

  type Mutation {
    createPost(
      title: String!
      content: String!
      category: String!
      tags: [String]
      isUrgent: Boolean
    ): Post!

    updatePost(id: ID!, title: String, content: String, tags: [String], status: String): Post!

    deletePost(id: ID!): Boolean!

    addReply(postId: ID!, content: String!): Post!

    summarizePost(postId: ID!): Post!
  }
`;

module.exports = typeDefs;
