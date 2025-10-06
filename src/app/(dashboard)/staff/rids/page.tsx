'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { RIDSTable } from '@/components/dashboard/rids/RIDSTable';
import { CreateRIDSModal } from '@/components/dashboard/rids/CreateRIDSModal';
import { RIDSPreviewModal } from '@/components/dashboard/rids/RIDSPreviewModal';
import { SubmitRIDSModal } from '@/components/dashboard/rids/SubmitRIDSModal';
import { ApproveRIDSModal } from '@/components/dashboard/rids/ApproveRIDSModal';
import { RejectRIDSModal } from '@/components/dashboard/rids/RejectRIDSModal';
import { ChangeRIDSStatusModal } from '@/components/dashboard/rids/ChangeRIDSStatusModal';
import { Toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { logger } from '@/lib/logger';
import type { RIDSFormComplete } from '@/lib/types/rids';

export default function StaffRIDSPage() {
  // State
  const [ridsForms, setRidsForms] = useState<RIDSFormComplete[]>([]);
  const [filteredRIDS, setFilteredRIDS] = useState<RIDSFormComplete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRIDS, setSelectedRIDS] = useState<RIDSFormComplete | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [editingRIDS, setEditingRIDS] = useState<RIDSFormComplete | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Stats
  const stats = {
    total: ridsForms.length,
    draft: ridsForms.filter(r => r.status === 'draft').length,
    submitted: ridsForms.filter(r => r.status === 'submitted').length,
    approved: ridsForms.filter(r => r.status === 'approved').length,
    rejected: ridsForms.filter(r => r.status === 'rejected').length,
  };

  // Fetch RIDS on mount
  useEffect(() => {
    fetchRIDS();
  }, []);

  // Filter RIDS when filters change
  useEffect(() => {
    filterRIDS();
  }, [searchQuery, statusFilter, companyFilter, ridsForms]);

  const fetchRIDS = async () => {
    try {
      setIsLoading(true);
      logger.info('Fetching RIDS list', { context: 'StaffRIDSPage' });

      const response = await fetch('/api/staff/rids?limit=100');
      const data = await response.json();

      if (data.success) {
        setRidsForms(data.data || []);
        logger.success('RIDS fetched', { context: 'StaffRIDSPage', count: data.data?.length || 0 });
      } else {
        setToast({ message: data.error || 'Failed to fetch RIDS', type: 'error' });
      }
    } catch (error) {
      logger.error('Error fetching RIDS', error, { context: 'StaffRIDSPage' });
      setToast({ message: 'Failed to fetch RIDS', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRIDS = () => {
    let filtered = ridsForms;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filter by company
    if (companyFilter !== 'all') {
      filtered = filtered.filter(r => r.reservist?.company === companyFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        const fullName = `${r.reservist?.first_name} ${r.reservist?.middle_name || ''} ${r.reservist?.last_name}`.toLowerCase();
        const serviceNumber = (r.reservist?.service_number || '').toLowerCase();
        return fullName.includes(query) || serviceNumber.includes(query);
      });
    }

    setFilteredRIDS(filtered);
  };

  const getUniqueCompanies = () => {
    const companies = [...new Set(ridsForms.map(r => r.reservist?.company).filter(Boolean))].sort();
    return companies as string[];
  };

  // Handlers
  const handleView = (rids: RIDSFormComplete) => {
    setSelectedRIDS(rids);
    setIsPreviewModalOpen(true);
  };

  const handleEdit = (rids: RIDSFormComplete) => {
    setEditingRIDS(rids);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (rids: RIDSFormComplete) => {
    setSelectedRIDS(rids);
    setIsSubmitModalOpen(true);
  };

  const handleApprove = (rids: RIDSFormComplete) => {
    setSelectedRIDS(rids);
    setIsApproveModalOpen(true);
  };

  const handleReject = (rids: RIDSFormComplete) => {
    setSelectedRIDS(rids);
    setIsRejectModalOpen(true);
  };

  const handleChangeStatus = (rids: RIDSFormComplete) => {
    setSelectedRIDS(rids);
    setIsChangeStatusModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingRIDS(null);
  };

  const handleSuccess = (message: string) => {
    setToast({ message, type: 'success' });
    fetchRIDS(); // Refresh list
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="RIDS Management"
        description="Manage Reservist Information Data Sheets"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create RIDS
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total RIDS"
          value={stats.total}
          icon={FileText}
          trend="neutral"
        />
        <StatCard
          title="Draft"
          value={stats.draft}
          icon={Clock}
          trend="neutral"
          variant="default"
        />
        <StatCard
          title="Submitted"
          value={stats.submitted}
          icon={Clock}
          trend="neutral"
          variant="warning"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          trend="up"
          variant="success"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          trend="neutral"
          variant="danger"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchInput
            placeholder="Search by name or service number..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>

          <Select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
            <option value="all">All Companies</option>
            {getUniqueCompanies().map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* RIDS Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredRIDS.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No RIDS Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' || companyFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Get started by creating your first RIDS'}
            </p>
            {!searchQuery && statusFilter === 'all' && companyFilter === 'all' && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First RIDS
              </Button>
            )}
          </div>
        ) : (
          <RIDSTable
            ridsForms={filteredRIDS}
            onView={handleView}
            onSubmit={handleSubmit}
            onEdit={handleEdit}
            onApprove={handleApprove}
            onReject={handleReject}
            onChangeStatus={handleChangeStatus}
          />
        )}
      </div>

      {/* Results Info */}
      {!isLoading && filteredRIDS.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {filteredRIDS.length} of {ridsForms.length} RIDS
        </div>
      )}

      {/* Modals */}
      <CreateRIDSModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={() => handleSuccess('RIDS saved successfully')}
        existingRIDS={editingRIDS}
      />

      {selectedRIDS && (
        <>
          <RIDSPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            rids={selectedRIDS}
          />

          <SubmitRIDSModal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            rids={selectedRIDS}
            onSuccess={() => {
              handleSuccess('RIDS submitted successfully');
              setIsSubmitModalOpen(false);
            }}
          />

          <ApproveRIDSModal
            isOpen={isApproveModalOpen}
            onClose={() => setIsApproveModalOpen(false)}
            rids={selectedRIDS}
            onSuccess={() => {
              handleSuccess('RIDS approved successfully');
              setIsApproveModalOpen(false);
            }}
          />

          <RejectRIDSModal
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            rids={selectedRIDS}
            onSuccess={() => {
              handleSuccess('RIDS rejected successfully');
              setIsRejectModalOpen(false);
            }}
          />

          <ChangeRIDSStatusModal
            isOpen={isChangeStatusModalOpen}
            onClose={() => setIsChangeStatusModalOpen(false)}
            rids={selectedRIDS}
            onSuccess={() => {
              handleSuccess('RIDS status changed successfully');
              setIsChangeStatusModalOpen(false);
            }}
          />
        </>
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
