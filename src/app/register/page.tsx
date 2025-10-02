'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rank: '',
    serviceNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    rank: '',
    serviceNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: '',
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Check password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let label = '';
    let color = '';

    if (score === 0 || password.length === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 3) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (score <= 4) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    setPasswordStrength({ score, label, color });
  };

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      rank: '',
      serviceNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: '',
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.rank.trim()) {
      newErrors.rank = 'Rank is required';
    }

    if (!formData.serviceNumber.trim()) {
      newErrors.serviceNumber = 'Service number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // TODO: Implement actual registration logic
    console.log('Registration attempt:', formData);
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register for battalion personnel access"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Juan"
            required
            error={errors.firstName}
          />
          <FormInput
            label="Last Name"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Dela Cruz"
            required
            error={errors.lastName}
          />
        </div>

        {/* Rank Field */}
        <FormInput
          label="Rank"
          name="rank"
          type="text"
          value={formData.rank}
          onChange={handleChange}
          placeholder="e.g., Private, Sergeant, Lieutenant"
          required
          error={errors.rank}
        />

        {/* Service Number */}
        <FormInput
          label="Service Number"
          name="serviceNumber"
          type="text"
          value={formData.serviceNumber}
          onChange={handleChange}
          placeholder="Enter your service number"
          required
          error={errors.serviceNumber}
        />

        {/* Email */}
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="juan.delacruz@army.mil.ph"
          required
          error={errors.email}
        />

        {/* Password with Strength Indicator */}
        <div>
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            showPasswordToggle
            error={errors.password}
          />
          {formData.password && passwordStrength.label && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password Strength:</span>
                <span className={`text-xs font-semibold ${
                  passwordStrength.score <= 2 ? 'text-red-600' :
                  passwordStrength.score <= 3 ? 'text-yellow-600' :
                  passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          required
          showPasswordToggle
          error={errors.confirmPassword}
        />

        {/* Terms and Conditions */}
        <div>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2 cursor-pointer mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="mt-2 text-sm text-red-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.termsAccepted}
            </p>
          )}
        </div>

        {/* Register Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
        >
          CREATE ACCOUNT
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign In Link */}
        <Link href="/signin">
          <Button
            variant="outline"
            size="lg"
            className="w-full border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
          >
            SIGN IN
          </Button>
        </Link>

        {/* Back to Home */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-navy-900 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
