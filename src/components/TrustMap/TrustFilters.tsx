import React, { useState } from 'react';
import { CriteriaKey, CRITERIA_LABELS } from '../../types/trustLaws';

interface TrustFiltersProps {
  selectedCriteria: CriteriaKey[];
  onCriteriaChange: (criteria: CriteriaKey[]) => void;
}

const TrustFilters: React.FC<TrustFiltersProps> = ({
  selectedCriteria,
  onCriteriaChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const allCriteria = Object.keys(CRITERIA_LABELS) as CriteriaKey[];

  const handleToggleCriterion = (criterion: CriteriaKey) => {
    if (selectedCriteria.includes(criterion)) {
      onCriteriaChange(selectedCriteria.filter(c => c !== criterion));
    } else {
      onCriteriaChange([...selectedCriteria, criterion]);
    }
  };

  const handleSelectAll = () => {
    onCriteriaChange(allCriteria);
  };

  const handleClearAll = () => {
    onCriteriaChange([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-600 to-teal-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-white font-semibold">Filter by Criteria</h3>
          {selectedCriteria.length > 0 && (
            <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {selectedCriteria.length} selected
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-white/80 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Filter options */}
      {isExpanded && (
        <div className="p-5">
          {/* Quick actions */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <button
              onClick={handleSelectAll}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear All
            </button>
            {selectedCriteria.length === 0 && (
              <span className="text-xs text-gray-400 ml-2">
                (Showing overall scores)
              </span>
            )}
          </div>

          {/* Criteria checkboxes */}
          <div className="space-y-2">
            {allCriteria.map((criterion) => {
              const { label, description } = CRITERIA_LABELS[criterion];
              const isSelected = selectedCriteria.includes(criterion);
              
              return (
                <label
                  key={criterion}
                  className={`
                    flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150
                    ${isSelected 
                      ? 'bg-teal-50 border-2 border-teal-200' 
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex-shrink-0 pt-0.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCriterion(criterion)}
                      className="sr-only"
                    />
                    <div
                      className={`
                        w-5 h-5 rounded-md flex items-center justify-center transition-colors
                        ${isSelected 
                          ? 'bg-teal-600' 
                          : 'bg-white border-2 border-gray-300'
                        }
                      `}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-teal-900' : 'text-gray-700'}`}>
                      {label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-teal-700/70' : 'text-gray-500'}`}>
                      {description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Info text */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Select criteria to see weighted scores for those factors. 
                Map colors will update to reflect the average of selected criteria scores.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustFilters;

