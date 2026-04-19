import { gql } from '@apollo/client';

export const CREATE_EVENT = gql`
  mutation CreateEvent(
    $title: String!
    $description: String!
    $date: String!
    $endDate: String
    $location: String!
    $category: String!
    $maxAttendees: Int
  ) {
    createEvent(
      title: $title
      description: $description
      date: $date
      endDate: $endDate
      location: $location
      category: $category
      maxAttendees: $maxAttendees
    ) {
      id
      title
    }
  }
`;

export const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: ID!) {
    joinEvent(eventId: $eventId) {
      id
      attendees {
        userId
      }
    }
  }
`;

export const VOLUNTEER_FOR_EVENT = gql`
  mutation VolunteerForEvent($eventId: ID!, $role: String) {
    volunteerForEvent(eventId: $eventId, role: $role) {
      id
      volunteers {
        userId
        role
      }
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $title: String, $description: String, $date: String, $location: String, $status: String) {
    updateEvent(id: $id, title: $title, description: $description, date: $date, location: $location, status: $status) {
      id
      title
      description
      date
      location
      status
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;
