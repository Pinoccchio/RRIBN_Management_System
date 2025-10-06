'use client';

import React, { useState } from 'react';
import { FileDown, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  generatePDFReport,
  downloadPDF,
  printPDF,
  type ReportHeader,
  type TableColumn,
  type PDFReportOptions,
} from '@/lib/utils/report-generator';

interface ExportPDFButtonProps {
  reportTitle: string;
  reportSubtitle?: string;
  company?: string;
  generatedBy?: string;
  columns: TableColumn[];
  data: any[];
  filename: string;
  options?: PDFReportOptions;
  variant?: 'primary' | 'secondary';
  showPrintButton?: boolean;
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  reportTitle,
  reportSubtitle,
  company,
  generatedBy,
  columns,
  data,
  filename,
  options = {},
  variant = 'primary',
  showPrintButton = true,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleExportPDF = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    setIsExporting(true);

    try {
      const header: ReportHeader = {
        title: reportTitle,
        subtitle: reportSubtitle,
        company,
        generatedBy,
        date: new Date(),
      };

      const pdf = generatePDFReport(header, columns, data, options);
      downloadPDF(pdf, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (data.length === 0) {
      alert('No data to print');
      return;
    }

    setIsPrinting(true);

    try {
      const header: ReportHeader = {
        title: reportTitle,
        subtitle: reportSubtitle,
        company,
        generatedBy,
        date: new Date(),
      };

      const pdf = generatePDFReport(header, columns, data, options);
      printPDF(pdf);
    } catch (error) {
      console.error('Error printing PDF:', error);
      alert('Failed to open print dialog. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {showPrintButton && (
        <Button
          variant="secondary"
          onClick={handlePrint}
          disabled={isPrinting || data.length === 0}
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          {isPrinting ? 'Preparing...' : 'Print'}
        </Button>
      )}
      <Button
        variant={variant}
        onClick={handleExportPDF}
        disabled={isExporting || data.length === 0}
        className="flex items-center gap-2"
      >
        <FileDown className="w-4 h-4" />
        {isExporting ? 'Exporting...' : 'Export to PDF'}
      </Button>
    </div>
  );
};
