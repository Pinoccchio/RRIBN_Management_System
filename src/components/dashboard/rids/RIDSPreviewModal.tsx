'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RIDSStatusBadge } from '@/components/ui/Badge';
import type { RIDSFormComplete } from '@/lib/types/rids';
import { formatManilaTime } from '@/lib/utils/timezone';
import { User, Calendar, FileText, Send, CheckCircle, XCircle } from 'lucide-react';

interface RIDSPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rids: RIDSFormComplete | null;
  onSubmit?: (rids: RIDSFormComplete) => void;
  onApprove?: (rids: RIDSFormComplete) => void;
  onReject?: (rids: RIDSFormComplete) => void;
}

export function RIDSPreviewModal({
  isOpen,
  onClose,
  rids,
  onSubmit,
  onApprove,
  onReject,
}: RIDSPreviewModalProps) {
  if (!rids) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="RIDS Preview"
      description="Reservist Information Data Sheet"
    >
      <div className="space-y-6">
        {/* Reservist Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <User className="w-4 h-4 mr-2" />
              Reservist
            </div>
            <div className="font-semibold text-navy-900">
              {rids.reservist?.first_name} {rids.reservist?.middle_name ? `${rids.reservist?.middle_name} ` : ''}{rids.reservist?.last_name}
            </div>
            <div className="text-sm text-gray-600">
              {rids.reservist?.service_number} • {rids.reservist?.company || 'No Company'}
            </div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <FileText className="w-4 h-4 mr-2" />
              RIDS Details
            </div>
            <div className="text-sm font-medium text-navy-900">Version {rids.version}</div>
            <div className="text-sm text-gray-600">
              <RIDSStatusBadge status={rids.status} size="sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              Created
            </div>
            <div className="text-sm font-medium text-navy-900">{formatManilaTime(rids.created_at)}</div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              Updated
            </div>
            <div className="text-sm font-medium text-navy-900">{formatManilaTime(rids.updated_at)}</div>
          </div>
        </div>

        {/* Approval/Rejection Info */}
        {rids.approved_at && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-navy-900 mb-2">
              {rids.status === 'approved' ? 'Approval Information' : 'Rejection Information'}
            </h4>
            <div className="space-y-2 text-sm">
              {rids.approver && (
                <div>
                  <span className="text-gray-600">{rids.status === 'approved' ? 'Approved' : 'Rejected'} by:</span>{' '}
                  <span className="font-medium">{rids.approver.first_name} {rids.approver.last_name}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Date:</span>{' '}
                <span className="font-medium">{formatManilaTime(rids.approved_at)}</span>
              </div>
              {rids.rejection_reason && (
                <div>
                  <span className="text-gray-600">Rejection Reason:</span>
                  <div className="mt-1 p-2 bg-white rounded border border-red-200 text-red-800">
                    {rids.rejection_reason}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personal Information (Section 2) */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-navy-900 mb-3">Section 2: Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {rids.present_occupation && (
              <div>
                <span className="text-gray-600">Occupation:</span>{' '}
                <span className="font-medium">{rids.present_occupation}</span>
              </div>
            )}
            {rids.company_name && (
              <div>
                <span className="text-gray-600">Company:</span>{' '}
                <span className="font-medium">{rids.company_name}</span>
              </div>
            )}
            {rids.mobile_tel_nr && (
              <div>
                <span className="text-gray-600">Mobile:</span>{' '}
                <span className="font-medium">{rids.mobile_tel_nr}</span>
              </div>
            )}
            {rids.home_address_city && (
              <div>
                <span className="text-gray-600">Address:</span>{' '}
                <span className="font-medium">
                  {rids.home_address_street && `${rids.home_address_street}, `}
                  {rids.home_address_city}, {rids.home_address_province}
                </span>
              </div>
            )}
            {rids.religion && (
              <div>
                <span className="text-gray-600">Religion:</span>{' '}
                <span className="font-medium">{rids.religion}</span>
              </div>
            )}
            {rids.marital_status && (
              <div>
                <span className="text-gray-600">Marital Status:</span>{' '}
                <span className="font-medium">{rids.marital_status}</span>
              </div>
            )}
            {rids.height_cm && (
              <div>
                <span className="text-gray-600">Height:</span>{' '}
                <span className="font-medium">{rids.height_cm} cm</span>
              </div>
            )}
            {rids.weight_kg && (
              <div>
                <span className="text-gray-600">Weight:</span>{' '}
                <span className="font-medium">{rids.weight_kg} kg</span>
              </div>
            )}
          </div>
        </div>

        {/* Service Records Summary */}
        {(rids.promotion_history?.length || rids.military_training?.length || rids.awards?.length) ? (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-navy-900 mb-3">Service Records</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {rids.promotion_history && rids.promotion_history.length > 0 && (
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-gray-600">Promotion History</div>
                  <div className="text-2xl font-bold text-navy-900">{rids.promotion_history.length}</div>
                </div>
              )}
              {rids.military_training && rids.military_training.length > 0 && (
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-gray-600">Military Training</div>
                  <div className="text-2xl font-bold text-navy-900">{rids.military_training.length}</div>
                </div>
              )}
              {rids.awards && rids.awards.length > 0 && (
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-gray-600">Awards</div>
                  <div className="text-2xl font-bold text-navy-900">{rids.awards.length}</div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Biometrics Status */}
        {(rids.photo_url || rids.thumbmark_url || rids.signature_url) && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-navy-900 mb-3">Section 11: Biometrics</h4>
            <div className="flex gap-4">
              {rids.photo_url && (
                <div className="text-sm">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Photo uploaded
                </div>
              )}
              {rids.thumbmark_url && (
                <div className="text-sm">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Thumbmark uploaded
                </div>
              )}
              {rids.signature_url && (
                <div className="text-sm">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Signature uploaded
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>

          {/* Submit button - only for draft/rejected */}
          {(rids.status === 'draft' || rids.status === 'rejected') && onSubmit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onSubmit(rids);
                onClose();
              }}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </Button>
          )}

          {/* Quick Actions for Submitted RIDS */}
          {rids.status === 'submitted' && onApprove && onReject && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onReject(rids);
                  onClose();
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onApprove(rids);
                  onClose();
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
