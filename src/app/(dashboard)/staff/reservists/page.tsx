'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ReservistTable } from '@/components/dashboard/reservists/ReservistTable';
import { ViewReservistModal } from '@/components/dashboard/reservists/ViewReservistModal';
import { EditReservistModal } from '@/components/dashboard/reservists/EditReservistModal';
import { ChangeAccountStatusModal } from '@/components/dashboard/reservists/ChangeAccountStatusModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toast } from '@/components/ui/Toast';
import { Search, Filter } from 'lucide-react';
import type { Reservist } from '@/lib/types/reservist';
import { logger } from '@/lib/logger';

type TabType = 'all' | 'active' | 'inactive';

export default function StaffReservistsPage() {
  const [allReservists, setAllReservists] = useState<Reservist[]>([]);
  const [filteredReservists, setFilteredReservists] = useState<Reservist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [selectedRank, setSelectedRank] = useState('');

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [selectedReservist, setSelectedReservist] = useState<Reservist | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch all reservists in assigned companies
  const fetchAllReservists = async () => {
    try {
      setIsLoading(true);
      logger.info('Fetching reservists in assigned companies...', { context: 'StaffReservistsPage' });

      // Fetch ALL reservists in staff's assigned companies
      const response = await fetch(`/api/staff/reservists?status=all&limit=1000`);
      const data = await response.json();

      if (data.success) {
        setAllReservists(data.data);
        logger.success(`Fetched ${data.data.length} reservists`, { context: 'StaffReservistsPage' });
      } else {
        logger.error('Failed to fetch reservists', data.error, { context: 'StaffReservistsPage' });
      }
    } catch (error) {
      logger.error('Error fetching reservists', error, { context: 'StaffReservistsPage' });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllReservists();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!allReservists.length) {
      setFilteredReservists([]);
      return;
    }

    let filtered = allReservists;

    // Filter by tab (status)
    if (activeTab === 'active') {
      filtered = filtered.filter(r => r.status === 'active');
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(r => r.status === 'inactive' || r.status === 'deactivated');
    }

    // Filter by rank
    if (selectedRank) {
      filtered = filtered.filter(r => r.reservist_details.rank === selectedRank);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((reservist) => {
        const fullName = `${reservist.profile.first_name} ${reservist.profile.middle_name || ''} ${reservist.profile.last_name}`.toLowerCase();
        const email = reservist.email.toLowerCase();
        const serviceNumber = reservist.reservist_details.service_number.toLowerCase();
        const company = (reservist.reservist_details.company || '').toLowerCase();
        const rank = (reservist.reservist_details.rank || '').toLowerCase();

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          serviceNumber.includes(query) ||
          company.includes(query) ||
          rank.includes(query)
        );
      });
    }

    setFilteredReservists(filtered);
  }, [activeTab, selectedRank, searchQuery, allReservists]);

  // Modal handlers
  const handleView = (reservist: Reservist) => {
    setSelectedReservist(reservist);
    setViewModalOpen(true);
  };

  const handleEdit = (reservist: Reservist) => {
    setSelectedReservist(reservist);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setToast({
      message: 'Reservist updated successfully!',
      type: 'success',
    });
    fetchAllReservists();
  };

  const handleChangeAccountStatus = (reservist: Reservist) => {
    setSelectedReservist(reservist);
    setChangeStatusModalOpen(true);
  };

  const handleChangeStatusSubmit = async (reservistId: string, newStatus: 'active' | 'inactive', reason: string) => {
    try {
      logger.info('Changing account status', { reservistId, newStatus, reason });

      const response = await fetch(`/api/staff/reservists/${reservistId}/change-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Account status changed successfully');
        setToast({
          message: `Account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`,
          type: 'success',
        });
        fetchAllReservists();
      } else {
        logger.error('Failed to change account status', data.error);
        setToast({
          message: data.error || 'Failed to change account status',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error changing account status', error);
      setToast({
        message: 'An error occurred while changing account status',
        type: 'error',
      });
      throw error;
    }
  };

  // Tab counts
  const activeCount = allReservists.filter(r => r.status === 'active').length;
  const inactiveCount = allReservists.filter(r => r.status === 'inactive' || r.status === 'deactivated').length;
  const totalCount = allReservists.length;

  // Get unique ranks for filter
  const uniqueRanks = Array.from(new Set(allReservists.map(r => r.reservist_details.rank).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Reservists"
        description="View and manage reservists in your assigned companies"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Reservists' },
        ]}
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
              Active Reservists
              {activeCount > 0 && (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {activeCount}
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
              Inactive Reservists
              {inactiveCount > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">
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
              All Reservists
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
                placeholder="Search by name, email, service number, company, or rank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>

            {/* Rank Filter */}
            <Select
              label=""
              value={selectedRank}
              onChange={(value) => setSelectedRank(value)}
              options={[
                { value: '', label: 'All Ranks' },
                ...uniqueRanks.map(rank => ({ value: rank!, label: rank! }))
              ]}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading reservists...</p>
          </div>
        ) : filteredReservists.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No reservists found in your assigned companies.</p>
          </div>
        ) : (
          <ReservistTable
            reservists={filteredReservists}
            onView={handleView}
            onEdit={handleEdit}
            onChangeAccountStatus={handleChangeAccountStatus}
            // Staff only views and edits, no approval actions
            hideApprovalActions
          />
        )}
      </div>

      {/* Modals */}
      <ViewReservistModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedReservist(null);
        }}
        reservist={selectedReservist}
      />

      <EditReservistModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedReservist(null);
        }}
        onSuccess={handleEditSuccess}
        reservist={selectedReservist}
      />

      <ChangeAccountStatusModal
        isOpen={changeStatusModalOpen}
        onClose={() => {
          setChangeStatusModalOpen(false);
          setSelectedReservist(null);
        }}
        onChangeStatus={handleChangeStatusSubmit}
        reservist={selectedReservist}
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
