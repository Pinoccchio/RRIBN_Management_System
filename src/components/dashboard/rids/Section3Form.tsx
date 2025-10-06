'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PromotionHistoryEntry } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

interface Section3FormProps {
  entry?: PromotionHistoryEntry | null;
  onSave: (data: Omit<PromotionHistoryEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function Section3Form({ entry, onSave, onCancel, saving }: Section3FormProps) {
  const [formData, setFormData] = useState({
    entry_number: entry?.entry_number || 1,
    rank: entry?.rank || '',
    date_of_rank: entry?.date_of_rank || '',
    authority: entry?.authority || '',
    action_type: entry?.action_type || 'Promotion' as const,
    notes: entry?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    setSubmitError(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.entry_number || formData.entry_number < 1) {
      newErrors.entry_number = 'Entry number must be at least 1';
    }

    if (!formData.rank?.trim()) {
      newErrors.rank = 'Rank is required';
    }

    if (!formData.date_of_rank) {
      newErrors.date_of_rank = 'Date of rank is required';
    } else {
      // Date cannot be in future
      const rankDate = new Date(formData.date_of_rank);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (rankDate > today) {
        newErrors.date_of_rank = 'Date cannot be in the future';
      }
    }

    if (!formData.authority?.trim()) {
      newErrors.authority = 'Authority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      logger.warn('⚠️ [Section3Form] Validation failed', { context: 'SECTION_FORM' });
      return;
    }

    try {
      logger.info('💾 [Section3Form] Submitting promotion history entry...', { context: 'SECTION_FORM' });
      await onSave(formData);
      logger.success('✅ [Section3Form] Entry saved successfully', { context: 'SECTION_FORM' });
    } catch (error) {
      logger.error('❌ [Section3Form] Failed to save entry', error, { context: 'SECTION_FORM' });
      setSubmitError(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit' : 'Add'} Promotion/Demotion Entry
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Record promotion, demotion, or initial commission history
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Entry Number */}
        <Input
          label="Entry Number *"
          type="number"
          value={formData.entry_number}
          onChange={(e) => handleChange('entry_number', parseInt(e.target.value) || 1)}
          error={errors.entry_number}
          min={1}
          placeholder="1, 2, 3..."
          helperText="Sequential entry number for this record"
        />

        {/* Rank */}
        <Input
          label="Rank *"
          placeholder="e.g., PFC, CPL, SGT, 2LT, 1LT"
          value={formData.rank}
          onChange={(e) => handleChange('rank', e.target.value)}
          error={errors.rank}
          helperText="Military rank achieved"
        />

        {/* Date of Rank */}
        <Input
          label="Date of Rank *"
          type="date"
          value={formData.date_of_rank}
          onChange={(e) => handleChange('date_of_rank', e.target.value)}
          error={errors.date_of_rank}
          max={new Date().toISOString().split('T')[0]}
          helperText="Date rank was effective"
        />

        {/* Authority */}
        <Input
          label="Authority *"
          placeholder="e.g., SO 123, GO 456, HQ Order 789"
          value={formData.authority}
          onChange={(e) => handleChange('authority', e.target.value)}
          error={errors.authority}
          helperText="Authorizing order or document"
        />

        {/* Action Type */}
        <Select
          label="Action Type *"
          value={formData.action_type}
          onChange={(value) => handleChange('action_type', value)}
          options={[
            { value: 'Promotion', label: 'Promotion' },
            { value: 'Demotion', label: 'Demotion' },
            { value: 'Initial Commission', label: 'Initial Commission' },
          ]}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          rows={3}
          placeholder="Optional notes, remarks, or additional context"
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Optional field for additional information</p>
      </div>

      {/* Actions */}
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
