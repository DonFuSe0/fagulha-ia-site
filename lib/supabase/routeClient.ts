'use server';

// Para route handlers (API) usamos o mesmo client de server (pode usar SERVICE_ROLE se estiver definido)
import { createClient as createServerClient } from './server';
export const createClient = createServerClient;
