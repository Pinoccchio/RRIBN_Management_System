'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';

interface Reservist {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  service_number: string;
  rank: string;
  company: string;
  section?: string | null;
  has_rids: boolean;
  rids_id?: string | null;
  rids_status?: string | null;
}

interface ReservistSelectProps {
  onSelect: (reservist: Reservist) => void;
  selectedReservistId?: string | null;
}

export function ReservistSelect({ onSelect, selectedReservistId }: ReservistSelectProps) {
  const [reservists, setReservists] = useState<Reservist[]>([]);
  const [filteredReservists, setFilteredReservists] = useState<Reservist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReservist, setSelectedReservist] = useState<Reservist | null>(null);

  useEffect(() => {
    fetchReservists();
  }, []);

  useEffect(() => {
    filterReservists();
  }, [searchQuery, reservists]);

  const fetchReservists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/reservists/simple?status=active');

      if (!response.ok) {
        throw new Error('Failed to fetch reservists');
      }

      const data = await response.json();

      if (data.success) {
        setReservists(data.data || []);
        setFilteredReservists(data.data || []);
      }
    } catch (error) {
      logger.error('Failed to fetch reservists', error);
      setReservists([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReservists = () => {
    if (!searchQuery.trim()) {
      setFilteredReservists(reservists);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = reservists.filter((r) => {
      const fullName = `${r.first_name} ${r.middle_name || ''} ${r.last_name}`.toLowerCase();
      const serviceNumber = r.service_number?.toLowerCase() || '';
      const rank = r.rank?.toLowerCase() || '';
      const company = r.company?.toLowerCase() || '';

      return (
        fullName.includes(query) ||
        serviceNumber.includes(query) ||
        rank.includes(query) ||
        company.includes(query)
      );
    });

    setFilteredReservists(filtered);
  };

  const handleSelect = (reservist: Reservist) => {
    if (reservist.has_rids) {
      alert(`${reservist.first_name} ${reservist.last_name} already has a RIDS (Status: ${reservist.rids_status}). Please select a different reservist.`);
      return;
    }

    setSelectedReservist(reservist);
    onSelect(reservist);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
          <span className="ml-3 text-gray-600">Loading reservists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        type="text"
        placeholder="Search by name, service number, rank, or company..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
      />

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-800">
            Select a reservist to create their RIDS. Reservists who already have a RIDS are marked and cannot be selected.
          </p>
        </div>
      </div>

      {/* Reservist List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        {filteredReservists.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No reservists found matching your search' : 'No reservists available'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReservists.map((reservist) => (
              <button
                key={reservist.id}
                onClick={() => handleSelect(reservist)}
                disabled={reservist.has_rids}
                className={`
                  w-full text-left p-4 transition-colors
                  ${reservist.has_rids
                    ? 'bg-gray-50 cursor-not-allowed opacity-60'
                    : 'hover:bg-gray-50 cursor-pointer'
                  }
                  ${selectedReservist?.id === reservist.id ? 'bg-navy-50 border-l-4 border-navy-600' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {reservist.first_name} {reservist.middle_name?.charAt(0)}. {reservist.last_name}
                      </p>
                      {reservist.has_rids && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Has RIDS
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                      <span>SN: {reservist.service_number}</span>
                      <span>•</span>
                      <span>{reservist.rank}</span>
                      <span>•</span>
                      <span>{reservist.company}</span>
                      {reservist.section && (
                        <>
                          <span>•</span>
                          <span>{reservist.section}</span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{reservist.email}</p>
                  </div>

                  {selectedReservist?.id === reservist.id && !reservist.has_rids && (
                    <CheckCircle2 className="w-5 h-5 text-navy-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Summary */}
      {selectedReservist && !selectedReservist.has_rids && (
        <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-navy-900 mb-1">Selected Reservist</p>
          <p className="text-sm text-navy-700">
            {selectedReservist.first_name} {selectedReservist.middle_name?.charAt(0)}. {selectedReservist.last_name} ({selectedReservist.service_number})
          </p>
        </div>
      )}
    </div>
  );
}
