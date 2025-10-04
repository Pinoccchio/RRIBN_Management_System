'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Calendar, MapPin, Users, Clock, Award } from 'lucide-react';
import type { TrainingWithStats } from '@/lib/types/training';
import { formatManilaTime } from '@/lib/utils/timezone';

interface DeleteTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (trainingId: string) => Promise<void>;
  training: TrainingWithStats | null;
}

export function DeleteTrainingModal({
  isOpen,
  onClose,
  onDelete,
  training,
}: DeleteTrainingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!training) return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(training.id);
      onClose();
    } catch (error) {
      console.error('Error deleting training:', error);
      setError('Failed to delete training. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!training) return null;

  // Check if training can be safely deleted
  const hasRegistrations = training.registration_count > 0;
  const hasAwardedHours = training.passed_count > 0 || training.failed_count > 0;
  const isCompleted = training.status === 'completed';
  const cannotDelete = isCompleted || hasAwardedHours;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Delete Training Session"
      description="Confirm training session deletion"
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">Warning: This action cannot be undone</h3>
            <p className="text-sm text-red-800">
              {cannotDelete
                ? 'This training session cannot be deleted because it has already been completed or has awarded training hours. These records are critical for promotion analytics and must be preserved.'
                : 'Deleting this training session will permanently remove all associated data.'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Training Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Training Title</h4>
            <p className="text-base font-semibold text-gray-900">{training.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Scheduled Date
              </h4>
              <p className="text-sm text-gray-900">
                {training.scheduled_date ? formatManilaTime(training.scheduled_date) : 'Not set'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </h4>
              <p className="text-sm text-gray-900">{training.location || 'Not specified'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Company</h4>
              <p className="text-sm text-gray-900">{training.company || 'System-wide'}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                training.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                training.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                training.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                'bg-red-100 text-red-700'
              }`}>
                {training.status.charAt(0).toUpperCase() + training.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Associated Data
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-blue-700 mb-1">Registrations</p>
              <p className="text-lg font-bold text-blue-900">{training.registration_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Attended</p>
              <p className="text-lg font-bold text-blue-900">{training.attended_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700 mb-1 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Hours Awarded
              </p>
              <p className="text-lg font-bold text-blue-900">
                {(training.passed_count || 0) + (training.failed_count || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* What Will Be Deleted */}
        {!cannotDelete && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">What will be deleted:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Training session record</span>
              </li>
              {hasRegistrations && (
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>
                    {training.registration_count} registration{training.registration_count !== 1 ? 's' : ''}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading || cannotDelete}
          >
            {isLoading ? 'Deleting...' : 'Delete Training'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
