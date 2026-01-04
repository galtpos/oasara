import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const SiteHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  // Check auth state - use getSession (cached) not getUser (network call)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      {/* Skip Link for keyboard navigation */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b-[3px] border-ocean-400 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <h1 className="logo-gradient text-4xl">OASARA</h1>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-ocean-600 hover:text-ocean-800 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {/* My Journey / Dashboard */}
              <Link
                to="/my-journey"
                className={`nav-link font-semibold ${location.pathname.startsWith('/my-journey') ? 'text-gold-500' : ''}`}
              >
                My Journey
              </Link>

              {/* Facilities */}
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'text-gold-500' : ''}`}
              >
                Facilities
              </Link>

              {/* Protect Your Assets */}
              <Link
                to="/medical-trusts"
                className={`nav-link ${isActive('/medical-trusts') ? 'text-gold-500' : ''}`}
              >
                Protect Assets
              </Link>

              {/* Take Action - 3 Pledges */}
              <Link
                to="/action"
                className={`nav-link ${isActive('/action') ? 'text-gold-500' : ''}`}
              >
                Take Action
              </Link>

              {/* Learn */}
              <Link
                to="/hub"
                className={`nav-link ${isActive('/hub') ? 'text-gold-500' : ''}`}
              >
                Learn
              </Link>

              {/* Stories */}
              <Link
                to="/stories"
                className={`nav-link flex items-center gap-1 ${location.pathname.startsWith('/stories') || isActive('/share-story') ? 'text-gold-500' : ''}`}
              >
                <span className="text-red-500">💔</span>
                Stories
              </Link>

              {/* Bounty Board */}
              <Link
                to="/bounty"
                className={`nav-link flex items-center gap-1 ${isActive('/bounty') ? 'text-gold-500' : ''}`}
              >
                <span className="text-gold-500 font-bold">$</span>
                Bounty
              </Link>

              {/* Auth buttons */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-ocean-600 text-sm">{user.email?.split('@')[0]}</span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link to="/auth" className="btn-gold">
                    Join
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-sage-200" aria-label="Mobile navigation">
              <div className="flex flex-col space-y-3">
                {/* My Journey */}
                <Link
                  to="/my-journey"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                    location.pathname.startsWith('/my-journey') ? 'bg-gold-100 text-gold-700' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  My Journey
                </Link>

                {/* Facilities */}
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Facilities
                </Link>

                {/* Protect Your Assets */}
                <Link
                  to="/medical-trusts"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/medical-trusts') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Protect Assets
                </Link>

                {/* Take Action */}
                <Link
                  to="/action"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/action') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Take Action
                </Link>

                {/* Learn */}
                <Link
                  to="/hub"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/hub') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Learn
                </Link>

                {/* Stories */}
                <Link
                  to="/stories"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    location.pathname.startsWith('/stories') || isActive('/share-story') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="text-red-500">💔</span>
                  Stories
                </Link>

                {/* Bounty Board */}
                <Link
                  to="/bounty"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isActive('/bounty') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="text-gold-500 font-bold">$</span>
                  Bounty Board
                </Link>

                {/* Auth buttons */}
                {!loading && (
                  user ? (
                    <div className="mx-4 mt-2 flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                      <span className="text-ocean-600 text-sm">{user.email?.split('@')[0]}</span>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mx-4 mt-2 btn-gold text-center"
                    >
                      Join
                    </Link>
                  )
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default SiteHeader;
