'use client';

import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Reservist } from '@/lib/types/reservist';
import { User, Mail, Phone, Shield, Calendar, Clock, MapPin, UserCheck, FileText, Heart } from 'lucide-react';

interface ViewReservistModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservist: Reservist | null;
}

export function ViewReservistModal({
  isOpen,
  onClose,
  reservist,
}: ViewReservistModalProps) {
  if (!reservist) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
      case 'deactivated':
        return 'error';
      default:
        return 'secondary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reservist Details"
      description="Complete reservist profile and service information"
      size="xl"
    >
      <div className="space-y-6">
        {/* Profile Information Section */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Full Name</p>
                  <p className="text-sm font-medium text-navy-900">
                    {reservist.profile.first_name} {reservist.profile.middle_name ? `${reservist.profile.middle_name} ` : ''}{reservist.profile.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Date of Birth</p>
                  <p className="text-sm font-medium text-navy-900">
                    {formatDate(reservist.reservist_details.date_of_birth)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Email Address</p>
                <p className="text-sm font-medium text-navy-900">{reservist.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                <p className="text-sm font-medium text-navy-900">
                  {reservist.profile.phone || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Address</p>
                <p className="text-sm font-medium text-navy-900">
                  {reservist.reservist_details.address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Military Service Information */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Military Service Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Service Number</p>
                  <p className="text-sm font-medium text-navy-900">
                    {reservist.reservist_details.service_number}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">AFPSN</p>
                  <p className="text-sm font-medium text-navy-900">
                    {reservist.reservist_details.afpsn || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Rank</p>
                  <p className="text-sm font-medium text-navy-900">
                    {reservist.reservist_details.rank || 'Not assigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Company</p>
                  <p className="text-sm font-medium text-navy-900">
                    {reservist.reservist_details.company || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Commission Type</p>
                  <p className="text-sm font-medium text-navy-900">
                    {reservist.reservist_details.commission_type || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Reservist Status</p>
                  <Badge variant="secondary">
                    {reservist.reservist_details.reservist_status?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>

            {reservist.reservist_details.date_of_commission && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Date of Commission</p>
                  <p className="text-sm font-medium text-navy-900">
                    {formatDate(reservist.reservist_details.date_of_commission)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Emergency Contact
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Contact Name</p>
                <p className="text-sm font-medium text-navy-900">
                  {reservist.reservist_details.emergency_contact_name || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Contact Phone</p>
                <p className="text-sm font-medium text-navy-900">
                  {reservist.reservist_details.emergency_contact_phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Account Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Account Status</p>
                <Badge variant={getStatusBadgeVariant(reservist.status)}>
                  {reservist.status.charAt(0).toUpperCase() + reservist.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Account Created</p>
                <p className="text-sm font-medium text-navy-900">
                  {formatDateTime(reservist.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Last Login</p>
                <p className="text-sm font-medium text-navy-900">
                  {formatDateTime(reservist.last_login_at)}
                </p>
              </div>
            </div>

            {reservist.approver && reservist.approved_at && (
              <>
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Approved By</p>
                    <p className="text-sm font-medium text-navy-900">
                      {reservist.approver.first_name} {reservist.approver.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Approved At</p>
                    <p className="text-sm font-medium text-navy-900">
                      {formatDateTime(reservist.approved_at)}
                    </p>
                  </div>
                </div>
              </>
            )}

            {reservist.status === 'deactivated' && reservist.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-900 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">
                      {reservist.rejection_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account ID (for reference) */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-4">System Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Account ID</p>
            <p className="text-xs font-mono text-gray-800 break-all">{reservist.id}</p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
