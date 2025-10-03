'use client';

import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { CompanyBadgeList } from '@/components/ui/CompanyBadge';
import type { StaffMember } from '@/lib/types/staff';
import { Mail, Phone, Calendar, User, IdCard, Briefcase, Building2, UserCheck } from 'lucide-react';

interface ViewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
}

export function ViewStaffModal({ isOpen, onClose, staff }: ViewStaffModalProps) {
  if (!staff) {
    return null;
  }

  const fullName = `${staff.profile.first_name} ${staff.profile.last_name}`;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-navy-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-base font-medium text-navy-900 break-words">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Member Details" size="lg">
      <div className="space-y-6">
        {/* Header with Avatar */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <Avatar
            firstName={staff.profile.first_name}
            lastName={staff.profile.last_name}
            src={staff.profile.profile_photo_url}
            size="xl"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-navy-900">{fullName}</h3>
            <p className="text-gray-600 mt-1">{staff.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={staff.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
            Contact Information
          </h4>
          <div className="grid gap-4">
            <InfoRow icon={Mail} label="Email Address" value={staff.email} />
            <InfoRow icon={Phone} label="Phone Number" value={staff.profile.phone} />
          </div>
        </div>

        {/* Employment Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
            Employment Details
          </h4>
          <div className="grid gap-4">
            <InfoRow
              icon={IdCard}
              label="Employee ID"
              value={staff.staff_details.employee_id}
            />
            <InfoRow
              icon={Briefcase}
              label="Position"
              value={staff.staff_details.position}
            />
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Assigned Companies</p>
                <div className="mt-1">
                  {staff.staff_details.assigned_companies.length > 0 ? (
                    <CompanyBadgeList
                      companyCodes={staff.staff_details.assigned_companies}
                      maxDisplay={10}
                    />
                  ) : (
                    <p className="text-base font-medium text-navy-900">—</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
            Account Information
          </h4>
          <div className="grid gap-4">
            <InfoRow
              icon={Calendar}
              label="Account Created"
              value={new Date(staff.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
            {staff.creator && (
              <InfoRow
                icon={UserCheck}
                label="Created By"
                value={`${staff.creator.first_name} ${staff.creator.last_name}`}
              />
            )}
            {staff.last_login_at && (
              <InfoRow
                icon={User}
                label="Last Login"
                value={new Date(staff.last_login_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
            )}
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
