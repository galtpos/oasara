import React, { useState, useEffect, useRef } from 'react';
import type { HospitalFilters, CaptureTier } from '../../types/hospital';
import {
  CAPTURE_TIER_CONFIG,
  US_STATES,
  HOSPITAL_TYPE_LABELS,
  OWNERSHIP_TYPE_LABELS,
} from '../../types/hospital';

interface USMapFiltersProps {
  filters: Partial<HospitalFilters>;
  onFiltersChange: (filters: Partial<HospitalFilters>) => void;
  availableStates?: string[];
  availableTypes?: string[];
  availableOwnership?: string[];
  hospitalCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const USMapFilters: React.FC<USMapFiltersProps> = ({
  filters,
  onFiltersChange,
  availableStates = [],
  availableTypes = [],
  availableOwnership = [],
  hospitalCount = 0,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tier: true,
    compliance: true,
    state: false,
    type: false,
    ownership: false,
  });

  // Refs to avoid stale closures in debounced effect
  const filtersRef = useRef(filters);
  const onFiltersChangeRef = useRef(onFiltersChange);

  useEffect(() => {
    filtersRef.current = filters;
    onFiltersChangeRef.current = onFiltersChange;
  }, [filters, onFiltersChange]);

  // Debounce search input - uses refs to avoid stale closures
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filtersRef.current.searchQuery) {
        onFiltersChangeRef.current({ ...filtersRef.current, searchQuery: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTierToggle = (tier: CaptureTier) => {
    const currentTiers = filters.captureTiers || [];
    const newTiers = currentTiers.includes(tier)
      ? currentTiers.filter((t) => t !== tier)
      : [...currentTiers, tier];
    onFiltersChange({ ...filters, captureTiers: newTiers });
  };

  const handleStateToggle = (state: string) => {
    const currentStates = filters.states || [];
    const newStates = currentStates.includes(state)
      ? currentStates.filter((s) => s !== state)
      : [...currentStates, state];
    onFiltersChange({ ...filters, states: newStates });
  };

  const handleTypeToggle = (type: string) => {
    const currentTypes = filters.hospitalTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onFiltersChange({ ...filters, hospitalTypes: newTypes });
  };

  const handleOwnershipToggle = (ownership: string) => {
    const currentOwnership = filters.ownershipTypes || [];
    const newOwnership = currentOwnership.includes(ownership)
      ? currentOwnership.filter((o) => o !== ownership)
      : [...currentOwnership, ownership];
    onFiltersChange({ ...filters, ownershipTypes: newOwnership });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    onFiltersChange({});
  };

  const hasActiveFilters =
    (filters.states?.length || 0) > 0 ||
    (filters.hospitalTypes?.length || 0) > 0 ||
    (filters.ownershipTypes?.length || 0) > 0 ||
    (filters.captureTiers?.length || 0) > 0 ||
    filters.emergencyServicesOnly ||
    filters.mrfPublishedOnly ||
    filters.searchQuery;

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="bg-white border-2 border-sage-200 rounded-lg p-3 hover:border-ocean-400 transition-colors shadow-md"
        aria-label="Expand filters"
      >
        <svg
          className="w-5 h-5 text-ocean-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-sage-200 rounded-lg w-72 max-h-[calc(100vh-200px)] overflow-y-auto shadow-lg">
      {/* Header */}
      <div className="sticky top-0 bg-white p-4 border-b border-sage-200 z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-ocean-700">Filters</h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-gold-600 hover:text-gold-700 font-medium"
              >
                Clear All
              </button>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 text-sage-500 hover:text-ocean-600"
                aria-label="Collapse filters"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search hospitals, cities, zip..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-sage-50 border border-sage-300 rounded-lg px-3 py-2 text-sm text-ocean-800 placeholder-sage-500 focus:outline-none focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sage-500 hover:text-ocean-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="text-xs text-sage-600 mt-2">
          <span className="font-bold text-ocean-700">{hospitalCount.toLocaleString()}</span> hospitals found
        </div>
      </div>

      {/* Filter Sections */}
      <div className="p-4 space-y-4">
        {/* Capture Tier */}
        <div className="border-b border-sage-200 pb-4">
          <button
            onClick={() => toggleSection('tier')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-ocean-700 text-sm">Transparency Tier</span>
            <svg
              className={`w-4 h-4 text-sage-500 transition-transform ${
                expandedSections.tier ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.tier && (
            <div className="mt-3 space-y-2">
              {(Object.keys(CAPTURE_TIER_CONFIG) as CaptureTier[]).map((tier) => {
                const config = CAPTURE_TIER_CONFIG[tier];
                const isActive = filters.captureTiers?.includes(tier);
                return (
                  <button
                    key={tier}
                    onClick={() => handleTierToggle(tier)}
                    className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-ocean-50 text-ocean-700 border border-ocean-200'
                        : 'text-sage-600 hover:text-ocean-700 hover:bg-sage-50'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Compliance */}
        <div className="border-b border-sage-200 pb-4">
          <button
            onClick={() => toggleSection('compliance')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-ocean-700 text-sm">Compliance</span>
            <svg
              className={`w-4 h-4 text-sage-500 transition-transform ${
                expandedSections.compliance ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.compliance && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.mrfPublishedOnly || false}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, mrfPublishedOnly: e.target.checked })
                  }
                  className="rounded bg-sage-50 border-sage-300 text-ocean-600 focus:ring-ocean-500"
                />
                <span className="text-sage-700">Price File Published</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.emergencyServicesOnly || false}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, emergencyServicesOnly: e.target.checked })
                  }
                  className="rounded bg-sage-50 border-sage-300 text-ocean-600 focus:ring-ocean-500"
                />
                <span className="text-sage-700">Emergency Services</span>
              </label>
            </div>
          )}
        </div>

        {/* State */}
        <div className="border-b border-sage-200 pb-4">
          <button
            onClick={() => toggleSection('state')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-ocean-700 text-sm">
              State
              {(filters.states?.length || 0) > 0 && (
                <span className="ml-2 text-xs text-sage-500">
                  ({filters.states?.length} selected)
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-sage-500 transition-transform ${
                expandedSections.state ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.state && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
              {(availableStates.length > 0 ? availableStates : Object.keys(US_STATES))
                .sort()
                .map((state) => {
                  const isActive = filters.states?.includes(state);
                  return (
                    <button
                      key={state}
                      onClick={() => handleStateToggle(state)}
                      className={`block w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                        isActive
                          ? 'bg-ocean-50 text-ocean-700'
                          : 'text-sage-600 hover:text-ocean-700 hover:bg-sage-50'
                      }`}
                    >
                      {state} - {US_STATES[state] || state}
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Hospital Type */}
        <div className="border-b border-sage-200 pb-4">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-ocean-700 text-sm">
              Hospital Type
              {(filters.hospitalTypes?.length || 0) > 0 && (
                <span className="ml-2 text-xs text-sage-500">
                  ({filters.hospitalTypes?.length} selected)
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-sage-500 transition-transform ${
                expandedSections.type ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.type && availableTypes.length > 0 && (
            <div className="mt-3 space-y-1">
              {availableTypes.map((type) => {
                const isActive = filters.hospitalTypes?.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`block w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-ocean-50 text-ocean-700'
                        : 'text-sage-600 hover:text-ocean-700 hover:bg-sage-50'
                    }`}
                  >
                    {HOSPITAL_TYPE_LABELS[type] || type}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ownership */}
        <div>
          <button
            onClick={() => toggleSection('ownership')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-ocean-700 text-sm">
              Ownership
              {(filters.ownershipTypes?.length || 0) > 0 && (
                <span className="ml-2 text-xs text-sage-500">
                  ({filters.ownershipTypes?.length} selected)
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-sage-500 transition-transform ${
                expandedSections.ownership ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.ownership && availableOwnership.length > 0 && (
            <div className="mt-3 space-y-1">
              {availableOwnership.map((ownership) => {
                const isActive = filters.ownershipTypes?.includes(ownership);
                return (
                  <button
                    key={ownership}
                    onClick={() => handleOwnershipToggle(ownership)}
                    className={`block w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-ocean-50 text-ocean-700'
                        : 'text-sage-600 hover:text-ocean-700 hover:bg-sage-50'
                    }`}
                  >
                    {OWNERSHIP_TYPE_LABELS[ownership] || ownership}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default USMapFilters;
