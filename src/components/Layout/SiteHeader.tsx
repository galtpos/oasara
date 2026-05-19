import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useOasaraAuth } from '../../hooks/useEcosystemAuthInit';

const SiteHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Read auth state from the ecosystem client (FreedomForge) where sign-in
  // actually happens. Reading from the per-site `lib/supabase` produces a
  // permanent "Sign In" button in the nav even after the user signs in,
  // because the per-site client has no session of its own. Unified Auth
  // Board 2026-05-11.
  const ecoAuth = useOasaraAuth();
  const user = ecoAuth.user;
  const ecoSupabase = ecoAuth.supabase;
  const [loading, setLoading] = useState(!ecoAuth.initialized);

  useEffect(() => {
    setLoading(!ecoAuth.initialized);
  }, [ecoAuth.initialized]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await ecoSupabase.auth.signOut();
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
            <Link to="/" data-umami-event="oasara-header-logo">
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
                className={`nav-link ${location.pathname.startsWith('/stories') || isActive('/share-story') ? 'text-gold-500' : ''}`}
              >
                Stories
              </Link>

              {/* Music */}
              <Link
                to="/music"
                className={`nav-link ${isActive('/music') ? 'text-gold-500' : ''}`}
              >
                Music
              </Link>

              {/* Auth buttons */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-ocean-600 text-sm">{user.email?.split('@')[0]}</span>
                    <Link to="/settings" className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors">
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link to="/auth" className="btn-gold">
                    Sign In
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
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname.startsWith('/stories') || isActive('/share-story') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Stories
                </Link>

                {/* Music */}
                <Link
                  to="/music"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/music') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Music
                </Link>

                {/* Auth buttons */}
                {!loading && (
                  user ? (
                    <div className="mx-4 mt-2 flex flex-col gap-2 p-3 bg-sage-50 rounded-lg">
                      <span className="text-ocean-600 text-sm">{user.email?.split('@')[0]}</span>
                      <div className="flex items-center justify-between">
                        <Link
                          to="/settings"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors min-h-[44px] flex items-center"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors min-h-[44px] flex items-center"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mx-4 mt-2 btn-gold text-center"
                    >
                      Sign In
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
