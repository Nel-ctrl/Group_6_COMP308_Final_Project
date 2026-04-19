import { gql } from '@apollo/client';

export const GET_BUSINESSES = gql`
  query GetBusinesses($category: String) {
    getBusinesses(category: $category) {
      id
      name
      description
      category
      owner {
        id
        name
      }
      address
      phone
      website
      hours
      deals {
        title
        description
        validUntil
        isActive
      }
      reviews {
        authorId
        rating
        comment
        sentiment
        ownerReply
        createdAt
      }
      averageRating
      createdAt
    }
  }
`;

export const GET_BUSINESS = gql`
  query GetBusiness($id: ID!) {
    getBusiness(id: $id) {
      id
      name
      description
      category
      owner {
        id
        name
      }
      address
      phone
      website
      hours
      images
      deals {
        title
        description
        validUntil
        isActive
      }
      reviews {
        authorId
        rating
        comment
        sentiment
        ownerReply
        createdAt
      }
      averageRating
    }
  }
`;
