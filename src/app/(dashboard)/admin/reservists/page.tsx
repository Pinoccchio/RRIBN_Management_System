'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ReservistTable } from '@/components/dashboard/reservists/ReservistTable';
import { ViewReservistModal } from '@/components/dashboard/reservists/ViewReservistModal';
import { ApproveReservistModal } from '@/components/dashboard/reservists/ApproveReservistModal';
import { RejectReservistModal } from '@/components/dashboard/reservists/RejectReservistModal';
import { Input } from '@/components/ui/Input';
import { Search, Filter } from 'lucide-react';
import type { Reservist } from '@/lib/types/reservist';
import { logger } from '@/lib/logger';

type TabType = 'pending' | 'active' | 'all';

export default function ReservistsPage() {
  const [allReservists, setAllReservists] = useState<Reservist[]>([]); // Store ALL reservists
  const [filteredReservists, setFilteredReservists] = useState<Reservist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReservist, setSelectedReservist] = useState<Reservist | null>(null);

  // Fetch ALL reservists (called once on mount)
  const fetchAllReservists = async () => {
    try {
      setIsLoading(true);
      logger.info('Fetching all reservists...', { context: 'ReservistsPage' });

      // Fetch ALL reservists regardless of status
      const response = await fetch(`/api/admin/reservists?status=all&limit=1000`);
      const data = await response.json();

      if (data.success) {
        setAllReservists(data.data);
        logger.success(`Fetched ${data.data.length} total reservists`, { context: 'ReservistsPage' });
      } else {
        logger.error('Failed to fetch reservists', data.error, { context: 'ReservistsPage' });
      }
    } catch (error) {
      logger.error('Error fetching reservists', error, { context: 'ReservistsPage' });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch - only once on mount
  useEffect(() => {
    fetchAllReservists();
  }, []);

  // Filter reservists by active tab
  useEffect(() => {
    if (!allReservists.length) {
      setFilteredReservists([]);
      return;
    }

    let tabFiltered = allReservists;

    // Apply tab filter
    if (activeTab === 'pending') {
      tabFiltered = allReservists.filter(r => r.status === 'pending');
    } else if (activeTab === 'active') {
      tabFiltered = allReservists.filter(r => r.status === 'active');
    }
    // For 'all' tab, keep all reservists

    setFilteredReservists(tabFiltered);
  }, [activeTab, allReservists]);

  // Apply search filter on top of tab filter
  useEffect(() => {
    if (!allReservists.length) {
      setFilteredReservists([]);
      return;
    }

    // First, filter by active tab
    let tabFiltered = allReservists;
    if (activeTab === 'pending') {
      tabFiltered = allReservists.filter(r => r.status === 'pending');
    } else if (activeTab === 'active') {
      tabFiltered = allReservists.filter(r => r.status === 'active');
    }

    // Then, apply search filter if query exists
    if (!searchQuery.trim()) {
      setFilteredReservists(tabFiltered);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchFiltered = tabFiltered.filter((reservist) => {
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

    setFilteredReservists(searchFiltered);
  }, [searchQuery, activeTab, allReservists]);

  // Modal handlers
  const handleView = (reservist: Reservist) => {
    setSelectedReservist(reservist);
    setViewModalOpen(true);
  };

  const handleApproveClick = (reservist: Reservist) => {
    setSelectedReservist(reservist);
    setApproveModalOpen(true);
  };

  const handleRejectClick = (reservist: Reservist) => {
    setSelectedReservist(reservist);
    setRejectModalOpen(true);
  };

  const handleApprove = async (reservistId: string) => {
    try {
      logger.info(`Approving reservist: ${reservistId}`, { context: 'ReservistsPage' });

      const response = await fetch(`/api/admin/reservists/${reservistId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Reservist approved successfully', { context: 'ReservistsPage' });
        // Refresh the list
        fetchAllReservists();
      } else {
        logger.error('Failed to approve reservist', data.error, { context: 'ReservistsPage' });
        alert(`Failed to approve reservist: ${data.error}`);
      }
    } catch (error) {
      logger.error('Error approving reservist', error, { context: 'ReservistsPage' });
      alert('An error occurred while approving the reservist');
    }
  };

  const handleReject = async (reservistId: string, reason: string) => {
    try {
      logger.info(`Rejecting reservist: ${reservistId}`, { context: 'ReservistsPage', reason });

      const response = await fetch(`/api/admin/reservists/${reservistId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Reservist rejected successfully', { context: 'ReservistsPage' });
        // Refresh the list
        fetchAllReservists();
      } else {
        logger.error('Failed to reject reservist', data.error, { context: 'ReservistsPage' });
        alert(`Failed to reject reservist: ${data.error}`);
      }
    } catch (error) {
      logger.error('Error rejecting reservist', error, { context: 'ReservistsPage' });
      alert('An error occurred while rejecting the reservist');
    }
  };

  // Tab counts - calculated from ALL reservists to show counts on all tabs
  const pendingCount = allReservists.filter(r => r.status === 'pending').length;
  const activeCount = allReservists.filter(r => r.status === 'active').length;
  const totalCount = allReservists.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservists"
        description="Manage reservist accounts and approvals"
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Approval
              {pendingCount > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {pendingCount}
                </span>
              )}
            </button>
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

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
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
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading reservists...</p>
          </div>
        ) : (
          <ReservistTable
            reservists={filteredReservists}
            onView={handleView}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
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

      <ApproveReservistModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedReservist(null);
        }}
        onApprove={handleApprove}
        reservist={selectedReservist}
      />

      <RejectReservistModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedReservist(null);
        }}
        onReject={handleReject}
        reservist={selectedReservist}
      />
    </div>
  );
}
