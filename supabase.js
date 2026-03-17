// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nyjkfjsvujnhmhbjavzp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55amtmanN2dWpuaG1oYmphdnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTQyMjksImV4cCI6MjA4OTMzMDIyOX0.ZWRq8Jb1qvcVP0ikzgG1r9Xuucl8YHZUg7yRUKiTtwQ'

export const supabase = createClient(supabaseUrl, supabaseKey)