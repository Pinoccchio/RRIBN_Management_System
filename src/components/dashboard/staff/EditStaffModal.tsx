'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import type { StaffMember, UpdateStaffInput, Company } from '@/lib/types/staff';

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staff: StaffMember | null;
}

export function EditStaffModal({
  isOpen,
  onClose,
  onSuccess,
  staff,
}: EditStaffModalProps) {
  const [formData, setFormData] = useState<UpdateStaffInput>({
    firstName: '',
    lastName: '',
    phone: '',
    employeeId: '',
    position: '',
    assignedCompanies: [],
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Fetch active companies from database
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      const response = await fetch('/api/admin/companies?active=true');
      const data = await response.json();

      if (response.ok) {
        setCompanies(data.data);
      } else {
        console.error('Failed to fetch companies:', data.error);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const companyOptions = companies.map((company, index) => {
    const colors = ['blue', 'green', 'purple', 'yellow', 'orange', 'red'];
    return {
      value: company.code,
      label: company.name,
      color: colors[index % colors.length],
    };
  });

  // Populate form when staff changes
  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.profile.first_name,
        lastName: staff.profile.last_name,
        phone: staff.profile.phone || '',
        employeeId: staff.staff_details.employee_id || '',
        position: staff.staff_details.position || '',
        assignedCompanies: staff.staff_details.assigned_companies || [],
        status: staff.status,
      });
    }
  }, [staff]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName || formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.assignedCompanies && formData.assignedCompanies.length === 0) {
      newErrors.assignedCompanies = 'At least one company must be assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/staff/${staff.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({ submit: result.error || 'Failed to update staff member' });
        setIsSubmitting(false);
        return;
      }

      // Success - close modal and refresh
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating staff member:', error);
      setErrors({ submit: 'An unexpected error occurred' });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!staff) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Staff Member" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Email (Read-only) */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={staff.email}
              disabled
              className="bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-600">Email cannot be changed</p>
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" required>
                First Name
              </Label>
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
            <div>
              <Label htmlFor="lastName" required>
                Last Name
              </Label>
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
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+63 912 345 6789"
              error={errors.phone}
              disabled={isSubmitting}
            />
          </div>

          {/* Employee ID and Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="EMP-12345"
                error={errors.employeeId}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Administrative Officer"
                error={errors.position}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Assigned Companies */}
          <div>
            <MultiSelect
              label="Assigned Companies"
              options={companyOptions}
              value={formData.assignedCompanies || []}
              onChange={(value) => setFormData({ ...formData, assignedCompanies: value })}
              placeholder="Select companies..."
              error={errors.assignedCompanies}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-600">
              Staff can be assigned to multiple companies
            </p>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as any })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'deactivated', label: 'Deactivated' },
              ]}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
