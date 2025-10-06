'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

interface Section2Data {
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
  mobile_tel_nr?: string;

  // Personal Details
  birth_place?: string;
  religion?: string;
  height_cm?: number;
  weight_kg?: number;
  marital_status?: string;
  sex?: string;

  // Digital Presence
  fb_account?: string;

  // Additional Info
  special_skills?: string;
  languages_spoken?: string;
}

interface Section2FormProps {
  initialData?: Section2Data;
  onChange: (data: Section2Data) => void;
}

export function Section2Form({ initialData, onChange }: Section2FormProps) {
  const [formData, setFormData] = useState<Section2Data>(initialData || {});

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (field: keyof Section2Data, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Section 2: Personal Information</p>
            <p className="text-sm text-blue-700 mt-1">
              Fill in the reservist's personal and contact information. Fields marked with * are required.
            </p>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div>
        <h3 className="text-lg font-semibold text-navy-900 mb-4 pb-2 border-b border-gray-200">
          Employment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="present_occupation">Present Occupation</Label>
            <Input
              id="present_occupation"
              placeholder="e.g., Software Engineer"
              value={formData.present_occupation || ''}
              onChange={(e) => handleChange('present_occupation', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              placeholder="e.g., ABC Corporation"
              value={formData.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="company_address">Company Address</Label>
            <Input
              id="company_address"
              placeholder="Complete company address"
              value={formData.company_address || ''}
              onChange={(e) => handleChange('company_address', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="office_tel_nr">Office Telephone Number</Label>
            <Input
              id="office_tel_nr"
              placeholder="(02) 1234-5678"
              value={formData.office_tel_nr || ''}
              onChange={(e) => handleChange('office_tel_nr', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Residential Information */}
      <div>
        <h3 className="text-lg font-semibold text-navy-900 mb-4 pb-2 border-b border-gray-200">
          Residential Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="home_address_street">Home Address (Street/Barangay) *</Label>
            <Input
              id="home_address_street"
              placeholder="House No., Street, Barangay"
              value={formData.home_address_street || ''}
              onChange={(e) => handleChange('home_address_street', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="home_address_city">City/Municipality *</Label>
            <Input
              id="home_address_city"
              placeholder="e.g., Quezon City"
              value={formData.home_address_city || ''}
              onChange={(e) => handleChange('home_address_city', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="home_address_province">Province *</Label>
            <Input
              id="home_address_province"
              placeholder="e.g., Metro Manila"
              value={formData.home_address_province || ''}
              onChange={(e) => handleChange('home_address_province', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="home_address_zip">ZIP Code</Label>
            <Input
              id="home_address_zip"
              placeholder="1100"
              value={formData.home_address_zip || ''}
              onChange={(e) => handleChange('home_address_zip', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="res_tel_nr">Residence Telephone Number</Label>
            <Input
              id="res_tel_nr"
              placeholder="(02) 1234-5678"
              value={formData.res_tel_nr || ''}
              onChange={(e) => handleChange('res_tel_nr', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="mobile_tel_nr">Mobile Number *</Label>
            <Input
              id="mobile_tel_nr"
              placeholder="0917-123-4567"
              value={formData.mobile_tel_nr || ''}
              onChange={(e) => handleChange('mobile_tel_nr', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div>
        <h3 className="text-lg font-semibold text-navy-900 mb-4 pb-2 border-b border-gray-200">
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="birth_place">Place of Birth *</Label>
            <Input
              id="birth_place"
              placeholder="e.g., Manila, Philippines"
              value={formData.birth_place || ''}
              onChange={(e) => handleChange('birth_place', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="religion">Religion *</Label>
            <Input
              id="religion"
              placeholder="e.g., Roman Catholic"
              value={formData.religion || ''}
              onChange={(e) => handleChange('religion', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="height_cm">Height (cm) *</Label>
            <Input
              id="height_cm"
              type="number"
              placeholder="170"
              value={formData.height_cm || ''}
              onChange={(e) => handleChange('height_cm', parseFloat(e.target.value) || undefined)}
              required
            />
          </div>

          <div>
            <Label htmlFor="weight_kg">Weight (kg) *</Label>
            <Input
              id="weight_kg"
              type="number"
              placeholder="70"
              value={formData.weight_kg || ''}
              onChange={(e) => handleChange('weight_kg', parseFloat(e.target.value) || undefined)}
              required
            />
          </div>

          <div>
            <Label htmlFor="marital_status">Marital Status *</Label>
            <Select
              id="marital_status"
              value={formData.marital_status || ''}
              onChange={(e) => handleChange('marital_status', e.target.value)}
              required
            >
              <option value="">Select marital status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widow">Widow/Widower</option>
              <option value="Separated">Separated</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="sex">Sex *</Label>
            <Select
              id="sex"
              value={formData.sex || ''}
              onChange={(e) => handleChange('sex', e.target.value)}
              required
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Digital Presence & Additional Info */}
      <div>
        <h3 className="text-lg font-semibold text-navy-900 mb-4 pb-2 border-b border-gray-200">
          Digital Presence & Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fb_account">Facebook Account</Label>
            <Input
              id="fb_account"
              placeholder="Facebook username or profile URL"
              value={formData.fb_account || ''}
              onChange={(e) => handleChange('fb_account', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="special_skills">Special Skills</Label>
            <Input
              id="special_skills"
              placeholder="e.g., First Aid, Marksmanship"
              value={formData.special_skills || ''}
              onChange={(e) => handleChange('special_skills', e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="languages_spoken">Languages Spoken</Label>
            <Input
              id="languages_spoken"
              placeholder="e.g., Filipino, English, Spanish"
              value={formData.languages_spoken || ''}
              onChange={(e) => handleChange('languages_spoken', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
