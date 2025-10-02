'use client';

import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { isValidEmail, sanitizeInput } from '@/lib/utils/validation';
import type { CreateAdministratorInput } from '@/lib/types/administrator';

interface CreateAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (password: string) => void;
}

export function CreateAdministratorModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAdministratorModalProps) {
  const [formData, setFormData] = useState<CreateAdministratorInput>({
    email: '',
    role: 'admin',
    firstName: '',
    lastName: '',
    phone: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.firstName || formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({ submit: result.error || 'Failed to create administrator' });
        setIsSubmitting(false);
        return;
      }

      // Show the temporary password
      setTempPassword(result.data.temporaryPassword);
    } catch (error) {
      console.error('Error creating administrator:', error);
      setErrors({ submit: 'An unexpected error occurred' });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (tempPassword) {
      onSuccess(tempPassword);
    }
    setFormData({
      email: '',
      role: 'admin',
      firstName: '',
      lastName: '',
      phone: '',
      status: 'active',
    });
    setErrors({});
    setTempPassword(null);
    setIsSubmitting(false);
    onClose();
  };

  // If password was generated, show success screen
  if (tempPassword) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Administrator Created Successfully"
        size="md"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-2">
              Administrator account has been created successfully!
            </p>
            <p className="text-sm text-green-700">
              The account for <strong>{formData.email}</strong> is now {formData.status}.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-900 mb-2">
              Temporary Password
            </p>
            <div className="bg-white border border-yellow-300 rounded p-3 font-mono text-sm break-all">
              {tempPassword}
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              ⚠️ Please save this password securely. It will only be shown once.
            </p>
          </div>

          <p className="text-sm text-gray-600">
            The administrator should change their password upon first login.
          </p>
        </div>

        <ModalFooter>
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Administrator Account"
      description="Add a new administrator or super administrator to the system."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
            placeholder="administrator@example.com"
            error={errors.email}
            disabled={isSubmitting}
          />
        </div>

        {/* Role */}
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'super_admin' })}
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'super_admin', label: 'Super Administrator' },
            ]}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Super Administrators have full system access, including creating other admins.
          </p>
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
          <Label htmlFor="phone">Phone Number (Optional)</Label>
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
          <Label htmlFor="status">Initial Status *</Label>
          <Select
            value={formData.status || 'active'}
            onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'pending' })}
            options={[
              { value: 'active', label: 'Active (Can login immediately)' },
              { value: 'pending', label: 'Pending (Requires approval)' },
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
            {isSubmitting ? 'Creating...' : 'Create Administrator'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
