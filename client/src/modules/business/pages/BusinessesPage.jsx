import { useQuery } from '@apollo/client';
import { GET_BUSINESSES } from '../graphql/queries';
import { useAuth } from '../../../shared/context/AuthContext';
import { Link } from 'react-router-dom';

export default function BusinessesPage() {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_BUSINESSES);

  if (loading) return <p className="p-6 text-gray-500">Loading businesses...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Local Businesses</h1>
        {user?.role === 'business_owner' && (
          <Link
            to="/businesses/create"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
          >
            List Your Business
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.getBusinesses?.map((biz) => (
          <div key={biz.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{biz.name}</h3>
              {biz.averageRating > 0 && (
                <span className="text-sm font-medium text-yellow-600">
                  {'*'.repeat(Math.round(biz.averageRating))} {biz.averageRating.toFixed(1)}
                </span>
              )}
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {biz.category}
            </span>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{biz.description}</p>
            <p className="text-xs text-gray-500 mt-2">{biz.address}</p>

            {biz.deals?.filter((d) => d.isActive).length > 0 && (
              <div className="mt-3 bg-green-50 p-2 rounded text-sm text-green-700">
                {biz.deals.filter((d) => d.isActive).length} active deal(s)
              </div>
            )}

            <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
              <span>{biz.reviews?.length || 0} reviews</span>
              <Link
                to={`/businesses/${biz.id}`}
                className="text-primary-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {data?.getBusinesses?.length === 0 && (
        <p className="text-gray-500 text-center mt-8">
          No businesses listed yet. Be the first to add yours!
        </p>
      )}
    </div>
  );
}
