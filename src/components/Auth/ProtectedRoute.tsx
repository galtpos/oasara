import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuthState();
  const location = useLocation();
  const [checked, setChecked] = React.useState(false);

  // Check localStorage directly for faster auth detection
  React.useEffect(() => {
    const checkLocalStorage = () => {
      const stored = localStorage.getItem('oasara.auth.token');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data?.access_token) {
            // Session exists in storage, wait for Supabase to confirm
            return;
          }
        } catch {}
      }
      // No stored session, mark as checked
      setChecked(true);
    };

    checkLocalStorage();

    // Fallback timeout - only if no session found
    const timer = setTimeout(() => setChecked(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Once loading is done, mark as checked
  React.useEffect(() => {
    if (!loading) {
      setChecked(true);
    }
  }, [loading]);

  // Show loading state while checking auth
  if (loading && !checked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/30 to-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <p className="text-ocean-600/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to unified auth page if not authenticated
  if (!user && !session) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
