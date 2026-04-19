import { gql } from '@apollo/client';

export const GET_POSTS = gql`
  query GetPosts($category: String, $limit: Int, $offset: Int) {
    getPosts(category: $category, limit: $limit, offset: $offset) {
      id
      title
      content
      category
      author {
        id
        name
      }
      aiSummary
      aiSentiment
      tags
      status
      isUrgent
      replies {
        authorId
        content
        createdAt
      }
      createdAt
    }
  }
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      title
      content
      category
      author {
        id
        name
      }
      aiSummary
      aiSentiment
      tags
      status
      isUrgent
      replies {
        authorId
        content
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_HELP_REQUESTS = gql`
  query GetHelpRequests($status: String) {
    getHelpRequests(status: $status) {
      id
      title
      content
      author {
        id
        name
      }
      status
      isUrgent
      replies {
        authorId
        content
        createdAt
      }
      createdAt
    }
  }
`;

export const GET_EMERGENCY_ALERTS = gql`
  query GetEmergencyAlerts {
    getEmergencyAlerts {
      id
      title
      content
      author {
        id
        name
      }
      createdAt
    }
  }
`;

export const GET_TRENDING_TOPICS = gql`
  query GetTrendingTopics {
    getTrendingTopics {
      topic
      count
      sentiment
    }
  }
`;

export const EMERGENCY_ALERT_CREATED = gql`
  subscription EmergencyAlertCreated {
    emergencyAlertCreated {
      id
      title
      content
      createdAt
    }
  }
`;
