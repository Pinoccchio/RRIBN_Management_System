'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { sanitizeInput } from '@/lib/utils/validation';
import type { Administrator, UpdateAdministratorInput } from '@/lib/types/administrator';

interface EditAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  administrator: Administrator | null;
}

export function EditAdministratorModal({
  isOpen,
  onClose,
  onSuccess,
  administrator,
}: EditAdministratorModalProps) {
  const [formData, setFormData] = useState<UpdateAdministratorInput>({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'admin',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when administrator changes
  useEffect(() => {
    if (administrator) {
      setFormData({
        firstName: administrator.profile.first_name,
        lastName: administrator.profile.last_name,
        phone: administrator.profile.phone || '',
        role: administrator.role as 'admin' | 'super_admin',
        status: administrator.status,
      });
    }
  }, [administrator]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.firstName && formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (formData.lastName && formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!administrator || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/administrators/${administrator.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({ submit: result.error || 'Failed to update administrator' });
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating administrator:', error);
      setErrors({ submit: 'An unexpected error occurred' });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!administrator) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Administrator"
      description={`Update information for ${administrator.profile.first_name} ${administrator.profile.last_name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (Read-only) */}
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={administrator.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email addresses cannot be changed for security reasons.
          </p>
        </div>

        {/* Role */}
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role || ''}
            onChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'super_admin' })}
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'super_admin', label: 'Super Administrator' },
            ]}
            disabled={isSubmitting}
          />
        </div>

        {/* First Name */}
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
            error={errors.firstName}
            disabled={isSubmitting}
          />
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
            error={errors.lastName}
            disabled={isSubmitting}
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+639XXXXXXXXX"
            error={errors.phone}
            disabled={isSubmitting}
          />
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Account Status *</Label>
          <Select
            value={formData.status || ''}
            onChange={(value) => setFormData({ ...formData, status: value as any })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' },
              { value: 'deactivated', label: 'Deactivated' },
            ]}
            disabled={isSubmitting}
          />
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
            {errors.submit}
          </div>
        )}

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
