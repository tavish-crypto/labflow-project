import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SamplesPage } from './pages/SamplesPage';
import { SampleDetailsPage } from './pages/SampleDetailsPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import './App.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/samples" element={<SamplesPage />} />
          <Route path="/samples/:id" element={<SampleDetailsPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;