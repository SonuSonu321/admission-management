import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';

import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ApplicantsPage from './pages/ApplicantsPage';
import ApplicantFormPage from './pages/ApplicantFormPage';
import SeatAllocationPage from './pages/SeatAllocationPage';
import AdmissionConfirmPage from './pages/AdmissionConfirmPage';
import MasterSetupPage from './pages/MasterSetupPage';
import SeatMatrixPage from './pages/SeatMatrixPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applicants" element={<ApplicantsPage />} />
            <Route path="/applicants/new" element={<ApplicantFormPage />} />
            <Route path="/applicants/:id/edit" element={<ApplicantFormPage />} />
            <Route path="/seat-allocation" element={<SeatAllocationPage />} />
            <Route path="/admission-confirm" element={<AdmissionConfirmPage />} />
            <Route path="/master-setup" element={<MasterSetupPage />} />
            <Route path="/seat-matrix" element={<SeatMatrixPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
