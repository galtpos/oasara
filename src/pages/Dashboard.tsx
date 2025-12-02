import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuth';
import { supabase, Facility } from '../lib/supabase';

interface SavedFacility {
  id: string;
  facility_id: string;
  notes?: string;
  procedures_interested?: string[];
  created_at: string;
  facility?: Facility;
}

interface UserInquiry {
  id: string;
  facility_id: string;
  procedure_interest?: string;
  message: string;
  status: 'sent' | 'viewed' | 'replied' | 'closed';
  facility_response?: string;
  created_at: string;
  facility?: Facility;
}

const Dashboard: React.FC = () => {
  const { user, profile, loading, signOut } = useAuthState();
  const navigate = useNavigate();
  const [savedFacilities, setSavedFacilities] = useState<SavedFacility[]>([]);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'inquiries' | 'profile'>('saved');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch saved facilities
      const { data: saved } = await supabase
        .from('saved_facilities')
        .select(`
          *,
          facility:facilities(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (saved) {
        setSavedFacilities(saved);
      }

      // Fetch inquiries
      const { data: inq } = await supabase
        .from('user_inquiries')
        .select(`
          *,
          facility:facilities(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (inq) {
        setInquiries(inq);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/30 to-sage-50 flex items-center justify-center">
        <div className="animate-pulse text-ocean-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/30 to-sage-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sage-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-display text-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-ocean-600 bg-clip-text text-transparent">
              OASARA
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/hub" className="text-ocean-600 hover:text-ocean-700 text-sm font-medium">
                Explore Facilities
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg bg-sage-100 hover:bg-sage-200 text-ocean-700 text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl text-ocean-700 mb-2">
            Welcome back, {profile?.name || 'Explorer'}
          </h1>
          <p className="text-ocean-600/70">
            Manage your saved facilities and inquiries
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-ocean-700">{savedFacilities.length}</p>
                <p className="text-ocean-600/70 text-sm">Saved Facilities</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-ocean-700">{inquiries.length}</p>
                <p className="text-ocean-600/70 text-sm">Inquiries Sent</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-ocean-700">
                  {inquiries.filter(i => i.status === 'replied').length}
                </p>
                <p className="text-ocean-600/70 text-sm">Responses Received</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-sage-200">
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'saved'
                ? 'text-gold-600 border-b-2 border-gold-600'
                : 'text-ocean-600/70 hover:text-ocean-700'
            }`}
          >
            Saved Facilities
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'inquiries'
                ? 'text-gold-600 border-b-2 border-gold-600'
                : 'text-ocean-600/70 hover:text-ocean-700'
            }`}
          >
            My Inquiries
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-gold-600 border-b-2 border-gold-600'
                : 'text-ocean-600/70 hover:text-ocean-700'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'saved' && (
            <div>
              {dataLoading ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-ocean-600">Loading saved facilities...</div>
                </div>
              ) : savedFacilities.length === 0 ? (
                <div className="text-center py-12 bg-white/60 border border-sage-200 rounded-xl">
                  <svg className="w-16 h-16 mx-auto mb-4 text-ocean-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="font-display text-xl text-ocean-700 mb-2">No Saved Facilities Yet</h3>
                  <p className="text-ocean-600/70 mb-4">Explore our network and save facilities you're interested in.</p>
                  <Link
                    to="/hub"
                    className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    Explore Facilities
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedFacilities.map((saved) => (
                    <div
                      key={saved.id}
                      className="bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                    >
                      <h3 className="font-display text-lg text-ocean-700 mb-2">
                        {saved.facility?.name || 'Facility'}
                      </h3>
                      <p className="text-ocean-600/70 text-sm mb-3">
                        {saved.facility?.city}, {saved.facility?.country}
                      </p>
                      {saved.facility?.specialties && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {saved.facility.specialties.slice(0, 3).map((spec) => (
                            <span
                              key={spec}
                              className="px-2 py-0.5 bg-gold-100 text-gold-700 text-xs rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        to={`/hub?facility=${saved.facility_id}`}
                        className="text-gold-600 hover:text-gold-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div>
              {dataLoading ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-ocean-600">Loading inquiries...</div>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-12 bg-white/60 border border-sage-200 rounded-xl">
                  <svg className="w-16 h-16 mx-auto mb-4 text-ocean-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="font-display text-xl text-ocean-700 mb-2">No Inquiries Yet</h3>
                  <p className="text-ocean-600/70 mb-4">Contact facilities to learn more about their services.</p>
                  <Link
                    to="/hub"
                    className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    Explore Facilities
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl p-6 shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display text-lg text-ocean-700">
                            {inquiry.facility?.name || 'Facility'}
                          </h3>
                          <p className="text-ocean-600/70 text-sm">
                            {inquiry.facility?.city}, {inquiry.facility?.country}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            inquiry.status === 'replied'
                              ? 'bg-green-100 text-green-700'
                              : inquiry.status === 'viewed'
                              ? 'bg-gold-100 text-gold-700'
                              : 'bg-sage-100 text-ocean-600'
                          }`}
                        >
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-ocean-600/70 text-sm mb-3">{inquiry.message}</p>
                      {inquiry.facility_response && (
                        <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 mt-3">
                          <p className="text-sm font-medium text-ocean-700 mb-1">Response:</p>
                          <p className="text-ocean-600/70 text-sm">{inquiry.facility_response}</p>
                        </div>
                      )}
                      <p className="text-ocean-500/50 text-xs mt-3">
                        Sent {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl p-8 shadow-lg">
                <h2 className="font-display text-2xl text-ocean-700 mb-6">Your Profile</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">Name</label>
                    <p className="text-ocean-600">{profile?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">Email</label>
                    <p className="text-ocean-600">{profile?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">Account Type</label>
                    <p className="text-ocean-600 capitalize">{profile?.user_type || 'Patient'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">Member Since</label>
                    <p className="text-ocean-600">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
