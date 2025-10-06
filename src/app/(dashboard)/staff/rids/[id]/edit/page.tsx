'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { RIDSFormComplete } from '@/lib/types/rids';
import { SectionEntryManager } from '@/components/dashboard/rids/SectionEntryManager';
import { Section3Form } from '@/components/dashboard/rids/Section3Form';
import { Section4Form } from '@/components/dashboard/rids/Section4Form';
import { Section5Form } from '@/components/dashboard/rids/Section5Form';
import { Section6Form } from '@/components/dashboard/rids/Section6Form';
import { Section7Form } from '@/components/dashboard/rids/Section7Form';
import { Section8Form } from '@/components/dashboard/rids/Section8Form';
import { Section9Form } from '@/components/dashboard/rids/Section9Form';
import { Section10Form } from '@/components/dashboard/rids/Section10Form';
import { format } from 'date-fns';
import { logger } from '@/lib/logger';

export default function EditRIDSPage() {
  const router = useRouter();
  const params = useParams();
  const ridsId = params.id as string;

  const [rids, setRids] = useState<RIDSFormComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRIDS();
  }, [ridsId]);

  const fetchRIDS = async () => {
    try {
      setLoading(true);
      logger.info(`📥 [EditRIDSPage] Fetching RIDS data for ID: ${ridsId}`, { context: 'EDIT_RIDS' });

      const response = await fetch(`/api/staff/rids/${ridsId}`);
      const data = await response.json();

      if (data.success) {
        setRids(data.data);
        logger.success(`✅ [EditRIDSPage] RIDS data loaded`, { context: 'EDIT_RIDS' });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('❌ [EditRIDSPage] Failed to fetch RIDS', error, { context: 'EDIT_RIDS' });
      alert('Failed to load RIDS. Please try again.');
      router.push('/staff/rids');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Submit this RIDS for approval? You cannot edit it after submission.')) return;

    try {
      setSubmitting(true);
      logger.info(`📤 [EditRIDSPage] Submitting RIDS for approval...`, { context: 'EDIT_RIDS' });

      const response = await fetch(`/api/staff/rids/${ridsId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        logger.success(`✅ [EditRIDSPage] RIDS submitted for approval`, { context: 'EDIT_RIDS' });
        alert('RIDS submitted for approval successfully!');
        router.push('/staff/rids');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit');
      }
    } catch (error) {
      logger.error('❌ [EditRIDSPage] Failed to submit RIDS', error, { context: 'EDIT_RIDS' });
      alert('Failed to submit RIDS for approval. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-navy-600" />
        <span className="ml-3 text-gray-600">Loading RIDS...</span>
      </div>
    );
  }

  if (!rids) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">RIDS not found</p>
          <Button onClick={() => router.push('/staff/rids')}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { number: 1, label: 'Personnel Info', available: true },
    { number: 2, label: 'Personal Info', available: true },
    { number: 3, label: 'Promotions', available: true },
    { number: 4, label: 'Training', available: true },
    { number: 5, label: 'Awards', available: true },
    { number: 6, label: 'Dependents', available: true },
    { number: 7, label: 'Education', available: true },
    { number: 8, label: 'Active Duty', available: true },
    { number: 9, label: 'Unit Assignments', available: true },
    { number: 10, label: 'Designations', available: true },
    { number: 11, label: 'Biometrics', available: true },
  ];

  const canEdit = rids.status === 'draft';

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={`Edit RIDS - ${rids.reservist?.first_name} ${rids.reservist?.last_name}`}
        description={`Service Number: ${rids.reservist?.service_number} | Status: ${rids.status}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/staff/rids')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
            {canEdit && (
              <Button onClick={handleSubmit} disabled={submitting}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            )}
          </div>
        }
      />

      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            This RIDS has been submitted and can no longer be edited. Status: <strong>{rids.status}</strong>
          </p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.number}
              onClick={() => setActiveTab(tab.number)}
              disabled={!tab.available}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.number
                  ? 'border-b-2 border-navy-600 text-navy-600 bg-navy-50'
                  : tab.available
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                  activeTab === tab.number
                    ? 'bg-navy-600 text-white'
                    : tab.available
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {tab.number}
                </span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Section 1: Personnel Information (Read-only) */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Section 1: Personnel Information
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  This information is pulled from the reservist's profile and cannot be edited here.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Full Name</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {rids.reservist?.first_name} {rids.reservist?.middle_name} {rids.reservist?.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Service Number</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.reservist?.service_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Rank</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.reservist?.rank || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">AFPSN</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.reservist?.afpsn || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Company</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.reservist?.company || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">MOS</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.reservist?.mos || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Personal Information */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Section 2: Personal Information
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Employment, residential, and personal details.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Occupation</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.present_occupation || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Company</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.company_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Mobile</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.mobile_tel_nr || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Birth Place</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.birth_place || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Height / Weight</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {rids.height_cm || 'N/A'} cm / {rids.weight_kg || 'N/A'} kg
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Marital Status</label>
                  <p className="text-sm text-gray-900 mt-1">{rids.marital_status || 'N/A'}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 italic">
                To edit Section 2, please use the main RIDS edit form (coming soon).
              </p>
            </div>
          )}

          {/* Section 3: Promotion History */}
          {activeTab === 3 && canEdit && (
            <SectionEntryManager
              ridsId={ridsId}
              sectionName="Promotion/Demotion History"
              sectionNumber={3}
              apiEndpoint="/api/staff/rids/[id]/sections/promotion-history"
              columns={[
                { key: 'entry_number', label: '#' },
                { key: 'rank', label: 'Rank' },
                {
                  key: 'date_of_rank',
                  label: 'Date',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                { key: 'authority', label: 'Authority' },
                { key: 'action_type', label: 'Type' },
              ]}
              FormComponent={Section3Form}
              emptyMessage="No promotion/demotion history recorded yet"
            />
          )}

          {/* Section 4: Military Training */}
          {activeTab === 4 && canEdit && (
            <SectionEntryManager
              ridsId={ridsId}
              sectionName="Military Training/Seminar/Schooling"
              sectionNumber={4}
              apiEndpoint="/api/staff/rids/[id]/sections/military-training"
              columns={[
                { key: 'training_name', label: 'Training Name' },
                { key: 'school', label: 'School/Institution' },
                {
                  key: 'date_graduated',
                  label: 'Date Graduated',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                { key: 'training_category', label: 'Category' },
              ]}
              FormComponent={Section4Form}
              emptyMessage="No military training recorded yet"
            />
          )}

          {/* Section 5: Awards */}
          {activeTab === 5 && canEdit && (
            <SectionEntryManager
              ridsId={ridsId}
              sectionName="Awards and Decorations"
              sectionNumber={5}
              apiEndpoint="/api/staff/rids/[id]/sections/awards"
              columns={[
                { key: 'award_name', label: 'Award Name' },
                { key: 'authority', label: 'Authority' },
                {
                  key: 'date_awarded',
                  label: 'Date Awarded',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                { key: 'award_category', label: 'Category' },
              ]}
              FormComponent={Section5Form}
              emptyMessage="No awards recorded yet"
            />
          )}

          {/* Section 6: Dependents */}
          {activeTab === 6 && canEdit && (
            <SectionEntryManager
              ridsId={ridsId}
              sectionName="Dependents and Family Members"
              sectionNumber={6}
              apiEndpoint="/api/staff/rids/[id]/sections/dependents"
              columns={[
                { key: 'relation', label: 'Relationship' },
                { key: 'full_name', label: 'Full Name' },
                {
                  key: 'birthdate',
                  label: 'Birthdate',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                { key: 'contact_info', label: 'Contact' },
              ]}
              FormComponent={Section6Form}
              emptyMessage="No dependents recorded yet"
            />
          )}

          {/* Section 7: Educational Attainment */}
          {activeTab === 7 && canEdit && (
            <SectionEntryManager
              ridsId={ridsId}
              sectionName="Educational Attainment"
              sectionNumber={7}
              apiEndpoint="/api/staff/rids/[id]/sections/education"
              columns={[
                { key: 'course', label: 'Course/Program' },
                { key: 'school', label: 'School' },
                {
                  key: 'date_graduated',
                  label: 'Graduated',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                { key: 'level', label: 'Level' },
              ]}
              FormComponent={Section7Form}
              emptyMessage="No educational records yet"
            />
          )}

          {/* Section 8: Active Duty Training */}
          {activeTab === 8 && canEdit && (
            <SectionEntryManager
              ridsId={ridsId}
              sectionName="Active Duty Training"
              sectionNumber={8}
              apiEndpoint="/api/staff/rids/[id]/sections/active-duty"
              columns={[
                { key: 'unit', label: 'Unit' },
                { key: 'purpose', label: 'Purpose' },
                {
                  key: 'date_start',
                  label: 'Start',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                {
                  key: 'date_end',
                  label: 'End',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                { key: 'days_served', label: 'Days' },
              ]}
              FormComponent={Section8Form}
              emptyMessage="No active duty training recorded yet"
            />
          )}

          {/* Section 9: Unit Assignment History */}
          {activeTab === 9 && canEdit && (
            <SectionEntryManager
              ridsId={ridsId}
              sectionName="Unit Assignment History"
              sectionNumber={9}
              apiEndpoint="/api/staff/rids/[id]/sections/unit-assignments"
              columns={[
                { key: 'unit', label: 'Unit' },
                { key: 'authority', label: 'Authority' },
                {
                  key: 'date_from',
                  label: 'From',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                {
                  key: 'date_to',
                  label: 'To',
                  render: (val, entry) => entry.is_current ? 'Present' : val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
              ]}
              FormComponent={Section9Form}
              emptyMessage="No unit assignments recorded yet"
            />
          )}

          {/* Section 10: Designation History */}
          {activeTab === 10 && canEdit && (
            <SectionEntryManager
              ridsId={ridsId}
              sectionName="Designation History"
              sectionNumber={10}
              apiEndpoint="/api/staff/rids/[id]/sections/designations"
              columns={[
                { key: 'position', label: 'Position' },
                { key: 'authority', label: 'Authority' },
                {
                  key: 'date_from',
                  label: 'From',
                  render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
                {
                  key: 'date_to',
                  label: 'To',
                  render: (val, entry) => entry.is_current ? 'Present' : val ? format(new Date(val), 'MMM d, yyyy') : 'N/A'
                },
              ]}
              FormComponent={Section10Form}
              emptyMessage="No designations recorded yet"
            />
          )}

          {/* Section 11: Biometrics */}
          {activeTab === 11 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Section 11: Biometric Data
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  2x2 photo, right thumbmark, and signature.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">2x2 Photo</label>
                  {rids.photo_url ? (
                    <img
                      src={rids.photo_url}
                      alt="Photo"
                      className="w-full h-48 object-contain bg-gray-50 rounded border border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                      No photo uploaded
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Right Thumbmark</label>
                  {rids.thumbmark_url ? (
                    <img
                      src={rids.thumbmark_url}
                      alt="Thumbmark"
                      className="w-full h-48 object-contain bg-gray-50 rounded border border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                      No thumbmark uploaded
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Signature</label>
                  {rids.signature_url ? (
                    <img
                      src={rids.signature_url}
                      alt="Signature"
                      className="w-full h-48 object-contain bg-gray-50 rounded border border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                      No signature uploaded
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-500 italic">
                To edit biometrics, please use the biometric upload component (coming soon).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-navy-900 mb-2">RIDS Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 font-medium text-navy-900 capitalize">{rids.status}</span>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 text-navy-900">{format(new Date(rids.created_at), 'MMM d, yyyy')}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 text-navy-900">{format(new Date(rids.updated_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
