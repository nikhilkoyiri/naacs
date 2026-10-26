import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import CriterionForm from './pages/CriterionForm';
import CriterionAnalysis from './pages/CriterionAnalysis';
import GapAnalysis from './pages/GapAnalysis';
import EvidenceVault from './pages/EvidenceVault';
import BulkUpload from './pages/BulkUpload';
import ReviewSubmit from './pages/ReviewSubmit';
import SSRGenerator from './pages/SSRGenerator';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useData();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function Toast() {
  const { toast } = useData();
  if (!toast) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className={`${bgColor} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2`}>
        {toast.type === 'success' && '✓'}
        {toast.type === 'error' && '✗'}
        {toast.type === 'info' && 'ℹ'}
        {toast.message}
      </div>
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/data-entry" element={<ProtectedRoute><DataEntry /></ProtectedRoute>} />
          <Route path="/data-entry/criterion/:n" element={<ProtectedRoute><CriterionForm /></ProtectedRoute>} />
          <Route path="/data-entry/bulk-upload" element={<ProtectedRoute><BulkUpload /></ProtectedRoute>} />
          <Route path="/data-entry/evidence-vault" element={<ProtectedRoute><EvidenceVault /></ProtectedRoute>} />
          <Route path="/data-entry/review" element={<ProtectedRoute><ReviewSubmit /></ProtectedRoute>} />
          <Route path="/criteria/:n" element={<ProtectedRoute><CriterionAnalysis /></ProtectedRoute>} />
          <Route path="/analytics/gap-analysis" element={<ProtectedRoute><GapAnalysis /></ProtectedRoute>} />
          <Route path="/reports/ssr-generator" element={<ProtectedRoute><SSRGenerator /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </HashRouter>
    </DataProvider>
  );
}

export default App;
