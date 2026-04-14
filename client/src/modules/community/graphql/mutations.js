import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost(
    $title: String!
    $content: String!
    $category: String!
    $tags: [String]
    $isUrgent: Boolean
  ) {
    createPost(
      title: $title
      content: $content
      category: $category
      tags: $tags
      isUrgent: $isUrgent
    ) {
      id
      title
      content
      category
      tags
      isUrgent
      createdAt
    }
  }
`;

export const ADD_REPLY = gql`
  mutation AddReply($postId: ID!, $content: String!) {
    addReply(postId: $postId, content: $content) {
      id
      replies {
        authorId
        content
        createdAt
      }
    }
  }
`;

export const SUMMARIZE_POST = gql`
  mutation SummarizePost($postId: ID!) {
    summarizePost(postId: $postId) {
      id
      aiSummary
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;
