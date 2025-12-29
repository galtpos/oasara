import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Guide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'my-journey', label: 'My Journey', icon: '🗺️' },
    { id: 'facilities', label: 'Finding Facilities', icon: '🏥' },
    { id: 'comparison', label: 'Comparing Options', icon: '📊' },
    { id: 'notes', label: 'Taking Notes', icon: '📝' },
    { id: 'trust', label: 'Trust & Safety', icon: '🛡️' },
    { id: 'faq', label: 'FAQ', icon: '❓' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sage-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-display text-2xl text-ocean-700">
              OASARA
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/my-journey"
                className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm font-medium"
              >
                Start My Journey
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-display text-ocean-800 mb-4">Guide Sections</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-ocean-100 text-ocean-700 font-semibold'
                        : 'text-ocean-600 hover:bg-sage-50'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              {/* Getting Started */}
              {activeSection === 'getting-started' && (
                <div className="space-y-6">
                  <h1 className="text-4xl font-display text-ocean-800 mb-4">
                    Welcome to Oasara
                  </h1>
                  <p className="text-lg text-ocean-700">
                    Your guide to affordable, high-quality medical care around the world.
                  </p>

                  <div className="border-l-4 border-ocean-500 bg-ocean-50 p-6 rounded-r-xl">
                    <h3 className="text-xl font-semibold text-ocean-800 mb-2">
                      What is Medical Tourism?
                    </h3>
                    <p className="text-ocean-700">
                      Medical tourism means traveling to another country for medical care. People do this to save money (often 50-80% less than US prices), avoid long wait times, or access treatments not available at home.
                    </p>
                  </div>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    How Oasara Works
                  </h2>

                  <div className="grid gap-4">
                    <div className="flex gap-4 p-4 bg-sage-50 rounded-xl">
                      <div className="flex-shrink-0 w-12 h-12 bg-ocean-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">Start Your Journey</h3>
                        <p className="text-ocean-600">
                          Answer 3 simple questions: What procedure? What's your budget? When do you need it?
                        </p>
                        <Link to="/my-journey" className="text-ocean-600 hover:text-ocean-800 font-medium mt-2 inline-block">
                          Start Now →
                        </Link>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-sage-50 rounded-xl">
                      <div className="flex-shrink-0 w-12 h-12 bg-ocean-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">Browse Facilities</h3>
                        <p className="text-ocean-600">
                          Search through 1,000+ JCI-accredited hospitals and clinics worldwide. See real prices, wait times, and reviews.
                        </p>
                        <Link to="/hub" className="text-ocean-600 hover:text-ocean-800 font-medium mt-2 inline-block">
                          Browse Facilities →
                        </Link>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-sage-50 rounded-xl">
                      <div className="flex-shrink-0 w-12 h-12 bg-ocean-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">Compare & Decide</h3>
                        <p className="text-ocean-600">
                          Add facilities to your shortlist and compare them side-by-side. Save notes, ask questions, and make an informed decision.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-sage-50 rounded-xl">
                      <div className="flex-shrink-0 w-12 h-12 bg-ocean-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">Contact & Book</h3>
                        <p className="text-ocean-600">
                          Reach out to facilities directly through Oasara. Get quotes, ask questions, and book your procedure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* My Journey */}
              {activeSection === 'my-journey' && (
                <div className="space-y-6">
                  <h1 className="text-4xl font-display text-ocean-800 mb-4">
                    Using "My Journey"
                  </h1>
                  <p className="text-lg text-ocean-700">
                    Your personal medical tourism planner.
                  </p>

                  <div className="border-l-4 border-ocean-500 bg-ocean-50 p-6 rounded-r-xl">
                    <h3 className="text-xl font-semibold text-ocean-800 mb-2">
                      What is My Journey?
                    </h3>
                    <p className="text-ocean-700">
                      My Journey is your personal workspace where you organize research, compare facilities, and track your medical tourism process from start to finish.
                    </p>
                  </div>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    The 3-Question Wizard
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-sage-50 rounded-xl">
                      <h3 className="font-semibold text-ocean-800 mb-2">Question 1: What procedure?</h3>
                      <p className="text-ocean-600 mb-3">
                        Tell us what medical procedure you're researching. You can type anything or pick from common procedures like:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm">Hip Replacement</span>
                        <span className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm">Knee Replacement</span>
                        <span className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm">Dental Implants</span>
                        <span className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm">Cardiac Surgery</span>
                        <span className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm">IVF Treatment</span>
                      </div>
                    </div>

                    <div className="p-4 bg-sage-50 rounded-xl">
                      <h3 className="font-semibold text-ocean-800 mb-2">Question 2: What's your budget?</h3>
                      <p className="text-ocean-600 mb-3">
                        Choose a price range or enter your own:
                      </p>
                      <ul className="space-y-2 text-ocean-700">
                        <li>• <strong>Under $10k</strong> - Budget-friendly options</li>
                        <li>• <strong>$10k-$25k</strong> - Most common range</li>
                        <li>• <strong>$25k-$50k</strong> - Premium care</li>
                        <li>• <strong>Custom</strong> - Enter your own range</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-sage-50 rounded-xl">
                      <h3 className="font-semibold text-ocean-800 mb-2">Question 3: When do you need treatment?</h3>
                      <p className="text-ocean-600 mb-3">
                        Your timeline helps us prioritize facilities:
                      </p>
                      <ul className="space-y-2 text-ocean-700">
                        <li>• <strong>Urgent (within 2 weeks)</strong> - We'll show facilities with immediate availability</li>
                        <li>• <strong>Soon (1-3 months)</strong> - Planning in the near future</li>
                        <li>• <strong>Flexible (3+ months)</strong> - Researching with no rush</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                    <h3 className="font-semibold text-green-800 mb-2">✅ After the Wizard</h3>
                    <p className="text-green-700">
                      Once you answer these 3 questions, you'll see your personal dashboard with:
                    </p>
                    <ul className="mt-3 space-y-1 text-green-700">
                      <li>• A comparison table for facilities you save</li>
                      <li>• Your personal shortlist</li>
                      <li>• A notes section for research and questions</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Finding Facilities */}
              {activeSection === 'facilities' && (
                <div className="space-y-6">
                  <h1 className="text-4xl font-display text-ocean-800 mb-4">
                    Finding Facilities
                  </h1>

                  <p className="text-lg text-ocean-700">
                    Oasara has 1,000+ medical facilities worldwide. Here's how to find the right one for you.
                  </p>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    Browse All Facilities
                  </h2>

                  <div className="p-4 bg-sage-50 rounded-xl">
                    <p className="text-ocean-600 mb-3">
                      Visit the <Link to="/hub" className="text-ocean-600 font-semibold underline">Medical Tourism Hub</Link> to see all facilities. You can:
                    </p>
                    <ul className="space-y-2 text-ocean-700">
                      <li>• Filter by country (Thailand, India, Turkey, Mexico, etc.)</li>
                      <li>• Filter by specialty (Orthopedics, Cardiac, Dental, etc.)</li>
                      <li>• Sort by price, rating, or distance</li>
                      <li>• Search by facility name</li>
                    </ul>
                  </div>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    What to Look For
                  </h2>

                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 border-2 border-green-200 bg-green-50 rounded-xl">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800 mb-2">JCI Accreditation</h3>
                        <p className="text-green-700">
                          JCI (Joint Commission International) is the gold standard for hospital quality. Look for the green "JCI Accredited" badge on facility cards.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 border-2 border-blue-200 bg-blue-50 rounded-xl">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-800 mb-2">Patient Reviews</h3>
                        <p className="text-blue-700">
                          Check Google ratings and patient testimonials. Look for 4+ stars with many reviews.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 border-2 border-purple-200 bg-purple-50 rounded-xl">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-800 mb-2">Clear Pricing</h3>
                        <p className="text-purple-700">
                          Good facilities show upfront pricing. If prices aren't listed, contact them directly for a quote.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <h3 className="font-semibold text-yellow-800 mb-2">💡 Pro Tip</h3>
                    <p className="text-yellow-700">
                      Add 3-5 facilities to your shortlist before comparing. This gives you enough options without feeling overwhelming.
                    </p>
                  </div>
                </div>
              )}

              {/* Comparing Options */}
              {activeSection === 'comparison' && (
                <div className="space-y-6">
                  <h1 className="text-4xl font-display text-ocean-800 mb-4">
                    Comparing Your Options
                  </h1>

                  <p className="text-lg text-ocean-700">
                    Once you've added facilities to your shortlist, comparing them side-by-side is easy.
                  </p>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    The Comparison Table
                  </h2>

                  <p className="text-ocean-600 mb-4">
                    Your comparison table shows all your shortlisted facilities in one view. Here's what you'll see:
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-3 p-4 bg-sage-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-ocean-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <div>
                        <h4 className="font-semibold text-ocean-800">Location</h4>
                        <p className="text-ocean-600 text-sm">City and country for each facility</p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-4 bg-sage-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-ocean-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <div>
                        <h4 className="font-semibold text-ocean-800">Accreditation</h4>
                        <p className="text-ocean-600 text-sm">JCI accreditation status (green checkmark = accredited)</p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-4 bg-sage-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-ocean-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <div>
                        <h4 className="font-semibold text-ocean-800">Patient Rating</h4>
                        <p className="text-ocean-600 text-sm">Google reviews with star ratings</p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-4 bg-sage-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-ocean-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                      <div>
                        <h4 className="font-semibold text-ocean-800">Your Rating</h4>
                        <p className="text-ocean-600 text-sm">Add your own rating (1-5 hearts) as you research</p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-4 bg-sage-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-ocean-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                      <div>
                        <h4 className="font-semibold text-ocean-800">Your Notes</h4>
                        <p className="text-ocean-600 text-sm">Quick notes you've saved about each facility</p>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    Adding/Removing Facilities
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <h3 className="font-semibold text-green-800 mb-2">To Add a Facility:</h3>
                      <ol className="list-decimal list-inside space-y-1 text-green-700">
                        <li>Browse facilities at the <Link to="/hub" className="underline font-semibold">Medical Tourism Hub</Link></li>
                        <li>Click on a facility to see details</li>
                        <li>Click "Add to Journey" button</li>
                        <li>It automatically appears in your comparison table</li>
                      </ol>
                    </div>

                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <h3 className="font-semibold text-red-800 mb-2">To Remove a Facility:</h3>
                      <ol className="list-decimal list-inside space-y-1 text-red-700">
                        <li>Go to "My Shortlist" tab in your journey</li>
                        <li>Click the trash icon next to any facility</li>
                        <li>It's removed from both the shortlist and comparison table</li>
                      </ol>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <h3 className="font-semibold text-blue-800 mb-2">📊 Best Practices</h3>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Compare at least 3 facilities to see real differences</li>
                      <li>• Don't compare more than 7 (gets overwhelming)</li>
                      <li>• Add your own ratings as you research to track favorites</li>
                      <li>• Use notes to remember key details about each facility</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Taking Notes */}
              {activeSection === 'notes' && (
                <div className="space-y-6">
                  <h1 className="text-4xl font-display text-ocean-800 mb-4">
                    Taking Notes
                  </h1>

                  <p className="text-lg text-ocean-700">
                    Your Notes section is where you organize research, track questions, and manage to-dos.
                  </p>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    5 Types of Notes
                  </h2>

                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-sage-50 border-l-4 border-sage-500 rounded-r-xl">
                      <div className="text-3xl">📝</div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">General Notes</h3>
                        <p className="text-ocean-600">
                          Use for any thoughts, observations, or information you want to remember.
                        </p>
                        <p className="text-sm text-ocean-500 italic mt-2">
                          Example: "Bangkok Hospital has an international patient coordinator who speaks English"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                      <div className="text-3xl">❓</div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">Questions</h3>
                        <p className="text-ocean-600">
                          Track questions you need to ask facilities or research further.
                        </p>
                        <p className="text-sm text-ocean-500 italic mt-2">
                          Example: "What's included in the $15,000 knee replacement price?"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl">
                      <div className="text-3xl">🔍</div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">Research Notes</h3>
                        <p className="text-ocean-600">
                          Save information you've found from websites, reviews, or other sources.
                        </p>
                        <p className="text-sm text-ocean-500 italic mt-2">
                          Example: "Found 200+ positive reviews on Google. Most mention short wait times."
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                      <div className="text-3xl">⚠️</div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">Concerns</h3>
                        <p className="text-ocean-600">
                          Flag worries or red flags you want to investigate.
                        </p>
                        <p className="text-sm text-ocean-500 italic mt-2">
                          Example: "Website says 1-week wait but reviews mention 3-week delays"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                      <div className="text-3xl">✅</div>
                      <div>
                        <h3 className="font-semibold text-ocean-800 mb-1">To-Do Items</h3>
                        <p className="text-ocean-600">
                          Create action items and check them off as you complete them.
                        </p>
                        <p className="text-sm text-ocean-500 italic mt-2">
                          Example: "Call Bangkok Hospital for quote" (click to mark complete)
                        </p>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    Managing Your Notes
                  </h2>

                  <div className="space-y-3">
                    <div className="p-4 bg-sage-50 rounded-xl">
                      <h3 className="font-semibold text-ocean-800 mb-2">Add a Note</h3>
                      <ol className="list-decimal list-inside space-y-1 text-ocean-600">
                        <li>Go to the "Notes" tab in My Journey</li>
                        <li>Select the note type (General, Question, Research, Concern, or To-Do)</li>
                        <li>Type your note</li>
                        <li>Click "Add Note"</li>
                      </ol>
                    </div>

                    <div className="p-4 bg-sage-50 rounded-xl">
                      <h3 className="font-semibold text-ocean-800 mb-2">Edit a Note</h3>
                      <p className="text-ocean-600">
                        Click the pencil icon next to any note to edit it. Save when done or cancel to keep the original.
                      </p>
                    </div>

                    <div className="p-4 bg-sage-50 rounded-xl">
                      <h3 className="font-semibold text-ocean-800 mb-2">Delete a Note</h3>
                      <p className="text-ocean-600">
                        Click the trash icon next to any note to delete it permanently.
                      </p>
                    </div>

                    <div className="p-4 bg-sage-50 rounded-xl">
                      <h3 className="font-semibold text-ocean-800 mb-2">Complete a To-Do</h3>
                      <p className="text-ocean-600">
                        Click the checkmark icon on any To-Do note to mark it as complete. It will show with a strikethrough.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                    <h3 className="font-semibold text-purple-800 mb-2">💡 Why Take Notes?</h3>
                    <p className="text-purple-700 mb-3">
                      Medical tourism decisions are complex. Notes help you:
                    </p>
                    <ul className="space-y-1 text-purple-700">
                      <li>• Remember details about each facility</li>
                      <li>• Track questions you need answered</li>
                      <li>• Flag concerns before making a decision</li>
                      <li>• Organize your to-do list</li>
                      <li>• Reduce anxiety by externalizing your thoughts</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Trust & Safety */}
              {activeSection === 'trust' && (
                <div className="space-y-6">
                  <h1 className="text-4xl font-display text-ocean-800 mb-4">
                    Trust & Safety
                  </h1>

                  <p className="text-lg text-ocean-700">
                    Your health and safety are our top priority. Here's how we ensure quality.
                  </p>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    What is JCI Accreditation?
                  </h2>

                  <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex gap-4 mb-4">
                      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <h3 className="text-xl font-semibold text-green-800 mb-2">
                          JCI = Gold Standard
                        </h3>
                        <p className="text-green-700">
                          Joint Commission International (JCI) is the world's leading accreditation for healthcare quality. JCI-accredited hospitals meet the same standards as top US hospitals.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-green-700">
                      <p className="font-semibold">What JCI accreditation means:</p>
                      <ul className="space-y-1 ml-4">
                        <li>✓ International safety protocols</li>
                        <li>✓ Board-certified doctors</li>
                        <li>✓ Modern equipment</li>
                        <li>✓ Rigorous infection control</li>
                        <li>✓ Regular quality audits</li>
                        <li>✓ English-speaking staff</li>
                      </ul>
                    </div>
                  </div>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    How We Vet Facilities
                  </h2>

                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-sage-50 rounded-xl">
                      <div className="text-3xl">✅</div>
                      <div>
                        <h3 className="font-semibold text-ocean-800">Accreditation Verification</h3>
                        <p className="text-ocean-600">
                          We verify JCI accreditation status directly with JCI. Every facility's accreditation is up-to-date.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-sage-50 rounded-xl">
                      <div className="text-3xl">⭐</div>
                      <div>
                        <h3 className="font-semibold text-ocean-800">Patient Reviews</h3>
                        <p className="text-ocean-600">
                          We show real Google reviews from actual patients. Look for 4+ stars with many reviews.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-sage-50 rounded-xl">
                      <div className="text-3xl">🔍</div>
                      <div>
                        <h3 className="font-semibold text-ocean-800">Manual Screening</h3>
                        <p className="text-ocean-600">
                          Our team researches each facility's history, specialties, and patient outcomes before listing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-display text-ocean-800 mt-8 mb-4">
                    Red Flags to Watch For
                  </h2>

                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                      <h3 className="font-semibold text-red-800 mb-1">⚠️ No Accreditation</h3>
                      <p className="text-red-700">
                        If a facility isn't JCI-accredited, ask why. Some excellent facilities aren't accredited yet, but understand the risks.
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                      <h3 className="font-semibold text-red-800 mb-1">⚠️ Hidden Pricing</h3>
                      <p className="text-red-700">
                        Be wary of facilities that won't provide pricing upfront. Good facilities are transparent about costs.
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                      <h3 className="font-semibold text-red-800 mb-1">⚠️ Pressure Tactics</h3>
                      <p className="text-red-700">
                        If a facility pressures you to book immediately or offers "today only" discounts, walk away.
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                      <h3 className="font-semibold text-red-800 mb-1">⚠️ Poor Communication</h3>
                      <p className="text-red-700">
                        If a facility is slow to respond or communication is unclear, this may indicate poor patient care.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <h3 className="font-semibold text-blue-800 mb-2">🛡️ Oasara's Promise</h3>
                    <p className="text-blue-700">
                      We only list facilities we'd trust with our own family. If you encounter any issues with a facility listed on Oasara, please <Link to="/feedback" className="underline font-semibold">report it</Link> immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeSection === 'faq' && (
                <div className="space-y-6">
                  <h1 className="text-4xl font-display text-ocean-800 mb-4">
                    Frequently Asked Questions
                  </h1>

                  <div className="space-y-4">
                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        Is medical tourism safe?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        Yes, when done right. JCI-accredited facilities meet international safety standards equivalent to top US hospitals. Millions of Americans travel for medical care each year. The key is choosing accredited facilities and doing your research.
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        How much can I really save?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        Most procedures cost 50-80% less than US prices. For example, a hip replacement that costs $45,000 in the US might cost $12,000 in Thailand—a savings of $33,000. Even with travel costs, you save tens of thousands.
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        What if something goes wrong?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        JCI-accredited facilities have the same complication rates as US hospitals. Most include follow-up care in the price. Ask facilities about their complication policy before booking. Some also offer medical travel insurance.
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        Will my insurance cover it?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        Most US insurance doesn't cover medical tourism. However, some newer plans do, especially for pre-approved procedures. Check with your insurer. Even without insurance, you'll likely save money vs. US prices.
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        How long do I need to stay?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        It varies by procedure. Most surgical procedures require 1-2 weeks total (pre-op + procedure + recovery). Dental work might only take 3-5 days. Check each facility's recommended timeline.
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        Do they speak English?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        JCI-accredited facilities serving international patients have English-speaking staff. Many have dedicated international patient coordinators who handle all communication in English.
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        Is Oasara free to use?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        Yes! Oasara is 100% free for patients. We make money through partnerships with facilities, but this never affects what we show you. Our recommendations are always unbiased.
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        Can I bring someone with me?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        Absolutely! Most medical tourists bring a family member or friend. Many facilities offer companion accommodations. Factor this into your budget (extra airfare + hotel).
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        What's included in the price?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        Most prices include the procedure, hospital stay, medications, and follow-up appointments. They usually DON'T include airfare, hotel, or transportation. Always ask facilities what's included before booking.
                      </p>
                    </details>

                    <details className="p-6 bg-sage-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-ocean-800 cursor-pointer">
                        How do I book a procedure?
                      </summary>
                      <p className="mt-3 text-ocean-600">
                        After choosing a facility through Oasara, contact them directly (we provide contact info). They'll request your medical records, give you a quote, and schedule your procedure. We're here to help if you have questions!
                      </p>
                    </details>
                  </div>

                  <div className="mt-8 p-6 bg-ocean-50 border-2 border-ocean-200 rounded-xl">
                    <h3 className="font-semibold text-ocean-800 mb-2">Still have questions?</h3>
                    <p className="text-ocean-700 mb-4">
                      We're here to help! Send us your question and we'll respond within 24 hours.
                    </p>
                    <Link
                      to="/feedback"
                      className="inline-block px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors font-medium"
                    >
                      Ask a Question
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
