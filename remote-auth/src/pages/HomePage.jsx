import { Link } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary-600">CommunityHub</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          An AI-powered platform that connects your local community.
          Share news, organize events, support local businesses, and get intelligent insights.
        </p>
        {!user && (
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-50 transition"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          title="Community Board"
          description="Share news, start discussions, and request help from your neighbors."
          link="/community"
          color="bg-blue-500"
        />
        <FeatureCard
          title="Local Businesses"
          description="Discover and support local businesses. Find deals and leave reviews."
          link="/businesses"
          color="bg-green-500"
        />
        <FeatureCard
          title="Events"
          description="Join community events, volunteer, and connect with organizers."
          link="/events"
          color="bg-purple-500"
        />
        <FeatureCard
          title="AI Insights"
          description="Get AI-powered summaries, sentiment analysis, and trend detection."
          link="/community"
          color="bg-orange-500"
        />
      </div>

      {/* Role-specific welcome */}
      {user && (
        <div className="mt-12 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            {user.role === 'resident' &&
              'Check out the latest community discussions and help requests.'}
            {user.role === 'business_owner' &&
              'Manage your business listings and check review sentiments.'}
            {user.role === 'community_organizer' &&
              'Organize events and find the best times using AI suggestions.'}
          </p>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ title, description, link, color }) {
  return (
    <Link to={link} className="group">
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 h-full">
        <div className={`w-12 h-12 ${color} rounded-lg mb-4`} />
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition">
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
