import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SiteHeader: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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

            {/* Navigation */}
            <nav className="flex items-center gap-8" aria-label="Main navigation">
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
              <Link to="/early-access" className="btn-gold">
                Join
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default SiteHeader;
