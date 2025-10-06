'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MilitaryTrainingEntry } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

interface Section4FormProps {
  entry?: MilitaryTrainingEntry | null;
  onSave: (data: Omit<MilitaryTrainingEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function Section4Form({ entry, onSave, onCancel, saving }: Section4FormProps) {
  const [formData, setFormData] = useState({
    training_name: entry?.training_name || '',
    school: entry?.school || '',
    date_graduated: entry?.date_graduated || '',
    certificate_number: entry?.certificate_number || '',
    training_category: entry?.training_category || 'Basic' as const,
    duration_days: entry?.duration_days || undefined,
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

    if (!formData.training_name?.trim()) {
      newErrors.training_name = 'Training name is required';
    }

    if (!formData.school?.trim()) {
      newErrors.school = 'School/institution is required';
    }

    if (!formData.date_graduated) {
      newErrors.date_graduated = 'Graduation date is required';
    } else {
      const gradDate = new Date(formData.date_graduated);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (gradDate > today) {
        newErrors.date_graduated = 'Date cannot be in the future';
      }
    }

    if (formData.duration_days && formData.duration_days < 1) {
      newErrors.duration_days = 'Duration must be at least 1 day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      logger.warn('⚠️ [Section4Form] Validation failed', { context: 'SECTION_FORM' });
      return;
    }

    try {
      logger.info('💾 [Section4Form] Submitting military training entry...', { context: 'SECTION_FORM' });
      await onSave(formData);
      logger.success('✅ [Section4Form] Entry saved successfully', { context: 'SECTION_FORM' });
    } catch (error) {
      logger.error('❌ [Section4Form] Failed to save entry', error, { context: 'SECTION_FORM' });
      setSubmitError(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit' : 'Add'} Military Training Entry
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Record military training, seminars, and schooling
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Training Name *"
          placeholder="e.g., Basic Infantry Course, Leadership Seminar"
          value={formData.training_name}
          onChange={(e) => handleChange('training_name', e.target.value)}
          error={errors.training_name}
          helperText="Full name of the training or course"
        />

        <Input
          label="School/Institution *"
          placeholder="e.g., Philippine Army Training School"
          value={formData.school}
          onChange={(e) => handleChange('school', e.target.value)}
          error={errors.school}
          helperText="Training institution or academy"
        />

        <Input
          label="Date Graduated *"
          type="date"
          value={formData.date_graduated}
          onChange={(e) => handleChange('date_graduated', e.target.value)}
          error={errors.date_graduated}
          max={new Date().toISOString().split('T')[0]}
          helperText="Completion or graduation date"
        />

        <Input
          label="Certificate Number"
          placeholder="e.g., CERT-2024-001"
          value={formData.certificate_number || ''}
          onChange={(e) => handleChange('certificate_number', e.target.value)}
          error={errors.certificate_number}
          helperText="Optional certificate or diploma number"
        />

        <Select
          label="Training Category"
          value={formData.training_category}
          onChange={(value) => handleChange('training_category', value)}
          options={[
            { value: 'Basic', label: 'Basic' },
            { value: 'Advanced', label: 'Advanced' },
            { value: 'Specialized', label: 'Specialized' },
            { value: 'Other', label: 'Other' },
          ]}
        />

        <Input
          label="Duration (Days)"
          type="number"
          placeholder="e.g., 30"
          value={formData.duration_days || ''}
          onChange={(e) => handleChange('duration_days', e.target.value ? parseInt(e.target.value) : undefined)}
          error={errors.duration_days}
          min={1}
          helperText="Optional training duration in days"
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
