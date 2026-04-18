import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from './apollo/client';
import { AuthProvider } from './shared/context/AuthContext';
import CommunityPage from './community/pages/CommunityPage';
import BusinessesPage from './business/pages/BusinessesPage';
import BusinessCreatePage from './business/pages/BusinessCreatePage';
import BusinessDetailPage from './business/pages/BusinessDetailPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/community"             element={<CommunityPage />} />
            <Route path="/businesses"          element={<BusinessesPage />} />
            <Route path="/businesses/create"   element={<BusinessCreatePage />} />
            <Route path="/businesses/:id"      element={<BusinessDetailPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
