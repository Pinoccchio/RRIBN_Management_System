'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { RIDSTable } from '@/components/dashboard/rids/RIDSTable';
import { RIDSViewModal } from '@/components/dashboard/rids/RIDSViewModal';
import { CreateRIDSModal } from '@/components/dashboard/rids/CreateRIDSModal';
import { EditRIDSModal } from '@/components/dashboard/rids/EditRIDSModal';
import { DeleteRIDSModal } from '@/components/dashboard/rids/DeleteRIDSModal';
import { SubmitRIDSModal } from '@/components/dashboard/rids/SubmitRIDSModal';
import { ApproveRIDSModal } from '@/components/dashboard/rids/ApproveRIDSModal';
import { RejectRIDSModal } from '@/components/dashboard/rids/RejectRIDSModal';
import { ChangeRIDSStatusModal } from '@/components/dashboard/rids/ChangeRIDSStatusModal';
import { Plus, AlertCircle, Search } from 'lucide-react';
import { RIDSFormComplete } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

type TabType = 'all' | 'draft' | 'submitted' | 'approved' | 'rejected';

export default function StaffRIDSPage() {
  const [loading, setLoading] = useState(true);
  const [allRIDS, setAllRIDS] = useState<RIDSFormComplete[]>([]);
  const [filteredRIDS, setFilteredRIDS] = useState<RIDSFormComplete[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Modal states
  const [selectedRIDS, setSelectedRIDS] = useState<RIDSFormComplete | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingRIDSId, setViewingRIDSId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRIDSId, setEditingRIDSId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch all RIDS
  const fetchRIDS = async () => {
    try {
      setLoading(true);
      logger.info('Fetching RIDS...', { context: 'StaffRIDSPage' });

      const response = await fetch(`/api/staff/rids?status=all&limit=1000`);
      const data = await response.json();

      if (data.success) {
        setAllRIDS(data.data || []);
        logger.success(`Fetched ${data.data?.length || 0} RIDS`, { context: 'StaffRIDSPage' });
      } else {
        logger.error('Failed to fetch RIDS', data.error, { context: 'StaffRIDSPage' });
      }
    } catch (error) {
      logger.error('Error fetching RIDS', error, { context: 'StaffRIDSPage' });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRIDS();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!allRIDS.length) {
      setFilteredRIDS([]);
      return;
    }

    let filtered = allRIDS;

    // Filter by tab (status)
    if (activeTab === 'draft') {
      filtered = filtered.filter(r => r.status === 'draft');
    } else if (activeTab === 'submitted') {
      filtered = filtered.filter(r => r.status === 'submitted');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(r => r.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(r => r.status === 'rejected');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((rids) => {
        const fullName = `${rids.reservist?.first_name} ${rids.reservist?.middle_name || ''} ${rids.reservist?.last_name}`.toLowerCase();
        const email = rids.reservist?.email?.toLowerCase() || '';
        const serviceNumber = rids.reservist?.service_number?.toLowerCase() || '';
        const company = rids.reservist?.company?.toLowerCase() || '';

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          serviceNumber.includes(query) ||
          company.includes(query)
        );
      });
    }

    setFilteredRIDS(filtered);
  }, [activeTab, searchQuery, allRIDS]);

  // Modal handlers
  const handleView = (ridsItem: RIDSFormComplete) => {
    setViewingRIDSId(ridsItem.id);
    setViewModalOpen(true);
  };

  const handleEdit = (ridsItem: RIDSFormComplete) => {
    setEditingRIDSId(ridsItem.id);
    setEditModalOpen(true);
  };

  const handleDelete = (ridsItem: RIDSFormComplete) => {
    setSelectedRIDS(ridsItem);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRIDS) return;

    setActionLoading(true);

    try {
      const response = await fetch(`/api/staff/rids/${selectedRIDS.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete RIDS');
      }

      setToast({
        message: 'RIDS deleted successfully',
        type: 'success',
      });
      setDeleteModalOpen(false);
      setSelectedRIDS(null);
      fetchRIDS();
    } catch (error) {
      logger.error('Failed to delete RIDS', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to delete RIDS',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitClick = (ridsItem: RIDSFormComplete) => {
    setSelectedRIDS(ridsItem);
    setSubmitModalOpen(true);
  };

  const handleSubmitConfirm = async () => {
    if (!selectedRIDS) return;

    setActionLoading(true);

    try {
      const response = await fetch(`/api/staff/rids/${selectedRIDS.id}/submit`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: 'RIDS submitted successfully',
          type: 'success',
        });
        setSubmitModalOpen(false);
        setSelectedRIDS(null);
        fetchRIDS();
      } else {
        throw new Error(data.error || 'Failed to submit RIDS');
      }
    } catch (error) {
      logger.error('Failed to submit RIDS', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to submit RIDS',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveClick = (ridsItem: RIDSFormComplete) => {
    setSelectedRIDS(ridsItem);
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRIDS) return;

    setActionLoading(true);

    try {
      const response = await fetch(`/api/staff/rids/${selectedRIDS.id}/approve`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: 'RIDS approved successfully',
          type: 'success',
        });
        setApproveModalOpen(false);
        setSelectedRIDS(null);
        fetchRIDS();
      } else {
        throw new Error(data.error || 'Failed to approve RIDS');
      }
    } catch (error) {
      logger.error('Failed to approve RIDS', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to approve RIDS',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (ridsItem: RIDSFormComplete) => {
    setSelectedRIDS(ridsItem);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (ridsId: string, rejectionReason: string) => {
    setActionLoading(true);

    try {
      const response = await fetch(`/api/staff/rids/${ridsId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: 'RIDS rejected',
          type: 'success',
        });
        setRejectModalOpen(false);
        setSelectedRIDS(null);
        fetchRIDS();
      } else {
        throw new Error(data.error || 'Failed to reject RIDS');
      }
    } catch (error) {
      logger.error('Failed to reject RIDS', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to reject RIDS',
        type: 'error',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatusClick = (ridsItem: RIDSFormComplete) => {
    setSelectedRIDS(ridsItem);
    setChangeStatusModalOpen(true);
  };

  const handleChangeStatusConfirm = async (ridsId: string, newStatus: string, reason: string, notes?: string) => {
    setActionLoading(true);

    try {
      const response = await fetch(`/api/staff/rids/${ridsId}/change-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: newStatus, reason, notes }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: `RIDS status changed to ${newStatus} successfully`,
          type: 'success',
        });
        setChangeStatusModalOpen(false);
        setSelectedRIDS(null);
        fetchRIDS();
      } else {
        throw new Error(data.error || 'Failed to change RIDS status');
      }
    } catch (error) {
      logger.error('Failed to change RIDS status', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to change RIDS status',
        type: 'error',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Tab counts
  const draftCount = allRIDS.filter(r => r.status === 'draft').length;
  const submittedCount = allRIDS.filter(r => r.status === 'submitted').length;
  const approvedCount = allRIDS.filter(r => r.status === 'approved').length;
  const rejectedCount = allRIDS.filter(r => r.status === 'rejected').length;
  const totalCount = allRIDS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="RIDS Management"
        description="Reservist Information Data Sheet"
        action={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New RIDS
          </Button>
        }
      />

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">About RIDS</h3>
          <p className="text-sm text-blue-800 mt-1">
            The Reservist Information Data Sheet (RIDS) is the official Philippine Army form containing
            comprehensive personnel records for each reservist. It includes 12 sections covering service history,
            training, awards, and biometric data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'draft'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Draft
              {draftCount > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {draftCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('submitted')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'submitted'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submitted
              {submittedCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {submittedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'approved'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved
              {approvedCount > 0 && (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {approvedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rejected'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejected
              {rejectedCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {rejectedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All RIDS
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
              placeholder="Search by name, service number, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-navy-500"></div>
            <p className="mt-4 text-gray-600">Loading RIDS...</p>
          </div>
        ) : (
          <RIDSTable
            rids={filteredRIDS}
            loading={false}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSubmit={handleSubmitClick}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            onChangeStatus={handleChangeStatusClick}
          />
        )}
      </div>

      {/* View Modal */}
      <RIDSViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingRIDSId(null);
        }}
        ridsId={viewingRIDSId}
      />

      {/* Create Modal */}
      <CreateRIDSModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchRIDS();
          setCreateModalOpen(false);
          setToast({
            message: 'RIDS created successfully!',
            type: 'success',
          });
        }}
        onToast={(message, type) => setToast({ message, type })}
      />

      {/* Edit Modal */}
      <EditRIDSModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingRIDSId(null);
        }}
        ridsId={editingRIDSId}
        onSuccess={() => {
          fetchRIDS();
        }}
        onToast={(message, type) => setToast({ message, type })}
      />

      {/* Delete Modal */}
      <DeleteRIDSModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedRIDS(null);
        }}
        onConfirm={handleDeleteConfirm}
        rids={selectedRIDS}
        loading={actionLoading}
      />

      {/* Submit Modal */}
      <SubmitRIDSModal
        isOpen={submitModalOpen}
        onClose={() => {
          setSubmitModalOpen(false);
          setSelectedRIDS(null);
        }}
        onConfirm={handleSubmitConfirm}
        rids={selectedRIDS}
        loading={actionLoading}
      />

      {/* Approve Modal */}
      <ApproveRIDSModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedRIDS(null);
        }}
        onConfirm={handleApproveConfirm}
        rids={selectedRIDS}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <RejectRIDSModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRIDS(null);
        }}
        onReject={handleRejectConfirm}
        rids={selectedRIDS}
        loading={actionLoading}
      />

      {/* Change Status Modal */}
      <ChangeRIDSStatusModal
        isOpen={changeStatusModalOpen}
        onClose={() => {
          setChangeStatusModalOpen(false);
          setSelectedRIDS(null);
        }}
        onChangeStatus={handleChangeStatusConfirm}
        rids={selectedRIDS}
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
