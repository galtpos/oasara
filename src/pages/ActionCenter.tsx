import React from 'react';
import SiteHeader from '../components/Layout/SiteHeader';
import PledgeBlock from '../components/Pledge/PledgeBlock';

const ActionCenter: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <SiteHeader />

      <PledgeBlock variant="full" />

      <footer className="py-12 border-t border-slate-800 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-lg italic mb-4">
            "The healthcare system won't fix itself. But we can exit it. Together."
          </p>
          <p className="text-slate-500 text-sm">
            oasara.com — Healthcare without borders. Sovereignty without compromise.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ActionCenter;
