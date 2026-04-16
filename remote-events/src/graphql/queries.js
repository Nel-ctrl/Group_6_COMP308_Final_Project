import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
  query GetEvents($status: String, $category: String) {
    getEvents(status: $status, category: $category) {
      id
      title
      description
      organizer {
        id
        name
      }
      date
      endDate
      location
      category
      maxAttendees
      attendees {
        userId
      }
      volunteers {
        userId
        role
      }
      status
      aiSuggestedTime
      createdAt
    }
  }
`;

export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    getEvent(id: $id) {
      id
      title
      description
      organizer {
        id
        name
      }
      date
      endDate
      location
      category
      maxAttendees
      attendees {
        userId
      }
      volunteers {
        userId
        role
      }
      status
      aiSuggestedTime
    }
  }
`;

export const GET_OPTIMAL_TIME = gql`
  query GetOptimalEventTime($category: String!, $location: String!) {
    getOptimalEventTime(category: $category, location: $location)
  }
`;
