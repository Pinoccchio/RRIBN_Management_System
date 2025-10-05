'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { DocumentsTable } from '@/components/dashboard/documents/DocumentsTable';
import { DocumentPreviewModal } from '@/components/dashboard/documents/DocumentPreviewModal';
import { ValidateDocumentModal } from '@/components/dashboard/documents/ValidateDocumentModal';
import { RejectDocumentModal } from '@/components/dashboard/documents/RejectDocumentModal';
import { ChangeDocumentStatusModal } from '@/components/dashboard/documents/ChangeDocumentStatusModal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Search } from 'lucide-react';
import type { DocumentWithReservist, DocumentStatus } from '@/lib/types/document';
import { logger } from '@/lib/logger';

type TabType = 'all' | 'pending' | 'verified' | 'rejected';

export default function StaffDocumentsPage() {
  const [allDocuments, setAllDocuments] = useState<DocumentWithReservist[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithReservist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  // Modal states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [validateModalOpen, setValidateModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithReservist | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch all documents
  const fetchAllDocuments = async () => {
    try {
      setIsLoading(true);
      logger.info('Fetching documents...', { context: 'StaffDocumentsPage' });

      const response = await fetch(`/api/staff/documents?status=all&limit=1000`);
      const data = await response.json();

      if (data.success) {
        setAllDocuments(data.data);
        logger.success(`Fetched ${data.data.length} documents`, { context: 'StaffDocumentsPage' });
      } else {
        logger.error('Failed to fetch documents', data.error, { context: 'StaffDocumentsPage' });
      }
    } catch (error) {
      logger.error('Error fetching documents', error, { context: 'StaffDocumentsPage' });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllDocuments();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!allDocuments.length) {
      setFilteredDocuments([]);
      return;
    }

    let filtered = allDocuments;

    // Filter by tab (status)
    if (activeTab === 'pending') {
      filtered = filtered.filter(d => d.status === 'pending');
    } else if (activeTab === 'verified') {
      filtered = filtered.filter(d => d.status === 'verified');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(d => d.status === 'rejected');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) => {
        const fullName = `${doc.reservist.first_name} ${doc.reservist.middle_name || ''} ${doc.reservist.last_name}`.toLowerCase();
        const email = doc.reservist.email.toLowerCase();
        const serviceNumber = doc.reservist.service_number.toLowerCase();
        const documentType = doc.document_type.toLowerCase();
        const fileName = doc.file_name.toLowerCase();

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          serviceNumber.includes(query) ||
          documentType.includes(query) ||
          fileName.includes(query)
        );
      });
    }

    setFilteredDocuments(filtered);
  }, [activeTab, searchQuery, allDocuments]);

  // Modal handlers
  const handleView = (document: DocumentWithReservist) => {
    setSelectedDocument(document);
    setPreviewModalOpen(true);
  };

  const handleValidateClick = (document: DocumentWithReservist) => {
    setSelectedDocument(document);
    setValidateModalOpen(true);
  };

  const handleRejectClick = (document: DocumentWithReservist) => {
    setSelectedDocument(document);
    setRejectModalOpen(true);
  };

  const handleChangeStatusClick = (document: DocumentWithReservist) => {
    setSelectedDocument(document);
    setChangeStatusModalOpen(true);
  };

  const handleChangeStatus = async (documentId: string, newStatus: DocumentStatus, reason: string, notes?: string) => {
    try {
      logger.info(`Changing document status: ${documentId} to ${newStatus}`, { context: 'StaffDocumentsPage', reason });

      const response = await fetch(`/api/staff/documents/${documentId}/change-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_status: newStatus, reason, notes }),
      });

      const data = await response.json();

      if (data.success) {
        logger.success(`Document status changed to ${newStatus} successfully`, { context: 'StaffDocumentsPage' });
        setToast({
          message: `Document status changed to ${newStatus} successfully!`,
          type: 'success',
        });
        // Refresh the list
        fetchAllDocuments();
      } else {
        logger.error('Failed to change document status', data.error, { context: 'StaffDocumentsPage' });
        setToast({
          message: data.error || 'Failed to change document status',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error changing document status', error, { context: 'StaffDocumentsPage' });
      setToast({
        message: 'An error occurred while changing document status',
        type: 'error',
      });
      throw error;
    }
  };

  const handleValidate = async (documentId: string, notes?: string) => {
    try {
      logger.info(`Validating document: ${documentId}`, { context: 'StaffDocumentsPage' });

      const response = await fetch(`/api/staff/documents/${documentId}/validate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Document validated successfully', { context: 'StaffDocumentsPage' });
        setToast({
          message: 'Document validated successfully!',
          type: 'success',
        });
        // Refresh the list
        fetchAllDocuments();
      } else {
        logger.error('Failed to validate document', data.error, { context: 'StaffDocumentsPage' });
        setToast({
          message: data.error || 'Failed to validate document',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error validating document', error, { context: 'StaffDocumentsPage' });
      setToast({
        message: 'An error occurred while validating document',
        type: 'error',
      });
      throw error;
    }
  };

  const handleReject = async (documentId: string, rejectionReason: string, notes?: string) => {
    try {
      logger.info(`Rejecting document: ${documentId}`, { context: 'StaffDocumentsPage', rejectionReason });

      const response = await fetch(`/api/staff/documents/${documentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason: rejectionReason, notes }),
      });

      const data = await response.json();

      if (data.success) {
        logger.success('Document rejected successfully', { context: 'StaffDocumentsPage' });
        setToast({
          message: 'Document rejected successfully',
          type: 'success',
        });
        // Refresh the list
        fetchAllDocuments();
      } else {
        logger.error('Failed to reject document', data.error, { context: 'StaffDocumentsPage' });
        setToast({
          message: data.error || 'Failed to reject document',
          type: 'error',
        });
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error rejecting document', error, { context: 'StaffDocumentsPage' });
      setToast({
        message: 'An error occurred while rejecting document',
        type: 'error',
      });
      throw error;
    }
  };

  // Tab counts
  const pendingCount = allDocuments.filter(d => d.status === 'pending').length;
  const verifiedCount = allDocuments.filter(d => d.status === 'verified').length;
  const rejectedCount = allDocuments.filter(d => d.status === 'rejected').length;
  const totalCount = allDocuments.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Validate documents from reservists"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Documents' },
        ]}
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
              Pending
              {pendingCount > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'verified'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Verified
              {verifiedCount > 0 && (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {verifiedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rejected'
                  ? 'border-yellow-500 text-yellow-600'
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
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Documents
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
              placeholder="Search by name, email, service number, document type, or file name..."
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
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : (
          <DocumentsTable
            documents={filteredDocuments}
            onView={handleView}
            onValidate={handleValidateClick}
            onReject={handleRejectClick}
            onChangeStatus={handleChangeStatusClick}
          />
        )}
      </div>

      {/* Modals */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        onValidate={handleValidateClick}
        onReject={handleRejectClick}
        onChangeStatus={handleChangeStatusClick}
      />

      <ValidateDocumentModal
        isOpen={validateModalOpen}
        onClose={() => {
          setValidateModalOpen(false);
          setSelectedDocument(null);
        }}
        onValidate={handleValidate}
        document={selectedDocument}
      />

      <RejectDocumentModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedDocument(null);
        }}
        onReject={handleReject}
        document={selectedDocument}
      />

      <ChangeDocumentStatusModal
        isOpen={changeStatusModalOpen}
        onClose={() => {
          setChangeStatusModalOpen(false);
          setSelectedDocument(null);
        }}
        onChangeStatus={handleChangeStatus}
        document={selectedDocument}
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
