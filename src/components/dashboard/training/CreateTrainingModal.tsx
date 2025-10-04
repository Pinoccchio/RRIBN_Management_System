'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CreateTrainingInput } from '@/lib/types/training';
import { convertManilaLocalToUTC } from '@/lib/utils/timezone';

interface CreateTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateTrainingInput) => Promise<void>;
  assignedCompanies: string[];
}

export function CreateTrainingModal({
  isOpen,
  onClose,
  onCreate,
  assignedCompanies,
}: CreateTrainingModalProps) {
  const [formData, setFormData] = useState<CreateTrainingInput>({
    title: '',
    description: '',
    company: assignedCompanies[0] || '',
    training_category: 'Other',
    scheduled_date: '',
    end_date: '',
    location: '',
    capacity: undefined,
    prerequisites: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.scheduled_date) {
      setError('Scheduled date is required');
      return;
    }

    const scheduledDate = new Date(formData.scheduled_date);
    if (formData.end_date) {
      const endDate = new Date(formData.end_date);
      if (endDate < scheduledDate) {
        setError('End date must be after scheduled date');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert Manila time to UTC before sending to API
      const createPayload: CreateTrainingInput = {
        ...formData,
        scheduled_date: convertManilaLocalToUTC(formData.scheduled_date),
        end_date: formData.end_date ? convertManilaLocalToUTC(formData.end_date) : '',
      };

      await onCreate(createPayload);
      handleClose();
    } catch (error) {
      console.error('Error creating training:', error);
      setError('Failed to create training. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      company: assignedCompanies[0] || '',
      training_category: 'Other',
      scheduled_date: '',
      end_date: '',
      location: '',
      capacity: undefined,
      prerequisites: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Create Training Session"
      description="Schedule a new training session for your company"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Training Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              setError(null);
            }}
            required
            placeholder="e.g., Rifle Marksmanship Training"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Provide details about the training..."
          />
        </div>

        {/* Company & Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Company <span className="text-red-500">*</span>
            </label>
            <select
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Select company</option>
              {assignedCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Training Category */}
          <div>
            <label htmlFor="training_category" className="block text-sm font-medium text-gray-700 mb-2">
              Training Category
            </label>
            <select
              id="training_category"
              value={formData.training_category}
              onChange={(e) => setFormData({ ...formData, training_category: e.target.value as 'Leadership' | 'Combat' | 'Technical' | 'Seminar' | 'Other' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="Leadership">Leadership</option>
              <option value="Combat">Combat</option>
              <option value="Technical">Technical</option>
              <option value="Seminar">Seminar</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Camp Aguinaldo"
          />
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scheduled Date */}
          <div>
            <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => {
                setFormData({ ...formData, scheduled_date: e.target.value });
                setError(null);
              }}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Philippine Time (UTC+8) • Format: MM/DD/YYYY HH:mm
            </p>
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <Input
              id="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Philippine Time (UTC+8) • Format: MM/DD/YYYY HH:mm
            </p>
          </div>
        </div>

        {/* Capacity & Prerequisites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Capacity */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              Capacity
            </label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Leave blank for unlimited"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum number of participants (leave blank for unlimited)
            </p>
          </div>

          {/* Prerequisites */}
          <div>
            <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites
            </label>
            <Input
              id="prerequisites"
              type="text"
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              placeholder="e.g., BMT completion"
            />
          </div>
        </div>

        {/* Info Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> After creating the training, reservists can register via the mobile app.
            You can then mark attendance and award training hours upon completion.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Training'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
