import { gql } from '@apollo/client';

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness(
    $name: String!
    $description: String!
    $category: String!
    $address: String!
    $phone: String
    $website: String
    $hours: String
  ) {
    createBusiness(
      name: $name
      description: $description
      category: $category
      address: $address
      phone: $phone
      website: $website
      hours: $hours
    ) {
      id
      name
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview($businessId: ID!, $rating: Int!, $comment: String!) {
    addReview(businessId: $businessId, rating: $rating, comment: $comment) {
      id
      reviews {
        authorId
        rating
        comment
        sentiment
        createdAt
      }
      averageRating
    }
  }
`;

export const ADD_DEAL = gql`
  mutation AddDeal(
    $businessId: ID!
    $title: String!
    $description: String
    $validUntil: String
  ) {
    addDeal(
      businessId: $businessId
      title: $title
      description: $description
      validUntil: $validUntil
    ) {
      id
      deals {
        title
        description
        validUntil
        isActive
      }
    }
  }
`;
