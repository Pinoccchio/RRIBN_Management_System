'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toast } from '@/components/ui/Toast';
import { AnnouncementsTable } from '@/components/dashboard/announcements/AnnouncementsTable';
import { CreateAnnouncementModal } from '@/components/dashboard/announcements/CreateAnnouncementModal';
import { EditAnnouncementModal } from '@/components/dashboard/announcements/EditAnnouncementModal';
import { ViewAnnouncementModal } from '@/components/dashboard/announcements/ViewAnnouncementModal';
import { DeleteAnnouncementModal } from '@/components/dashboard/announcements/DeleteAnnouncementModal';
import { Plus, Search } from 'lucide-react';
import type { AnnouncementWithCreator, CreateAnnouncementInput, UpdateAnnouncementInput, AnnouncementPriority } from '@/lib/types/announcement';
import { logger } from '@/lib/logger';

type TabType = 'all' | 'active' | 'inactive' | 'draft';

export default function StaffAnnouncementsPage() {
  const [allAnnouncements, setAllAnnouncements] = useState<AnnouncementWithCreator[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<AnnouncementWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedCompanies, setAssignedCompanies] = useState<string[]>([]);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementWithCreator | null>(null);

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

  // Fetch all announcements
  const fetchAllAnnouncements = async () => {
    try {
      setIsLoading(true);
      logger.info('Fetching announcements...', { context: 'StaffAnnouncementsPage' });

      const response = await fetch('/api/staff/announcements?status=all&limit=1000');
      const data = await response.json();

      if (data.success) {
        setAllAnnouncements(data.data);
        logger.success(`Fetched ${data.data.length} announcements`, { context: 'StaffAnnouncementsPage' });
      } else {
        logger.error('Failed to fetch announcements', data.error, { context: 'StaffAnnouncementsPage' });
      }
    } catch (error) {
      logger.error('Error fetching announcements', error, { context: 'StaffAnnouncementsPage' });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAssignedCompanies();
    fetchAllAnnouncements();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!allAnnouncements.length) {
      setFilteredAnnouncements([]);
      return;
    }

    let filtered = allAnnouncements;

    // Filter by tab (status)
    if (activeTab === 'active') {
      filtered = filtered.filter((a) => a.is_active && a.published_at);
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter((a) => !a.is_active);
    } else if (activeTab === 'draft') {
      filtered = filtered.filter((a) => !a.published_at);
    }

    // Filter by priority
    if (priorityFilter) {
      filtered = filtered.filter((a) => a.priority === priorityFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((announcement) => {
        const title = announcement.title.toLowerCase();
        const content = announcement.content.toLowerCase();
        const creatorName = `${announcement.creator.first_name} ${announcement.creator.last_name}`.toLowerCase();

        return (
          title.includes(query) ||
          content.includes(query) ||
          creatorName.includes(query)
        );
      });
    }

    setFilteredAnnouncements(filtered);
  }, [activeTab, priorityFilter, searchQuery, allAnnouncements]);

  // Modal handlers
  const handleView = (announcement: AnnouncementWithCreator) => {
    setSelectedAnnouncement(announcement);
    setViewModalOpen(true);
  };

  const handleEdit = (announcement: AnnouncementWithCreator) => {
    setSelectedAnnouncement(announcement);
    setEditModalOpen(true);
  };

  const handleDelete = (announcement: AnnouncementWithCreator) => {
    setSelectedAnnouncement(announcement);
    setDeleteModalOpen(true);
  };

  // CRUD operations
  const handleCreate = async (input: CreateAnnouncementInput) => {
    try {
      logger.info('Creating announcement', { title: input.title });

      const response = await fetch('/api/staff/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Announcement created successfully');
        setToast({
          message: input.publish_now
            ? 'Announcement published successfully!'
            : 'Announcement saved as draft!',
          type: 'success',
        });
        fetchAllAnnouncements();
      } else {
        logger.error('Failed to create announcement', data.error);
        setToast({
          message: data.error || 'Failed to create announcement',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error creating announcement', error);
      setToast({
        message: 'An error occurred while creating announcement',
        type: 'error',
      });
      throw error;
    }
  };

  const handleUpdate = async (announcementId: string, input: UpdateAnnouncementInput) => {
    try {
      logger.info('Updating announcement', { announcementId });

      const response = await fetch(`/api/staff/announcements/${announcementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Announcement updated successfully');
        setToast({
          message: 'Announcement updated successfully!',
          type: 'success',
        });
        fetchAllAnnouncements();
      } else {
        logger.error('Failed to update announcement', data.error);
        setToast({
          message: data.error || 'Failed to update announcement',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error updating announcement', error);
      setToast({
        message: 'An error occurred while updating announcement',
        type: 'error',
      });
      throw error;
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      logger.info('Deleting announcement', { announcementId });

      const response = await fetch(`/api/staff/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Announcement deleted successfully');
        setToast({
          message: 'Announcement deleted successfully!',
          type: 'success',
        });
        fetchAllAnnouncements();
      } else {
        logger.error('Failed to delete announcement', data.error);
        setToast({
          message: data.error || 'Failed to delete announcement',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error deleting announcement', error);
      setToast({
        message: 'An error occurred while deleting announcement',
        type: 'error',
      });
      throw error;
    }
  };

  // Tab counts
  const activeCount = allAnnouncements.filter((a) => a.is_active && a.published_at).length;
  const inactiveCount = allAnnouncements.filter((a) => !a.is_active).length;
  const draftCount = allAnnouncements.filter((a) => !a.published_at).length;
  const totalCount = allAnnouncements.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Create and manage announcements for your assigned companies"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Announcements' },
        ]}
        action={
          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create Announcement
          </Button>
        }
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'active'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active
              {activeCount > 0 && (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {activeCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'draft'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Drafts
              {draftCount > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {draftCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'inactive'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inactive
              {inactiveCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {inactiveCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Announcements
              {totalCount > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {totalCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by title, content, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>

            {/* Priority Filter */}
            <Select
              label=""
              value={priorityFilter}
              onChange={(value) => setPriorityFilter(value)}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'low', label: 'Low Priority' },
                { value: 'normal', label: 'Normal Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'urgent', label: 'Urgent Priority' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        ) : (
          <AnnouncementsTable
            announcements={filteredAnnouncements}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modals */}
      <CreateAnnouncementModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreate}
        assignedCompanies={assignedCompanies}
      />

      <EditAnnouncementModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        onUpdate={handleUpdate}
        announcement={selectedAnnouncement}
        assignedCompanies={assignedCompanies}
      />

      <ViewAnnouncementModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcement={selectedAnnouncement}
        onEdit={handleEdit}
      />

      <DeleteAnnouncementModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        onDelete={handleDeleteAnnouncement}
        announcement={selectedAnnouncement}
      />

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
