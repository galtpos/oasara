import React, { useState } from 'react';


interface SpecialtyFilterProps {
  specialties: string[];
  selectedSpecialties: string[];
  onSpecialtyToggle: (specialty: string) => void;
  onClearAll: () => void;
}

const SpecialtyFilter: React.FC<SpecialtyFilterProps> = ({
  specialties,
  selectedSpecialties,
  onSpecialtyToggle,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border-2 border-sage-200 hover:border-ocean-400 px-6 py-3 rounded-lg flex items-center gap-2 text-base font-semibold text-ocean-600 transition-all"
      >
        <span>
          Specialty {selectedSpecialties.length > 0 && `(${selectedSpecialties.length})`}
        </span>
        <span className={`text-ocean-400 transition-transform inline-block ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>


        {isOpen && (
          <div
            className="absolute top-full mt-2 left-0 z-50 w-72 bg-white rounded-lg p-5 shadow-xl border-2 border-sage-200 transition-all duration-200 ease-in-out"
            style={{animation: 'fadeSlideDown 0.2s ease-in-out'}}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-ocean-600 text-lg">Select Specialties</h3>
              {selectedSpecialties.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-gold-600 hover:text-gold-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Specialty List */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {specialties.map((specialty) => {
                const isSelected = selectedSpecialties.includes(specialty);
                return (
                  <button
                    key={specialty}
                    onClick={() => onSpecialtyToggle(specialty)}
                    className={`
                      w-full px-4 py-3 rounded-lg text-left text-base transition-all font-medium
                      ${isSelected
                        ? 'bg-gold-500 text-white'
                        : 'bg-sage-50 text-ocean-600 hover:bg-sage-100 border border-sage-200'
                      }
                    `}
                  >
                    {specialty}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      

      {/* Backdrop - lower z-index to not block facility cards */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default SpecialtyFilter;
