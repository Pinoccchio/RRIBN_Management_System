'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AwardEntry } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

interface Section5FormProps {
  entry?: AwardEntry | null;
  onSave: (data: Omit<AwardEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function Section5Form({ entry, onSave, onCancel, saving }: Section5FormProps) {
  const [formData, setFormData] = useState({
    award_name: entry?.award_name || '',
    authority: entry?.authority || '',
    date_awarded: entry?.date_awarded || '',
    citation: entry?.citation || '',
    award_category: entry?.award_category || 'Medal' as const,
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

    if (!formData.award_name?.trim()) {
      newErrors.award_name = 'Award name is required';
    }

    if (!formData.authority?.trim()) {
      newErrors.authority = 'Authority is required';
    }

    if (!formData.date_awarded) {
      newErrors.date_awarded = 'Award date is required';
    } else {
      const awardDate = new Date(formData.date_awarded);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (awardDate > today) {
        newErrors.date_awarded = 'Date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit' : 'Add'} Award Entry
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Record military awards and decorations
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Award Name *"
          placeholder="e.g., Medal of Valor, Distinguished Service Cross"
          value={formData.award_name}
          onChange={(e) => handleChange('award_name', e.target.value)}
          error={errors.award_name}
          helperText="Official name of the award"
          containerClassName="md:col-span-2"
        />

        <Input
          label="Authority *"
          placeholder="e.g., GHQ AFP, SO 123"
          value={formData.authority}
          onChange={(e) => handleChange('authority', e.target.value)}
          error={errors.authority}
          helperText="Awarding authority or order"
        />

        <Input
          label="Date Awarded *"
          type="date"
          value={formData.date_awarded}
          onChange={(e) => handleChange('date_awarded', e.target.value)}
          error={errors.date_awarded}
          max={new Date().toISOString().split('T')[0]}
          helperText="Date award was conferred"
        />

        <Select
          label="Award Category"
          value={formData.award_category}
          onChange={(value) => handleChange('award_category', value)}
          options={[
            { value: 'Medal', label: 'Medal' },
            { value: 'Ribbon', label: 'Ribbon' },
            { value: 'Certificate', label: 'Certificate' },
            { value: 'Other', label: 'Other' },
          ]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Citation
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          rows={4}
          placeholder="Optional citation or reason for award"
          value={formData.citation || ''}
          onChange={(e) => handleChange('citation', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Optional description or citation text</p>
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
