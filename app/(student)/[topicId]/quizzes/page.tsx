'use client';

import { getProfileClient } from '@/lib/auth';
import { createClientComponentClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TopicQuizzesPage({ params }: { params: { topicId: string } }) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [topicInfo, setTopicInfo] = useState(null);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const result = await getProfileClient();
        if (result.error) {
          setProfileError(result.error);
        } else {
          setProfile(result.data);
        }
      } catch (err: any) {
        setProfileError(err.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Load topic info and quizzes when topicId changes
  useEffect(() => {
    if (!params.topicId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClientComponentClient();

        // Fetch topic info
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select(`
            *,
            units: unit_id (
              name,
              subjects: subject_id (
                name,
                code,
                semesters: semester_id (
                  name,
                  number,
                  branches: branch_id (name, code)
                )
              )
            )
          `)
          .eq('id', params.topicId)
          .single();

        if (topicError) throw topicError;
        setTopicInfo(topicData);

        // Fetch quizzes for this topic
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select(`
            *,
            topics: topic_id (name)
          `)
          .eq('topic_id', params.topicId)
          .order('created_at', { ascending: false });

        if (quizError) throw quizError;
        setQuiz(quizData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load quizzes');
        setQuiz([]);
        setTopicInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.topicId]);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to be signed in to take quizzes.</p>
          <a href="/auth/sign-in" className="btn-primary">Sign In</a>
        </div>
      </main>
    );
  }

  if (profileLoading || !profile) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{error}</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </main>
    );
  }

  if (!topicInfo) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Topic Not Found</h1>
          <p className="text-muted-foreground">The requested topic does not exist.</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col items-center justify-between p-6">
        <h1 className="text-2xl font-bold">Quizzes for {topicInfo.units?.subjects?.name}</h1>
        <div className="flex space-x-3">
          <p className="text-muted-foreground text-sm">
            Topic: {topicInfo.name} &bullet; Unit: {topicInfo.units?.name} &bullet;
            Subject: {topicInfo.units?.subjects?.name} ({topicInfo.units?.subjects?.code})
          </p>
          {profile?.role === 'admin' && (
            <Link
              href={`/admin/topics/${params.topicId}/quizzes/new`}
              className="btn-primary"
            >
              Add New Quiz
            </Link>
          )}
        </div>
      </div>

      {quiz.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No quizzes available for this topic yet. Check back later or ask your instructor to add some.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {quiz.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{q.title}</h2>
                  <p className="text-muted-foreground mt-2">{q.description || 'No description available'}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {q.question_count} Questions
                    </span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {q.time_limit_minutes} min timer
                    </span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      Pass: {q.passing_percentage}%
                    </span>
                    <span className={`
                      px-3 py-1 rounded-full
                      ${q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                    `}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Link
                    href={`/quiz/${q.id}`}
                    className="btn-primary px-6 py-2"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}