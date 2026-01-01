import { useLocation } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import ChatButton from './components/Chat/ChatButton';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/welcome';
  const isChatPage = location.pathname === '/my-journey/chat';
  const isJourneyDashboard = location.pathname === '/my-journey';

  // Show ChatButton on all pages except:
  // - Landing page
  // - Active chat page (full screen)
  // - Journey dashboard (has its own JourneyChatbot)
  return (
    <>
      <AppRoutes />
      {!isLandingPage && !isChatPage && !isJourneyDashboard && <ChatButton />}
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
