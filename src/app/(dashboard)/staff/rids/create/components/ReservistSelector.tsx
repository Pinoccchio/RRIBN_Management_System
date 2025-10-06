'use client';

import React, { useState, useEffect } from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { logger } from '@/lib/logger';

interface Reservist {
  id: string;
  service_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  company: string;
  rank: string | null;
}

interface ReservistSelectorProps {
  selectedReservistId: string | null;
  onSelect: (reservist: Reservist | null) => void;
}

export function ReservistSelector({ selectedReservistId, onSelect }: ReservistSelectorProps) {
  const [reservists, setReservists] = useState<Reservist[]>([]);
  const [filteredReservists, setFilteredReservists] = useState<Reservist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  // Fetch reservists on mount
  useEffect(() => {
    fetchReservists();
  }, []);

  // Filter reservists when search or company filter changes
  useEffect(() => {
    filterReservists();
  }, [searchQuery, companyFilter, reservists]);

  const fetchReservists = async () => {
    try {
      setIsLoading(true);
      logger.info('Fetching reservists for RIDS selector', { context: 'ReservistSelector' });

      const response = await fetch('/api/staff/reservists/simple');
      const data = await response.json();

      if (data.success) {
        setReservists(data.data || []);
        logger.success('Reservists fetched', { context: 'ReservistSelector', count: data.data?.length || 0 });
      } else {
        logger.error('Failed to fetch reservists', new Error(data.error), { context: 'ReservistSelector' });
      }
    } catch (error) {
      logger.error('Error fetching reservists', error, { context: 'ReservistSelector' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterReservists = () => {
    let filtered = reservists;

    // Filter by company
    if (companyFilter !== 'all') {
      filtered = filtered.filter(r => r.company === companyFilter);
    }

    // Filter by search query (name or service number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        const fullName = `${r.first_name} ${r.middle_name || ''} ${r.last_name}`.toLowerCase();
        const serviceNumber = (r.service_number || '').toLowerCase();
        return fullName.includes(query) || serviceNumber.includes(query);
      });
    }

    setFilteredReservists(filtered);
  };

  const handleSelectReservist = (reservistId: string) => {
    const reservist = reservists.find(r => r.id === reservistId);
    onSelect(reservist || null);
  };

  const getUniqueCompanies = () => {
    const companies = [...new Set(reservists.map(r => r.company))].filter(Boolean).sort();
    return companies;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchInput
          placeholder="Search by name or service number..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="all">All Companies</option>
          {getUniqueCompanies().map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </Select>
      </div>

      {/* Reservist List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
        {filteredReservists.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No reservists found</p>
            {searchQuery && (
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReservists.map(reservist => {
              const isSelected = selectedReservistId === reservist.id;
              return (
                <div
                  key={reservist.id}
                  onClick={() => handleSelectReservist(reservist.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-yellow-50 border-l-4 border-yellow-500'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-navy-900">
                          {reservist.rank && <span className="text-sm text-gray-600 mr-2">{reservist.rank}</span>}
                          {reservist.first_name} {reservist.middle_name ? `${reservist.middle_name} ` : ''}{reservist.last_name}
                        </h3>
                        {isSelected && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          {reservist.service_number || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {reservist.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {reservist.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selection Info */}
      {selectedReservistId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-900">Reservist Selected</p>
              <p className="text-sm text-green-700 mt-1">
                Click "Next" to continue with RIDS creation for the selected reservist.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredReservists.length} of {reservists.length} reservists
      </div>
    </div>
  );
}
