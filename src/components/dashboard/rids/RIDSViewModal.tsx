'use client';

import { useState, useEffect } from 'react';
import { X, Download, User, FileText, Award, Users, GraduationCap, Briefcase, MapPin, Shield, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RIDSFormComplete } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

interface RIDSViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ridsId: string | null;
}

export function RIDSViewModal({ isOpen, onClose, ridsId }: RIDSViewModalProps) {
  const [rids, setRids] = useState<RIDSFormComplete | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ridsId) {
      fetchRIDS();
    }
  }, [isOpen, ridsId]);

  const fetchRIDS = async () => {
    if (!ridsId) return;

    try {
      setLoading(true);
      logger.info(`📥 [RIDSViewModal] Fetching RIDS data for ID: ${ridsId}`, { context: 'VIEW_RIDS_MODAL' });

      const response = await fetch(`/api/staff/rids/${ridsId}`);
      const data = await response.json();

      if (data.success) {
        setRids(data.data);
        logger.success(`✅ [RIDSViewModal] RIDS data loaded successfully`, { context: 'VIEW_RIDS_MODAL' });
      } else {
        logger.error(`❌ [RIDSViewModal] Failed to fetch RIDS: ${data.error}`, { context: 'VIEW_RIDS_MODAL' });
      }
    } catch (error) {
      logger.error('❌ [RIDSViewModal] Error fetching RIDS', error, { context: 'VIEW_RIDS_MODAL' });
    } finally {
      setLoading(false);
    }
  };

  if (!ridsId) return null;

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
      <Icon className="w-5 h-5 text-navy-600" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="grid grid-cols-3 py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2">{value || 'N/A'}</dd>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-navy-600" />
          <span className="ml-3 text-gray-600">Loading RIDS data...</span>
        </div>
      ) : !rids ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No RIDS data available</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reservist Information Data Sheet</h2>
              <p className="text-sm text-gray-500 mt-1">
                {rids.reservist?.first_name} {rids.reservist?.middle_name} {rids.reservist?.last_name} - {rids.reservist?.service_number}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto space-y-8">
        {/* Section 1: Personnel Information (from reservist_details) */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={User} title="Section 1: Personnel Information" />
          <dl className="divide-y divide-gray-200">
            <InfoRow label="Rank" value={rids.reservist?.rank} />
            <InfoRow label="AFPSN" value={rids.reservist?.afpsn} />
            <InfoRow label="Branch of Service" value={rids.reservist?.br_svc} />
            <InfoRow label="MOS" value={rids.reservist?.mos} />
            <InfoRow label="Company" value={rids.reservist?.company} />
            <InfoRow label="Status" value={rids.reservist?.reservist_status} />
          </dl>
        </div>

        {/* Section 2: Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={FileText} title="Section 2: Personal Information" />
          <dl className="divide-y divide-gray-200">
            <InfoRow label="Birth Place" value={rids.birth_place} />
            <InfoRow label="Religion" value={rids.religion} />
            <InfoRow label="Height" value={rids.height_cm ? `${rids.height_cm} cm` : null} />
            <InfoRow label="Weight" value={rids.weight_kg ? `${rids.weight_kg} kg` : null} />
            <InfoRow label="Marital Status" value={rids.marital_status} />
            <InfoRow label="Sex" value={rids.sex} />
            <InfoRow label="Mobile" value={rids.mobile_tel_nr} />
            <InfoRow label="Address" value={`${rids.home_address_street || ''} ${rids.home_address_city || ''} ${rids.home_address_province || ''} ${rids.home_address_zip || ''}`.trim() || 'N/A'} />
            <InfoRow label="Occupation" value={rids.present_occupation} />
            <InfoRow label="Company" value={rids.company_name} />
          </dl>
        </div>

        {/* Section 3: Promotion History */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={Award} title="Section 3: Promotion/Demotion History" />
          {rids.promotion_history && rids.promotion_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rank</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Authority</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rids.promotion_history.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{entry.entry_number}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{entry.rank}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{format(new Date(entry.date_of_rank), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{entry.authority}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{entry.action_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No promotion history recorded</p>
          )}
        </div>

        {/* Section 4: Military Training */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={GraduationCap} title="Section 4: Military Training/Seminar/Schooling" />
          {rids.military_training && rids.military_training.length > 0 ? (
            <div className="space-y-3">
              {rids.military_training.map((entry) => (
                <div key={entry.id} className="border-l-4 border-navy-500 pl-4">
                  <p className="font-medium text-gray-900">{entry.training_name}</p>
                  <p className="text-sm text-gray-600">{entry.school}</p>
                  <p className="text-xs text-gray-500">Graduated: {format(new Date(entry.date_graduated), 'MMM d, yyyy')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No military training recorded</p>
          )}
        </div>

        {/* Section 5: Awards */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={Award} title="Section 5: Awards and Decoration" />
          {rids.awards && rids.awards.length > 0 ? (
            <div className="space-y-3">
              {rids.awards.map((entry) => (
                <div key={entry.id} className="border-l-4 border-yellow-500 pl-4">
                  <p className="font-medium text-gray-900">{entry.award_name}</p>
                  <p className="text-sm text-gray-600">Authority: {entry.authority}</p>
                  <p className="text-xs text-gray-500">Date: {format(new Date(entry.date_awarded), 'MMM d, yyyy')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No awards recorded</p>
          )}
        </div>

        {/* Section 6: Dependents */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={Users} title="Section 6: Dependents" />
          {rids.dependents && rids.dependents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rids.dependents.map((entry) => (
                <div key={entry.id} className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-medium text-gray-900">{entry.full_name}</p>
                  <p className="text-sm text-gray-600">{entry.relation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No dependents recorded</p>
          )}
        </div>

        {/* Section 7: Education */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={GraduationCap} title="Section 7: Educational Attainment" />
          {rids.education && rids.education.length > 0 ? (
            <div className="space-y-3">
              {rids.education.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-gray-900">{entry.course}</p>
                  <p className="text-sm text-gray-600">{entry.school}</p>
                  <p className="text-xs text-gray-500">{entry.level} - {entry.date_graduated ? format(new Date(entry.date_graduated), 'yyyy') : 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No education records</p>
          )}
        </div>

        {/* Section 8: Active Duty */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={Briefcase} title="Section 8: Active Duty Training (CAD/OJT/ADT)" />
          {rids.active_duty && rids.active_duty.length > 0 ? (
            <div className="space-y-3">
              {rids.active_duty.map((entry) => (
                <div key={entry.id} className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium text-gray-900">{entry.unit}</p>
                  <p className="text-sm text-gray-600">Purpose: {entry.purpose}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(entry.date_start), 'MMM d, yyyy')} - {format(new Date(entry.date_end), 'MMM d, yyyy')}
                    ({entry.days_served} days)
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active duty records</p>
          )}
        </div>

        {/* Section 9: Unit Assignments */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={MapPin} title="Section 9: Unit Assignment History" />
          {rids.unit_assignments && rids.unit_assignments.length > 0 ? (
            <div className="space-y-3">
              {rids.unit_assignments.map((entry) => (
                <div key={entry.id} className="border-l-4 border-purple-500 pl-4">
                  <p className="font-medium text-gray-900">{entry.unit} {entry.is_current && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">Current</span>}</p>
                  <p className="text-sm text-gray-600">Authority: {entry.authority}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(entry.date_from), 'MMM d, yyyy')} - {entry.date_to ? format(new Date(entry.date_to), 'MMM d, yyyy') : 'Present'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No unit assignment records</p>
          )}
        </div>

        {/* Section 10: Designations */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={Shield} title="Section 10: Designation History" />
          {rids.designations && rids.designations.length > 0 ? (
            <div className="space-y-3">
              {rids.designations.map((entry) => (
                <div key={entry.id} className="border-l-4 border-red-500 pl-4">
                  <p className="font-medium text-gray-900">{entry.position} {entry.is_current && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">Current</span>}</p>
                  <p className="text-sm text-gray-600">Authority: {entry.authority}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(entry.date_from), 'MMM d, yyyy')} - {entry.date_to ? format(new Date(entry.date_to), 'MMM d, yyyy') : 'Present'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No designation records</p>
          )}
        </div>

        {/* Section 11: Biometrics */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <SectionHeader icon={User} title="Section 11: Biometrics & Certification" />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">2x2 Photo</p>
              {rids.photo_url ? (
                <img src={rids.photo_url} alt="Photo" className="w-full h-48 object-contain bg-gray-50 rounded border border-gray-200" />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">No photo</div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Right Thumbmark</p>
              {rids.thumbmark_url ? (
                <img src={rids.thumbmark_url} alt="Thumbmark" className="w-full h-48 object-contain bg-gray-50 rounded border border-gray-200" />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">No thumbmark</div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Signature</p>
              {rids.signature_url ? (
                <img src={rids.signature_url} alt="Signature" className="w-full h-48 object-contain bg-gray-50 rounded border border-gray-200" />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">No signature</div>
              )}
            </div>
          </div>
        </div>

        {/* Status & Timestamps */}
        <div className="bg-navy-50 p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">RIDS Status</h3>
          <dl className="divide-y divide-gray-200">
            <InfoRow label="Status" value={<span className="capitalize">{rids.status}</span>} />
            <InfoRow label="Created" value={format(new Date(rids.created_at), 'MMM d, yyyy HH:mm')} />
            <InfoRow label="Last Updated" value={format(new Date(rids.updated_at), 'MMM d, yyyy HH:mm')} />
            {rids.submitted_at && <InfoRow label="Submitted" value={format(new Date(rids.submitted_at), 'MMM d, yyyy HH:mm')} />}
            {rids.approved_at && <InfoRow label="Approved" value={format(new Date(rids.approved_at), 'MMM d, yyyy HH:mm')} />}
            {rids.rejection_reason && <InfoRow label="Rejection Reason" value={rids.rejection_reason} />}
          </dl>
        </div>
      </div>
        </>
      )}
    </Modal>
  );
}
