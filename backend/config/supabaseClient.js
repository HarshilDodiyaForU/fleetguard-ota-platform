const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL

/**
 * Backend must use the service role key (server-side only) to bypass RLS for admin operations.
 * Fallback order: SUPABASE_SERVICE_ROLE_KEY → SUPABASE_KEY (legacy) → SUPABASE_ANON_KEY (dev only).
 */
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY

function missingEnvError() {
  const error = new Error(
    'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY).',
  )
  error.statusCode = 500
  throw error
}

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from() {
          missingEnvError()
        },
      }

module.exports = supabase
