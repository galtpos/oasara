import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SiteHeader: React.FC = () => {
  const location = useLocation();
  const [usPricesOpen, setUsPricesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isUSPricesActive = location.pathname.startsWith('/us-') || location.pathname === '/price-comparison';

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
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {/* Dashboard - FIRST */}
              <Link
                to="/my-journey"
                className={`nav-link font-semibold ${location.pathname.startsWith('/my-journey') ? 'text-gold-500' : ''}`}
              >
                Dashboard
              </Link>

              {/* US Prices Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setUsPricesOpen(true)}
                onMouseLeave={() => setUsPricesOpen(false)}
              >
                <button
                  className={`nav-link flex items-center gap-1 ${isUSPricesActive ? 'text-gold-500' : ''}`}
                  aria-expanded={usPricesOpen}
                  aria-haspopup="true"
                >
                  <span>US Prices</span>
                  <svg className={`w-4 h-4 transition-transform ${usPricesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {usPricesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border-2 border-sage-200 py-2 z-50">
                    <Link
                      to="/price-comparison"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-sage-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-ocean-800">Price Comparison</div>
                        <div className="text-xs text-sage-600">See how much you could save</div>
                      </div>
                    </Link>
                    <Link
                      to="/us-prices"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-sage-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-ocean-800">Compare US Prices</div>
                        <div className="text-xs text-sage-600">Search procedure costs by hospital</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Facilities */}
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'text-gold-500' : ''}`}
              >
                Facilities
              </Link>
              <Link
                to="/why-zano"
                className={`nav-link ${isActive('/why-zano') ? 'text-gold-500' : ''}`}
              >
                Why Zano?
              </Link>
              <Link
                to="/action"
                className={`nav-link ${isActive('/action') ? 'text-gold-500' : ''}`}
              >
                Take Action
              </Link>
              <Link
                to="/hub"
                className={`nav-link ${isActive('/hub') ? 'text-gold-500' : ''}`}
              >
                Guide
              </Link>
              <Link
                to="/medical-trusts"
                className={`nav-link ${isActive('/medical-trusts') ? 'text-gold-500' : ''}`}
              >
                Trust Laws
              </Link>
              <Link
                to="/bounty"
                className={`nav-link flex items-center gap-1 ${isActive('/bounty') ? 'text-gold-500' : ''}`}
              >
                Bounty
                <span className="text-xs bg-gradient-to-r from-gold-500 to-gold-600 text-white px-1.5 py-0.5 rounded-full font-bold">$50</span>
              </Link>
              <Link to="/signup" className="btn-gold">
                Join
              </Link>
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-sage-200" aria-label="Mobile navigation">
              <div className="flex flex-col space-y-3">
                {/* Dashboard - FIRST */}
                <Link
                  to="/my-journey"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                    location.pathname.startsWith('/my-journey') ? 'bg-gold-100 text-gold-700' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Dashboard
                </Link>

                {/* US Prices Mobile */}
                <div className="border-t border-sage-100 pt-2">
                  <div className="px-4 py-1 text-xs font-bold text-ocean-600 uppercase tracking-wide">
                    US Prices
                  </div>
                  <Link
                    to="/price-comparison"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-ocean-700 hover:bg-sage-50 rounded-lg transition-colors ml-2"
                  >
                    Price Comparison
                  </Link>
                  <Link
                    to="/us-prices"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-ocean-700 hover:bg-sage-50 rounded-lg transition-colors ml-2"
                  >
                    Compare Prices
                  </Link>
                </div>

                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Facilities
                </Link>
                <Link
                  to="/why-zano"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/why-zano') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Why Zano?
                </Link>
                <Link
                  to="/action"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/action') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Take Action
                </Link>
                <Link
                  to="/hub"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/hub') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Guide
                </Link>
                <Link
                  to="/medical-trusts"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/medical-trusts') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  Trust Laws
                </Link>
                <Link
                  to="/bounty"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isActive('/bounty') ? 'bg-gold-100 text-gold-700 font-semibold' : 'text-ocean-700 hover:bg-sage-50'
                  }`}
                >
                  <span>Bounty</span>
                  <span className="text-xs bg-gradient-to-r from-gold-500 to-gold-600 text-white px-1.5 py-0.5 rounded-full font-bold">$50</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mx-4 mt-2 btn-gold text-center"
                >
                  Join
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default SiteHeader;
