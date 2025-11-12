import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminHeaderProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  };
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-warm-clay/20 sticky top-0 z-40 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search facilities, doctors, testimonials... (⌘K)"
              className="w-full px-4 py-2 pl-10 bg-cream/50 border border-warm-clay/20 rounded-lg text-deep-teal placeholder-deep-teal/40 focus:outline-none focus:border-ignition-amber focus:ring-2 focus:ring-ignition-amber/20 transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-teal/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* Quick Actions */}
          <button
            onClick={() => navigate('/admin/facilities/new')}
            className="px-4 py-2 bg-gradient-to-r from-ignition-amber to-champagne-gold text-white font-semibold rounded-lg hover:scale-105 hover:shadow-lg transition-all"
            title="Add New Facility"
          >
            <span className="hidden sm:inline">+ Add Facility</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-cream rounded-lg transition-colors group">
            <svg className="w-5 h-5 text-deep-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-ignition-amber rounded-full animate-pulse"></span>

            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-white border border-warm-clay/30 rounded-lg text-sm text-deep-teal shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              Notifications
            </div>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-cream rounded-lg transition-colors"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-ignition-amber/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ignition-amber to-champagne-gold flex items-center justify-center text-white font-bold shadow-md">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-deep-teal">{user.name || 'Admin'}</p>
                <p className="text-xs text-deep-teal/60">{user.email}</p>
              </div>
              <svg
                className={`w-4 h-4 text-deep-teal/60 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />

                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-warm-clay/20 shadow-xl overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-warm-clay/10 bg-gradient-to-r from-cream to-desert-sand/30">
                      <p className="text-sm font-medium text-deep-teal">{user.name || 'Admin'}</p>
                      <p className="text-xs text-deep-teal/60">{user.email}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-ignition-amber/20 text-ignition-amber rounded-full border border-ignition-amber/30">
                        Administrator
                      </span>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/admin/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-deep-teal/80 hover:text-deep-teal hover:bg-cream transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin/settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-deep-teal/80 hover:text-deep-teal hover:bg-cream transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-deep-teal/80 hover:text-deep-teal hover:bg-cream transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>View Public Site</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-warm-clay/10">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
