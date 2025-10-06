'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { logger } from '@/lib/logger';

interface Column {
  key: string;
  label: string;
  render?: (value: any, entry: any) => React.ReactNode;
}

interface SectionEntryManagerProps<T> {
  ridsId: string;
  sectionName: string;
  sectionNumber: number;
  apiEndpoint: string; // e.g., '/api/staff/rids/[id]/sections/promotion-history'
  columns: Column[];
  FormComponent: React.ComponentType<{
    entry?: T | null;
    onSave: (data: T) => Promise<void>;
    onCancel: () => void;
    saving?: boolean;
  }>;
  emptyMessage?: string;
}

export function SectionEntryManager<T extends { id?: string }>({
  ridsId,
  sectionName,
  sectionNumber,
  apiEndpoint,
  columns,
  FormComponent,
  emptyMessage = 'No entries added yet',
}: SectionEntryManagerProps<T>) {
  const [entries, setEntries] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [ridsId]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      logger.info(`📥 [SectionEntryManager] Fetching ${sectionName} entries...`, { context: 'SECTION_MANAGER' });

      const response = await fetch(apiEndpoint.replace('[id]', ridsId));
      const data = await response.json();

      if (data.success) {
        setEntries(data.data || []);
        logger.success(`✅ [SectionEntryManager] Loaded ${data.data?.length || 0} ${sectionName} entries`, { context: 'SECTION_MANAGER' });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error(`❌ [SectionEntryManager] Failed to fetch ${sectionName} entries`, error, { context: 'SECTION_MANAGER' });
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    logger.info(`➕ [SectionEntryManager] Opening add form for ${sectionName}`, { context: 'SECTION_MANAGER' });
    setEditingEntry(null);
    setShowModal(true);
  };

  const handleEdit = (entry: T) => {
    logger.info(`✏️ [SectionEntryManager] Opening edit form for ${sectionName} entry`, { context: 'SECTION_MANAGER' });
    setEditingEntry(entry);
    setShowModal(true);
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      logger.info(`🗑️ [SectionEntryManager] Deleting ${sectionName} entry...`, { context: 'SECTION_MANAGER' });

      const response = await fetch(
        `${apiEndpoint.replace('[id]', ridsId)}/${entryId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setEntries(entries.filter((e) => e.id !== entryId));
        logger.success(`✅ [SectionEntryManager] ${sectionName} entry deleted`, { context: 'SECTION_MANAGER' });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error) {
      logger.error(`❌ [SectionEntryManager] Failed to delete ${sectionName} entry`, error, { context: 'SECTION_MANAGER' });
      alert('Failed to delete entry. Please try again.');
    }
  };

  const handleSave = async (data: T) => {
    try {
      setSaving(true);
      const isEdit = !!editingEntry?.id;
      const url = isEdit
        ? `${apiEndpoint.replace('[id]', ridsId)}/${editingEntry.id}`
        : apiEndpoint.replace('[id]', ridsId);
      const method = isEdit ? 'PUT' : 'POST';

      logger.info(`💾 [SectionEntryManager] ${isEdit ? 'Updating' : 'Creating'} ${sectionName} entry...`, { context: 'SECTION_MANAGER' });
      logger.debug(`   API: ${method} ${url}`, { context: 'SECTION_MANAGER' });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        await fetchEntries(); // Refresh list
        setShowModal(false);
        setEditingEntry(null);
        logger.success(`✅ [SectionEntryManager] ${sectionName} entry ${isEdit ? 'updated' : 'created'}`, { context: 'SECTION_MANAGER' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      logger.error(`❌ [SectionEntryManager] Failed to save ${sectionName} entry`, error, { context: 'SECTION_MANAGER' });
      throw error; // Let form component handle error display
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    logger.debug(`❌ [SectionEntryManager] Form cancelled`, { context: 'SECTION_MANAGER' });
    setShowModal(false);
    setEditingEntry(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-navy-600" />
        <span className="ml-3 text-gray-600">Loading {sectionName.toLowerCase()}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Section {sectionNumber}: {sectionName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Table or Empty State */}
      {entries.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">{emptyMessage}</p>
          <Button size="sm" variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Entry
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {col.render ? col.render((entry as any)[col.key], entry) : (entry as any)[col.key] || 'N/A'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-navy-600 hover:text-navy-800 p-1 rounded hover:bg-navy-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id!)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={handleCancel} size="lg">
          <FormComponent
            entry={editingEntry}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}
