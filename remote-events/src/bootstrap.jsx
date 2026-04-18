import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from './apollo/client';
import { AuthProvider } from './shared/context/AuthContext';
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/events"         element={<EventsPage />} />
            <Route path="/events/create"  element={<CreateEventPage />} />
            <Route path="/events/:id"     element={<EventDetailPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
