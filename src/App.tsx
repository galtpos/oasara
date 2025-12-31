import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import ChatButton from './components/Chat/ChatButton';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/welcome';
  const isChatPage = location.pathname === '/my-journey/chat';
  const isJourneyPage = location.pathname === '/my-journey';

  // Hide global ChatButton on journey pages (JourneyDashboard has its own chat)
  return (
    <>
      <AppRoutes />
      {!isLandingPage && !isChatPage && !isJourneyPage && <ChatButton />}
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
