import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import ChatButton from './components/Chat/ChatButton';
import { FeedbackWidget } from './components/FeedbackWidget';
import { AdBanner } from './components/AdBanner';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/welcome';
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('oasara_ad_dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    // Show ad again after 24 hours
    if (Date.now() - dismissedTime > 24 * 60 * 60 * 1000) {
      setShowAd(true);
    }
  }, []);

  const dismissAd = () => {
    localStorage.setItem('oasara_ad_dismissed', Date.now().toString());
    setShowAd(false);
  };

  return (
    <>
      <AppRoutes />
      {!isLandingPage && <ChatButton />}
      {!isLandingPage && <FeedbackWidget projectName="oasara" primaryColor="#10B981" />}
      {!isLandingPage && showAd && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', maxWidth: '728px', width: '90%', zIndex: 30 }}>
          <button
            onClick={dismissAd}
            style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#333', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', zIndex: 31 }}
          >×</button>
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
