import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface PostSelectionFlowProps {
  journeyId: string;
  procedureType: string;
  shortlistCount: number;
  onContactFacility?: (facilityId: string, message: string) => void;
}

type Step = 'medical_records' | 'quote' | 'travel_prep' | 'procedure' | 'recovery';

interface StepInfo {
  id: Step;
  title: string;
  description: string;
  details: string[];
  estimatedTime: string;
  nextAction?: string;
}

const STEPS: StepInfo[] = [
  {
    id: 'medical_records',
    title: 'Share Medical Records',
    description: 'Gather and share your medical history with the facility',
    details: [
      'Contact your current doctor to request your medical records',
      'You\'ll need: recent lab results, imaging (X-rays, MRIs), surgical history, current medications',
      'Most facilities accept digital copies via email or secure portal',
      'Allow 1-2 weeks for your doctor\'s office to prepare records'
    ],
    estimatedTime: '1-2 weeks',
    nextAction: 'Request records from your doctor'
  },
  {
    id: 'quote',
    title: 'Get Personalized Quote',
    description: 'Receive and compare quotes from facilities',
    details: [
      'Facility will review your medical records and provide a personalized quote',
      'Quote includes: procedure cost, hospital stay, anesthesia, post-op care',
      'Ask about: payment plans, cancellation policy, what\'s included vs. extra',
      'Compare quotes from multiple facilities before deciding'
    ],
    estimatedTime: '3-7 days after records received',
    nextAction: 'Review and compare quotes'
  },
  {
    id: 'travel_prep',
    title: 'Travel & Logistics',
    description: 'Prepare for travel including visas, insurance, and accommodations',
    details: [
      'Check passport validity (6+ months remaining)',
      'Apply for visa if required (tourist visa usually sufficient)',
      'Book flights with flexible dates (procedure may shift)',
      'Arrange medical tourism insurance (covers complications)',
      'Plan for travel companion if recommended for your procedure',
      'Pack: comfortable clothes, medications list, medical records copies'
    ],
    estimatedTime: '2-4 weeks before travel',
    nextAction: 'Start visa application and book flights'
  },
  {
    id: 'procedure',
    title: 'Procedure & Hospital Stay',
    description: 'Undergo the procedure and initial recovery',
    details: [
      'Arrive 1-2 days early for pre-op consultations',
      'Meet your surgeon and medical team',
      'Final pre-op tests and clearance',
      'Procedure day: follow fasting instructions',
      'Post-op: hospital stay duration varies by procedure',
      'Hospital staff will provide recovery instructions'
    ],
    estimatedTime: 'Varies by procedure (1-7 days hospital stay)',
    nextAction: 'Follow pre-op instructions from facility'
  },
  {
    id: 'recovery',
    title: 'Recovery & Follow-up',
    description: 'Complete recovery and ongoing follow-up care',
    details: [
      'Initial recovery: stay in destination country (usually 1-2 weeks)',
      'Follow-up appointments with surgeon before returning home',
      'Get medical clearance for travel (usually 1-2 weeks post-op)',
      'Return home: continue recovery with local doctor',
      'Facility provides remote follow-up support',
      'Keep all medical records and receipts for insurance/tax purposes'
    ],
    estimatedTime: '1-2 weeks in destination, ongoing at home',
    nextAction: 'Schedule follow-up with local doctor'
  }
];

const PostSelectionFlow: React.FC<PostSelectionFlowProps> = ({
  journeyId,
  procedureType,
  shortlistCount,
  onContactFacility
}) => {
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  // Load saved progress
  React.useEffect(() => {
    const loadProgress = async () => {
      const { data } = await supabase
        .from('journey_notes')
        .select('note_text')
        .eq('journey_id', journeyId)
        .eq('note_type', 'progress')
        .single();

      if (data?.note_text) {
        try {
          const progress = JSON.parse(data.note_text);
          if (progress.currentStep) setCurrentStep(progress.currentStep);
          if (progress.completedSteps) setCompletedSteps(new Set(progress.completedSteps));
        } catch (e) {
          // Ignore parse errors
        }
      }
    };
    loadProgress();
  }, [journeyId]);

  const saveProgress = async (step: Step | null, completed: Set<Step>) => {
    await supabase
      .from('journey_notes')
      .upsert({
        journey_id: journeyId,
        note_type: 'progress',
        note_text: JSON.stringify({ currentStep: step, completedSteps: Array.from(completed) }),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'journey_id,note_type'
      });
  };

  const handleStepClick = (step: Step) => {
    setCurrentStep(currentStep === step ? null : step);
    saveProgress(currentStep === step ? null : step, completedSteps);
  };

  const handleStepComplete = (step: Step) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(step);
    setCompletedSteps(newCompleted);
    saveProgress(currentStep, newCompleted);
  };

  if (shortlistCount === 0) {
    return null; // Don't show until facilities are shortlisted
  }

  return (
    <div className="bg-white rounded-xl border border-sage-200 p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-ocean-800 mb-2">
          What Happens Next
        </h3>
        <p className="text-sm text-ocean-600">
          You've shortlisted {shortlistCount} {shortlistCount === 1 ? 'facility' : 'facilities'} for {procedureType}. 
          Here's your roadmap to getting care:
        </p>
      </div>

      {/* Progressive Roadmap */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isExpanded = currentStep === step.id;
          const isCompleted = completedSteps.has(step.id);
          const isActive = index === 0 || completedSteps.has(STEPS[index - 1].id as Step);

          return (
            <div
              key={step.id}
              className={`border rounded-lg transition-all ${
                isExpanded
                  ? 'border-ocean-400 bg-ocean-50'
                  : isCompleted
                  ? 'border-green-300 bg-green-50'
                  : isActive
                  ? 'border-sage-300 bg-sage-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <button
                onClick={() => isActive && handleStepClick(step.id)}
                disabled={!isActive}
                className={`w-full text-left p-4 flex items-center justify-between ${
                  !isActive ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-80'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Step Number */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-ocean-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-ocean-800">{step.title}</h4>
                      {isCompleted && (
                        <span className="text-xs text-green-600 font-medium">Completed</span>
                      )}
                    </div>
                    <p className="text-xs text-ocean-600 mt-0.5">
                      {step.estimatedTime}
                    </p>
                  </div>
                </div>

                {/* Expand/Collapse Icon */}
                {isActive && (
                  <svg
                    className={`w-5 h-5 text-ocean-600 transition-transform ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-ocean-200">
                      <ul className="space-y-2 mb-4">
                        {step.details.map((detail, i) => (
                          <li key={i} className="text-sm text-ocean-700 flex items-start gap-2">
                            <span className="text-ocean-400 mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>

                      {step.nextAction && (
                        <div className="flex items-center justify-between pt-3 border-t border-ocean-200">
                          <span className="text-sm font-medium text-ocean-800">
                            Next: {step.nextAction}
                          </span>
                          <button
                            onClick={() => handleStepComplete(step.id)}
                            className="px-3 py-1.5 text-sm bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      {shortlistCount > 0 && (
        <div className="mt-6 p-4 bg-gold-50 border border-gold-200 rounded-lg">
          <p className="text-sm text-ocean-800 mb-2">
            <strong>Ready to reach out?</strong> I can help you draft a message to contact your shortlisted facilities.
          </p>
          <button
            onClick={() => onContactFacility?.('', '')}
            className="text-sm text-ocean-700 hover:text-ocean-900 underline font-medium"
          >
            Generate contact message →
          </button>
        </div>
      )}
    </div>
  );
};

export default PostSelectionFlow;

