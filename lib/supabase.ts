import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for Server Components
export const createServerComponentClient = () => {
  // Dynamic import to avoid issues with next/headers in client environments
  const { cookies } = require('next/headers')

  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )
}

// Create a Supabase client for Client Components
export const createClientComponentClient = (options?: Parameters<typeof createSupabaseClient>[2]) => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, options)
}

// For backward compatibility
export const createSupabaseServerClient = createServerComponentClient
export const createClient = createClientComponentClient