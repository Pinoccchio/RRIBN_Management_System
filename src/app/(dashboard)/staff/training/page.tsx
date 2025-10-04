'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { TrainingTable } from '@/components/dashboard/training/TrainingTable';
import { CreateTrainingModal } from '@/components/dashboard/training/CreateTrainingModal';
import { EditTrainingModal } from '@/components/dashboard/training/EditTrainingModal';
import { TrainingDetailModal } from '@/components/dashboard/training/TrainingDetailModal';
import { MarkAttendanceModal } from '@/components/dashboard/training/MarkAttendanceModal';
import { AwardTrainingHoursModal } from '@/components/dashboard/training/AwardTrainingHoursModal';
import { DeleteTrainingModal } from '@/components/dashboard/training/DeleteTrainingModal';
import { Plus, Search } from 'lucide-react';
import type { TrainingWithStats, CreateTrainingInput, UpdateTrainingInput, AwardHoursInput, TrainingCategory, RegistrationWithReservist } from '@/lib/types/training';
import { logger } from '@/lib/logger';

type TabType = 'all' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export default function StaffTrainingPage() {
  const [allTrainings, setAllTrainings] = useState<TrainingWithStats[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<TrainingWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [assignedCompanies, setAssignedCompanies] = useState<string[]>([]);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<(TrainingWithStats & { registrations?: RegistrationWithReservist[] }) | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch staff's assigned companies
  const fetchAssignedCompanies = async () => {
    try {
      const response = await fetch('/api/staff/me');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data.assignedCompanies) {
        setAssignedCompanies(data.data.assignedCompanies);
      }
    } catch (error) {
      logger.error('Failed to fetch assigned companies', error);
    }
  };

  // Fetch all trainings
  const fetchAllTrainings = async () => {
    try {
      setIsLoading(true);
      logger.info('Fetching trainings...', { context: 'StaffTrainingPage' });

      const response = await fetch('/api/staff/training?status=all&limit=1000');
      const data = await response.json();

      if (data.success) {
        setAllTrainings(data.data);
        logger.success(`Fetched ${data.data.length} trainings`, { context: 'StaffTrainingPage' });
      } else {
        logger.error('Failed to fetch trainings', data.error, { context: 'StaffTrainingPage' });
      }
    } catch (error) {
      logger.error('Error fetching trainings', error, { context: 'StaffTrainingPage' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch training detail with registrations
  const fetchTrainingDetail = async (trainingId: string) => {
    try {
      const response = await fetch(`/api/staff/training/${trainingId}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        logger.error('Failed to fetch training detail', data.error);
        return null;
      }
    } catch (error) {
      logger.error('Error fetching training detail', error);
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAssignedCompanies();
    fetchAllTrainings();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!allTrainings.length) {
      setFilteredTrainings([]);
      return;
    }

    let filtered = allTrainings;

    // Filter by tab (status)
    if (activeTab === 'scheduled') {
      filtered = filtered.filter((t) => t.status === 'scheduled');
    } else if (activeTab === 'ongoing') {
      filtered = filtered.filter((t) => t.status === 'ongoing');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((t) => t.status === 'completed');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter((t) => t.status === 'cancelled');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((training) => {
        const title = training.title.toLowerCase();
        const location = training.location?.toLowerCase() || '';
        const company = training.company?.toLowerCase() || '';
        const description = training.description?.toLowerCase() || '';

        return (
          title.includes(query) ||
          location.includes(query) ||
          company.includes(query) ||
          description.includes(query)
        );
      });
    }

    setFilteredTrainings(filtered);
  }, [activeTab, searchQuery, allTrainings]);

  // Modal handlers
  const handleView = async (training: TrainingWithStats) => {
    setIsLoadingDetail(true);
    try {
      const detail = await fetchTrainingDetail(training.id);
      if (detail) {
        setSelectedTraining(detail);
        setDetailModalOpen(true);
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = (training: TrainingWithStats) => {
    setSelectedTraining(training);
    setEditModalOpen(true);
  };

  const handleMarkAttendance = async (training: TrainingWithStats) => {
    setIsLoadingDetail(true);
    try {
      const detail = await fetchTrainingDetail(training.id);
      if (detail) {
        setSelectedTraining(detail);
        setAttendanceModalOpen(true);
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleComplete = async (training: TrainingWithStats) => {
    setIsLoadingDetail(true);
    try {
      const detail = await fetchTrainingDetail(training.id);
      if (detail) {
        setSelectedTraining(detail);
        setCompleteModalOpen(true);
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDelete = (training: TrainingWithStats) => {
    setSelectedTraining(training);
    setDeleteModalOpen(true);
  };

  // CRUD operations
  const handleCreate = async (input: CreateTrainingInput) => {
    try {
      logger.info('Creating training session', { title: input.title });

      const response = await fetch('/api/staff/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Training created successfully');
        setToast({
          message: 'Training session created successfully!',
          type: 'success',
        });
        fetchAllTrainings();
      } else {
        logger.error('Failed to create training', data.error);
        setToast({
          message: data.error || 'Failed to create training session',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error creating training', error);
      setToast({
        message: 'An error occurred while creating training session',
        type: 'error',
      });
      throw error;
    }
  };

  const handleUpdate = async (trainingId: string, input: UpdateTrainingInput) => {
    try {
      logger.info('Updating training session', { trainingId });

      const response = await fetch(`/api/staff/training/${trainingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Training updated successfully');
        setToast({
          message: 'Training session updated successfully!',
          type: 'success',
        });
        fetchAllTrainings();
      } else {
        logger.error('Failed to update training', data.error);
        setToast({
          message: data.error || 'Failed to update training session',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error updating training', error);
      setToast({
        message: 'An error occurred while updating training session',
        type: 'error',
      });
      throw error;
    }
  };

  const handleMarkAttendanceSubmit = async (trainingId: string, reservistIds: string[]) => {
    try {
      logger.info('Marking attendance', { trainingId, count: reservistIds.length });

      const response = await fetch(`/api/staff/training/${trainingId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservist_ids: reservistIds }),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Attendance marked successfully');
        setToast({
          message: `Attendance marked for ${reservistIds.length} reservist${reservistIds.length > 1 ? 's' : ''}!`,
          type: 'success',
        });
        fetchAllTrainings();
      } else {
        logger.error('Failed to mark attendance', data.error);
        setToast({
          message: data.error || 'Failed to mark attendance',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error marking attendance', error);
      setToast({
        message: 'An error occurred while marking attendance',
        type: 'error',
      });
      throw error;
    }
  };

  const handleAwardHours = async (trainingId: string, awards: AwardHoursInput[], category?: TrainingCategory) => {
    try {
      logger.info('Awarding training hours', { trainingId, count: awards.length, category });

      const response = await fetch(`/api/staff/training/${trainingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ awards, training_category: category }),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Training hours awarded successfully', {
          hoursAwarded: data.data.hours_awarded.length,
          notificationsSent: data.data.notifications_sent,
        });
        setToast({
          message: `Training hours awarded to ${data.data.hours_awarded.length} reservist${data.data.hours_awarded.length > 1 ? 's' : ''}!`,
          type: 'success',
        });
        fetchAllTrainings();
      } else {
        logger.error('Failed to award training hours', data.error);
        setToast({
          message: data.error || 'Failed to award training hours',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error awarding training hours', error);
      setToast({
        message: 'An error occurred while awarding training hours',
        type: 'error',
      });
      throw error;
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    try {
      logger.info('Deleting training session', { trainingId });

      const response = await fetch(`/api/staff/training/${trainingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Training deleted successfully');
        setToast({
          message: 'Training session deleted successfully!',
          type: 'success',
        });
        fetchAllTrainings();
      } else {
        logger.error('Failed to delete training', data.error);
        setToast({
          message: data.error || 'Failed to delete training session',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error deleting training', error);
      setToast({
        message: 'An error occurred while deleting training session',
        type: 'error',
      });
      throw error;
    }
  };

  // Tab counts
  const scheduledCount = allTrainings.filter((t) => t.status === 'scheduled').length;
  const ongoingCount = allTrainings.filter((t) => t.status === 'ongoing').length;
  const completedCount = allTrainings.filter((t) => t.status === 'completed').length;
  const cancelledCount = allTrainings.filter((t) => t.status === 'cancelled').length;
  const totalCount = allTrainings.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training"
        description="Create and manage training sessions for your companies"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Training' },
        ]}
        action={
          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create Training
          </Button>
        }
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Trainings
              {totalCount > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {totalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'scheduled'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Scheduled
              {scheduledCount > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {scheduledCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ongoing'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ongoing
              {ongoingCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {ongoingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'completed'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
              {completedCount > 0 && (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {completedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'cancelled'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelled
              {cancelledCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {cancelledCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, location, company, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading trainings...</p>
          </div>
        ) : (
          <TrainingTable
            trainings={filteredTrainings}
            onView={handleView}
            onEdit={handleEdit}
            onMarkAttendance={handleMarkAttendance}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modals */}
      <CreateTrainingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreate}
        assignedCompanies={assignedCompanies}
      />

      <EditTrainingModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTraining(null);
        }}
        onUpdate={handleUpdate}
        training={selectedTraining}
        assignedCompanies={assignedCompanies}
      />

      <TrainingDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedTraining(null);
        }}
        training={selectedTraining}
        onMarkAttendance={handleMarkAttendance}
        onComplete={handleComplete}
      />

      <MarkAttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => {
          setAttendanceModalOpen(false);
          setSelectedTraining(null);
        }}
        onMarkAttendance={handleMarkAttendanceSubmit}
        training={selectedTraining}
      />

      <AwardTrainingHoursModal
        isOpen={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setSelectedTraining(null);
        }}
        onAwardHours={handleAwardHours}
        training={selectedTraining}
      />

      <DeleteTrainingModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTraining(null);
        }}
        onDelete={handleDeleteTraining}
        training={selectedTraining}
      />

      {/* Loading Overlay */}
      {isLoadingDetail && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            <p className="text-gray-700 font-medium">Loading training details...</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
