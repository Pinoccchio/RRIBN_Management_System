'use client';

import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Administrator } from '@/lib/types/administrator';
import { User, Mail, Phone, Shield, Calendar, Clock, UserCheck } from 'lucide-react';

interface ViewAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  administrator: Administrator | null;
}

export function ViewAdministratorModal({
  isOpen,
  onClose,
  administrator,
}: ViewAdministratorModalProps) {
  if (!administrator) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeVariant = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'primary';
      default:
        return 'secondary';
    }
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

  const formatRole = (role: string) => {
    return role.replace('_', ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administrator Details"
      description="View administrator account information"
      size="lg"
    >
      <div className="space-y-6">
        {/* Profile Information Section */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Full Name</p>
                <p className="text-sm font-medium text-navy-900">
                  {administrator.profile.first_name} {administrator.profile.last_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Email Address</p>
                <p className="text-sm font-medium text-navy-900">{administrator.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                <p className="text-sm font-medium text-navy-900">
                  {administrator.profile.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Account Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Role</p>
                <Badge variant={getRoleBadgeVariant(administrator.role)}>
                  {formatRole(administrator.role)}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <Badge variant={getStatusBadgeVariant(administrator.status)}>
                  {administrator.status.charAt(0).toUpperCase() + administrator.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Account Created</p>
                <p className="text-sm font-medium text-navy-900">
                  {formatDate(administrator.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Last Login</p>
                <p className="text-sm font-medium text-navy-900">
                  {formatDate(administrator.last_login_at)}
                </p>
              </div>
            </div>

            {administrator.creator && (
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Created By</p>
                  <p className="text-sm font-medium text-navy-900">
                    {administrator.creator.first_name} {administrator.creator.last_name}
                  </p>
                </div>
              </div>
            )}

            {administrator.approved_by && administrator.approved_at && (
              <>
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Approved At</p>
                    <p className="text-sm font-medium text-navy-900">
                      {formatDate(administrator.approved_at)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account ID (for reference) */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-4">System Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Account ID</p>
            <p className="text-xs font-mono text-gray-800 break-all">{administrator.id}</p>
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
