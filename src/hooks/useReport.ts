import { useState, useEffect } from 'react';
import type { ReportType, ReportMetadata } from '@/lib/types/report';
import type { ReportFilterValues } from '@/components/dashboard/reports/ReportFilters';
import { logger } from '@/lib/logger';

interface UseReportResult<TData, TSummary> {
  data: TData[];
  summary: TSummary | null;
  metadata: ReportMetadata | null;
  isLoading: boolean;
  filters: ReportFilterValues;
  handleFilterChange: (newFilters: ReportFilterValues) => void;
  refetch: () => void;
}

export function useReport<TData = any, TSummary = any>(
  reportType: ReportType
): UseReportResult<TData, TSummary> {
  const [data, setData] = useState<TData[]>([]);
  const [summary, setSummary] = useState<TSummary | null>(null);
  const [metadata, setMetadata] = useState<ReportMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilterValues>({});

  const fetchReport = async (currentFilters: ReportFilterValues) => {
    try {
      setIsLoading(true);
      logger.info(`Fetching ${reportType} report`, { filters: currentFilters });

      // Build query params from filters
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/staff/reports/${reportType}?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data || []);
        setSummary(result.summary || null);
        setMetadata(result.metadata || null);
        logger.success(`Loaded ${result.data?.length || 0} records for ${reportType}`);
      } else {
        logger.error(`Failed to fetch ${reportType} report`, result.error);
        setData([]);
        setSummary(null);
        setMetadata(null);
      }
    } catch (error) {
      logger.error(`Error fetching ${reportType} report`, error);
      setData([]);
      setSummary(null);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(filters);
  }, []);

  const handleFilterChange = (newFilters: ReportFilterValues) => {
    setFilters(newFilters);
    fetchReport(newFilters);
  };

  const refetch = () => {
    fetchReport(filters);
  };

  return {
    data,
    summary,
    metadata,
    isLoading,
    filters,
    handleFilterChange,
    refetch,
  };
}
