import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SharedJourneyView from '../components/Journey/SharedJourneyView';
import SiteHeader from '../components/Layout/SiteHeader';

const SharedJourneyPage: React.FC = () => {
  const { journeyId } = useParams<{ journeyId: string }>();

  if (!journeyId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-sage-50">
      <SiteHeader />
      <main id="main-content">
        <SharedJourneyView journeyId={journeyId} />
      </main>
    </div>
  );
};

export default SharedJourneyPage;
