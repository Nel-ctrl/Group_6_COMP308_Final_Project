import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_REPLY, SUMMARIZE_POST, UPDATE_POST, DELETE_POST } from '../graphql/mutations';
import { useAuth } from '../../shared/context/AuthContext';

const categoryColors = {
  news: 'bg-blue-100 text-blue-700',
  discussion: 'bg-purple-100 text-purple-700',
  help_request: 'bg-yellow-100 text-yellow-700',
  emergency_alert: 'bg-red-100 text-red-700',
};

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editTags, setEditTags] = useState((post.tags || []).join(', '));

  const isAuthor = user?.id === post.author?.id;

  const [addReply, { loading: replyLoading }] = useMutation(ADD_REPLY, {
    onCompleted: () => {
      setReplyContent('');
      onUpdate();
    },
  });

  const [summarizePost, { loading: summarizing }] = useMutation(SUMMARIZE_POST, {
    onCompleted: onUpdate,
  });

  const [updatePost, { loading: updateLoading }] = useMutation(UPDATE_POST, {
    onCompleted: () => {
      setIsEditing(false);
      onUpdate();
    },
  });

  const [deletePost, { loading: deleteLoading }] = useMutation(DELETE_POST, {
    onCompleted: onUpdate,
  });

  function handleReply(e) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    addReply({ variables: { postId: post.id, content: replyContent } });
  }

  function handleUpdate(e) {
    e.preventDefault();
    updatePost({
      variables: {
        id: post.id,
        title: editTitle,
        content: editContent,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      },
    });
  }

  function handleDelete() {
    if (!window.confirm('Delete this post?')) return;
    deletePost({ variables: { id: post.id } });
  }

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-lg shadow">
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold"
            required
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="4"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
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
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[post.category] || 'bg-gray-100'}`}>
            {post.category.replace('_', ' ')}
          </span>
          {post.isUrgent && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500 text-white">
              URGENT
            </span>
          )}
        </div>
        {post.aiSentiment && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              post.aiSentiment === 'positive'
                ? 'bg-green-100 text-green-700'
                : post.aiSentiment === 'negative'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {post.aiSentiment}
          </span>
        )}
      </div>

      {/* Title & Content */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{post.title}</h3>
      <p className="text-gray-600 text-sm mb-3">{post.content}</p>

      {/* AI Summary */}
      {post.aiSummary && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 text-sm">
          <p className="font-medium text-blue-800 mb-1">AI Summary</p>
          <p className="text-blue-700">{post.aiSummary}</p>
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map((tag, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta & Actions */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
        <div>
          <span>By {post.author?.name || 'Unknown'}</span>
          <span className="mx-2">|</span>
          <span>{new Date(Number(post.createdAt)).toLocaleDateString()}</span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-primary-600 hover:underline"
          >
            {post.replies?.length || 0} replies
          </button>
          {user && !post.aiSummary && (
            <button
              onClick={() => summarizePost({ variables: { postId: post.id } })}
              disabled={summarizing}
              className="text-primary-600 hover:underline"
            >
              {summarizing ? 'Summarizing...' : 'AI Summarize'}
            </button>
          )}
          {isAuthor && (
            <>
              <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:underline">
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="text-red-500 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Replies Section */}
      {showReplies && (
        <div className="mt-4 border-t pt-3">
          {post.replies?.map((reply, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded mb-2 text-sm">
              <p className="text-gray-700">{reply.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(Number(reply.createdAt)).toLocaleDateString()}
              </p>
            </div>
          ))}

          {user && (
            <form onSubmit={handleReply} className="flex space-x-2 mt-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={replyLoading}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700 transition disabled:opacity-50"
              >
                Reply
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
