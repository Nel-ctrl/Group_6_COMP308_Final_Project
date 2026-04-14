import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENTS } from '../graphql/queries';
import { JOIN_EVENT, VOLUNTEER_FOR_EVENT } from '../graphql/mutations';
import { useAuth } from '../../../shared/context/AuthContext';
import { Link } from 'react-router-dom';

export default function EventsPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery(GET_EVENTS, {
    variables: { status: 'upcoming' },
  });

  const [joinEvent] = useMutation(JOIN_EVENT, { onCompleted: refetch });
  const [volunteerForEvent] = useMutation(VOLUNTEER_FOR_EVENT, { onCompleted: refetch });

  if (loading) return <p className="p-6 text-gray-500">Loading events...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Community Events</h1>
        {user?.role === 'community_organizer' && (
          <Link
            to="/events/create"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
          >
            Create Event
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.getEvents?.map((event) => {
          const isAttending = event.attendees?.some((a) => a.userId === user?.id);
          const isVolunteering = event.volunteers?.some((v) => v.userId === user?.id);

          return (
            <div key={event.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                  {event.category}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{event.description}</p>

              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>Date: {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}</p>
                <p>Location: {event.location}</p>
                <p>
                  Attendees: {event.attendees?.length || 0}
                  {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
                </p>
                <p>Volunteers: {event.volunteers?.length || 0}</p>
                <p>Organized by: {event.organizer?.name || 'Unknown'}</p>
              </div>

              {event.aiSuggestedTime && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-3 text-sm text-blue-700">
                  AI Suggestion: {event.aiSuggestedTime}
                </div>
              )}

              {user && (
                <div className="flex space-x-2">
                  {!isAttending && (
                    <button
                      onClick={() => joinEvent({ variables: { eventId: event.id } })}
                      className="bg-primary-600 text-white px-4 py-1.5 rounded text-sm hover:bg-primary-700 transition"
                    >
                      Join Event
                    </button>
                  )}
                  {isAttending && (
                    <span className="text-green-600 text-sm font-medium py-1.5">Attending</span>
                  )}
                  {!isVolunteering && (
                    <button
                      onClick={() =>
                        volunteerForEvent({ variables: { eventId: event.id, role: 'general' } })
                      }
                      className="border border-primary-600 text-primary-600 px-4 py-1.5 rounded text-sm hover:bg-primary-50 transition"
                    >
                      Volunteer
                    </button>
                  )}
                  {isVolunteering && (
                    <span className="text-green-600 text-sm font-medium py-1.5">Volunteering</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data?.getEvents?.length === 0 && (
        <p className="text-gray-500 text-center mt-8">
          No upcoming events. Check back later!
        </p>
      )}
    </div>
  );
}
