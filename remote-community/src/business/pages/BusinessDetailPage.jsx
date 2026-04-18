import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BUSINESS } from '../graphql/queries';
import { ADD_REVIEW, ADD_DEAL, REPLY_TO_REVIEW } from '../graphql/mutations';
import { useAuth } from '../../shared/context/AuthContext';

const sentimentColors = {
  positive: 'bg-green-100 text-green-700',
  negative: 'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-600',
};

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl ${star <= value ? 'text-yellow-600' : 'text-gray-400'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function BusinessDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [dealForm, setDealForm] = useState({ title: '', description: '', validUntil: '' });
  const [reviewError, setReviewError] = useState('');
  const [dealError, setDealError] = useState('');

  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  const { data, loading, error } = useQuery(GET_BUSINESS, {
    variables: { id },
    fetchPolicy: 'network-only',
  });

  const [addReview, { loading: reviewLoading }] = useMutation(ADD_REVIEW, {
    refetchQueries: [{ query: GET_BUSINESS, variables: { id } }],
    onCompleted: () => {
      setReviewForm({ rating: 0, comment: '' });
      setReviewError('');
    },
    onError: (err) => setReviewError(err.message),
  });

  const [addDeal, { loading: dealLoading }] = useMutation(ADD_DEAL, {
    refetchQueries: [{ query: GET_BUSINESS, variables: { id } }],
    onCompleted: () => {
      setDealForm({ title: '', description: '', validUntil: '' });
      setDealError('');
    },
    onError: (err) => setDealError(err.message),
  });

  const [replyToReview, { loading: replyLoading }] = useMutation(REPLY_TO_REVIEW, {
    refetchQueries: [{ query: GET_BUSINESS, variables: { id } }],
    onCompleted: () => {
      setReplyError('');
      setReplySuccess('Reply posted successfully.');
    },
    onError: (err) => {
      setReplyError(err.message);
      setReplySuccess('');
    },
  });

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;

  const biz = data?.getBusiness;
  if (!biz) return <p className="p-6 text-gray-500">Business not found.</p>;

  const isOwner = user?.id === biz.owner?.id;
  const hasReviewed = biz.reviews?.some((r) => r.authorId === user?.id);
  const activeDeals = biz.deals?.filter((d) => d.isActive) || [];

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (reviewForm.rating === 0) { setReviewError('Please select a rating.'); return; }
    if (!reviewForm.comment.trim()) { setReviewError('Please write a comment.'); return; }
    setReviewError('');
    addReview({ variables: { businessId: id, rating: reviewForm.rating, comment: reviewForm.comment } });
  }

  function handleDealSubmit(e) {
    e.preventDefault();
    if (!dealForm.title.trim()) { setDealError('Title is required.'); return; }
    setDealError('');
    addDeal({
      variables: {
        businessId: id,
        title: dealForm.title,
        description: dealForm.description || null,
        validUntil: dealForm.validUntil ? new Date(dealForm.validUntil).toISOString() : null,
      },
    });
  }

  function handleReplySubmit(reviewIndex) {
    const reply = (replyDrafts[reviewIndex] || '').trim();

    if (!reply) {
      setReplyError('Reply cannot be empty.');
      setReplySuccess('');
      return;
    }

    setReplyError('');

    replyToReview({
      variables: {
        businessId: id,
        reviewIndex,
        reply,
      },
    });

    setReplyDrafts((prev) => ({
      ...prev,
      [reviewIndex]: '',
    }));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/businesses" className="text-primary-600 hover:underline text-sm mb-4 block">
        ← Back to Businesses
      </Link>

      {/* Business Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold text-gray-800">{biz.name}</h1>
          {biz.averageRating > 0 && (
            <span className="text-yellow-600 font-semibold text-lg">
              ★ {biz.averageRating.toFixed(1)}
            </span>
          )}
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {biz.category}
        </span>
        <p className="text-gray-700 mt-3">{biz.description}</p>
        <div className="mt-4 space-y-1 text-sm text-gray-600">
          {biz.address && <p>{biz.address}</p>}
          {biz.phone && <p>{biz.phone}</p>}
          {biz.website && (
            <p>
              <a
                href={biz.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {biz.website}
              </a>
            </p>
          )}
          {biz.hours && <p>Hours: {biz.hours}</p>}
          <p className="text-gray-500">Owner: {biz.owner?.name || 'Unknown'}</p>
        </div>
      </div>

      {/* Deals */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Deals & Offers</h2>

        {activeDeals.length > 0 ? (
          <div className="space-y-3 mb-4">
            {activeDeals.map((deal, i) => (
              <div key={i} className="bg-green-50 rounded p-3">
                <p className="font-medium text-green-700">{deal.title}</p>
                {deal.description && (
                  <p className="text-sm text-green-700 mt-1">{deal.description}</p>
                )}
                {deal.validUntil && (
                  <p className="text-xs text-gray-500 mt-1">
                    Valid until {new Date(Number(deal.validUntil)).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-4">No active deals.</p>
        )}

        {isOwner && (
          <form onSubmit={handleDealSubmit} className="border-t border-gray-300 pt-6 space-y-3">
            <h3 className="font-medium text-gray-700">Add a Deal</h3>
            {dealError && <p className="text-red-600 text-sm">{dealError}</p>}
            <input
              type="text"
              placeholder="Deal title *"
              value={dealForm.title}
              onChange={(e) => setDealForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description (optional)"
              value={dealForm.description}
              onChange={(e) => setDealForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows="2"
            />
            <div>
              <label className="text-sm text-gray-600 block mb-1">Valid Until (optional)</label>
              <input
                type="date"
                value={dealForm.validUntil}
                onChange={(e) => setDealForm((p) => ({ ...p, validUntil: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={dealLoading}
              className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dealLoading ? 'Adding...' : 'Add Deal'}
            </button>
          </form>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Reviews ({biz.reviews?.length || 0})
        </h2>

        {replySuccess && <p className="text-green-600 text-sm mb-3">{replySuccess}</p>}
        {replyError && <p className="text-red-600 text-sm mb-3">{replyError}</p>}

        {biz.reviews?.length > 0 ? (
          <div className="space-y-4 mb-6">
            {biz.reviews.map((review, i) => (
              <div
                key={i}
                className={`${i > 0 ? 'border-t border-gray-300 pt-4' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-yellow-600 font-medium">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                  {review.sentiment && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        sentimentColors[review.sentiment] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {review.sentiment}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm mt-1">{review.comment}</p>
                {review.ownerReply && (
                  <div className="mt-2 bg-gray-50 border-l-4 border-primary-600 px-3 py-2 text-sm text-gray-600">
                    <span className="font-medium">Owner reply: </span>
                    {review.ownerReply}
                  </div>
                )}

                {isOwner && !review.ownerReply && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply to this review
                    </label>
                    <textarea
                      placeholder="Write a professional response..."
                      value={replyDrafts[i] || ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      rows="3"
                    />
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(i)}
                      disabled={replyLoading}
                      className="mt-2 bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {replyLoading ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {review.createdAt
                    ? new Date(Number(review.createdAt)).toLocaleDateString()
                    : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-6">No reviews yet. Be the first!</p>
        )}

        {user && !isOwner && !hasReviewed && (
          <form onSubmit={handleReviewSubmit} className="border-t border-gray-300 pt-6 space-y-3">
            <h3 className="font-medium text-gray-700">Write a Review</h3>
            {reviewError && <p className="text-red-600 text-sm">{reviewError}</p>}
            <StarRating
              value={reviewForm.rating}
              onChange={(v) => setReviewForm((p) => ({ ...p, rating: v }))}
            />
            <textarea
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows="3"
            />
            <button
              type="submit"
              disabled={reviewLoading}
              className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {user && !isOwner && hasReviewed && (
          <p className="text-sm text-gray-500 border-t border-gray-300 pt-4">
            You have already reviewed this business.
          </p>
        )}

        {!user && (
          <p className="text-sm text-gray-500 border-t border-gray-300 pt-4">
            <Link to="/login" className="text-primary-600 hover:underline">Log in</Link>
            {' '}to leave a review.
          </p>
        )}
      </div>
    </div>
  );
}
