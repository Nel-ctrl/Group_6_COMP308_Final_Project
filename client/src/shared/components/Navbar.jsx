import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold">
            CommunityHub
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/community" className="hover:text-primary-200 transition">
              Community
            </Link>
            <Link to="/businesses" className="hover:text-primary-200 transition">
              Businesses
            </Link>
            <Link to="/events" className="hover:text-primary-200 transition">
              Events
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="hover:text-primary-200 transition text-sm"
                >
                  Profile
                </Link>

                <span className="text-sm text-primary-200">
                  {user.name} ({user.role.replace('_', ' ')})
                </span>

                <button
                  onClick={handleLogout}
                  className="bg-primary-500 hover:bg-primary-400 px-3 py-1.5 rounded text-sm transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-primary-200 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-primary-50 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
