'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DependentEntry } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

interface Section6FormProps {
  entry?: DependentEntry | null;
  onSave: (data: Omit<DependentEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function Section6Form({ entry, onSave, onCancel, saving }: Section6FormProps) {
  const [formData, setFormData] = useState({
    relation: entry?.relation || 'Spouse' as const,
    full_name: entry?.full_name || '',
    birthdate: entry?.birthdate || '',
    contact_info: entry?.contact_info || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    setSubmitError(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.birthdate) {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (birthDate > today) {
        newErrors.birthdate = 'Birthdate cannot be in the future';
      }

      // Check for reasonable birthdate (not more than 120 years ago)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      if (birthDate < minDate) {
        newErrors.birthdate = 'Birthdate is not valid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      logger.warn('⚠️ [Section6Form] Validation failed', { context: 'SECTION_FORM' });
      return;
    }

    try {
      logger.info('💾 [Section6Form] Submitting dependent entry...', { context: 'SECTION_FORM' });
      await onSave(formData);
      logger.success('✅ [Section6Form] Entry saved successfully', { context: 'SECTION_FORM' });
    } catch (error) {
      logger.error('❌ [Section6Form] Failed to save entry', error, { context: 'SECTION_FORM' });
      setSubmitError(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit' : 'Add'} Dependent Entry
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Record family members and dependents
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Relationship *"
          value={formData.relation}
          onChange={(value) => handleChange('relation', value)}
          options={[
            { value: 'Spouse', label: 'Spouse' },
            { value: 'Son', label: 'Son' },
            { value: 'Daughter', label: 'Daughter' },
            { value: 'Father', label: 'Father' },
            { value: 'Mother', label: 'Mother' },
            { value: 'Sibling', label: 'Sibling' },
            { value: 'Other', label: 'Other' },
          ]}
        />

        <Input
          label="Full Name *"
          placeholder="e.g., Maria Clara Santos"
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          error={errors.full_name}
          helperText="Complete name of dependent"
        />

        <Input
          label="Birthdate"
          type="date"
          value={formData.birthdate || ''}
          onChange={(e) => handleChange('birthdate', e.target.value)}
          error={errors.birthdate}
          max={new Date().toISOString().split('T')[0]}
          helperText="Optional birthdate"
        />

        <Input
          label="Contact Information"
          placeholder="e.g., 0917-123-4567"
          value={formData.contact_info || ''}
          onChange={(e) => handleChange('contact_info', e.target.value)}
          error={errors.contact_info}
          helperText="Optional phone or email"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : entry ? 'Update Entry' : 'Add Entry'}
        </Button>
      </div>
    </form>
  );
}
