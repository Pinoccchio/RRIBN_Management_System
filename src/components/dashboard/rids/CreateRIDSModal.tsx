'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ReservistSelect } from './ReservistSelect';
import { Section2Form, Section2FormData } from './Section2Form';
import { BiometricUpload } from './BiometricUpload';
import { logger } from '@/lib/logger';

interface Reservist {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  service_number: string;
  rank: string;
  company: string;
}

interface CreateRIDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

export function CreateRIDSModal({ isOpen, onClose, onSuccess, onToast }: CreateRIDSModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedReservist, setSelectedReservist] = useState<Reservist | null>(null);
  const [createdRIDSId, setCreatedRIDSId] = useState<string | null>(null);

  // Prefilled with dummy data for easy testing
  const [section2Data, setSection2Data] = useState<Section2FormData>({
    // Employment
    present_occupation: 'Software Engineer',
    company_name: 'Tech Solutions Inc.',
    company_address: '123 Business Park, Makati City, Metro Manila',
    office_tel_nr: '(02) 8123-4567',

    // Residential
    home_address_street: '456 Mabini Street, Barangay Santo Niño',
    home_address_city: 'Quezon City',
    home_address_province: 'Metro Manila',
    home_address_zip: '1100',
    res_tel_nr: '(02) 8987-6543',
    mobile_tel_nr: '0917-123-4567',

    // Personal Details
    birth_place: 'Manila, Philippines',
    religion: 'Roman Catholic',
    height_cm: 170,
    weight_kg: 70,
    marital_status: 'Single',
    sex: 'Male',

    // Digital
    fb_account: 'juan.delacruz',

    // Additional
    special_skills: 'Computer Programming, Leadership, First Aid',
    languages_spoken: 'Filipino, English, Spanish',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: 'Select Reservist', description: 'Choose the reservist for this RIDS' },
    { number: 2, title: 'Personal Information', description: 'Section 2 - Employment, residential, and personal details' },
    { number: 3, title: 'Biometric Data', description: 'Section 11 - Photo, thumbmark, and signature' },
    { number: 4, title: 'Review & Save', description: 'Review and save as draft' },
  ];

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!section2Data.mobile_tel_nr?.trim()) {
      newErrors.mobile_tel_nr = 'Mobile number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!selectedReservist) {
        onToast?.('Please select a reservist', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) {
        onToast?.('Please fill in all required fields', 'error');
        return;
      }
      await createRIDSDraft();
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Reset form and close
      handleClose();
      onSuccess();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep(1);
    setSelectedReservist(null);
    setCreatedRIDSId(null);
    setSection2Data({
      present_occupation: 'Software Engineer',
      company_name: 'Tech Solutions Inc.',
      company_address: '123 Business Park, Makati City, Metro Manila',
      office_tel_nr: '(02) 8123-4567',
      home_address_street: '456 Mabini Street, Barangay Santo Niño',
      home_address_city: 'Quezon City',
      home_address_province: 'Metro Manila',
      home_address_zip: '1100',
      res_tel_nr: '(02) 8987-6543',
      mobile_tel_nr: '0917-123-4567',
      birth_place: 'Manila, Philippines',
      religion: 'Roman Catholic',
      height_cm: 170,
      weight_kg: 70,
      marital_status: 'Single',
      sex: 'Male',
      fb_account: 'juan.delacruz',
      special_skills: 'Computer Programming, Leadership, First Aid',
      languages_spoken: 'Filipino, English, Spanish',
    });
    setErrors({});
    onClose();
  };

  const createRIDSDraft = async () => {
    if (!selectedReservist) return;

    try {
      setLoading(true);

      const response = await fetch('/api/staff/rids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservist_id: selectedReservist.id,
          ...section2Data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create RIDS');
      }

      const data = await response.json();

      if (data.success) {
        setCreatedRIDSId(data.data.id);
        setCurrentStep(3);
        logger.success('RIDS draft created successfully', { rids_id: data.data.id });
      }
    } catch (error) {
      logger.error('Failed to create RIDS', error);
      onToast?.('Failed to create RIDS. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const ProgressIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                  ${currentStep > step.number
                    ? 'bg-green-500 text-white'
                    : currentStep === step.number
                    ? 'bg-navy-600 text-white ring-4 ring-navy-200'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${currentStep === step.number ? 'text-navy-900' : 'text-gray-600'}`}>
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New RIDS"
      description="Reservist Information Data Sheet"
      size="xl"
      showCloseButton={true}
    >
      <div className="space-y-6">
        <ProgressIndicator />

        {/* Step 1: Select Reservist */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Reservist</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose the reservist for whom you want to create a RIDS. Reservists who already have a RIDS cannot be selected.
            </p>
            <ReservistSelect
              onSelect={(reservist) => setSelectedReservist(reservist)}
              selectedReservistId={selectedReservist?.id}
            />
          </div>
        )}

        {/* Step 2: Section 2 Form */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information (Section 2)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Fill in the personal, employment, and residential information for{' '}
              <span className="font-semibold">{selectedReservist?.first_name} {selectedReservist?.last_name}</span>.
            </p>
            <Section2Form
              formData={section2Data}
              onChange={(data) => setSection2Data({ ...section2Data, ...data })}
              errors={errors}
            />
          </div>
        )}

        {/* Step 3: Biometric Upload */}
        {currentStep === 3 && createdRIDSId && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Biometric Data (Section 11)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload the biometric data for{' '}
              <span className="font-semibold">{selectedReservist?.first_name} {selectedReservist?.last_name}</span>.
              This step is optional but recommended.
            </p>
            <BiometricUpload ridsId={createdRIDSId} />
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Save</h3>
            <p className="text-sm text-gray-600 mb-4">
              Review the RIDS information and save as draft. You can edit and add more sections later.
            </p>

            <div className="space-y-4">
              {/* Reservist Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Reservist Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {selectedReservist?.first_name} {selectedReservist?.middle_name?.charAt(0)}. {selectedReservist?.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Service Number:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedReservist?.service_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rank:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedReservist?.rank}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Company:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedReservist?.company}</span>
                  </div>
                </div>
              </div>

              {/* Section 2 Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Section 2: Personal Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {section2Data.present_occupation && (
                    <div>
                      <span className="text-gray-600">Occupation:</span>
                      <span className="ml-2 font-medium text-gray-900">{section2Data.present_occupation}</span>
                    </div>
                  )}
                  {section2Data.mobile_tel_nr && (
                    <div>
                      <span className="text-gray-600">Mobile:</span>
                      <span className="ml-2 font-medium text-gray-900">{section2Data.mobile_tel_nr}</span>
                    </div>
                  )}
                  {section2Data.home_address_city && (
                    <div>
                      <span className="text-gray-600">City:</span>
                      <span className="ml-2 font-medium text-gray-900">{section2Data.home_address_city}</span>
                    </div>
                  )}
                  {section2Data.marital_status && (
                    <div>
                      <span className="text-gray-600">Marital Status:</span>
                      <span className="ml-2 font-medium text-gray-900">{section2Data.marital_status}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">RIDS Status:</span> Draft
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  This RIDS will be saved as a draft. You can continue editing and adding sections (3-10) later, then submit for approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="text-sm text-gray-600">
            Step {currentStep} of {steps.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={loading || (currentStep === 1 && !selectedReservist)}
            size="sm"
          >
            {loading ? (
              'Processing...'
            ) : currentStep === steps.length ? (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save & Close
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
