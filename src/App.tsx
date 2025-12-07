import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import ChatButton from './components/Chat/ChatButton';
import { FeedbackWidget } from './components/FeedbackWidget';
import { AdBanner } from './components/AdBanner';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/welcome';

  return (
    <>
      <AppRoutes />
      {!isLandingPage && <ChatButton />}
      {!isLandingPage && <FeedbackWidget projectName="oasara" primaryColor="#10B981" />}
      {!isLandingPage && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', maxWidth: '728px', width: '90%', zIndex: 30 }}>
          <AdBanner site="oasara" zone="FOOTER" />
        </div>
      )}
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
