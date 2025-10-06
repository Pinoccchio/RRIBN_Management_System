'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';
import { logger } from '@/lib/logger';
import { ReservistSelector } from '@/app/(dashboard)/staff/rids/create/components/ReservistSelector';
import { Section1Form } from '@/app/(dashboard)/staff/rids/create/components/Section1Form';
import { Section2Form } from '@/app/(dashboard)/staff/rids/create/components/Section2Form';
import { Section3Form } from '@/app/(dashboard)/staff/rids/create/components/Section3Form';
import { Section4Form } from '@/app/(dashboard)/staff/rids/create/components/Section4Form';
import { Section5Form } from '@/app/(dashboard)/staff/rids/create/components/Section5Form';
import { Section6Form } from '@/app/(dashboard)/staff/rids/create/components/Section6Form';
import { Section7Form } from '@/app/(dashboard)/staff/rids/create/components/Section7Form';
import { Section8Form } from '@/app/(dashboard)/staff/rids/create/components/Section8Form';
import { Section9Form } from '@/app/(dashboard)/staff/rids/create/components/Section9Form';
import { Section10Form } from '@/app/(dashboard)/staff/rids/create/components/Section10Form';
import { Section11_12Form } from '@/app/(dashboard)/staff/rids/create/components/Section11_12Form';

/**
 * RIDS Creation Modal Wizard for Staff
 *
 * Multi-step modal wizard for creating RIDS (Reservist Information Data Sheet)
 * Features:
 * - 12-step guided form
 * - Auto-save draft functionality (every 30 seconds)
 * - Progress tracking
 * - Pre-population from reservist_details
 */

interface CreateRIDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback when RIDS is successfully created/updated
  existingRIDS?: any | null; // Existing RIDS to edit (if provided, modal is in edit mode)
}

type WizardStep = {
  id: number;
  title: string;
  description: string;
  sectionName: string;
};

type Reservist = {
  id: string;
  service_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  company: string;
  rank: string | null;
  section: string | null;
};

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Select Reservist', description: 'Choose the reservist for this RIDS', sectionName: 'reservist_selection' },
  { id: 2, title: 'Personnel Information', description: 'Section 1: Basic military information', sectionName: 'section_1' },
  { id: 3, title: 'Personal Information', description: 'Section 2: Contact and personal details', sectionName: 'section_2' },
  { id: 4, title: 'Promotion History', description: 'Section 3: Rank progression', sectionName: 'section_3' },
  { id: 5, title: 'Military Training', description: 'Section 4: Training and courses', sectionName: 'section_4' },
  { id: 6, title: 'Awards & Decorations', description: 'Section 5: Military honors', sectionName: 'section_5' },
  { id: 7, title: 'Dependents', description: 'Section 6: Family information', sectionName: 'section_6' },
  { id: 8, title: 'Education', description: 'Section 7: Educational attainment', sectionName: 'section_7' },
  { id: 9, title: 'Active Duty Training', description: 'Section 8: CAD/OJT/ADT records', sectionName: 'section_8' },
  { id: 10, title: 'Unit Assignments', description: 'Section 9: Assignment history', sectionName: 'section_9' },
  { id: 11, title: 'Designations', description: 'Section 10: Position history', sectionName: 'section_10' },
  { id: 12, title: 'Biometrics & Documents', description: 'Section 11 & 12: Photos and supporting files', sectionName: 'section_11_12' },
];

export function CreateRIDSModal({ isOpen, onClose, onSuccess, existingRIDS }: CreateRIDSModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedReservist, setSelectedReservist] = useState<Reservist | null>(null);
  const [ridsId, setRidsId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRIDS, setIsLoadingRIDS] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isEditMode = !!existingRIDS;
  const currentStepInfo = WIZARD_STEPS[currentStep - 1];
  const progress = (currentStep / WIZARD_STEPS.length) * 100;

  // Reset wizard when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedReservist(null);
      setRidsId(null);
      setFormData({});
      setIsSaving(false);
      setIsLoadingRIDS(false);
      setToast(null);
    }
  }, [isOpen]);

  // Load existing RIDS data when editing
  useEffect(() => {
    const loadExistingRIDS = async () => {
      if (!isEditMode || !existingRIDS || !isOpen) return;

      try {
        setIsLoadingRIDS(true);
        logger.info('Loading existing RIDS for editing...', { context: 'CreateRIDSModal', ridsId: existingRIDS.id });

        // Fetch full RIDS data with all sections
        const response = await fetch(`/api/staff/rids/${existingRIDS.id}`);
        const data = await response.json();

        if (data.success && data.data) {
          const rids = data.data;

          // Set RIDS ID
          setRidsId(rids.id);

          // Set reservist info
          if (rids.reservist) {
            setSelectedReservist({
              id: rids.reservist_id,
              service_number: rids.reservist.service_number || '',
              first_name: rids.reservist.first_name || '',
              middle_name: rids.reservist.middle_name || null,
              last_name: rids.reservist.last_name || '',
              email: rids.reservist.email || '',
              company: rids.reservist.company || '',
              rank: rids.reservist.rank || null,
              section: null,
            });
          }

          // Pre-populate form data from existing RIDS
          const loadedFormData: Record<string, any> = {};

          // Section 1: Personnel Information
          if (rids.rank || rids.afpsn || rids.br_svc) {
            loadedFormData.section_1 = {
              rank: rids.rank,
              afpsn: rids.afpsn,
              br_svc: rids.br_svc,
              afpos_mos: rids.afpos_mos || {},
              source_of_commission: rids.source_of_commission || {},
              reservist_classification: rids.reservist_classification,
              mobilization_center: rids.mobilization_center,
              unit_organization: rids.unit_organization || {},
              uniform_sizing: rids.uniform_sizing || {},
            };
          }

          // Section 2: Personal Information
          loadedFormData.section_2 = {
            present_occupation: rids.present_occupation,
            company_name: rids.company_name,
            company_address: rids.company_address,
            office_tel_nr: rids.office_tel_nr,
            home_address_street: rids.home_address_street,
            home_address_city: rids.home_address_city,
            home_address_province: rids.home_address_province,
            home_address_zip: rids.home_address_zip,
            res_tel_nr: rids.res_tel_nr,
            mobile_tel_nr: rids.mobile_tel_nr,
            birth_place: rids.birth_place,
            religion: rids.religion,
            height_cm: rids.height_cm,
            weight_kg: rids.weight_kg,
            marital_status: rids.marital_status,
            sex: rids.sex,
            fb_account: rids.fb_account,
            special_skills: rids.special_skills,
            languages_spoken: rids.languages_spoken,
          };

          // Section 11-12: Biometrics
          loadedFormData.section_11_12 = {
            photo_url: rids.photo_url,
            thumbmark_url: rids.thumbmark_url,
            signature_url: rids.signature_url,
          };

          setFormData(loadedFormData);

          // Skip to section 2 (skip reservist selection)
          setCurrentStep(2);

          logger.success('Loaded existing RIDS data', { context: 'CreateRIDSModal' });
        } else {
          throw new Error(data.error || 'Failed to load RIDS');
        }
      } catch (error) {
        logger.error('Failed to load existing RIDS', error, { context: 'CreateRIDSModal' });
        setToast({ message: 'Failed to load RIDS data', type: 'error' });
      } finally {
        setIsLoadingRIDS(false);
      }
    };

    loadExistingRIDS();
  }, [isEditMode, existingRIDS, isOpen]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!ridsId || !selectedReservist || !isOpen) return;

    const autoSaveInterval = setInterval(() => {
      saveDraft(true);
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [ridsId, formData, selectedReservist, isOpen]);

  const saveDraft = async (isAutoSave = false) => {
    if (!selectedReservist) {
      if (!isAutoSave) {
        setToast({ message: 'Please select a reservist first', type: 'error' });
      }
      return;
    }

    try {
      setIsSaving(true);
      logger.info('Saving RIDS draft...', { context: 'CreateRIDSModal', isAutoSave });

      const payload = {
        reservist_id: selectedReservist.id,
        status: 'draft',
        ...formData,
      };

      const url = ridsId ? `/api/staff/rids/${ridsId}` : '/api/staff/rids';
      const method = ridsId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (!ridsId && data.data?.id) {
          setRidsId(data.data.id);
        }
        if (!isAutoSave) {
          setToast({ message: 'Draft saved successfully', type: 'success' });
        }
        logger.success('Draft saved', { context: 'CreateRIDSModal', ridsId: data.data?.id });
      } else {
        throw new Error(data.error || 'Failed to save draft');
      }
    } catch (error) {
      logger.error('Failed to save draft', error, { context: 'CreateRIDSModal' });

      // Enhanced error handling for duplicate RIDS
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft';

      if (!isAutoSave) {
        // Check if this is a duplicate RIDS error
        if (errorMessage.toLowerCase().includes('already exists')) {
          setToast({
            message: 'This reservist already has a RIDS form. Please select a different reservist or edit the existing RIDS from the RIDS list.',
            type: 'error'
          });
          // Reset to step 1 to allow user to select a different reservist
          setCurrentStep(1);
          setSelectedReservist(null);
        } else {
          setToast({ message: errorMessage, type: 'error' });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Validate step 1: Reservist must be selected
    if (currentStep === 1 && !selectedReservist) {
      setToast({ message: 'Please select a reservist to continue', type: 'error' });
      return;
    }

    // Save current step before moving forward
    await saveDraft();

    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!ridsId) {
      setToast({ message: 'Please save as draft first', type: 'error' });
      return;
    }

    try {
      setIsSaving(true);
      logger.info('Submitting RIDS for verification...', { context: 'CreateRIDSModal', ridsId });

      const response = await fetch(`/api/staff/rids/${ridsId}/submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitted_by: 'staff',
          certification_confirmed: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'RIDS submitted successfully!', type: 'success' });
        logger.success('RIDS submitted', { context: 'CreateRIDSModal', ridsId });

        // Close modal and notify parent after short delay
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to submit RIDS');
      }
    } catch (error) {
      logger.error('Failed to submit RIDS', error, { context: 'CreateRIDSModal' });
      setToast({ message: 'Failed to submit RIDS', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data,
    }));
  };

  // Memoized callbacks for all sections to prevent infinite loops
  const handleSection1Change = useCallback((data: any) => {
    updateFormData('section_1', data);
  }, []);

  const handleSection2Change = useCallback((data: any) => {
    updateFormData('section_2', data);
  }, []);

  const handleSection3Change = useCallback((data: any) => {
    updateFormData('section_3', data);
  }, []);

  const handleSection4Change = useCallback((data: any) => {
    updateFormData('section_4', data);
  }, []);

  const handleSection5Change = useCallback((data: any) => {
    updateFormData('section_5', data);
  }, []);

  const handleSection6Change = useCallback((data: any) => {
    updateFormData('section_6', data);
  }, []);

  const handleSection7Change = useCallback((data: any) => {
    updateFormData('section_7', data);
  }, []);

  const handleSection8Change = useCallback((data: any) => {
    updateFormData('section_8', data);
  }, []);

  const handleSection9Change = useCallback((data: any) => {
    updateFormData('section_9', data);
  }, []);

  const handleSection10Change = useCallback((data: any) => {
    updateFormData('section_10', data);
  }, []);

  const handleSection11_12Change = useCallback((data: any) => {
    updateFormData('section_11_12', data);
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ReservistSelector
            selectedReservistId={selectedReservist?.id || null}
            onSelect={setSelectedReservist}
          />
        );

      case 2:
        return (
          <Section1Form
            initialData={formData.section_1}
            reservistData={{
              rank: selectedReservist?.rank || undefined,
              company: selectedReservist?.company,
              section: selectedReservist?.section || undefined,
            }}
            onChange={handleSection1Change}
          />
        );

      case 3:
        return (
          <Section2Form
            initialData={formData.section_2}
            onChange={handleSection2Change}
          />
        );

      case 4:
        return (
          <Section3Form
            initialData={formData.section_3}
            onChange={handleSection3Change}
          />
        );

      case 5:
        return (
          <Section4Form
            initialData={formData.section_4}
            onChange={handleSection4Change}
          />
        );

      case 6:
        return (
          <Section5Form
            initialData={formData.section_5}
            onChange={handleSection5Change}
          />
        );

      case 7:
        return (
          <Section6Form
            initialData={formData.section_6}
            onChange={handleSection6Change}
          />
        );

      case 8:
        return (
          <Section7Form
            initialData={formData.section_7}
            onChange={handleSection7Change}
          />
        );

      case 9:
        return (
          <Section8Form
            initialData={formData.section_8}
            onChange={handleSection8Change}
          />
        );

      case 10:
        return (
          <Section9Form
            initialData={formData.section_9}
            onChange={handleSection9Change}
          />
        );

      case 11:
        return (
          <Section10Form
            initialData={formData.section_10}
            onChange={handleSection10Change}
          />
        );

      case 12:
        return (
          <Section11_12Form
            initialData={formData.section_11_12}
            onChange={handleSection11_12Change}
            ridsId={ridsId || undefined}
          />
        );

      default:
        return (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Unknown Step</p>
          </div>
        );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? "Edit RIDS" : "Create New RIDS"}
        description={`Step ${currentStep} of ${WIZARD_STEPS.length}: ${currentStepInfo.title}`}
        size="xl"
        showCloseButton={!isSaving && !isLoadingRIDS}
      >
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {WIZARD_STEPS.length}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step Info */}
          <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
            <h3 className="font-semibold text-navy-900">{currentStepInfo.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{currentStepInfo.description}</p>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {isLoadingRIDS ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
                  <p className="text-gray-600">Loading RIDS data...</p>
                </div>
              </div>
            ) : (
              renderStepContent()
            )}
          </div>

          {/* Navigation Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSaving}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => saveDraft(false)}
                  disabled={isSaving || !selectedReservist}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>

                {currentStep < WIZARD_STEPS.length ? (
                  <Button
                    onClick={handleNext}
                    disabled={isSaving}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSaving || !ridsId}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit RIDS
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
