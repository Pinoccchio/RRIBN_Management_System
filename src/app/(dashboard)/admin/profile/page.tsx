'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, UserCog, Calendar, CheckCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function AdminProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profile = user.profile;
  const account = user.account;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-navy-900 hover:text-yellow-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-navy-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header Section with Navy Background */}
        <div className="bg-navy-900 px-8 py-6">
          <div className="flex items-center gap-6">
            <Avatar
              firstName={profile?.first_name || 'Admin'}
              lastName={profile?.last_name || 'User'}
              src={profile?.profile_photo_url || undefined}
              size="xl"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <UserCog className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-semibold">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-navy-900 font-medium">
                  {profile?.first_name} {profile?.middle_name ? profile.middle_name + ' ' : ''}{profile?.last_name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <p className="text-navy-900 font-medium">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <p className="text-navy-900 font-medium">{profile?.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                <UserCog className="w-4 h-4 text-blue-600" />
                <p className="text-navy-900 font-medium">Administrator</p>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Status
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {account?.status === 'active' ? 'Active' : account?.status}
                </span>
              </div>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-navy-900 font-medium">
                  {account?.created_at
                    ? formatDistanceToNow(new Date(account.created_at), { addSuffix: true })
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This is a view-only profile page. To update your information, please contact the system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
