'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Reservist } from '@/lib/types/reservist';

interface EditReservistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reservist: Reservist | null;
}

export function EditReservistModal({
  isOpen,
  onClose,
  onSuccess,
  reservist,
}: EditReservistModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [rank, setRank] = useState('');
  const [reservistStatus, setReservistStatus] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [mos, setMos] = useState('');

  // Populate form when reservist changes
  useEffect(() => {
    if (reservist) {
      setFirstName(reservist.profile.first_name || '');
      setMiddleName(reservist.profile.middle_name || '');
      setLastName(reservist.profile.last_name || '');
      setPhone(reservist.profile.phone || '');
      setRank(reservist.reservist_details.rank || '');
      setReservistStatus(reservist.reservist_details.reservist_status || 'standby');
      setAddress(reservist.reservist_details.address || '');
      setEmergencyContactName(reservist.reservist_details.emergency_contact_name || '');
      setEmergencyContactPhone(reservist.reservist_details.emergency_contact_phone || '');
      setMos(reservist.reservist_details.mos || '');
    }
  }, [reservist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservist) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/staff/reservists/${reservist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            first_name: firstName,
            middle_name: middleName || null,
            last_name: lastName,
            phone: phone || null,
          },
          reservist_details: {
            rank: rank || null,
            reservist_status: reservistStatus,
            address: address || null,
            emergency_contact_name: emergencyContactName || null,
            emergency_contact_phone: emergencyContactPhone || null,
            mos: mos || null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update reservist');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating reservist:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!reservist) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Edit Reservist Information"
      description="Update reservist profile and service information"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Personal Information */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Middle Name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
          </div>
        </div>

        {/* Service Information */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3">Service Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Rank"
                value={rank}
                onChange={(value) => setRank(value)}
                options={[
                  { value: '', label: 'Select Rank' },
                  { value: 'Private', label: 'Private' },
                  { value: 'PFC', label: 'Private First Class' },
                  { value: 'Corporal', label: 'Corporal' },
                  { value: 'Sergeant', label: 'Sergeant' },
                  { value: '2LT', label: 'Second Lieutenant' },
                  { value: '1LT', label: 'First Lieutenant' },
                  { value: 'Captain', label: 'Captain' },
                  { value: 'Major', label: 'Major' },
                  { value: 'LtCol', label: 'Lieutenant Colonel' },
                  { value: 'Colonel', label: 'Colonel' },
                ]}
              />
              <Select
                label="Operational Status"
                value={reservistStatus}
                onChange={(value) => setReservistStatus(value)}
                options={[
                  { value: 'ready', label: 'Ready' },
                  { value: 'standby', label: 'Standby' },
                  { value: 'retired', label: 'Retired' },
                ]}
                helperText="Military readiness status (different from account status)"
              />
              <div className="md:col-span-2">
                <Input
                  label="MOS (Military Occupational Specialty)"
                  value={mos}
                  onChange={(e) => setMos(e.target.value)}
                  placeholder="e.g., INF, CAV, FA, SC"
                />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3">Address & Emergency Contact</h3>
          <div className="grid grid-cols-1 gap-4">
              <Input
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Input
                label="Emergency Contact Name"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
              <Input
                label="Emergency Contact Phone"
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Reservist'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
