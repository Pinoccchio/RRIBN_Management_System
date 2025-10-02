import { Metadata } from 'next';
import { SignInForm } from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In | 301st RRIBn Personnel System',
  description: 'Sign in to access your 301st Ready Reserve Infantry Battalion personnel account.',
};

export default function SignInPage() {
  return <SignInForm />;
}
