'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
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
      logger.info('🔄 [ReservistSelect] Fetching reservists...', { context: 'RESERVIST_SELECT' });

      const apiUrl = '/api/staff/reservists/simple?status=active';
      logger.debug(`   📡 Fetch URL: ${apiUrl}`, { context: 'RESERVIST_SELECT' });
      logger.debug('   🔒 Cache: no-store, Cache-Control: no-cache', { context: 'RESERVIST_SELECT' });

      // Force fresh data - no caching to ensure RIDS status is up-to-date
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      logger.debug(`   📥 Response status: ${response.status} ${response.statusText}`, { context: 'RESERVIST_SELECT' });

      if (!response.ok) {
        throw new Error('Failed to fetch reservists');
      }

      const data = await response.json();
      logger.debug('   📦 Raw API response received', { context: 'RESERVIST_SELECT' });
      logger.debug(`   ✓ Success: ${data.success}, Data length: ${data.data?.length || 0}`, { context: 'RESERVIST_SELECT' });

      if (data.success) {
        const reservistList = data.data || [];

        logger.success(`✅ [ReservistSelect] Received ${reservistList.length} reservists`, { context: 'RESERVIST_SELECT' });

        // Log each reservist's RIDS status
        if (reservistList.length > 0) {
          logger.debug('🔍 [ReservistSelect] RIDS Status by Reservist:', { context: 'RESERVIST_SELECT' });
          reservistList.forEach((r: Reservist, index: number) => {
            const statusIcon = r.has_rids ? '✅ HAS RIDS' : '❌ NO RIDS';
            logger.debug(`   ${index + 1}. ${r.first_name} ${r.last_name} (${r.service_number}): ${statusIcon}`, { context: 'RESERVIST_SELECT' });
            if (r.has_rids) {
              logger.debug(`      └─ RIDS ID: ${r.rids_id}, Status: ${r.rids_status}`, { context: 'RESERVIST_SELECT' });
            }
          });
        }

        setReservists(reservistList);
        setFilteredReservists(reservistList);
        setLastRefreshed(new Date());

        logger.success(`✅ [ReservistSelect] State updated with ${reservistList.length} reservists`, { context: 'RESERVIST_SELECT' });
      }
    } catch (error) {
      logger.error('❌ [ReservistSelect] Failed to fetch reservists', error, { context: 'RESERVIST_SELECT' });
      setReservists([]);
    } finally {
      setLoading(false);
      logger.debug('   🏁 Loading state set to false', { context: 'RESERVIST_SELECT' });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReservists();
    setRefreshing(false);
  };

  const filterReservists = () => {
    if (!searchQuery.trim()) {
      logger.debug(`🔍 [ReservistSelect] No search query - showing all ${reservists.length} reservists`, { context: 'RESERVIST_SELECT' });
      setFilteredReservists(reservists);
      return;
    }

    const query = searchQuery.toLowerCase();
    logger.debug(`🔍 [ReservistSelect] Filtering with query: "${query}"`, { context: 'RESERVIST_SELECT' });

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

    logger.debug(`   ✓ Filtered to ${filtered.length} reservists`, { context: 'RESERVIST_SELECT' });
    setFilteredReservists(filtered);
  };

  const handleSelect = (reservist: Reservist) => {
    logger.info(`👤 [ReservistSelect] Selection attempted: ${reservist.first_name} ${reservist.last_name}`, { context: 'RESERVIST_SELECT' });
    logger.debug(`   RIDS Status: has_rids=${reservist.has_rids}, rids_id=${reservist.rids_id || 'null'}, rids_status=${reservist.rids_status || 'null'}`, { context: 'RESERVIST_SELECT' });

    if (reservist.has_rids) {
      logger.warn(`⚠️ [ReservistSelect] BLOCKED: Reservist already has RIDS!`, { context: 'RESERVIST_SELECT' });
      alert(`${reservist.first_name} ${reservist.last_name} already has a RIDS (Status: ${reservist.rids_status}). Please select a different reservist.`);
      return;
    }

    logger.success(`✅ [ReservistSelect] Selection allowed - Reservist has no RIDS`, { context: 'RESERVIST_SELECT' });
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
      {/* Search and Refresh */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by name, service number, rank, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Last Refreshed */}
      {lastRefreshed && (
        <p className="text-xs text-gray-500">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </p>
      )}

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
