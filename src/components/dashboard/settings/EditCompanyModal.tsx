'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import type { Company, UpdateCompanyInput } from '@/lib/types/staff';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company: Company | null;
}

export function EditCompanyModal({
  isOpen,
  onClose,
  onSuccess,
  company,
}: EditCompanyModalProps) {
  const [formData, setFormData] = useState<UpdateCompanyInput>({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when company changes
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description || '',
      });
    }
  }, [company]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/companies/${company.code}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to update company' });
        return;
      }

      setErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating company:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!company) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Company"
      description="Update company information and settings."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Code (Read-only) */}
        <div>
            <Label htmlFor="code">
              Company Code
            </Label>
            <Input
              id="code"
              type="text"
              value={company.code}
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Company code cannot be changed
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
