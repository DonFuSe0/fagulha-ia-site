'use client';

import { supabase as browserSupabase, createClient as createBrowserClient } from './client';
export const supabase = browserSupabase;
export const createClient = createBrowserClient;
