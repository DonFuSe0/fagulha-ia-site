'use server';

import { createClient as createServerClient } from './server';
export const createClient = createServerClient;
