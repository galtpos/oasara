import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WhyLeaveTab from '../components/Hub/WhyLeaveTab';
import TreatmentGuidesTab from '../components/Hub/TreatmentGuidesTab';
import DestinationsTab from '../components/Hub/DestinationsTab';
import PlanningToolsTab from '../components/Hub/PlanningToolsTab';
import SuccessMetricsTab from '../components/Hub/SuccessMetricsTab';

const MedicalTourismHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [americansFled, setAmericansFled] = useState(2100000);
  const [bankruptciesToday, setBankruptciesToday] = useState(0);

  // Live counter for Americans who fled this year
  useEffect(() => {
    const interval = setInterval(() => {
      setAmericansFled(prev => prev + 1);
    }, 15000); // Increment every 15 seconds (2.1M / year)
    return () => clearInterval(interval);
  }, []);

  // Daily bankruptcy counter
  useEffect(() => {
    const interval = setInterval(() => {
      setBankruptciesToday(prev => prev + 1);
    }, 59500); // Increment every ~60 seconds (1,452 per day)
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 0, label: 'WHY LEAVE', subtitle: 'The Medical Exodus Explained', component: WhyLeaveTab },
    { id: 1, label: 'TREATMENT GUIDES', subtitle: 'Complete Procedure Intelligence', component: TreatmentGuidesTab },
    { id: 2, label: 'DESTINATIONS', subtitle: 'Complete Country Intelligence', component: DestinationsTab },
    { id: 3, label: 'PLANNING TOOLS', subtitle: 'Your Complete Toolkit', component: PlanningToolsTab },
    { id: 4, label: 'SUCCESS METRICS', subtitle: 'Real Data, Verified Sources', component: SuccessMetricsTab },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Live Statistics Header */}
      <div className="bg-gradient-to-r from-[#D97925] via-[#D4AF37] to-[#C17754] py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs md:text-sm text-white/90 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">{americansFled.toLocaleString()}</span>
            <span>Americans Fled This Year</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold">$100B</span>
            <span>Global Industry</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold">518</span>
            <span>Verified Facilities</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold">39</span>
            <span>Countries</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold">Zano Payments</span>
            <span className="text-[#FFF8F0]">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#0B697A]/20 to-transparent py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-[#D4AF37] mb-4">
            Medical Tourism Intelligence Center
          </h1>
          <p className="text-xl md:text-2xl text-[#FFF8F0]/80 mb-6">
            Your Oasis for Medical Sovereignty
          </p>
          <div className="text-[#D97925] text-lg">
            <span className="font-bold">{bankruptciesToday}</span> families filed for medical bankruptcy today
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-4 text-left transition-all duration-300 flex-shrink-0
                  ${activeTab === tab.id
                    ? 'text-[#D4AF37]'
                    : 'text-[#FFF8F0]/60 hover:text-[#D4AF37]/80'
                  }
                `}
              >
                <div className="text-sm md:text-base font-bold">{tab.label}</div>
                <div className="text-xs text-[#FFF8F0]/50 mt-1">{tab.subtitle}</div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D97925] to-[#D4AF37]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ActiveComponent />
        </motion.div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#D97925] to-[#D4AF37] text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold"
          onClick={() => window.location.href = '/'}
        >
          Search Facilities
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#0B697A] text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold"
        >
          Calculate Savings
        </motion.button>
      </div>

      {/* Trust Badges */}
      <div className="bg-[#0B697A]/10 border-t border-[#D4AF37]/20 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="text-[#FFF8F0]/80">
              <div className="text-[#D4AF37] font-bold">JCI Verified</div>
              <div className="text-xs">518 Facilities</div>
            </div>
            <div className="text-[#FFF8F0]/80">
              <div className="text-[#D4AF37] font-bold">Real Reviews</div>
              <div className="text-xs">From Actual Patients</div>
            </div>
            <div className="text-[#FFF8F0]/80">
              <div className="text-[#D4AF37] font-bold">Price Transparency</div>
              <div className="text-xs">No Hidden Fees</div>
            </div>
            <div className="text-[#FFF8F0]/80">
              <div className="text-[#D4AF37] font-bold">Escrow Protection</div>
              <div className="text-xs">With Zano (Soon)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-[#0A0A0A] border-t border-[#D4AF37]/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-xs text-[#FFF8F0]/50 text-center">
          <p className="mb-2">
            <strong className="text-[#D4AF37]">Medical Disclaimer:</strong> Medical tourism involves travel for medical procedures.
            While we verify facility credentials and compile patient experiences, medical outcomes vary by individual.
            Always consult with healthcare providers and thoroughly research facilities. OASARA provides information and
            booking services but is not a medical provider. International medical care carries different regulations than
            your home country. Travel insurance and careful planning are essential.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalTourismHub;
