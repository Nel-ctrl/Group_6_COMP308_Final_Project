const gql = require('graphql-tag');

// @key(fields: "id") tells Apollo Federation that this type can be
// referenced by other subgraphs using just the "id" field.
// This is how the Community Service can say "this post belongs to User X"
// without owning the User type.

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type User @key(fields: "id") {
    id: ID!
    email: String!
    name: String!
    role: String!
    interests: [String]
    location: String
    bio: String
    createdAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    getUser(id: ID!): User
    getUsers: [User]
  }

  type Mutation {
    register(
      email: String!
      password: String!
      name: String!
      role: String
      interests: [String]
      location: String
    ): AuthPayload!

    login(email: String!, password: String!): AuthPayload!

    updateProfile(
      name: String
      interests: [String]
      location: String
      bio: String
    ): User!
  }
`;

module.exports = typeDefs;
