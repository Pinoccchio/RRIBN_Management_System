'use client';

import React from 'react';
import { Eye, Edit, UserCheck, Award, GraduationCap, MapPin, Users, Calendar, Trash2 } from 'lucide-react';
import { TrainingStatusBadge } from '@/components/ui/Badge';
import { timeAgo, formatDate } from '@/lib/design-system/utils';
import type { TrainingWithStats } from '@/lib/types/training';

interface TrainingTableProps {
  trainings: TrainingWithStats[];
  onView: (training: TrainingWithStats) => void;
  onEdit: (training: TrainingWithStats) => void;
  onMarkAttendance: (training: TrainingWithStats) => void;
  onComplete: (training: TrainingWithStats) => void;
  onDelete: (training: TrainingWithStats) => void;
}

export function TrainingTable({
  trainings,
  onView,
  onEdit,
  onMarkAttendance,
  onComplete,
  onDelete,
}: TrainingTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'ongoing':
        return 'text-blue-600 bg-blue-50';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (trainings.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No trainings found</h3>
        <p className="text-gray-600">
          No training sessions to display for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-navy-subtle">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Training Details
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Schedule & Location
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Registrations
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trainings.map((training) => {
              const scheduledDate = new Date(training.scheduled_date);
              const isPast = scheduledDate < new Date();
              const canMarkAttendance = training.status === 'scheduled' || training.status === 'ongoing';
              const canComplete = training.status === 'ongoing' && training.attended_count > 0;
              const canDelete = (training.status === 'scheduled' || training.status === 'cancelled') &&
                                (training.passed_count === 0 && training.failed_count === 0);

              return (
                <tr key={training.id} className="hover:bg-gray-50 transition-colors">
                  {/* Training Details */}
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 bg-navy-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-navy-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-navy-900">{training.title}</div>
                        {training.description && (
                          <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {training.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {training.company && (
                            <span className="text-xs px-2 py-0.5 bg-navy-100 text-navy-700 rounded">
                              {training.company}
                            </span>
                          )}
                          {training.capacity && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              Max: {training.capacity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Schedule & Location */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center text-navy-900 font-medium mb-1">
                        <Calendar className="w-4 h-4 mr-1.5 text-navy-400" />
                        {formatDate(training.scheduled_date)}
                      </div>
                      {training.end_date && (
                        <div className="text-xs text-gray-500 ml-5">
                          to {formatDate(training.end_date)}
                        </div>
                      )}
                      {training.location && (
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {training.location}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Registrations */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-navy-900">
                          {training.registration_count} registered
                        </span>
                      </div>
                      {training.attended_count > 0 && (
                        <div className="text-xs text-green-600">
                          ✓ {training.attended_count} attended
                        </div>
                      )}
                      {training.completed_count > 0 && (
                        <div className="text-xs text-blue-600">
                          ★ {training.completed_count} completed
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TrainingStatusBadge status={training.status} size="sm" />
                    {isPast && training.status === 'scheduled' && (
                      <div className="text-xs text-orange-600 mt-1">⚠️ Overdue</div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <button
                        onClick={() => onView(training)}
                        className="p-2 text-info hover:bg-info-light rounded-lg transition-all hover:scale-105"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit (only if not completed or cancelled) */}
                      {training.status !== 'completed' && training.status !== 'cancelled' && (
                        <button
                          onClick={() => onEdit(training)}
                          className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-all hover:scale-105"
                          title="Edit training"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Mark Attendance */}
                      {canMarkAttendance && training.registration_count > 0 && (
                        <button
                          onClick={() => onMarkAttendance(training)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-105"
                          title="Mark attendance"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}

                      {/* Complete & Award Hours */}
                      {canComplete && (
                        <button
                          onClick={() => onComplete(training)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-105"
                          title="Complete & award hours"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete (only for scheduled/cancelled with no awarded hours) */}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(training)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-105"
                          title="Delete training"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
