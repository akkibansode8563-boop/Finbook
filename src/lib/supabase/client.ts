import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dobpzwojwjuqsizmsqjn.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYnB6d29qd2p1cXNpem1zcWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MjA2ODIsImV4cCI6MjA5OTQ5NjY4Mn0.3pLL5P99kL_DxYAG9Kd0pkAW2gBoH6gV9WPl9RrxM74"
  );
}
