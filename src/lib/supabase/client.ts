import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * Creates a Supabase client for use in browser/client components
 * This client is used for client-side operations like Auth UI, real-time subscriptions, etc.
 */

// Track if we've already logged initialization
let isInitialized = false;

export function createClient() {
  if (!isInitialized && typeof window !== 'undefined') {
    const timestamp = new Date().toISOString().substring(11, 19);
    console.log(`\x1b[2m[${timestamp}]\x1b[0m \x1b[35m🔧 SUPABASE\x1b[0m | Initializing browser client`);
    console.log(`\x1b[2m[${timestamp}]\x1b[0m \x1b[35m🔧 SUPABASE\x1b[0m | URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`\x1b[2m[${timestamp}]\x1b[0m \x1b[32m✅ SUPABASE\x1b[0m | Browser client initialized successfully`);
    isInitialized = true;
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
