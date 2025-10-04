'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TrainingWithStats, UpdateTrainingInput } from '@/lib/types/training';
import { convertUTCToManilaLocal, convertManilaLocalToUTC } from '@/lib/utils/timezone';

interface EditTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (trainingId: string, input: UpdateTrainingInput) => Promise<void>;
  training: TrainingWithStats | null;
  assignedCompanies: string[];
}

export function EditTrainingModal({
  isOpen,
  onClose,
  onUpdate,
  training,
  assignedCompanies,
}: EditTrainingModalProps) {
  const [formData, setFormData] = useState<UpdateTrainingInput>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (training) {
      setFormData({
        title: training.title,
        description: training.description || '',
        company: training.company || '',
        training_category: training.training_category || 'Other',
        scheduled_date: training.scheduled_date ? convertUTCToManilaLocal(training.scheduled_date) : '',
        end_date: training.end_date ? convertUTCToManilaLocal(training.end_date) : '',
        location: training.location || '',
        capacity: training.capacity || undefined,
        prerequisites: training.prerequisites || '',
        status: training.status,
      });
    }
  }, [training]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!training) return;

    if (formData.title && !formData.title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    if (formData.scheduled_date && formData.end_date) {
      const scheduledDate = new Date(formData.scheduled_date);
      const endDate = new Date(formData.end_date);
      if (endDate < scheduledDate) {
        setError('End date must be after scheduled date');
        return;
      }
    }

    if (formData.capacity !== undefined && formData.capacity !== null && formData.capacity <= 0) {
      setError('Capacity must be greater than 0');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert Manila time back to UTC before sending to API
      const updatePayload: UpdateTrainingInput = {
        ...formData,
        scheduled_date: formData.scheduled_date ? convertManilaLocalToUTC(formData.scheduled_date) : formData.scheduled_date,
        end_date: formData.end_date ? convertManilaLocalToUTC(formData.end_date) : formData.end_date,
      };

      await onUpdate(training.id, updatePayload);
      handleClose();
    } catch (error) {
      console.error('Error updating training:', error);
      setError('Failed to update training. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setError(null);
    onClose();
  };

  if (!training) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Edit Training Session"
      description="Update training session details"
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
            value={formData.title || ''}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              setError(null);
            }}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        {/* Company & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <select
              id="company"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">System-wide</option>
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
              value={formData.training_category || ''}
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
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scheduled Date */}
          <div>
            <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={formData.scheduled_date || ''}
              onChange={(e) => {
                setFormData({ ...formData, scheduled_date: e.target.value });
                setError(null);
              }}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Philippine Time (UTC+8)
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
              value={formData.end_date || ''}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Philippine Time (UTC+8)
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
              placeholder="Unlimited"
            />
          </div>

          {/* Prerequisites */}
          <div>
            <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites
            </label>
            <Input
              id="prerequisites"
              type="text"
              value={formData.prerequisites || ''}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status || training.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Training'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
