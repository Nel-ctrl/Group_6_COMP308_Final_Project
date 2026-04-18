import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { UPDATE_PROFILE } from '../graphql/mutations';

export default function ProfilePage() {
  const { data, loading, error, refetch } = useQuery(GET_ME);
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE);

  const user = data?.me;

  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    interests: '',
  });

  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const normalizedInterests = useMemo(() => {
    return (user?.interests || []).join(', ');
  }, [user]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        interests: normalizedInterests,
      });
    }
  }, [user, normalizedInterests]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setSubmitError('');

    const parsedInterests = form.interests
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await updateProfile({
        variables: {
          name: form.name,
          bio: form.bio,
          location: form.location,
          interests: parsedInterests,
        },
      });

      await refetch();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setSubmitError(err.message || 'Failed to update profile.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md text-red-600">
          Failed to load profile.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>

            <div>
              <p className="text-gray-500">Role</p>
              <p className="font-medium text-gray-800 capitalize">
                {user.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Edit Profile
          </h2>

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">
              {success}
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Tell us a little about yourself"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Your location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests
              </label>
              <input
                type="text"
                name="interests"
                value={form.interests}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g. volunteering, events, local business"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate interests with commas.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 text-white px-5 py-2 rounded-md hover:bg-primary-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}