import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password - RRIBN Management System',
  description: 'Reset your password for the RRIBN Management System',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
