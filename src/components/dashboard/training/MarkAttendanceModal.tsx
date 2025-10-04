'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { UserCheck, UserX } from 'lucide-react';
import type { TrainingWithStats, RegistrationWithReservist } from '@/lib/types/training';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAttendance: (trainingId: string, reservistIds: string[]) => Promise<void>;
  training: (TrainingWithStats & { registrations?: RegistrationWithReservist[] }) | null;
}

export function MarkAttendanceModal({
  isOpen,
  onClose,
  onMarkAttendance,
  training,
}: MarkAttendanceModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (training && training.registrations) {
      // Pre-select already attended reservists
      const attendedIds = training.registrations
        .filter((r) => r.status === 'attended' || r.status === 'completed')
        .map((r) => r.reservist_id);
      setSelectedIds(new Set(attendedIds));
    }
  }, [training]);

  const handleToggle = (reservistId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(reservistId)) {
      newSelected.delete(reservistId);
    } else {
      newSelected.add(reservistId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (!training?.registrations) return;
    const allIds = training.registrations.map((r) => r.reservist_id);
    setSelectedIds(new Set(allIds));
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!training) return;

    if (selectedIds.size === 0) {
      setError('Please select at least one reservist');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onMarkAttendance(training.id, Array.from(selectedIds));
      handleClose();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setError(null);
    onClose();
  };

  if (!training || !training.registrations) return null;

  const registrations = training.registrations;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title="Mark Attendance"
      description={`Mark attendance for "${training.title}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {registrations.length === 0 ? (
          <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600">No registrations found</p>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-700">
                <strong>{selectedIds.size}</strong> of <strong>{registrations.length}</strong> selected
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedIds.size === registrations.length}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={selectedIds.size === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Reservist Checklist */}
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === registrations.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectAll();
                          } else {
                            handleClearAll();
                          }
                        }}
                        className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Reservist</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {registrations.map((reg) => {
                    const isSelected = selectedIds.has(reg.reservist_id);
                    const currentStatus = reg.status;

                    return (
                      <tr
                        key={reg.id}
                        onClick={() => handleToggle(reg.reservist_id)}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggle(reg.reservist_id)}
                            className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {isSelected ? (
                              <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <UserX className="w-5 h-5 text-gray-400 mr-2" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-navy-900">
                                {reg.reservist.first_name} {reg.reservist.last_name}
                              </div>
                              <div className="text-xs text-gray-500">{reg.reservist.service_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{reg.reservist.rank || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                              currentStatus === 'attended' || currentStatus === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : currentStatus === 'no_show'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {currentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Info Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Reservists not selected will be marked as "no-show".
                Already attended reservists are pre-selected.
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || selectedIds.size === 0}
          >
            {isLoading ? 'Marking Attendance...' : `Mark ${selectedIds.size} as Attended`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
