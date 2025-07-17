import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qmenlmdjfxctqmgyrpka.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZW5sbWRqZnhjdHFtZ3lycGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNTAwNjEsImV4cCI6MjA2NjcyNjA2MX0.1NWHiND1RcdV8NZPFQ3Yp8BMeAUwY71Av9yRVpUb55w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)