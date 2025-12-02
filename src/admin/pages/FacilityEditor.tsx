import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker } from 'react-map-gl/mapbox';
import { supabase } from '../../lib/supabase';
import { Facility } from '../../lib/supabase';
import MultiSelect from '../../components/Forms/MultiSelect';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const COMMON_SPECIALTIES = [
  'Cosmetic Surgery', 'Dental Care', 'Cardiac Surgery', 'Orthopedics',
  'Hair Transplant', 'Fertility Treatment', 'Cancer Treatment', 'Bariatric Surgery',
  'Ophthalmology', 'Neurosurgery', 'Stem Cell Therapy', 'Gender Reassignment',
  'Organ Transplant', 'Spine Surgery', 'Sports Medicine', 'Dermatology'
];

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Arabic', 'Mandarin',
  'Japanese', 'Korean', 'Russian', 'Portuguese', 'Italian', 'Thai',
  'Hindi', 'Turkish', 'Dutch', 'Swedish'
];

interface FacilityFormData {
  name: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  jci_accredited: boolean;
  accepts_zano: boolean;
  specialties: string[];
  languages: string[];
  website: string | null;
  phone: string | null;
  contact_email: string | null;
  airport_distance: string | null;
  google_rating: number | null;
}

const FacilityEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewFacility = !id || id === 'new';

  const [activeTab, setActiveTab] = useState<'basic' | 'enriched'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    country: '',
    city: '',
    lat: 0,
    lng: 0,
    jci_accredited: false,
    accepts_zano: false,
    specialties: [],
    languages: [],
    website: null,
    phone: null,
    contact_email: null,
    airport_distance: null,
    google_rating: null
  });

  // Fetch facility if editing
  const { data: facility, isLoading } = useQuery({
    queryKey: ['facility', id],
    queryFn: async () => {
      if (isNewFacility) return null;
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Facility;
    },
    enabled: !isNewFacility
  });

  // Populate form when facility loads
  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name,
        country: facility.country,
        city: facility.city,
        lat: facility.lat,
        lng: facility.lng,
        jci_accredited: facility.jci_accredited,
        accepts_zano: facility.accepts_zano,
        specialties: facility.specialties,
        languages: facility.languages,
        website: facility.website || null,
        phone: facility.phone || null,
        contact_email: facility.contact_email || null,
        airport_distance: facility.airport_distance || null,
        google_rating: facility.google_rating || null
      });
    }
  }, [facility]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FacilityFormData) => {
      if (isNewFacility) {
        const { data: newFacility, error } = await supabase
          .from('facilities')
          .insert([{
            ...data,
            popular_procedures: [],
            review_count: 0
          }])
          .select()
          .single();

        if (error) throw error;
        return newFacility;
      } else {
        const { data: updatedFacility, error } = await supabase
          .from('facilities')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return updatedFacility;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facility', id] });
      navigate('/admin/facilities');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      await saveMutation.mutateAsync(formData);
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save facility');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMapClick = (event: any) => {
    setFormData(prev => ({
      ...prev,
      lat: event.lngLat.lat,
      lng: event.lngLat.lng
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="shimmer w-20 h-20 rounded-full mx-auto mb-4"></div>
          <p className="font-display text-xl text-gold-600">Loading facility...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ocean-600 mb-2">
            {isNewFacility ? 'Add New Facility' : `Edit: ${facility?.name || 'Facility'}`}
          </h1>
          <p className="text-ocean-600/70">
            {isNewFacility
              ? 'Create a new JCI-certified facility entry'
              : 'Update facility information and enriched data'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/facilities')}
          className="px-4 py-2 border border-sage-200 text-ocean-600/80 hover:text-ocean-600 hover:border-ocean-300 rounded-lg transition-colors"
        >
          ← Back to List
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sage-200">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'basic'
              ? 'text-ocean-700 border-b-2 border-gold-500'
              : 'text-ocean-500/60 hover:text-ocean-600'
          }`}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('enriched')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'enriched'
              ? 'text-ocean-700 border-b-2 border-gold-500'
              : 'text-ocean-500/60 hover:text-ocean-600'
          }`}
          disabled={isNewFacility}
        >
          Enriched Data {isNewFacility && '(Save first)'}
        </button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
          >
            {saveError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <form onSubmit={handleSubmit}>
          {/* Split View: Map + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Map */}
            <div className="bg-white border border-sage-200 shadow-sm rounded-xl p-6">
              <h2 className="font-display text-xl text-ocean-600 mb-4">Location</h2>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-sage-200">
                <Map
                  mapboxAccessToken={MAPBOX_TOKEN}
                  initialViewState={{
                    latitude: formData.lat || 0,
                    longitude: formData.lng || 0,
                    zoom: formData.lat ? 12 : 2
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/dark-v11"
                  onClick={handleMapClick}
                >
                  {formData.lat !== 0 && formData.lng !== 0 && (
                    <Marker
                      latitude={formData.lat}
                      longitude={formData.lng}
                      color="#D97925"
                    />
                  )}
                </Map>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ocean-600/70">Coordinates:</span>
                  <span className="text-ocean-700 font-mono">
                    {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                  </span>
                </div>
                <p className="text-xs text-ocean-500/60 italic">Click on map to set location</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white border border-sage-200 shadow-sm rounded-xl p-6 space-y-4">
              <h2 className="font-display text-xl text-ocean-600 mb-4">Basic Details</h2>

              {/* Name */}
              <div>
                <label className="block text-sm text-ocean-700/80 mb-2">Facility Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                  placeholder="e.g., Bumrungrad International Hospital"
                />
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ocean-700/80 mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                    placeholder="e.g., Thailand"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ocean-700/80 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                    placeholder="e.g., Bangkok"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ocean-700/80 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ocean-700/80 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.jci_accredited}
                    onChange={(e) => setFormData(prev => ({ ...prev, jci_accredited: e.target.checked }))}
                    className="w-5 h-5 rounded border-sage-300 bg-white checked:bg-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-ocean-700/80">JCI Accredited</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accepts_zano}
                    onChange={(e) => setFormData(prev => ({ ...prev, accepts_zano: e.target.checked }))}
                    className="w-5 h-5 rounded border-sage-300 bg-white checked:bg-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-ocean-700/80">Accepts Zano</span>
                </label>
              </div>
            </div>
          </div>

          {/* Contact & Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Contact Information */}
            <div className="bg-white border border-sage-200 shadow-sm rounded-xl p-6 space-y-4">
              <h2 className="font-display text-xl text-ocean-600 mb-4">Contact Information</h2>

              <div>
                <label className="block text-sm text-ocean-700/80 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value || null }))}
                  className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm text-ocean-700/80 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value || null }))}
                  className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm text-ocean-700/80 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value || null }))}
                  className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                  placeholder="info@facility.com"
                />
              </div>

              <div>
                <label className="block text-sm text-ocean-700/80 mb-2">Airport Distance</label>
                <input
                  type="text"
                  value={formData.airport_distance || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, airport_distance: e.target.value || null }))}
                  className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                  placeholder="e.g., 25 km"
                />
              </div>

              <div>
                <label className="block text-sm text-ocean-700/80 mb-2">Google Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.google_rating || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_rating: parseFloat(e.target.value) || null }))}
                  className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-colors"
                  placeholder="4.5"
                />
              </div>
            </div>

            {/* Specialties & Languages */}
            <div className="bg-white border border-sage-200 shadow-sm rounded-xl p-6 space-y-6">
              <h2 className="font-display text-xl text-ocean-600 mb-4">Specialties & Languages</h2>

              <MultiSelect
                label="Medical Specialties"
                options={COMMON_SPECIALTIES}
                selected={formData.specialties}
                onChange={(specialties) => setFormData(prev => ({ ...prev, specialties }))}
                placeholder="Select specialties..."
                allowCustom={true}
              />

              <MultiSelect
                label="Languages Spoken"
                options={COMMON_LANGUAGES}
                selected={formData.languages}
                onChange={(languages) => setFormData(prev => ({ ...prev, languages }))}
                placeholder="Select languages..."
                allowCustom={true}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 btn-gold px-6 py-3 font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? 'Saving...' : isNewFacility ? 'Create Facility' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/facilities')}
              className="px-6 py-3 border border-sage-200 text-ocean-600/80 hover:text-ocean-600 hover:border-ocean-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Enriched Data Tab (Placeholder for now) */}
      {activeTab === 'enriched' && !isNewFacility && (
        <div className="bg-white border border-sage-200 shadow-sm rounded-xl p-6">
          <h2 className="font-display text-xl text-ocean-600 mb-4">Enriched Data Management</h2>
          <p className="text-ocean-600/60 mb-6">Manage doctors, testimonials, and pricing for this facility</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-sage-50 rounded-lg border border-sage-200 text-center">
              <p className="text-sm text-ocean-600/60 mb-2">Doctors</p>
              <p className="text-3xl font-display text-ocean-700 mb-4">
                {facility?.doctors?.length || 0}
              </p>
              <button className="px-4 py-2 bg-gold-100 text-gold-700 rounded-lg hover:bg-gold-200 transition-colors text-sm">
                Manage Doctors
              </button>
            </div>
            <div className="p-6 bg-sage-50 rounded-lg border border-sage-200 text-center">
              <p className="text-sm text-ocean-600/60 mb-2">Testimonials</p>
              <p className="text-3xl font-display text-ocean-700 mb-4">
                {facility?.testimonials?.length || 0}
              </p>
              <button className="px-4 py-2 bg-gold-100 text-gold-700 rounded-lg hover:bg-gold-200 transition-colors text-sm">
                Manage Testimonials
              </button>
            </div>
            <div className="p-6 bg-sage-50 rounded-lg border border-sage-200 text-center">
              <p className="text-sm text-ocean-600/60 mb-2">Pricing</p>
              <p className="text-3xl font-display text-ocean-700 mb-4">
                {facility?.procedure_pricing?.length || 0}
              </p>
              <button className="px-4 py-2 bg-gold-100 text-gold-700 rounded-lg hover:bg-gold-200 transition-colors text-sm">
                Manage Pricing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityEditor;
