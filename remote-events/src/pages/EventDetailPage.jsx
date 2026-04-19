import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENT, GET_OPTIMAL_TIME, GET_VOLUNTEER_MATCHES } from '../graphql/queries';
import { JOIN_EVENT, VOLUNTEER_FOR_EVENT, UPDATE_EVENT, DELETE_EVENT } from '../graphql/mutations';
import { useAuth } from '../shared/context/AuthContext';
import { formatEventDate } from '../utils/dateUtils';

function toDatetimeLocal(timestamp) {
  if (!timestamp) return '';
  const d = new Date(Number(timestamp));
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

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

  const [updateEvent, { loading: updateLoading }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      setIsEditing(false);
      refetch();
    },
  });

  const [deleteEvent, { loading: deleteLoading }] = useMutation(DELETE_EVENT, {
    onCompleted: () => navigate('/events'),
  });

  if (loading) return <p className="p-6 text-gray-500">Loading event...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;
  if (!event) return <p className="p-6 text-gray-500">Event not found.</p>;

  const isOrganizer = user?.id === event.organizer?.id;
  const isAttending = event.attendees?.some((a) => a.userId === user?.id);
  const isVolunteering = event.volunteers?.some((v) => v.userId === user?.id);
  const isFull = event.maxAttendees && event.attendees?.length >= event.maxAttendees;
  const optimalTime = timeData?.getOptimalEventTime;
  const matches = matchData?.getVolunteerMatches || [];

  function startEditing() {
    setEditForm({
      title: event.title,
      description: event.description,
      location: event.location,
      date: toDatetimeLocal(event.date),
      status: event.status || 'upcoming',
    });
    setIsEditing(true);
  }

  function handleUpdate(e) {
    e.preventDefault();
    updateEvent({
      variables: {
        id: event.id,
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        date: editForm.date ? new Date(editForm.date).toISOString() : undefined,
        status: editForm.status,
      },
    });
  }

  function handleDelete() {
    if (!window.confirm('Delete this event?')) return;
    deleteEvent({ variables: { id: event.id } });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/events" className="text-primary-600 hover:underline text-sm mb-4 block">
        ← Back to Events
      </Link>

      {/* Event Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-3">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold"
              required
            />
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              rows="3"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="Location"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            />
            <div>
              <label className="text-sm text-gray-600 block mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={editForm.date}
                onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={updateLoading}
                className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition disabled:opacity-50"
              >
                {updateLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-start mb-3">
              <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                  {event.category}
                </span>
                {isOrganizer && (
                  <>
                    <button
                      onClick={startEditing}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="text-sm text-red-500 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
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
          </>
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
