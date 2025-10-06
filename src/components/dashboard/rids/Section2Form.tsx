'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Briefcase, Home, User, Heart, Globe } from 'lucide-react';
import { MaritalStatus, Sex } from '@/lib/types/rids';

export interface Section2FormData {
  // Employment
  present_occupation?: string;
  company_name?: string;
  company_address?: string;
  office_tel_nr?: string;

  // Residential
  home_address_street?: string;
  home_address_city?: string;
  home_address_province?: string;
  home_address_zip?: string;
  res_tel_nr?: string;
  mobile_tel_nr: string; // Required

  // Personal Details
  birth_place?: string;
  religion?: string;
  height_cm?: number;
  weight_kg?: number;
  marital_status?: MaritalStatus;
  sex?: Sex;

  // Digital Presence
  fb_account?: string;

  // Additional
  special_skills?: string;
  languages_spoken?: string;
}

interface Section2FormProps {
  formData: Section2FormData;
  onChange: (data: Partial<Section2FormData>) => void;
  errors?: Record<string, string>;
}

export function Section2Form({ formData, onChange, errors = {} }: Section2FormProps) {
  const handleChange = (field: keyof Section2FormData, value: any) => {
    onChange({ [field]: value });
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
      <Icon className="w-5 h-5 text-navy-600" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Employment Information */}
      <div>
        <SectionHeader icon={Briefcase} title="Employment Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Present Occupation"
            placeholder="e.g., Software Engineer"
            value={formData.present_occupation || ''}
            onChange={(e) => handleChange('present_occupation', e.target.value)}
            error={errors.present_occupation}
          />
          <Input
            label="Company/Business Name"
            placeholder="e.g., ABC Corporation"
            value={formData.company_name || ''}
            onChange={(e) => handleChange('company_name', e.target.value)}
            error={errors.company_name}
          />
          <Input
            label="Company Address"
            placeholder="Full company address"
            value={formData.company_address || ''}
            onChange={(e) => handleChange('company_address', e.target.value)}
            error={errors.company_address}
            containerClassName="md:col-span-2"
          />
          <Input
            label="Office Telephone"
            placeholder="e.g., (02) 1234-5678"
            value={formData.office_tel_nr || ''}
            onChange={(e) => handleChange('office_tel_nr', e.target.value)}
            error={errors.office_tel_nr}
          />
        </div>
      </div>

      {/* Residential Information */}
      <div>
        <SectionHeader icon={Home} title="Residential Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Home Address (Street/Barangay)"
            placeholder="e.g., 123 Main Street, Brgy. Sample"
            value={formData.home_address_street || ''}
            onChange={(e) => handleChange('home_address_street', e.target.value)}
            error={errors.home_address_street}
            containerClassName="md:col-span-2"
          />
          <Input
            label="City/Municipality"
            placeholder="e.g., Quezon City"
            value={formData.home_address_city || ''}
            onChange={(e) => handleChange('home_address_city', e.target.value)}
            error={errors.home_address_city}
          />
          <Input
            label="Province"
            placeholder="e.g., Metro Manila"
            value={formData.home_address_province || ''}
            onChange={(e) => handleChange('home_address_province', e.target.value)}
            error={errors.home_address_province}
          />
          <Input
            label="ZIP Code"
            placeholder="e.g., 1100"
            value={formData.home_address_zip || ''}
            onChange={(e) => handleChange('home_address_zip', e.target.value)}
            error={errors.home_address_zip}
          />
          <Input
            label="Residential Telephone"
            placeholder="e.g., (02) 8765-4321"
            value={formData.res_tel_nr || ''}
            onChange={(e) => handleChange('res_tel_nr', e.target.value)}
            error={errors.res_tel_nr}
          />
          <Input
            label="Mobile Number *"
            placeholder="e.g., 09171234567"
            value={formData.mobile_tel_nr || ''}
            onChange={(e) => handleChange('mobile_tel_nr', e.target.value)}
            error={errors.mobile_tel_nr}
            required
          />
        </div>
      </div>

      {/* Personal Details */}
      <div>
        <SectionHeader icon={User} title="Personal Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Place of Birth"
            placeholder="e.g., Manila, Philippines"
            value={formData.birth_place || ''}
            onChange={(e) => handleChange('birth_place', e.target.value)}
            error={errors.birth_place}
          />
          <Input
            label="Religion"
            placeholder="e.g., Roman Catholic"
            value={formData.religion || ''}
            onChange={(e) => handleChange('religion', e.target.value)}
            error={errors.religion}
          />
          <Input
            label="Height (cm)"
            type="number"
            placeholder="e.g., 170"
            value={formData.height_cm?.toString() || ''}
            onChange={(e) => handleChange('height_cm', e.target.value ? parseInt(e.target.value) : undefined)}
            error={errors.height_cm}
          />
          <Input
            label="Weight (kg)"
            type="number"
            placeholder="e.g., 70"
            value={formData.weight_kg?.toString() || ''}
            onChange={(e) => handleChange('weight_kg', e.target.value ? parseInt(e.target.value) : undefined)}
            error={errors.weight_kg}
          />
        </div>
      </div>

      {/* Marital Status & Sex */}
      <div>
        <SectionHeader icon={Heart} title="Civil Status" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Marital Status"
            value={formData.marital_status || ''}
            onChange={(value) => handleChange('marital_status', value as MaritalStatus)}
            options={[
              { value: '', label: 'Select marital status' },
              { value: 'Single', label: 'Single' },
              { value: 'Married', label: 'Married' },
              { value: 'Widow', label: 'Widow/Widower' },
              { value: 'Separated', label: 'Separated' },
            ]}
            error={errors.marital_status}
          />
          <Select
            label="Sex"
            value={formData.sex || ''}
            onChange={(value) => handleChange('sex', value as Sex)}
            options={[
              { value: '', label: 'Select sex' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ]}
            error={errors.sex}
          />
        </div>
      </div>

      {/* Digital Presence */}
      <div>
        <SectionHeader icon={Globe} title="Digital Presence" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Facebook Account"
            placeholder="Facebook profile URL or username"
            value={formData.fb_account || ''}
            onChange={(e) => handleChange('fb_account', e.target.value)}
            error={errors.fb_account}
          />
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <SectionHeader icon={User} title="Additional Information" />
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Special Skills"
            placeholder="e.g., First Aid, Communications, Marksmanship"
            value={formData.special_skills || ''}
            onChange={(e) => handleChange('special_skills', e.target.value)}
            error={errors.special_skills}
          />
          <Input
            label="Languages Spoken"
            placeholder="e.g., English, Tagalog, Bisaya"
            value={formData.languages_spoken || ''}
            onChange={(e) => handleChange('languages_spoken', e.target.value)}
            error={errors.languages_spoken}
          />
        </div>
      </div>

      {/* Required Fields Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Note:</span> Fields marked with * are required. Other fields are optional but recommended for a complete RIDS record.
        </p>
      </div>
    </div>
  );
}
