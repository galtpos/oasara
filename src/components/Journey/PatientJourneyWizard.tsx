import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { searchProcedures, getCommonProcedures } from '../../data/procedures';

interface WizardData {
  procedure_type: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: 'urgent' | 'soon' | 'flexible' | null;
  concerns: string[];
  priority_factors: {
    price: number;
    reputation: number;
    wait_time: number;
    location: number;
  };
}

interface PatientJourneyWizardProps {
  onComplete: (journeyId: string) => void;
}

const PatientJourneyWizard: React.FC<PatientJourneyWizardProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>({
    procedure_type: '',
    budget_min: null,
    budget_max: null,
    timeline: null,
    concerns: [],
    priority_factors: {
      price: 3,
      reputation: 3,
      wait_time: 3,
      location: 3
    }
  });

  // Get common procedures and search results
  const commonProcedures = useMemo(() => getCommonProcedures(), []);

  // Search results based on input
  const searchResults = useMemo(() => {
    if (!wizardData.procedure_type || wizardData.procedure_type.length < 2) {
      return commonProcedures;
    }
    return searchProcedures(wizardData.procedure_type).slice(0, 12);
  }, [wizardData.procedure_type, commonProcedures]);

  const handleProcedureChange = (value: string) => {
    setWizardData({ ...wizardData, procedure_type: value });
  };

  const handleBudgetChange = (min: number | null, max: number | null) => {
    setWizardData({ ...wizardData, budget_min: min, budget_max: max });
  };

  const handleTimelineChange = (timeline: 'urgent' | 'soon' | 'flexible') => {
    setWizardData({ ...wizardData, timeline });
  };

  const handleConcernsToggle = (concern: string) => {
    const newConcerns = wizardData.concerns.includes(concern)
      ? wizardData.concerns.filter(c => c !== concern)
      : [...wizardData.concerns, concern];
    setWizardData({ ...wizardData, concerns: newConcerns });
  };

  const handlePriorityChange = (factor: keyof WizardData['priority_factors'], value: number) => {
    setWizardData({
      ...wizardData,
      priority_factors: {
        ...wizardData.priority_factors,
        [factor]: value
      }
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login
        navigate('/login?redirect=/my-journey');
        return;
      }

      // Create journey in database
      const { data, error } = await supabase
        .from('patient_journeys')
        .insert({
          user_id: user.id,
          procedure_type: wizardData.procedure_type,
          budget_min: wizardData.budget_min,
          budget_max: wizardData.budget_max,
          timeline: wizardData.timeline,
          concerns: wizardData.concerns,
          priority_factors: wizardData.priority_factors,
          wizard_responses: wizardData,
          status: 'researching'
        })
        .select()
        .single();

      if (error) throw error;

      // Call onComplete callback
      onComplete(data.id);
    } catch (error) {
      console.error('Error creating journey:', error);
      alert('Failed to create journey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return wizardData.procedure_type.length >= 3;
    if (step === 2) return wizardData.budget_min !== null && wizardData.budget_max !== null;
    if (step === 3) return wizardData.timeline !== null;
    return false;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ocean-700">Step {step} of 3</span>
          <span className="text-sm text-ocean-600">{Math.round((step / 3) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-sage-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-ocean-500 to-ocean-600"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Procedure Type */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-3xl font-display text-ocean-800 mb-3">
              What brings you here today?
            </h2>
            <p className="text-ocean-600 mb-6">
              You're taking an important step toward better health. Let's find care that's right for you—quality treatment you can trust and afford.
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={wizardData.procedure_type}
                onChange={(e) => handleProcedureChange(e.target.value)}
                placeholder="Type your procedure (e.g., Hip Replacement)"
                className="w-full px-4 py-3 border-2 border-sage-200 rounded-xl focus:border-ocean-500 focus:outline-none text-lg"
                autoFocus
              />

              {/* Procedure suggestions (live search or common procedures) */}
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((proc) => (
                  <button
                    key={proc.name}
                    onClick={() => handleProcedureChange(proc.name)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      wizardData.procedure_type === proc.name
                        ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                        : 'border-sage-200 hover:border-ocean-300 text-ocean-600'
                    }`}
                  >
                    <div className="font-semibold">{proc.name}</div>
                    <div className="text-xs opacity-70 mt-0.5">{proc.category}</div>
                  </button>
                ))}
              </div>
              {searchResults.length === 0 && wizardData.procedure_type.length >= 2 && (
                <div className="text-center py-4 text-ocean-600">
                  <p>Don't see what you're looking for? That's okay—just type in your procedure and we'll help you find options.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  canProceed()
                    ? 'bg-ocean-600 text-white hover:bg-ocean-700'
                    : 'bg-sage-200 text-sage-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-3xl font-display text-ocean-800 mb-3">
              Let's talk about budget
            </h2>
            <p className="text-ocean-600 mb-6">
              Healthcare costs can be overwhelming. Together, we'll find excellent facilities within your budget—no compromises on quality.
            </p>

            <div className="space-y-6">
              {/* Budget presets */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleBudgetChange(0, 10000)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    wizardData.budget_min === 0 && wizardData.budget_max === 10000
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-sage-200 hover:border-ocean-300'
                  }`}
                >
                  <div className="text-lg font-semibold text-ocean-700">Under $10k</div>
                  <div className="text-sm text-ocean-600">Budget-friendly</div>
                </button>
                <button
                  onClick={() => handleBudgetChange(10000, 25000)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    wizardData.budget_min === 10000 && wizardData.budget_max === 25000
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-sage-200 hover:border-ocean-300'
                  }`}
                >
                  <div className="text-lg font-semibold text-ocean-700">$10k - $25k</div>
                  <div className="text-sm text-ocean-600">Most common</div>
                </button>
                <button
                  onClick={() => handleBudgetChange(25000, 50000)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    wizardData.budget_min === 25000 && wizardData.budget_max === 50000
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-sage-200 hover:border-ocean-300'
                  }`}
                >
                  <div className="text-lg font-semibold text-ocean-700">$25k - $50k</div>
                  <div className="text-sm text-ocean-600">Premium care</div>
                </button>
              </div>

              {/* Custom range */}
              <div className="pt-4 border-t border-sage-200">
                <label className="block text-sm font-medium text-ocean-700 mb-3">
                  Or enter a custom range:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-ocean-600 mb-1">Minimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-ocean-500">$</span>
                      <input
                        type="number"
                        value={wizardData.budget_min || ''}
                        onChange={(e) => handleBudgetChange(Number(e.target.value), wizardData.budget_max)}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-3 border-2 border-sage-200 rounded-xl focus:border-ocean-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-ocean-600 mb-1">Maximum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-ocean-500">$</span>
                      <input
                        type="number"
                        value={wizardData.budget_max || ''}
                        onChange={(e) => handleBudgetChange(wizardData.budget_min, Number(e.target.value))}
                        placeholder="50000"
                        className="w-full pl-8 pr-4 py-3 border-2 border-sage-200 rounded-xl focus:border-ocean-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-8 py-3 rounded-xl font-semibold text-ocean-600 hover:bg-sage-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  canProceed()
                    ? 'bg-ocean-600 text-white hover:bg-ocean-700'
                    : 'bg-sage-200 text-sage-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Timeline */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-3xl font-display text-ocean-800 mb-3">
              What's your timeline?
            </h2>
            <p className="text-ocean-600 mb-6">
              Whether you need care urgently or you're planning ahead, we'll match you with facilities that can accommodate your needs.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleTimelineChange('urgent')}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  wizardData.timeline === 'urgent'
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-sage-200 hover:border-ocean-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-ocean-800">Urgent (within 2 weeks)</div>
                    <div className="text-sm text-ocean-600">I need care quickly—we're here to help you find it</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTimelineChange('soon')}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  wizardData.timeline === 'soon'
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-sage-200 hover:border-ocean-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-ocean-800">Soon (1-3 months)</div>
                    <div className="text-sm text-ocean-600">I'm ready to move forward in the coming months</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTimelineChange('flexible')}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  wizardData.timeline === 'flexible'
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-sage-200 hover:border-ocean-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-ocean-800">Flexible (3+ months)</div>
                    <div className="text-sm text-ocean-600">I'm taking my time to find the perfect fit</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-8 py-3 rounded-xl font-semibold text-ocean-600 hover:bg-sage-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  canProceed() && !isSubmitting
                    ? 'bg-ocean-600 text-white hover:bg-ocean-700'
                    : 'bg-sage-200 text-sage-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Getting Everything Ready...' : 'Let\'s Find Your Care'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientJourneyWizard;
