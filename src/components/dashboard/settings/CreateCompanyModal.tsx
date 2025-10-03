'use client';

import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { sanitizeInput } from '@/lib/utils/validation';
import type { CreateCompanyInput } from '@/lib/types/staff';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCompanyModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCompanyModalProps) {
  const [formData, setFormData] = useState<CreateCompanyInput>({
    code: '',
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code || formData.code.trim().length < 2) {
      newErrors.code = 'Company code must be at least 2 characters';
    }

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters';
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

    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          name: formData.name,
          description: formData.description || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to create company' });
        return;
      }

      // Reset form
      setFormData({ code: '', name: '', description: '' });
      setErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating company:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ code: '', name: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Company"
      description="Add a new company to organize battalion structure and unit assignments."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Code */}
        <div>
            <Label htmlFor="code" required>
              Company Code
            </Label>
            <Input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toUpperCase() });
                setErrors({ ...errors, code: '' });
              }}
              placeholder="e.g., ALPHA, BRAVO"
              error={errors.code}
              disabled={isSubmitting}
              maxLength={20}
              className="uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier (uppercase, min 2 characters)
            </p>
        </div>

        {/* Company Name */}
        <div>
            <Label htmlFor="name" required>
              Company Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g., Alpha Company"
              error={errors.name}
              disabled={isSubmitting}
              maxLength={100}
            />
        </div>

        {/* Description */}
        <div>
            <Label htmlFor="description">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
              placeholder="Optional description of the company"
              disabled={isSubmitting}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
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
            {isSubmitting ? 'Creating...' : 'Create Company'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
