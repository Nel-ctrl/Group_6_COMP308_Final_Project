import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apollo/client';
import { AuthProvider } from './shared/context/AuthContext';
import Navbar from './shared/components/Navbar';
import CreateEventPage from './modules/events/pages/CreateEventPage';
// Pages
import HomePage from './modules/auth/pages/HomePage';
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import CommunityPage from './modules/community/pages/CommunityPage';
import BusinessesPage from './modules/business/pages/BusinessesPage';
import EventsPage from './modules/events/pages/EventsPage';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/businesses" element={<BusinessesPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/create" element={<CreateEventPage />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}
