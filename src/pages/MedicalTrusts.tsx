import React from 'react';
import SiteHeader from '../components/Layout/SiteHeader';
import OnlineTrustServicesComparison from '../components/TrustServices/OnlineTrustServicesComparison';

const MedicalTrusts: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <OnlineTrustServicesComparison />
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-sage-200 bg-sage-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sage-500 text-base italic max-w-3xl mx-auto leading-relaxed">
            "Protect your medical sovereignty with proper legal structures."
          </p>
          <p className="text-sage-400 text-sm mt-6">
            Privacy-preserving medical marketplace. Your sovereignty. Your choice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MedicalTrusts;
