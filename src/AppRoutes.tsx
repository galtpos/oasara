import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import PublicSite from './pages/PublicSite';
import EarlyAccess from './pages/EarlyAccess';
import MedicalTourismHub from './pages/MedicalTourismHub';

// Admin pages
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/layouts/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import FacilitiesList from './admin/pages/FacilitiesList';
import FacilityEditor from './admin/pages/FacilityEditor';
import DoctorsList from './admin/pages/DoctorsList';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicSite />} />
      <Route path="/early-access" element={<EarlyAccess />} />
      <Route path="/hub" element={<MedicalTourismHub />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Routes (Protected) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="facilities" element={<FacilitiesList />} />
        <Route path="facilities/new" element={<FacilityEditor />} />
        <Route path="facilities/:id" element={<FacilityEditor />} />
        <Route path="doctors" element={<DoctorsList />} />
        <Route path="testimonials" element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-champagne-gold to-warm-clay flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-deep-teal mb-3">Testimonials Management</h2>
              <p className="text-deep-teal/70 mb-2">This feature is under construction.</p>
              <p className="text-sm text-deep-teal/60">Manage patient reviews and testimonials.</p>
              <div className="mt-6 p-4 bg-champagne-gold/10 rounded-lg border border-champagne-gold/20">
                <p className="text-sm text-deep-teal"><strong>Current Data:</strong> 635 testimonials collected</p>
              </div>
            </div>
          </div>
        } />
        <Route path="pricing" element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-warm-clay to-deep-teal flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-deep-teal mb-3">Pricing Management</h2>
              <p className="text-deep-teal/70 mb-2">This feature is under construction.</p>
              <p className="text-sm text-deep-teal/60">Manage procedure pricing and packages.</p>
              <div className="mt-6 p-4 bg-warm-clay/10 rounded-lg border border-warm-clay/20">
                <p className="text-sm text-deep-teal"><strong>Current Data:</strong> Pricing data collection in progress</p>
              </div>
            </div>
          </div>
        } />
        <Route path="claims" element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-deep-teal to-ignition-amber flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-deep-teal mb-3">Facility Claims</h2>
              <p className="text-deep-teal/70 mb-2">This feature is under construction.</p>
              <p className="text-sm text-deep-teal/60">Process facility ownership claims and verification.</p>
            </div>
          </div>
        } />
        <Route path="users" element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-ignition-amber to-champagne-gold flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-deep-teal mb-3">User Management</h2>
              <p className="text-deep-teal/70 mb-2">This feature is under construction.</p>
              <p className="text-sm text-deep-teal/60">Manage admin users and permissions.</p>
            </div>
          </div>
        } />
        <Route path="tasks" element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-champagne-gold to-warm-clay flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-deep-teal mb-3">Task Management</h2>
              <p className="text-deep-teal/70 mb-2">This feature is under construction.</p>
              <p className="text-sm text-deep-teal/60">Track facility outreach and data enrichment tasks.</p>
            </div>
          </div>
        } />
        <Route path="settings" element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-deep-teal to-ignition-amber flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-deep-teal mb-3">Settings</h2>
              <p className="text-deep-teal/70 mb-2">This feature is under construction.</p>
              <p className="text-sm text-deep-teal/60">Configure system settings and preferences.</p>
            </div>
          </div>
        } />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
