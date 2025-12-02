import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Pledge {
  id: string;
  email: string;
  name: string | null;
  pledge_type: string;
  created_at: string;
}

interface ZanoRequest {
  id: string;
  facility_id: string;
  user_email: string | null;
  status: string;
  requested_at: string;
  facility?: {
    name: string;
    country: string;
  };
}

interface Feedback {
  id: string;
  email: string | null;
  name: string | null;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalPledges: number;
  pledgesByType: {
    medical_trust: number;
    cancel_insurance: number;
    try_medical_tourism: number;
  };
  totalZanoRequests: number;
  totalFeedback: number;
  uniqueEmails: number;
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pledges' | 'zano' | 'feedback'>('overview');
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [zanoRequests, setZanoRequests] = useState<ZanoRequest[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch pledges
      const { data: pledgesData, error: pledgesError } = await supabase
        .from('pledges')
        .select('*')
        .order('created_at', { ascending: false });

      if (pledgesError) throw pledgesError;
      setPledges(pledgesData || []);

      // Fetch zano requests with facility info
      const { data: zanoData, error: zanoError } = await supabase
        .from('zano_requests')
        .select(`
          *,
          facility:facilities(name, country)
        `)
        .order('requested_at', { ascending: false });

      if (zanoError) throw zanoError;
      setZanoRequests(zanoData || []);

      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;
      setFeedback(feedbackData || []);

      // Calculate stats
      const pledgesByType = {
        medical_trust: pledgesData?.filter(p => p.pledge_type === 'medical_trust').length || 0,
        cancel_insurance: pledgesData?.filter(p => p.pledge_type === 'cancel_insurance').length || 0,
        try_medical_tourism: pledgesData?.filter(p => p.pledge_type === 'try_medical_tourism').length || 0,
      };

      const allEmails = new Set([
        ...(pledgesData?.map(p => p.email).filter(Boolean) || []),
        ...(zanoData?.map(z => z.user_email).filter(Boolean) || []),
        ...(feedbackData?.map(f => f.email).filter(Boolean) || []),
      ]);

      setStats({
        totalPledges: pledgesData?.length || 0,
        pledgesByType,
        totalZanoRequests: zanoData?.length || 0,
        totalFeedback: feedbackData?.length || 0,
        uniqueEmails: allEmails.size,
      });

    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPledgeLabel = (type: string) => {
    switch (type) {
      case 'medical_trust': return 'Medical Trust';
      case 'cancel_insurance': return 'Cancel Insurance';
      case 'try_medical_tourism': return 'Medical Tourism';
      default: return type;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'pledges', label: 'Pledges', icon: '✊', count: stats?.totalPledges },
    { id: 'zano', label: 'Zano Requests', icon: '💰', count: stats?.totalZanoRequests },
    { id: 'feedback', label: 'Feedback', icon: '💬', count: stats?.totalFeedback },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ocean-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-ocean-700 mb-2">Error Loading Data</h3>
          <p className="text-ocean-600/70 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-ocean-700">Analytics Dashboard</h1>
          <p className="text-ocean-600/70 mt-1">Track pledges, Zano requests, and user feedback</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gold-100 text-gold-700 rounded-lg hover:bg-gold-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sage-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gold-100 text-gold-700 border-b-2 border-gold-500'
                : 'text-ocean-600/70 hover:text-ocean-600 hover:bg-sage-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-gold-500 text-white' : 'bg-sage-200 text-ocean-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gold-50 to-gold-100 p-6 rounded-xl border border-gold-200"
            >
              <div className="text-4xl font-bold text-gold-600">{stats.totalPledges}</div>
              <div className="text-sm text-ocean-600/70 mt-1">Total Pledges</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-ocean-50 to-ocean-100 p-6 rounded-xl border border-ocean-200"
            >
              <div className="text-4xl font-bold text-ocean-600">{stats.totalZanoRequests}</div>
              <div className="text-sm text-ocean-600/70 mt-1">Zano Requests</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-sage-50 to-sage-100 p-6 rounded-xl border border-sage-200"
            >
              <div className="text-4xl font-bold text-sage-600">{stats.totalFeedback}</div>
              <div className="text-sm text-ocean-600/70 mt-1">Feedback Messages</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
            >
              <div className="text-4xl font-bold text-purple-600">{stats.uniqueEmails}</div>
              <div className="text-sm text-ocean-600/70 mt-1">Unique Emails</div>
            </motion.div>
          </div>

          {/* Pledge Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-sage-200">
            <h3 className="text-lg font-bold text-ocean-700 mb-4">Pledge Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(stats.pledgesByType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-4">
                  <div className="w-40 text-sm text-ocean-600">{getPledgeLabel(type)}</div>
                  <div className="flex-1 bg-sage-100 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.totalPledges > 0 ? (count / stats.totalPledges) * 100 : 0}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
                    />
                  </div>
                  <div className="w-16 text-right font-bold text-gold-600">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Pledges */}
            <div className="bg-white p-6 rounded-xl border border-sage-200">
              <h3 className="text-lg font-bold text-ocean-700 mb-4">Recent Pledges</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pledges.slice(0, 5).map((pledge) => (
                  <div key={pledge.id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                    <div>
                      <div className="font-medium text-ocean-700">{pledge.name || pledge.email}</div>
                      <div className="text-xs text-ocean-600/60">{getPledgeLabel(pledge.pledge_type)}</div>
                    </div>
                    <div className="text-xs text-ocean-600/50">{formatDate(pledge.created_at)}</div>
                  </div>
                ))}
                {pledges.length === 0 && (
                  <p className="text-center text-ocean-600/50 py-4">No pledges yet</p>
                )}
              </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-white p-6 rounded-xl border border-sage-200">
              <h3 className="text-lg font-bold text-ocean-700 mb-4">Recent Feedback</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {feedback.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 bg-sage-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">{item.category}</span>
                      <span className="text-xs text-ocean-600/50">{formatDate(item.created_at)}</span>
                    </div>
                    <p className="text-sm text-ocean-700 line-clamp-2">{item.message}</p>
                  </div>
                ))}
                {feedback.length === 0 && (
                  <p className="text-center text-ocean-600/50 py-4">No feedback yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pledges Tab */}
      {activeTab === 'pledges' && (
        <div className="bg-white rounded-xl border border-sage-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sage-50 border-b border-sage-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-bold text-ocean-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-ocean-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-ocean-700">Pledge Type</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-ocean-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {pledges.map((pledge, index) => (
                  <tr key={pledge.id} className={index % 2 === 0 ? 'bg-white' : 'bg-sage-50/50'}>
                    <td className="py-3 px-4 text-sm text-ocean-700">{pledge.email}</td>
                    <td className="py-3 px-4 text-sm text-ocean-600">{pledge.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-gold-100 text-gold-700 rounded-full">
                        {getPledgeLabel(pledge.pledge_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-ocean-600/70">{formatDate(pledge.created_at)}</td>
                  </tr>
                ))}
                {pledges.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ocean-600/50">No pledges recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Zano Requests Tab */}
      {activeTab === 'zano' && (
        <div className="bg-white rounded-xl border border-sage-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sage-50 border-b border-sage-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-bold text-ocean-700">User Email</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-ocean-700">Facility</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-ocean-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-ocean-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {zanoRequests.map((request, index) => (
                  <tr key={request.id} className={index % 2 === 0 ? 'bg-white' : 'bg-sage-50/50'}>
                    <td className="py-3 px-4 text-sm text-ocean-700">{request.user_email || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-ocean-700">{request.facility?.name || 'Unknown'}</div>
                      <div className="text-xs text-ocean-600/60">{request.facility?.country}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        request.status === 'declined' ? 'bg-red-100 text-red-700' :
                        request.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        'bg-gold-100 text-gold-700'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-ocean-600/70">{formatDate(request.requested_at)}</td>
                  </tr>
                ))}
                {zanoRequests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ocean-600/50">No Zano requests yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedback.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl border border-sage-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.category === 'bug' ? 'bg-red-100 text-red-700' :
                    item.category === 'feature' ? 'bg-blue-100 text-blue-700' :
                    item.category === 'data' ? 'bg-purple-100 text-purple-700' :
                    item.category === 'facility' ? 'bg-green-100 text-green-700' :
                    'bg-gold-100 text-gold-700'
                  }`}>
                    {item.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'new' ? 'bg-gold-100 text-gold-700' :
                    item.status === 'read' ? 'bg-blue-100 text-blue-700' :
                    item.status === 'responded' ? 'bg-green-100 text-green-700' :
                    'bg-sage-100 text-sage-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <span className="text-xs text-ocean-600/50">{formatDate(item.created_at)}</span>
              </div>
              <p className="text-ocean-700 mb-3">{item.message}</p>
              <div className="flex items-center gap-4 text-sm text-ocean-600/70">
                {item.email && <span>📧 {item.email}</span>}
                {item.name && <span>👤 {item.name}</span>}
              </div>
            </motion.div>
          ))}
          {feedback.length === 0 && (
            <div className="bg-white p-12 rounded-xl border border-sage-200 text-center">
              <p className="text-ocean-600/50">No feedback messages yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
