'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { EducationEntry } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

interface Section7FormProps {
  entry?: EducationEntry | null;
  onSave: (data: Omit<EducationEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function Section7Form({ entry, onSave, onCancel, saving }: Section7FormProps) {
  const [formData, setFormData] = useState({
    course: entry?.course || '',
    school: entry?.school || '',
    date_graduated: entry?.date_graduated || '',
    level: entry?.level || 'College' as const,
    honors: entry?.honors || '',
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

    if (!formData.course?.trim()) {
      newErrors.course = 'Course/program is required';
    }

    if (!formData.school?.trim()) {
      newErrors.school = 'School/institution is required';
    }

    if (formData.date_graduated) {
      const gradDate = new Date(formData.date_graduated);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (gradDate > today) {
        newErrors.date_graduated = 'Date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      logger.warn('⚠️ [Section7Form] Validation failed', { context: 'SECTION_FORM' });
      return;
    }

    try {
      logger.info('💾 [Section7Form] Submitting education entry...', { context: 'SECTION_FORM' });
      await onSave(formData);
      logger.success('✅ [Section7Form] Entry saved successfully', { context: 'SECTION_FORM' });
    } catch (error) {
      logger.error('❌ [Section7Form] Failed to save entry', error, { context: 'SECTION_FORM' });
      setSubmitError(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit' : 'Add'} Educational Attainment Entry
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Record academic qualifications and certifications
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Course/Program *"
          placeholder="e.g., Bachelor of Science in Computer Science"
          value={formData.course}
          onChange={(e) => handleChange('course', e.target.value)}
          error={errors.course}
          helperText="Degree, diploma, or program name"
          containerClassName="md:col-span-2"
        />

        <Input
          label="School/Institution *"
          placeholder="e.g., University of the Philippines"
          value={formData.school}
          onChange={(e) => handleChange('school', e.target.value)}
          error={errors.school}
          helperText="Name of educational institution"
        />

        <Input
          label="Date Graduated"
          type="date"
          value={formData.date_graduated || ''}
          onChange={(e) => handleChange('date_graduated', e.target.value)}
          error={errors.date_graduated}
          max={new Date().toISOString().split('T')[0]}
          helperText="Optional graduation date"
        />

        <Select
          label="Educational Level *"
          value={formData.level}
          onChange={(value) => handleChange('level', value)}
          options={[
            { value: 'High School', label: 'High School' },
            { value: 'Vocational', label: 'Vocational/Technical' },
            { value: 'College', label: 'College (Undergraduate)' },
            { value: 'Graduate - Masters', label: 'Graduate - Masters' },
            { value: 'Graduate - Doctorate', label: 'Graduate - Doctorate' },
          ]}
        />

        <Input
          label="Honors/Awards"
          placeholder="e.g., Cum Laude, Dean's List"
          value={formData.honors || ''}
          onChange={(e) => handleChange('honors', e.target.value)}
          error={errors.honors}
          helperText="Optional academic honors or awards"
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
