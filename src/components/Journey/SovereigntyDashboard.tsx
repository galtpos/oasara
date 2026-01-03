import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PledgeStatus {
  medical_trust: boolean;
  cancel_insurance: boolean;
  try_medical_tourism: boolean;
}

interface Journey {
  id: string;
  procedure_type: string;
  status: string;
  created_at: string;
}

interface SovereigntyDashboardProps {
  pledgeStatus: PledgeStatus;
  journey?: Journey | null;
  shortlistCount?: number;
  onStartJourney?: () => void;
}

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'not_started' | 'pledged' | 'in_progress' | 'completed' | 'coming_soon';
  statusLabel?: string;
  actionLabel: string;
  actionLink?: string;
  onAction?: () => void;
  isPledged: boolean;
  delay: number;
}

const PillarCard: React.FC<PillarCardProps> = ({
  icon,
  title,
  description,
  status,
  statusLabel,
  actionLabel,
  actionLink,
  onAction,
  isPledged,
  delay
}) => {
  const statusColors = {
    not_started: 'bg-gray-100 text-gray-600',
    pledged: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-ocean-100 text-ocean-700',
    completed: 'bg-green-100 text-green-700',
    coming_soon: 'bg-purple-100 text-purple-700'
  };

  const statusIcons = {
    not_started: '○',
    pledged: '◐',
    in_progress: '◑',
    completed: '●',
    coming_soon: '◇'
  };

  const displayStatus = statusLabel || {
    not_started: 'Not Started',
    pledged: 'Pledged',
    in_progress: 'In Progress',
    completed: 'Completed',
    coming_soon: 'Coming Soon'
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-ocean-100 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-ocean-900 text-lg">{title}</h3>
            {isPledged && (
              <span className="text-green-600 text-sm">✓ Pledged</span>
            )}
          </div>
          
          <p className="text-sm text-ocean-600 mb-3">{description}</p>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            <span>{statusIcons[status]}</span>
            <span>{displayStatus}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0">
          {actionLink ? (
            <Link
              to={actionLink}
              className="px-4 py-2 bg-ocean-600 text-white text-sm font-medium rounded-lg hover:bg-ocean-700 transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="px-4 py-2 bg-ocean-600 text-white text-sm font-medium rounded-lg hover:bg-ocean-700 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SovereigntyDashboard: React.FC<SovereigntyDashboardProps> = ({
  pledgeStatus,
  journey,
  shortlistCount = 0,
  onStartJourney
}) => {
  const totalPledges = [
    pledgeStatus.medical_trust,
    pledgeStatus.cancel_insurance,
    pledgeStatus.try_medical_tourism
  ].filter(Boolean).length;

  // Determine status for each pillar
  const getMedicalTrustStatus = (): PillarCardProps['status'] => {
    if (pledgeStatus.medical_trust) return 'pledged';
    return 'not_started';
  };

  const getInsuranceExitStatus = (): PillarCardProps['status'] => {
    if (pledgeStatus.cancel_insurance) return 'pledged';
    return 'coming_soon';
  };

  const getMedicalTourismStatus = (): PillarCardProps['status'] => {
    if (journey) {
      if (journey.status === 'completed') return 'completed';
      return 'in_progress';
    }
    if (pledgeStatus.try_medical_tourism) return 'pledged';
    return 'not_started';
  };

  const getMedicalTourismStatusLabel = (): string | undefined => {
    if (journey) {
      if (shortlistCount > 0) {
        return `${shortlistCount} facilities shortlisted`;
      }
      return `Researching: ${journey.procedure_type}`;
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-ocean-900">My Journey</h2>
          <p className="text-ocean-600">Your path to healthcare sovereignty</p>
        </div>

        {/* Pledge Progress */}
        <div className="flex items-center gap-3 bg-ocean-50 px-4 py-2 rounded-full">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < totalPledges ? 'bg-green-500' : 'bg-ocean-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-ocean-700 font-medium">
            {totalPledges}/3 Pledges
          </span>
          {totalPledges < 3 && (
            <Link
              to="/action"
              className="text-xs text-ocean-600 hover:text-ocean-800 underline"
            >
              Take Pledge
            </Link>
          )}
        </div>
      </motion.div>

      {/* Three Pillars */}
      <div className="space-y-4">
        {/* Medical Trust */}
        <PillarCard
          icon="🛡️"
          title="Medical Trust"
          description="Protect your assets from medical debt — the #1 cause of bankruptcy"
          status={getMedicalTrustStatus()}
          actionLabel={pledgeStatus.medical_trust ? 'Learn More' : 'Take Pledge'}
          actionLink={pledgeStatus.medical_trust ? '/medical-trusts' : '/action'}
          isPledged={pledgeStatus.medical_trust}
          delay={0.1}
        />

        {/* Insurance Exit */}
        <PillarCard
          icon="💸"
          title="Insurance Exit"
          description="Explore alternatives to $24K/year premiums and denied claims"
          status={getInsuranceExitStatus()}
          statusLabel={pledgeStatus.cancel_insurance ? 'Pledged — Tools Coming Soon' : 'Coming Soon'}
          actionLabel={pledgeStatus.cancel_insurance ? 'Join Waitlist' : 'Take Pledge'}
          actionLink="/action"
          isPledged={pledgeStatus.cancel_insurance}
          delay={0.2}
        />

        {/* Medical Tourism */}
        <PillarCard
          icon="✈️"
          title="Medical Tourism"
          description="Access JCI-accredited care abroad at 60-90% savings"
          status={getMedicalTourismStatus()}
          statusLabel={getMedicalTourismStatusLabel()}
          actionLabel={journey ? 'View Journey' : pledgeStatus.try_medical_tourism ? 'Start Journey' : 'Take Pledge'}
          actionLink={journey ? undefined : pledgeStatus.try_medical_tourism ? undefined : '/action'}
          onAction={!journey && pledgeStatus.try_medical_tourism ? onStartJourney : undefined}
          isPledged={pledgeStatus.try_medical_tourism}
          delay={0.3}
        />
      </div>

      {/* Quick Stats (when journey exists) */}
      {journey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-ocean-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-ocean-900">{shortlistCount}</div>
            <div className="text-sm text-ocean-600">Shortlisted</div>
          </div>
          <div className="bg-ocean-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-ocean-900">{journey.procedure_type.split(' ')[0]}</div>
            <div className="text-sm text-ocean-600">Procedure</div>
          </div>
          <div className="bg-ocean-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-ocean-900 capitalize">{journey.status}</div>
            <div className="text-sm text-ocean-600">Status</div>
          </div>
        </motion.div>
      )}

      {/* Call to Action for No Journey */}
      {!journey && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-xl p-6 text-white text-center"
        >
          <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
          <p className="text-ocean-100 mb-4">
            Tell us what procedure you need, and we'll find the best facilities worldwide.
          </p>
          <button
            onClick={onStartJourney}
            className="bg-white text-ocean-700 px-6 py-2 rounded-lg font-medium hover:bg-ocean-50 transition-colors"
          >
            Start Your Journey
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SovereigntyDashboard;

