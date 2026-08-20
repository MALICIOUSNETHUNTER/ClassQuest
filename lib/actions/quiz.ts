'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For Server Components and Server Actions - uses cookies middleware
export const createServerComponentClient = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
};

// Create a new quiz attempt
export async function createQuizAttempt(
  prevState: any,
  formData: FormData
) {
  // Ensure formData is provided
  if (!formData || typeof formData !== 'object' || !('get' in formData)) {
    return {
      success: false,
      error: 'Invalid form data'
    };
  }

  const quizId = formData.get('quizId') as string;

  if (!quizId) {
    return {
      success: false,
      error: 'Quiz ID is required'
    };
  }

  try {
    const supabase = await createServerComponentClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Get the user's profile (includes branch and semester)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        branches:branch_id (id, name, code),
        semesters:semester_id (id, name, number)
      `)
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) {
      return {
        success: false,
        error: 'Profile not found'
      };
    }

    // Fetch the quiz with its topic -> unit -> subject -> semester -> branch
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        topics: topic_id (
          name,
          units: unit_id (
            name,
            subjects: subject_id (
              name,
              code,
              semesters: semester_id (
                id,
                name,
                number,
                branches: branch_id (
                  id,
                  name,
                  code
                )
              )
            )
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (quizError) throw quizError;
    if (!quiz) {
      return {
        success: false,
        error: 'Quiz not found'
      };
    }

    // Verify the quiz belongs to the user's current branch and semester
    const hasAccess =
      quiz.topics?.units?.subjects?.semesters?.branches?.id === profile.branches?.id &&
      quiz.topics?.units?.subjects?.semesters?.id === profile.semesters?.id;

    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have access to this quiz'
      };
    }

    // Create a new quiz attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id: quiz.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    return {
      success: true,
      data: {
        attemptId: attemptData.id
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create quiz attempt'
    };
  }
}