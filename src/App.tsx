import React from 'react';
import AppRoutes from './AppRoutes';
import ChatButton from './components/Chat/ChatButton';
import { FeedbackWidget } from './components/FeedbackWidget';

function App() {
  return (
    <>
      <AppRoutes />
      <ChatButton />
      <FeedbackWidget projectName="oasara" primaryColor="#10B981" />
    </>
  );
}

export default App;
