import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface MetricCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  change?: string;
}

const Dashboard: React.FC = () => {
  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const [
        { count: facilitiesCount },
        { count: doctorsCount },
        { count: testimonialsCount },
        { count: pricingCount }
      ] = await Promise.all([
        supabase.from('facilities').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('procedure_pricing').select('*', { count: 'exact', head: true })
      ]);

      return {
        facilities: facilitiesCount || 0,
        doctors: doctorsCount || 0,
        testimonials: testimonialsCount || 0,
        pricing: pricingCount || 0
      };
    }
  });

  const getIconSvg = (title: string) => {
    const className = "w-6 h-6 text-white";
    switch (title) {
      case 'Total Facilities':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
      case 'Doctor Profiles':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'Patient Testimonials':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
      case 'Procedure Prices':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default:
        return null;
    }
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Total Facilities',
      value: metrics?.facilities || 0,
      icon: '',
      color: 'from-ignition-amber to-champagne-gold',
      change: '+518 JCI-certified'
    },
    {
      title: 'Doctor Profiles',
      value: metrics?.doctors || 0,
      icon: '',
      color: 'from-deep-teal to-ignition-amber',
      change: `${Math.round(((metrics?.doctors || 0) / (metrics?.facilities || 1)) * 100)}% enriched`
    },
    {
      title: 'Patient Testimonials',
      value: metrics?.testimonials || 0,
      icon: '',
      color: 'from-champagne-gold to-warm-clay',
      change: `${Math.round(((metrics?.testimonials || 0) / (metrics?.facilities || 1)) * 100)}% enriched`
    },
    {
      title: 'Procedure Prices',
      value: metrics?.pricing || 0,
      icon: '',
      color: 'from-warm-clay to-deep-teal',
      change: `${Math.round(((metrics?.pricing || 0) / (metrics?.facilities || 1)) * 100)}% enriched`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-deep-teal mb-2">Dashboard</h1>
        <p className="text-deep-teal/70">
          Welcome to the OASARA Admin Panel. Monitor data quality and manage your medical tourism marketplace.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-warm-clay/20 shadow-sm rounded-xl p-6 shimmer h-32" />
          ))
        ) : (
          metricCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-warm-clay/20 shadow-sm rounded-xl p-6 hover:scale-105 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                  {getIconSvg(card.title)}
                </div>
                {card.change && (
                  <span className="text-xs text-deep-teal/60 bg-ignition-amber/10 px-2 py-1 rounded">
                    {card.change}
                  </span>
                )}
              </div>
              <h3 className="text-sm text-deep-teal/60 mb-1">{card.title}</h3>
              <p className="font-serif text-3xl text-deep-teal font-bold">{card.value.toLocaleString()}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-warm-clay/20 shadow-sm rounded-xl p-6">
        <h2 className="font-serif text-xl text-deep-teal mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/facilities/new"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-ignition-amber/10 to-champagne-gold/10 border border-ignition-amber/30 rounded-lg hover:scale-105 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ignition-amber to-champagne-gold flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-deep-teal">Add Facility</p>
              <p className="text-xs text-deep-teal/60">Create new facility entry</p>
            </div>
          </a>
          <a
            href="/admin/facilities"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-deep-teal/10 to-ignition-amber/10 border border-deep-teal/30 rounded-lg hover:scale-105 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-deep-teal to-ignition-amber flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-deep-teal">Manage Facilities</p>
              <p className="text-xs text-deep-teal/60">Edit existing facilities</p>
            </div>
          </a>
          <a
            href="/admin/tasks"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-champagne-gold/10 to-warm-clay/10 border border-warm-clay/30 rounded-lg hover:scale-105 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-champagne-gold to-warm-clay flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-deep-teal">View Tasks</p>
              <p className="text-xs text-deep-teal/60">Manage pending tasks</p>
            </div>
          </a>
        </div>
      </div>

      {/* Data Quality Overview */}
      <div className="bg-white border border-warm-clay/20 shadow-sm rounded-xl p-6">
        <h2 className="font-serif text-xl text-deep-teal mb-6">Data Quality Overview</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-deep-teal/80">Facilities with Doctors</span>
              <span className="text-sm font-medium text-deep-teal">
                {metrics ? Math.round(((metrics.doctors || 0) / (metrics.facilities || 1)) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-cream/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics ? Math.round(((metrics.doctors || 0) / (metrics.facilities || 1)) * 100) : 0}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-ignition-amber to-champagne-gold"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-deep-teal/80">Facilities with Testimonials</span>
              <span className="text-sm font-medium text-deep-teal">
                {metrics ? Math.round(((metrics.testimonials || 0) / (metrics.facilities || 1)) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-cream/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics ? Math.round(((metrics.testimonials || 0) / (metrics.facilities || 1)) * 100) : 0}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-gradient-to-r from-deep-teal to-ignition-amber"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-deep-teal/80">Facilities with Pricing</span>
              <span className="text-sm font-medium text-deep-teal">
                {metrics ? Math.round(((metrics.pricing || 0) / (metrics.facilities || 1)) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-cream/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics ? Math.round(((metrics.pricing || 0) / (metrics.facilities || 1)) * 100) : 0}%` }}
                transition={{ duration: 1, delay: 0.9 }}
                className="h-full bg-gradient-to-r from-champagne-gold to-warm-clay"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white border border-warm-clay/20 shadow-sm rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-deep-teal">System Status</h2>
          <span className="flex items-center gap-2 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
            All systems operational
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-cream/30 rounded-lg">
            <p className="text-2xl font-bold text-deep-teal">{metrics?.facilities || 0}</p>
            <p className="text-xs text-deep-teal/60 mt-1">Total Facilities</p>
          </div>
          <div className="text-center p-3 bg-cream/30 rounded-lg">
            <p className="text-2xl font-bold text-deep-teal">{metrics?.doctors || 0}</p>
            <p className="text-xs text-deep-teal/60 mt-1">Doctor Profiles</p>
          </div>
          <div className="text-center p-3 bg-cream/30 rounded-lg">
            <p className="text-2xl font-bold text-deep-teal">{metrics?.testimonials || 0}</p>
            <p className="text-xs text-deep-teal/60 mt-1">Testimonials</p>
          </div>
          <div className="text-center p-3 bg-cream/30 rounded-lg">
            <p className="text-2xl font-bold text-deep-teal">{metrics?.pricing || 0}</p>
            <p className="text-xs text-deep-teal/60 mt-1">Price Entries</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
