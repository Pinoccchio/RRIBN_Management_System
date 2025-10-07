'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

export const SignInForm: React.FC = () => {
  const router = useRouter();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    logger.info('Sign in form submitted', { email: formData.email });

    // Validation
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
      logger.warn('Validation failed: Email is required');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      logger.warn('Validation failed: Invalid email format', { email: formData.email });
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      logger.warn('Validation failed: Password is required');
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      logger.warn('Validation failed: Password too short');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      logger.error('Form validation failed', null, {
        email: formData.email,
        data: { errorCount: Object.keys(newErrors).length }
      });
      return;
    }

    logger.info('Form validation passed', { email: formData.email });
    setIsLoading(true);
    setErrors({});

    try {
      logger.info('Calling signIn with credentials', { email: formData.email });
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        logger.error('Sign in returned error', error, { email: formData.email });
        setErrors({
          general: error.message || 'Invalid email or password. Please try again.',
        });
        setIsLoading(false);
        return;
      }

      // Successfully signed in - AuthContext has already refreshed user data
      logger.success('Sign in successful - User data loaded', { email: formData.email });
      logger.info('Redirecting to home (middleware will redirect to dashboard)', { email: formData.email });

      // Use hard redirect to ensure cookies are included in the request
      // Small delay ensures Supabase cookies are fully set before redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      logger.error('Unexpected error during sign in', error, { email: formData.email });
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to access your account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{errors.general}</span>
          </div>
        )}

        {/* Email Input */}
        <Input
          type="email"
          name="email"
          label="Email Address"
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
          disabled={isLoading}
        />

        {/* Password Input */}
        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          disabled={isLoading}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};
