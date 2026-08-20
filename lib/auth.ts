import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for Client Components
// Note: This doesn't handle cookies automatically, so it's mainly for
// static queries or when combined with manual cookie handling
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Get current user data (client-side)
export async function getUserClient() {
  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

    const { data: { user } } = await supabase.auth.getUser()
    return { success: true, data: { user } }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get user'
    }
  }
}

// Get user profile (client-side)
export async function getProfileClient() {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) {
      return { data: null, error: 'User not found' }
    }

    // Get the profile with related data
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        branches:branch_id (name, code),
        semesters:semester_id (name, number)
      `)
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    // Cleanse branch_id and semester_id in case they are stored as string 'null'
    if (profile?.branch_id === 'null') {
      profile.branch_id = null
    }
    if (profile?.semester_id === 'null') {
      profile.semester_id = null
    }

    // Add full_name from user metadata if available
    if (user.user_metadata && user.user_metadata.full_name) {
      profile.full_name = user.user_metadata.full_name
    } else {
      // Fallback to email or empty string
      profile.full_name = user.email || ''
    }

    return { data: profile, error: null }
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to load profile' }
  }
}

// Update user profile (client-side)
export async function updateProfileClient(
  formData: FormData
) {
  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    const fullName = formData.get('full_name') as string
    const role = formData.get('role') as 'student' | 'admin' | 'teacher' | null
    const branchId = formData.get('branch_id') as string | null
    const semesterId = formData.get('semester_id') as string | null

    const updates: any = {}
    if (fullName !== null && fullName !== undefined) updates.full_name = fullName
    if (role !== null) updates.role = role
    if (branchId !== null && branchId !== undefined) updates.branch_id = branchId
    if (semesterId !== null && semesterId !== undefined) updates.semester_id = semesterId

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update profile'
    }
  }
}

// Check if user is client-side (student)
export async function isClient() {
  try {
    const profileResult = await getProfileClient()
    if (profileResult.error) {
      return {
        success: false,
        error: profileResult.error
      }
    }
    return {
      success: true,
      data: profileResult.data?.role === 'student'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to check student status'
    }
  }
}

// Check if user is admin (client-side)
export async function isAdminClient() {
  try {
    const profileResult = await getProfileClient()
    if (profileResult.error) {
      return {
        success: false,
        error: profileResult.error
      }
    }
    return {
      success: true,
      data: profileResult.data?.role === 'admin'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to check admin status'
    }
  }
}

// Check if user is teacher (client-side)
export async function isTeacherClient() {
  try {
    const profileResult = await getProfileClient()
    if (profileResult.error) {
      return {
        success: false,
        error: profileResult.error
      }
    }
    return {
      success: true,
      data: profileResult.data?.role === 'teacher'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to check teacher status'
    }
  }
}