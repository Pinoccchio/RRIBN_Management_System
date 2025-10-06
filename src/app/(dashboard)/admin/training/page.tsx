'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Calendar, Users, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { logger } from '@/lib/logger';
import { toast } from 'react-hot-toast';

// Training modals
import { CreateTrainingModal } from '@/components/dashboard/training/CreateTrainingModal';
import { EditTrainingModal } from '@/components/dashboard/training/EditTrainingModal';
import { TrainingDetailModal } from '@/components/dashboard/training/TrainingDetailModal';
import { MarkAttendanceModal } from '@/components/dashboard/training/MarkAttendanceModal';
import { AwardTrainingHoursModal } from '@/components/dashboard/training/AwardTrainingHoursModal';
import { DeleteTrainingModal } from '@/components/dashboard/training/DeleteTrainingModal';
import { TrainingTable } from '@/components/dashboard/training/TrainingTable';

// Types
import type {
  TrainingSession,
  TrainingSessionWithStats,
  CreateTrainingInput,
  UpdateTrainingInput,
  TrainingCategory,
} from '@/lib/types/training';
import type { Company } from '@/lib/types/staff';

// Award input type (for awarding hours)
interface AwardInput {
  reservist_id: string;
  hours_completed: number;
  completion_status: 'passed' | 'failed' | 'pending';
  certificate_url?: string;
  notes?: string;
}

export default function AdminTrainingPage() {
  // State for trainings
  const [trainings, setTrainings] = useState<TrainingSessionWithStats[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<TrainingSessionWithStats[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAwardHoursModal, setShowAwardHoursModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected training for modals
  const [selectedTraining, setSelectedTraining] = useState<TrainingSessionWithStats | null>(null);

  // Fetch companies and trainings on mount
  useEffect(() => {
    fetchAllCompanies();
    fetchAllTrainings();
  }, []); // Remove activeTab dependency - fetch all data once

  // In-memory filtering whenever trainings, activeTab, or searchQuery changes
  useEffect(() => {
    if (!trainings.length) {
      setFilteredTrainings([]);
      return;
    }

    let filtered = trainings;

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
      filtered = filtered.filter(
        (training) =>
          training.title.toLowerCase().includes(query) ||
          training.description?.toLowerCase().includes(query) ||
          training.location?.toLowerCase().includes(query) ||
          training.company?.toLowerCase().includes(query)
      );
    }

    setFilteredTrainings(filtered);
  }, [activeTab, searchQuery, trainings]);

  /**
   * Fetch all active companies (admin has battalion-wide access)
   */
  const fetchAllCompanies = async () => {
    try {
      logger.info('Fetching all companies for admin...', { context: 'AdminTrainingPage' });
      const response = await fetch('/api/admin/companies?status=active');
      const result = await response.json();

      if (result.success) {
        setAllCompanies(result.data || []);
        logger.success('All companies fetched successfully', {
          context: 'AdminTrainingPage',
          count: result.data?.length || 0,
        });
      } else {
        logger.error('Failed to fetch companies', result.error, { context: 'AdminTrainingPage' });
      }
    } catch (err) {
      logger.error('Error fetching companies', err, { context: 'AdminTrainingPage' });
    }
  };

  /**
   * Fetch all training sessions (battalion-wide, no status filter)
   */
  const fetchAllTrainings = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Fetching all training sessions for admin...', {
        context: 'AdminTrainingPage',
      });

      // Always fetch ALL trainings (no status filter)
      const response = await fetch('/api/admin/training');
      const result = await response.json();

      if (result.success) {
        setTrainings(result.data || []);
        logger.success('Training sessions fetched successfully', {
          context: 'AdminTrainingPage',
          count: result.data?.length || 0,
        });
      } else {
        const errorMsg = result.error || 'Failed to fetch training sessions';
        setError(errorMsg);
        logger.error('Failed to fetch training sessions', result.error, {
          context: 'AdminTrainingPage',
        });
      }
    } catch (err) {
      const errorMsg = 'An error occurred while loading training sessions';
      setError(errorMsg);
      logger.error('Error fetching training sessions', err, {
        context: 'AdminTrainingPage',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch full training details with registrations
   */
  const fetchTrainingDetail = async (trainingId: string) => {
    try {
      const response = await fetch(`/api/admin/training/${trainingId}`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        logger.error('Failed to fetch training detail', data.error);
        toast.error('Failed to load training details');
        return null;
      }
    } catch (error) {
      logger.error('Error fetching training detail', error);
      toast.error('An error occurred while loading training details');
      return null;
    }
  };

  /**
   * Handle create training submission
   */
  const handleCreateTrainingSubmit = async (input: CreateTrainingInput) => {
    try {
      logger.info('Creating training session...', { context: 'AdminTrainingPage', input });
      const response = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await response.json();

      if (data.success) {
        logger.success('Training session created successfully', {
          context: 'AdminTrainingPage',
          trainingId: data.data.id,
        });
        toast.success('Training session created successfully');
        setShowCreateModal(false);
        fetchAllTrainings();
      } else {
        logger.error('Failed to create training', data.error, { context: 'AdminTrainingPage' });
        toast.error(data.error || 'Failed to create training session');
      }
    } catch (error) {
      logger.error('Error creating training', error, { context: 'AdminTrainingPage' });
      toast.error('An error occurred while creating training session');
    }
  };

  /**
   * Handle update training submission
   */
  const handleUpdateTrainingSubmit = async (trainingId: string, input: UpdateTrainingInput) => {
    try {
      logger.info('Updating training session...', { context: 'AdminTrainingPage', trainingId, input });
      const response = await fetch(`/api/admin/training/${trainingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await response.json();

      if (data.success) {
        logger.success('Training session updated successfully', {
          context: 'AdminTrainingPage',
          trainingId,
        });
        toast.success('Training session updated successfully');
        setShowEditModal(false);
        setSelectedTraining(null);
        fetchAllTrainings();
      } else {
        logger.error('Failed to update training', data.error, { context: 'AdminTrainingPage' });
        toast.error(data.error || 'Failed to update training session');
      }
    } catch (error) {
      logger.error('Error updating training', error, { context: 'AdminTrainingPage' });
      toast.error('An error occurred while updating training session');
    }
  };

  /**
   * Handle mark attendance submission
   */
  const handleMarkAttendanceSubmit = async (trainingId: string, reservistIds: string[]) => {
    try {
      logger.info('Marking attendance...', {
        context: 'AdminTrainingPage',
        trainingId,
        count: reservistIds.length,
      });
      const response = await fetch(`/api/admin/training/${trainingId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservist_ids: reservistIds }),
      });
      const data = await response.json();

      if (data.success) {
        logger.success('Attendance marked successfully', {
          context: 'AdminTrainingPage',
          trainingId,
          count: data.data.marked_count,
        });
        toast.success(`Attendance marked for ${reservistIds.length} reservist(s)`);
        setShowAttendanceModal(false);
        setSelectedTraining(null);
        fetchAllTrainings();
      } else {
        logger.error('Failed to mark attendance', data.error, { context: 'AdminTrainingPage' });
        toast.error(data.error || 'Failed to mark attendance');
      }
    } catch (error) {
      logger.error('Error marking attendance', error, { context: 'AdminTrainingPage' });
      toast.error('An error occurred while marking attendance');
    }
  };

  /**
   * Handle award training hours submission
   */
  const handleAwardHoursSubmit = async (
    trainingId: string,
    awards: AwardInput[],
    category?: TrainingCategory
  ) => {
    try {
      logger.info('Awarding training hours...', {
        context: 'AdminTrainingPage',
        trainingId,
        count: awards.length,
      });
      const response = await fetch(`/api/admin/training/${trainingId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awards, training_category: category }),
      });
      const data = await response.json();

      if (data.success) {
        logger.success('Training hours awarded successfully', {
          context: 'AdminTrainingPage',
          trainingId,
          count: data.data.hours_awarded.length,
        });
        toast.success(`Training hours awarded to ${data.data.hours_awarded.length} reservist(s)`);
        setShowAwardHoursModal(false);
        setSelectedTraining(null);
        fetchAllTrainings();
      } else {
        logger.error('Failed to award training hours', data.error, { context: 'AdminTrainingPage' });
        toast.error(data.error || 'Failed to award training hours');
      }
    } catch (error) {
      logger.error('Error awarding training hours', error, { context: 'AdminTrainingPage' });
      toast.error('An error occurred while awarding training hours');
    }
  };

  /**
   * Handle delete training submission
   */
  const handleDeleteTrainingSubmit = async (trainingId: string) => {
    try {
      logger.info('Deleting training session...', { context: 'AdminTrainingPage', trainingId });
      const response = await fetch(`/api/admin/training/${trainingId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        logger.success('Training session deleted successfully', {
          context: 'AdminTrainingPage',
          trainingId,
        });
        toast.success('Training session deleted successfully');
        setShowDeleteModal(false);
        setSelectedTraining(null);
        fetchAllTrainings();
      } else {
        logger.error('Failed to delete training', data.error, { context: 'AdminTrainingPage' });
        toast.error(data.error || 'Failed to delete training session');
      }
    } catch (error) {
      logger.error('Error deleting training', error, { context: 'AdminTrainingPage' });
      toast.error('An error occurred while deleting training session');
    }
  };

  /**
   * Handle view training details (fetch full details first)
   */
  const handleViewTraining = async (training: TrainingSessionWithStats) => {
    setLoading(true);
    const detail = await fetchTrainingDetail(training.id);
    if (detail) {
      setSelectedTraining(detail);
      setShowDetailModal(true);
    }
    setLoading(false);
  };

  /**
   * Handle edit training (use existing data)
   */
  const handleEditTraining = (training: TrainingSessionWithStats) => {
    setSelectedTraining(training);
    setShowEditModal(true);
  };

  /**
   * Handle mark attendance (fetch full details first)
   */
  const handleMarkAttendance = async (training: TrainingSessionWithStats) => {
    setLoading(true);
    const detail = await fetchTrainingDetail(training.id);
    if (detail) {
      setSelectedTraining(detail);
      setShowAttendanceModal(true);
    }
    setLoading(false);
  };

  /**
   * Handle award hours (fetch full details first)
   */
  const handleAwardHours = async (training: TrainingSessionWithStats) => {
    setLoading(true);
    const detail = await fetchTrainingDetail(training.id);
    if (detail) {
      setSelectedTraining(detail);
      setShowAwardHoursModal(true);
    }
    setLoading(false);
  };

  /**
   * Handle delete training
   */
  const handleDeleteTraining = (training: TrainingSessionWithStats) => {
    setSelectedTraining(training);
    setShowDeleteModal(true);
  };

  /**
   * Tab configuration (counts calculated from full dataset)
   */
  const tabs = [
    { key: 'all' as const, label: 'All Training', count: trainings.length },
    {
      key: 'scheduled' as const,
      label: 'Scheduled',
      count: trainings.filter((t) => t.status === 'scheduled').length,
    },
    {
      key: 'ongoing' as const,
      label: 'Ongoing',
      count: trainings.filter((t) => t.status === 'ongoing').length,
    },
    {
      key: 'completed' as const,
      label: 'Completed',
      count: trainings.filter((t) => t.status === 'completed').length,
    },
    {
      key: 'cancelled' as const,
      label: 'Cancelled',
      count: trainings.filter((t) => t.status === 'cancelled').length,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Training Management"
        description="Battalion-wide training sessions, attendance, and completion tracking"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Training' },
        ]}
      />

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Error loading training sessions</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-navy-600 text-navy-600'
                  : 'border-transparent text-gray-600 hover:text-navy-600 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search training sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Training
        </Button>
      </div>

      {/* Training Table */}
      <TrainingTable
        trainings={filteredTrainings}
        onView={handleViewTraining}
        onEdit={handleEditTraining}
        onMarkAttendance={handleMarkAttendance}
        onComplete={handleAwardHours}
        onDelete={handleDeleteTraining}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateTrainingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTrainingSubmit}
          assignedCompanies={allCompanies.map((c) => c.code)}
        />
      )}

      {showEditModal && selectedTraining && (
        <EditTrainingModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTraining(null);
          }}
          onUpdate={handleUpdateTrainingSubmit}
          training={selectedTraining}
          assignedCompanies={allCompanies.map((c) => c.code)}
        />
      )}

      {showDetailModal && selectedTraining && (
        <TrainingDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTraining(null);
          }}
          training={selectedTraining}
          onMarkAttendance={handleMarkAttendance}
          onComplete={handleAwardHours}
        />
      )}

      {showAttendanceModal && selectedTraining && (
        <MarkAttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedTraining(null);
          }}
          onMarkAttendance={handleMarkAttendanceSubmit}
          training={selectedTraining}
        />
      )}

      {showAwardHoursModal && selectedTraining && (
        <AwardTrainingHoursModal
          isOpen={showAwardHoursModal}
          onClose={() => {
            setShowAwardHoursModal(false);
            setSelectedTraining(null);
          }}
          onAwardHours={handleAwardHoursSubmit}
          training={selectedTraining}
        />
      )}

      {showDeleteModal && selectedTraining && (
        <DeleteTrainingModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTraining(null);
          }}
          onDelete={handleDeleteTrainingSubmit}
          training={selectedTraining}
        />
      )}
    </div>
  );
}
