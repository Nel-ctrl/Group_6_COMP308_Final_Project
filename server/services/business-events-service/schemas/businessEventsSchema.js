const gql = require('graphql-tag');

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type User @key(fields: "id") {
    id: ID!
  }

  # ─── Business Types ───

  type Deal {
    title: String!
    description: String
    validUntil: String
    isActive: Boolean
    createdAt: String
  }

  type Review {
    authorId: ID!
    rating: Int!
    comment: String!
    sentiment: String
    ownerReply: String
    createdAt: String
  }

  type Business @key(fields: "id") {
    id: ID!
    name: String!
    description: String!
    category: String!
    owner: User!
    address: String!
    phone: String
    website: String
    hours: String
    deals: [Deal]
    reviews: [Review]
    averageRating: Float
    createdAt: String
  }

  # ─── Event Types ───

  type Attendee {
    userId: ID!
    joinedAt: String
  }

  type Volunteer {
    userId: ID!
    role: String
    joinedAt: String
  }

  type Event @key(fields: "id") {
    id: ID!
    title: String!
    description: String!
    organizer: User!
    date: String!
    endDate: String
    location: String!
    category: String!
    maxAttendees: Int
    attendees: [Attendee]
    volunteers: [Volunteer]
    status: String
    aiSuggestedTime: String
    createdAt: String
  }

  type VolunteerMatch {
    userId: ID!
    name: String
    matchScore: Float
    reason: String
  }

  type Query {
    # Business queries
    getBusinesses(category: String): [Business]
    getBusiness(id: ID!): Business
    getBusinessesByOwner(ownerId: ID!): [Business]

    # Event queries
    getEvents(status: String, category: String): [Event]
    getEvent(id: ID!): Event
    getEventsByOrganizer(organizerId: ID!): [Event]
    getVolunteerMatches(eventId: ID!): [VolunteerMatch]
    getOptimalEventTime(category: String!, location: String!): String
  }

  type Mutation {
    # Business mutations
    createBusiness(
      name: String!
      description: String!
      category: String!
      address: String!
      phone: String
      website: String
      hours: String
    ): Business!

    updateBusiness(
      id: ID!
      name: String
      description: String
      category: String
      address: String
      phone: String
      website: String
      hours: String
    ): Business!

    deleteBusiness(id: ID!): Boolean!

    addDeal(
      businessId: ID!
      title: String!
      description: String
      validUntil: String
    ): Business!

    addReview(
      businessId: ID!
      rating: Int!
      comment: String!
    ): Business!

    replyToReview(
      businessId: ID!
      reviewIndex: Int!
      reply: String!
    ): Business!

    # Event mutations
    createEvent(
      title: String!
      description: String!
      date: String!
      endDate: String
      location: String!
      category: String!
      maxAttendees: Int
    ): Event!

    updateEvent(
      id: ID!
      title: String
      description: String
      date: String
      location: String
      status: String
    ): Event!

    deleteEvent(id: ID!): Boolean!

    joinEvent(eventId: ID!): Event!

    volunteerForEvent(eventId: ID!, role: String): Event!
  }
`;

module.exports = typeDefs;
