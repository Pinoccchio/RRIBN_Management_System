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
  onSuccess: () => void;
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
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

      // Success - close modal and refresh
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating administrator:', error);
      setErrors({ submit: 'An unexpected error occurred' });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      role: 'admin',
      firstName: '',
      lastName: '',
      phone: '',
      status: 'active',
      password: '',
    });
    setConfirmPassword('');
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

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

        {/* Password */}
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password (min 8 characters)"
            error={errors.password}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Password will be used by the administrator to log in. They can change it later.
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
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
