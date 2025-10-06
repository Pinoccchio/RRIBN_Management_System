'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DesignationEntry } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

interface Section10FormProps {
  entry?: DesignationEntry | null;
  onSave: (data: Omit<DesignationEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function Section10Form({ entry, onSave, onCancel, saving }: Section10FormProps) {
  const [formData, setFormData] = useState({
    position: entry?.position || '',
    authority: entry?.authority || '',
    date_from: entry?.date_from || '',
    date_to: entry?.date_to || '',
    is_current: entry?.is_current || false,
    responsibilities: entry?.responsibilities || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    setSubmitError(null);

    // If marking as current, clear date_to
    if (field === 'is_current' && value === true) {
      setFormData(prev => ({ ...prev, is_current: true, date_to: '' }));
      if (errors.date_to) {
        setErrors(prev => ({ ...prev, date_to: '' }));
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.position?.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.authority?.trim()) {
      newErrors.authority = 'Authority is required';
    }

    if (!formData.date_from) {
      newErrors.date_from = 'Start date is required';
    }

    // Only validate date_to if not current designation
    if (!formData.is_current) {
      if (!formData.date_to) {
        newErrors.date_to = 'End date is required (or mark as current designation)';
      }

      if (formData.date_from && formData.date_to) {
        const fromDate = new Date(formData.date_from);
        const toDate = new Date(formData.date_to);

        if (toDate < fromDate) {
          newErrors.date_to = 'End date cannot be before start date';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (toDate > today) {
          newErrors.date_to = 'End date cannot be in the future';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      logger.warn('⚠️ [Section10Form] Validation failed', { context: 'SECTION_FORM' });
      return;
    }

    try {
      logger.info('💾 [Section10Form] Submitting designation entry...', { context: 'SECTION_FORM' });
      await onSave(formData);
      logger.success('✅ [Section10Form] Entry saved successfully', { context: 'SECTION_FORM' });
    } catch (error) {
      logger.error('❌ [Section10Form] Failed to save entry', error, { context: 'SECTION_FORM' });
      setSubmitError(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit' : 'Add'} Designation Entry
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Record position designations and leadership roles
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Position *"
          placeholder="e.g., Squad Leader, Platoon Sergeant, Company Commander"
          value={formData.position}
          onChange={(e) => handleChange('position', e.target.value)}
          error={errors.position}
          helperText="Position or role designation"
          containerClassName="md:col-span-2"
        />

        <Input
          label="Authority *"
          placeholder="e.g., SO 123, GO 456, HQ Order 789"
          value={formData.authority}
          onChange={(e) => handleChange('authority', e.target.value)}
          error={errors.authority}
          helperText="Authorizing order or document"
          containerClassName="md:col-span-2"
        />

        <Input
          label="Start Date *"
          type="date"
          value={formData.date_from}
          onChange={(e) => handleChange('date_from', e.target.value)}
          error={errors.date_from}
          max={new Date().toISOString().split('T')[0]}
          helperText="Designation start date"
        />

        <Input
          label="End Date"
          type="date"
          value={formData.date_to || ''}
          onChange={(e) => handleChange('date_to', e.target.value)}
          error={errors.date_to}
          max={new Date().toISOString().split('T')[0]}
          disabled={formData.is_current}
          helperText={formData.is_current ? 'Disabled for current designation' : 'Designation end date'}
        />

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_current}
              onChange={(e) => handleChange('is_current', e.target.checked)}
              className="w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-navy-500"
            />
            <span className="text-sm font-medium text-gray-700">
              This is my current designation
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Check this box if you currently hold this position
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Responsibilities
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          rows={4}
          placeholder="Describe key responsibilities and duties for this position"
          value={formData.responsibilities || ''}
          onChange={(e) => handleChange('responsibilities', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Optional description of duties and responsibilities</p>
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
