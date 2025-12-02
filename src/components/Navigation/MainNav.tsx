import React from 'react';

interface MainNavProps {
  currentView: 'map' | 'hub' | 'early-access';
  onViewChange: (view: 'map' | 'hub' | 'early-access') => void;
  facilitiesCount?: number;
  countriesCount?: number;
  zanoCount?: number;
}

const MainNav: React.FC<MainNavProps> = ({
  currentView,
  onViewChange,
  facilitiesCount = 518,
  countriesCount = 39,
  zanoCount = 0
}) => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-sage-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div>
            <div className="text-3xl font-display text-gold-600 font-bold">OASARA</div>
            <div className="text-sm text-ocean-600/70 mt-1">Your Oasis for Medical Sovereignty</div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewChange('early-access')}
              className={`
                px-6 py-2 rounded-lg font-bold transition-all duration-300
                ${currentView === 'early-access'
                  ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-white'
                  : 'text-ocean-600/70 hover:text-gold-600'
                }
              `}
            >
              Early Access
            </button>
            <button
              onClick={() => onViewChange('map')}
              className={`
                px-6 py-2 rounded-lg font-bold transition-all duration-300
                ${currentView === 'map'
                  ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-white'
                  : 'text-ocean-600/70 hover:text-gold-600'
                }
              `}
            >
              Search Facilities
            </button>
            <button
              onClick={() => onViewChange('hub')}
              className={`
                px-6 py-2 rounded-lg font-bold transition-all duration-300
                ${currentView === 'hub'
                  ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-white'
                  : 'text-ocean-600/70 hover:text-gold-600'
                }
              `}
            >
              Medical Tourism Guide
            </button>
          </div>

          {/* Stats - Only show in map view */}
          {currentView === 'map' && (
            <div className="hidden lg:flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-display text-gold-600 font-bold">{facilitiesCount}</p>
                <p className="text-ocean-600/60">Facilities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display text-gold-500 font-bold">{countriesCount}</p>
                <p className="text-ocean-600/60">Countries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display text-ocean-600 font-bold">{zanoCount}</p>
                <p className="text-ocean-600/60">Zano Ready</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
