'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ActiveDutyEntry } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

interface Section8FormProps {
  entry?: ActiveDutyEntry | null;
  onSave: (data: Omit<ActiveDutyEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function Section8Form({ entry, onSave, onCancel, saving }: Section8FormProps) {
  const [formData, setFormData] = useState({
    unit: entry?.unit || '',
    purpose: entry?.purpose || '',
    authority: entry?.authority || '',
    date_start: entry?.date_start || '',
    date_end: entry?.date_end || '',
    days_served: entry?.days_served || undefined,
    efficiency_rating: entry?.efficiency_rating || '',
    evaluator: entry?.evaluator || '',
    remarks: entry?.remarks || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-calculate days served when dates change
  useEffect(() => {
    if (formData.date_start && formData.date_end) {
      const start = new Date(formData.date_start);
      const end = new Date(formData.date_end);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        setFormData(prev => ({ ...prev, days_served: diffDays }));
      }
    }
  }, [formData.date_start, formData.date_end]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    setSubmitError(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.unit?.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.purpose?.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    if (!formData.authority?.trim()) {
      newErrors.authority = 'Authority is required';
    }

    if (!formData.date_start) {
      newErrors.date_start = 'Start date is required';
    }

    if (!formData.date_end) {
      newErrors.date_end = 'End date is required';
    }

    if (formData.date_start && formData.date_end) {
      const startDate = new Date(formData.date_start);
      const endDate = new Date(formData.date_end);

      if (endDate < startDate) {
        newErrors.date_end = 'End date cannot be before start date';
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (endDate > today) {
        newErrors.date_end = 'End date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      logger.warn('⚠️ [Section8Form] Validation failed', { context: 'SECTION_FORM' });
      return;
    }

    try {
      logger.info('💾 [Section8Form] Submitting active duty entry...', { context: 'SECTION_FORM' });
      await onSave(formData);
      logger.success('✅ [Section8Form] Entry saved successfully', { context: 'SECTION_FORM' });
    } catch (error) {
      logger.error('❌ [Section8Form] Failed to save entry', error, { context: 'SECTION_FORM' });
      setSubmitError(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit' : 'Add'} Active Duty Training Entry
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Record active duty training periods and performance
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Unit *"
          placeholder="e.g., 1503rd Infantry Brigade"
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          error={errors.unit}
          helperText="Unit where active duty was performed"
        />

        <Input
          label="Purpose *"
          placeholder="e.g., Annual Training, Combat Training"
          value={formData.purpose}
          onChange={(e) => handleChange('purpose', e.target.value)}
          error={errors.purpose}
          helperText="Purpose of active duty"
        />

        <Input
          label="Authority *"
          placeholder="e.g., SO 123, GO 456"
          value={formData.authority}
          onChange={(e) => handleChange('authority', e.target.value)}
          error={errors.authority}
          helperText="Authorizing order or document"
          containerClassName="md:col-span-2"
        />

        <Input
          label="Start Date *"
          type="date"
          value={formData.date_start}
          onChange={(e) => handleChange('date_start', e.target.value)}
          error={errors.date_start}
          max={new Date().toISOString().split('T')[0]}
          helperText="Active duty start date"
        />

        <Input
          label="End Date *"
          type="date"
          value={formData.date_end}
          onChange={(e) => handleChange('date_end', e.target.value)}
          error={errors.date_end}
          max={new Date().toISOString().split('T')[0]}
          helperText="Active duty end date"
        />

        <Input
          label="Days Served"
          type="number"
          value={formData.days_served || ''}
          onChange={(e) => handleChange('days_served', e.target.value ? parseInt(e.target.value) : undefined)}
          error={errors.days_served}
          disabled
          helperText="Auto-calculated from dates"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Efficiency Rating
          </label>
          <Select
            value={formData.efficiency_rating || ''}
            onChange={(value) => handleChange('efficiency_rating', value || '')}
            options={[
              { value: '', label: 'Not Rated (Optional)' },
              { value: 'Excellent', label: 'Excellent' },
              { value: 'Satisfactory', label: 'Satisfactory' },
              { value: 'Unsatisfactory', label: 'Unsatisfactory' },
            ]}
          />
          <p className="text-xs text-gray-500 mt-1">Optional performance rating</p>
        </div>

        <Input
          label="Evaluator"
          placeholder="e.g., Col. Juan Dela Cruz"
          value={formData.evaluator || ''}
          onChange={(e) => handleChange('evaluator', e.target.value)}
          error={errors.evaluator}
          helperText="Optional name of evaluating officer"
          containerClassName="md:col-span-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          rows={3}
          placeholder="Optional remarks or notes"
          value={formData.remarks || ''}
          onChange={(e) => handleChange('remarks', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Optional additional information</p>
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
