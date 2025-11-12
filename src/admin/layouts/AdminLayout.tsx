import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, loading, isAdmin } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="shimmer w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-r from-ignition-amber to-champagne-gold"></div>
          <p className="font-serif text-xl text-deep-teal">
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !user) {
    return null; // useAdminAuth will handle redirect
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <AdminHeader user={user} />

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
