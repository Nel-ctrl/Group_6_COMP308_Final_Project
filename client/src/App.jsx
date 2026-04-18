import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apollo/client';
import { AuthProvider } from './shared/context/AuthContext';
import Navbar from './shared/components/Navbar';

const HomePage = React.lazy(() => import('remote_auth/HomePage'));
const LoginPage = React.lazy(() => import('remote_auth/LoginPage'));
const RegisterPage = React.lazy(() => import('remote_auth/RegisterPage'));
const CommunityPage = React.lazy(() => import('remote_community/CommunityPage'));
const BusinessesPage = React.lazy(() => import('remote_community/BusinessesPage'));
const BusinessCreatePage = React.lazy(() => import('remote_community/BusinessCreatePage'));
const BusinessDetailPage = React.lazy(() => import('remote_community/BusinessDetailPage'));
const EventsPage = React.lazy(() => import('remote_events/EventsPage'));
const CreateEventPage = React.lazy(() => import('remote_events/CreateEventPage'));

class RemoteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-3xl mx-auto mt-10 bg-white border border-red-200 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Module unavailable</h2>
          <p className="text-gray-700">
            This section could not be loaded. Make sure the matching remote app is running,
            then refresh this route.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

function Loading() {
  return <p className="p-6 text-gray-500">Loading module...</p>;
}

function RemoteRoutes() {
  const location = useLocation();

  return (
    <RemoteErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/businesses/create" element={<BusinessCreatePage />} />
          <Route path="/businesses/:id" element={<BusinessDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/create" element={<CreateEventPage />} />
        </Routes>
      </Suspense>
    </RemoteErrorBoundary>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <RemoteRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}
