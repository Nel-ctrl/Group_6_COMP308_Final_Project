import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENT, GET_OPTIMAL_TIME, GET_VOLUNTEER_MATCHES } from '../graphql/queries';
import { JOIN_EVENT, VOLUNTEER_FOR_EVENT } from '../graphql/mutations';
import { useAuth } from '../shared/context/AuthContext';

function formatEventDate(dateValue) {
  if (!dateValue) return 'No date';
  const parsed = new Date(Number(dateValue));
  if (isNaN(parsed.getTime())) return 'Invalid Date';
  return parsed.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, loading, error, refetch } = useQuery(GET_EVENT, {
    variables: { id },
    fetchPolicy: 'network-only',
  });

  const event = data?.getEvent;

  const { data: timeData, loading: timeLoading } = useQuery(GET_OPTIMAL_TIME, {
    variables: { category: event?.category || '', location: event?.location || '' },
    skip: !event?.category || !event?.location || user?.role !== 'community_organizer',
  });

  const { data: matchData, loading: matchLoading } = useQuery(GET_VOLUNTEER_MATCHES, {
    variables: { eventId: id },
    skip: user?.role !== 'community_organizer',
    fetchPolicy: 'network-only',
  });

  const [joinEvent, { loading: joinLoading }] = useMutation(JOIN_EVENT, {
    onCompleted: refetch,
  });

  const [volunteerForEvent, { loading: volunteerLoading }] = useMutation(VOLUNTEER_FOR_EVENT, {
    onCompleted: refetch,
  });

  if (loading) return <p className="p-6 text-gray-500">Loading event...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;
  if (!event) return <p className="p-6 text-gray-500">Event not found.</p>;

  const isAttending = event.attendees?.some((a) => a.userId === user?.id);
  const isVolunteering = event.volunteers?.some((v) => v.userId === user?.id);
  const isFull = event.maxAttendees && event.attendees?.length >= event.maxAttendees;
  const optimalTime = timeData?.getOptimalEventTime;
  const matches = matchData?.getVolunteerMatches || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/events" className="text-primary-600 hover:underline text-sm mb-4 block">
        ← Back to Events
      </Link>

      {/* Event Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
            {event.category}
          </span>
        </div>

        <p className="text-gray-700 mb-4">{event.description}</p>

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <p>Start: {formatEventDate(event.date)}</p>
          {event.endDate && <p>End: {formatEventDate(event.endDate)}</p>}
          <p>Location: {event.location}</p>
          <p>Organized by: {event.organizer?.name || 'Unknown'}</p>
          <p>
            Attendees: {event.attendees?.length || 0}
            {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
          </p>
          <p>Volunteers: {event.volunteers?.length || 0}</p>
          {event.status && (
            <p>Status: <span className="capitalize">{event.status}</span></p>
          )}
        </div>

        {user && (
          <div className="flex space-x-3">
            {!isAttending && !isFull && (
              <button
                onClick={() => joinEvent({ variables: { eventId: event.id } })}
                disabled={joinLoading}
                className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition disabled:opacity-50"
              >
                {joinLoading ? 'Joining...' : 'Join Event'}
              </button>
            )}
            {isAttending && (
              <span className="text-green-600 text-sm font-medium py-2">Attending</span>
            )}
            {isFull && !isAttending && (
              <span className="text-red-500 text-sm py-2">Event is full</span>
            )}
            {!isVolunteering && (
              <button
                onClick={() => volunteerForEvent({ variables: { eventId: event.id, role: 'general' } })}
                disabled={volunteerLoading}
                className="border border-primary-600 text-primary-600 px-4 py-2 rounded text-sm hover:bg-primary-50 transition disabled:opacity-50"
              >
                {volunteerLoading ? 'Signing up...' : 'Volunteer'}
              </button>
            )}
            {isVolunteering && (
              <span className="text-green-600 text-sm font-medium py-2">Volunteering</span>
            )}
          </div>
        )}
      </div>

      {/* AI Optimal Time — organizers only */}
      {user?.role === 'community_organizer' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">AI Scheduling Suggestion</h2>
          {timeLoading && (
            <p className="text-gray-500 text-sm">Analyzing optimal event timing...</p>
          )}
          {optimalTime && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-700">
              {optimalTime}
            </div>
          )}
          {!timeLoading && !optimalTime && (
            <p className="text-gray-500 text-sm">No suggestion available.</p>
          )}
        </div>
      )}

      {/* AI Volunteer Matches — organizers only */}
      {user?.role === 'community_organizer' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">AI Volunteer Matches</h2>
          {matchLoading && (
            <p className="text-gray-500 text-sm">Finding volunteer matches...</p>
          )}
          {!matchLoading && matches.length === 0 && (
            <p className="text-gray-500 text-sm">No matches found.</p>
          )}
          {matches.length > 0 && (
            <div className="space-y-3">
              {matches.map((match, i) => (
                <div key={i} className="bg-gray-50 rounded p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-gray-800">{match.name}</p>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                      {Math.round(match.matchScore * 100)}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{match.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
