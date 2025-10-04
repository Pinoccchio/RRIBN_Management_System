'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Award, AlertCircle } from 'lucide-react';
import type { TrainingWithStats, RegistrationWithReservist, AwardHoursInput, TrainingCategory, CompletionStatus } from '@/lib/types/training';

interface AwardTrainingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardHours: (trainingId: string, awards: AwardHoursInput[], category?: TrainingCategory) => Promise<void>;
  training: (TrainingWithStats & { registrations?: RegistrationWithReservist[] }) | null;
}

export function AwardTrainingHoursModal({
  isOpen,
  onClose,
  onAwardHours,
  training,
}: AwardTrainingHoursModalProps) {
  const [awards, setAwards] = useState<Map<string, AwardHoursInput>>(new Map());
  const [defaultHours, setDefaultHours] = useState<number>(8);
  const [defaultStatus, setDefaultStatus] = useState<CompletionStatus>('passed');
  const [category, setCategory] = useState<TrainingCategory>('Other');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (training && training.registrations) {
      // Initialize awards for attended reservists
      const initialAwards = new Map<string, AwardHoursInput>();
      training.registrations
        .filter((r) => r.status === 'attended' || r.status === 'completed')
        .forEach((reg) => {
          initialAwards.set(reg.reservist_id, {
            reservist_id: reg.reservist_id,
            hours_completed: defaultHours,
            completion_status: defaultStatus,
            certificate_url: reg.certificate_url || undefined,
            notes: reg.notes || undefined,
          });
        });
      setAwards(initialAwards);

      // Pre-fill category from training session if available
      if (training.training_category) {
        setCategory(training.training_category);
      }
    }
  }, [training, defaultHours, defaultStatus]);

  const handleUpdateAward = (reservistId: string, field: keyof AwardHoursInput, value: any) => {
    const newAwards = new Map(awards);
    const award = newAwards.get(reservistId) || {
      reservist_id: reservistId,
      hours_completed: defaultHours,
      completion_status: defaultStatus,
    };
    newAwards.set(reservistId, { ...award, [field]: value });
    setAwards(newAwards);
  };

  const handleApplyDefaults = () => {
    const newAwards = new Map(awards);
    newAwards.forEach((award, reservistId) => {
      newAwards.set(reservistId, {
        ...award,
        hours_completed: defaultHours,
        completion_status: defaultStatus,
      });
    });
    setAwards(newAwards);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!training) return;

    if (awards.size === 0) {
      setError('No reservists to award hours to. Please mark attendance first.');
      return;
    }

    // Validate awards
    for (const [_, award] of awards) {
      if (award.hours_completed <= 0) {
        setError('Hours completed must be greater than 0');
        return;
      }
      if (award.hours_completed > 720) {
        setError('Hours completed cannot exceed 720 hours (30 days)');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      await onAwardHours(training.id, Array.from(awards.values()), category);
      handleClose();
    } catch (error) {
      console.error('Error awarding hours:', error);
      setError('Failed to award training hours. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAwards(new Map());
    setDefaultHours(8);
    setDefaultStatus('passed');
    setCategory('Other');
    setError(null);
    onClose();
  };

  if (!training || !training.registrations) return null;

  const attendedReservists = training.registrations.filter(
    (r) => r.status === 'attended' || r.status === 'completed'
  );

  if (attendedReservists.length === 0) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        title="Award Training Hours"
        description={`Complete "${training.title}"`}
      >
        <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 font-medium">No attended reservists</p>
          <p className="text-sm text-gray-500 mt-1">
            Please mark attendance before awarding training hours
          </p>
          <Button type="button" variant="outline" onClick={handleClose} className="mt-4">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Award Training Hours"
      description={`Complete "${training.title}" and award hours`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Critical Notice */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <Award className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>CRITICAL:</strong> Training hours are recorded as data for future promotion eligibility analysis by Administrator Analytics.
              This action creates permanent training_hours records and sends notifications to reservists.
              <strong> Note: This does NOT promote anyone - it only collects data.</strong>
            </div>
          </div>
        </div>

        {/* Training Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Training Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TrainingCategory)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="Leadership">Leadership</option>
            <option value="Combat">Combat</option>
            <option value="Technical">Technical</option>
            <option value="Seminar">Seminar</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Bulk Settings */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-navy-900 mb-3">Default Settings (Apply to All)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="defaultHours" className="block text-sm font-medium text-gray-700 mb-2">
                Default Hours
              </label>
              <Input
                id="defaultHours"
                type="number"
                min="0.5"
                step="0.5"
                max="720"
                value={defaultHours}
                onChange={(e) => setDefaultHours(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="defaultStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Default Status
              </label>
              <select
                id="defaultStatus"
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value as CompletionStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyDefaults}
                className="w-full"
              >
                Apply to All
              </Button>
            </div>
          </div>
        </div>

        {/* Reservist List */}
        <div>
          <h4 className="font-semibold text-navy-900 mb-3">
            Awarding Hours to {attendedReservists.length} Reservist{attendedReservists.length > 1 ? 's' : ''}
          </h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Reservist</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {attendedReservists.map((reg) => {
                  const award = awards.get(reg.reservist_id);
                  if (!award) return null;

                  return (
                    <tr key={reg.id}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-navy-900">
                            {reg.reservist.first_name} {reg.reservist.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {reg.reservist.service_number} • {reg.reservist.rank || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0.5"
                          step="0.5"
                          max="720"
                          value={award.hours_completed}
                          onChange={(e) =>
                            handleUpdateAward(reg.reservist_id, 'hours_completed', parseFloat(e.target.value))
                          }
                          className="w-24"
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={award.completion_status}
                          onChange={(e) =>
                            handleUpdateAward(reg.reservist_id, 'completion_status', e.target.value)
                          }
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          required
                        >
                          <option value="passed">Passed</option>
                          <option value="failed">Failed</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={award.notes || ''}
                          onChange={(e) => handleUpdateAward(reg.reservist_id, 'notes', e.target.value)}
                          placeholder="Optional notes"
                          className="w-full"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Warning */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>⚠️ Confirm:</strong> This action will:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
            <li>Create permanent <strong>training_hours</strong> records (enables NCO promotions)</li>
            <li>Update all registrations to "completed" status</li>
            <li>Send notifications to all {attendedReservists.length} reservist{attendedReservists.length > 1 ? 's' : ''}</li>
            <li>Change training status to "completed"</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || awards.size === 0}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
          >
            {isLoading ? 'Awarding Hours...' : `Award Hours to ${awards.size} Reservist${awards.size > 1 ? 's' : ''}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
