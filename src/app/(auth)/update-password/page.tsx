import { Metadata } from 'next';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Update Password - RRIBN Management System',
  description: 'Update your password for the RRIBN Management System',
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
