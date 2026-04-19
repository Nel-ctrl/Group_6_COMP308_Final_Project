import { useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_POSTS, GET_TRENDING_TOPICS, EMERGENCY_ALERT_CREATED } from '../graphql/queries';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import { useAuth } from '../../shared/context/AuthContext';

export default function CommunityPage() {
  const [category, setCategory] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();

  const { data, loading, error, refetch } = useQuery(GET_POSTS, {
    variables: { category: category || undefined, limit: 20 },
  });

  const { data: trendingData } = useQuery(GET_TRENDING_TOPICS, {
    fetchPolicy: 'cache-first',
  });

  const [alertBanner, setAlertBanner] = useState(null);
  useSubscription(EMERGENCY_ALERT_CREATED, {
    onData: ({ data }) => {
      const alert = data?.data?.emergencyAlertCreated;
      if (alert) {
        setAlertBanner(alert);
        refetch();
      }
    },
    onError: (err) => console.error('[Subscription] error:', err),
  });

  const categories = [
    { value: '', label: 'All' },
    { value: 'news', label: 'News' },
    { value: 'discussion', label: 'Discussions' },
    { value: 'help_request', label: 'Help Requests' },
    { value: 'emergency_alert', label: 'Alerts' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {alertBanner && (
        <div className="mb-4 bg-red-600 text-white px-5 py-4 rounded-lg shadow-lg flex items-start justify-between">
          <div>
            <p className="font-bold text-sm uppercase tracking-wide mb-1">Emergency Alert</p>
            <p className="font-semibold">{alertBanner.title}</p>
            <p className="text-sm text-red-100 mt-1">{alertBanner.content}</p>
          </div>
          <button
            onClick={() => setAlertBanner(null)}
            className="ml-4 text-red-200 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Community Board</h1>
        {user && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
          >
            {showCreateForm ? 'Cancel' : 'New Post'}
          </button>
        )}
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <CreatePostForm
          onPostCreated={() => {
            setShowCreateForm(false);
            refetch();
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Category Filter */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                  category === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading && <p className="text-gray-500">Loading posts...</p>}
          {error && <p className="text-red-500">Error loading posts: {error.message}</p>}
          {data?.getPosts?.length === 0 && (
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          )}
          <div className="space-y-4">
            {data?.getPosts?.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={refetch} />
            ))}
          </div>
        </div>

        {/* Sidebar - Trending Topics */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-3">Trending Topics</h3>
            {trendingData?.getTrendingTopics?.length > 0 ? (
              <ul className="space-y-2">
                {trendingData.getTrendingTopics.map((topic, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{topic.topic}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        topic.sentiment === 'positive'
                          ? 'bg-green-100 text-green-700'
                          : topic.sentiment === 'negative'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {topic.count} posts
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No trending topics yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
