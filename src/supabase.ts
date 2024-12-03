import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize the database schema
export const initializeSchema = async () => {
  try {
    // Create the table directly if it doesn't exist
    const { error: createError } = await supabase.rpc('initialize_schema');
    
    if (createError) {
      console.error('Failed to create schema:', createError);
      // If the function doesn't exist, create the table directly
      const { error: tableError } = await supabase.from('laundry_orders').select('id').limit(1);
      
      if (tableError?.code === '42P01') {
        // Table doesn't exist, we need to run the SQL setup first
        console.error('Please run the SQL setup commands from the README.md file in your Supabase SQL editor first.');
      }
    } else {
      console.log('Schema initialized successfully');
    }
  } catch (error) {
    console.error('Schema initialization error:', error);
  }
};