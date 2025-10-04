'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  Calendar,
  MapPin,
  Users,
  User,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import type { TrainingWithStats, RegistrationWithReservist } from '@/lib/types/training';

interface TrainingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  training: (TrainingWithStats & { registrations?: RegistrationWithReservist[] }) | null;
  onMarkAttendance?: (training: TrainingWithStats) => void;
  onComplete?: (training: TrainingWithStats) => void;
}

export function TrainingDetailModal({
  isOpen,
  onClose,
  training,
  onMarkAttendance,
  onComplete,
}: TrainingDetailModalProps) {
  if (!training) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'registered':
        return 'text-blue-600 bg-blue-50';
      case 'no_show':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCompletionIcon = (status: string | null) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const canMarkAttendance = training.status === 'scheduled' || training.status === 'ongoing';
  const canComplete = training.status === 'ongoing' && training.attended_count > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Training Session Details"
      description={training.title}
    >
      <div className="space-y-6">
        {/* Training Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <GraduationCap className="w-4 h-4 mr-2" />
              Training Details
            </div>
            <div className="font-semibold text-navy-900">{training.title}</div>
            {training.description && (
              <div className="text-sm text-gray-600 mt-1">{training.description}</div>
            )}
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </div>
            <div className="font-semibold text-navy-900">{formatDate(training.scheduled_date)}</div>
            {training.end_date && (
              <div className="text-sm text-gray-600">to {formatDate(training.end_date)}</div>
            )}
          </div>

          {training.location && (
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </div>
              <div className="text-sm font-medium text-navy-900">{training.location}</div>
            </div>
          )}

          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Users className="w-4 h-4 mr-2" />
              Capacity & Registrations
            </div>
            <div className="text-sm font-medium text-navy-900">
              {training.registration_count} registered
              {training.capacity && ` / ${training.capacity} max`}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{training.registration_count}</div>
            <div className="text-xs text-blue-700">Registered</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{training.attended_count}</div>
            <div className="text-xs text-green-700">Attended</div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{training.completed_count}</div>
            <div className="text-xs text-purple-700">Completed</div>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{training.passed_count}</div>
            <div className="text-xs text-yellow-700">Passed</div>
          </div>
        </div>

        {/* Registrations List */}
        {training.registrations && training.registrations.length > 0 ? (
          <div>
            <h4 className="font-semibold text-navy-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Registered Reservists ({training.registrations.length})
            </h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Reservist</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Rank</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {training.registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-navy-900">
                          {reg.reservist.first_name} {reg.reservist.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{reg.reservist.service_number}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-700">{reg.reservist.rank || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(reg.status)}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          {getCompletionIcon(reg.completion_status)}
                          <span className="text-xs text-gray-600">
                            {reg.completion_status || 'pending'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No registrations yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Reservists can register via the mobile app
            </p>
          </div>
        )}

        {/* Prerequisites */}
        {training.prerequisites && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-sm font-medium text-yellow-800 mb-1">
              <FileText className="w-4 h-4 mr-2" />
              Prerequisites
            </div>
            <div className="text-sm text-yellow-700">{training.prerequisites}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {canMarkAttendance && training.registration_count > 0 && onMarkAttendance && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onMarkAttendance(training);
                onClose();
              }}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Mark Attendance
            </Button>
          )}
          {canComplete && onComplete && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onComplete(training);
                onClose();
              }}
            >
              Complete & Award Hours
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
