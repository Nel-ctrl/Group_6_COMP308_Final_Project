import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_POST } from '../graphql/mutations';
import { useAuth } from '../../shared/context/AuthContext';

export default function CreatePostForm({ onPostCreated }) {
  const { user } = useAuth();
  const canPostAlert = ['resident', 'community_organizer'].includes(user?.role);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'discussion',
    tags: '',
    isUrgent: false,
  });

  const [createPost, { loading }] = useMutation(CREATE_POST, {
    onCompleted: onPostCreated,
  });

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    createPost({
      variables: {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      },
    });
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Create a Post</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="news">News</option>
              <option value="discussion">Discussion</option>
              <option value="help_request">Help Request</option>
              {canPostAlert && <option value="emergency_alert">Emergency Alert</option>}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., safety, traffic, parks"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          {formData.category === 'help_request' && (
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Mark as Urgent
              </label>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
