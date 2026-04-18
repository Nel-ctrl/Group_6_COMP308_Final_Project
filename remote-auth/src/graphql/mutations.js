import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
        interests
        location
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $email: String!
    $password: String!
    $name: String!
    $role: String
    $interests: [String]
    $location: String
  ) {
    register(
      email: $email
      password: $password
      name: $name
      role: $role
      interests: $interests
      location: $location
    ) {
      token
      user {
        id
        email
        name
        role
        interests
        location
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $name: String
    $bio: String
    $location: String
    $interests: [String]
  ) {
    updateProfile(
      name: $name
      bio: $bio
      location: $location
      interests: $interests
    ) {
      id
      email
      name
      role
      bio
      location
      interests
    }
  }
`;