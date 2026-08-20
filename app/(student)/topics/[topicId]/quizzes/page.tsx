'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TopicQuizzesPage({ params }: { params: { topicId: string } }) {
  const [profile, setProfile] = useState<null | { [key: string]: any }>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Quiz data
  const [topic, setTopic] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
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

  // Fetch topic and quizzes when profile and topicId are available
  useEffect(() => {
    if (!profile || !params.topicId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = await import('@/lib/supabase').then(
          (mod) => mod.createServerComponentClient()
        );

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
                  branches: branch_id (
                    name,
                    code
                  )
                )
              )
            )
          `)
          .eq('id', params.topicId)
          .single();

        if (topicError) throw topicError;
        setTopic(topicData);

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
        setQuizzes(quizData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.topicId, profile]);

  // Handle auth/checks for profile
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-red-500">{profileError}</p>
            <Link href="/" className="btn-primary">Go Home</Link>
          </div>
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
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </main>
    );
  }

  // Handle topic loading and error
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

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading quizzes...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!topic) {
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
        <h1 className="text-2xl font-bold">Quizzes for {topic.units.subjects.name}</h1>
        <div className="flex space-x-3">
          <p className="text-muted-foreground text-sm">
            Topic: {topic.name} &bullet; Unit: {topic.units.name} &bullet;
            Subject: {topic.units.subjects.name} ({topic.units.subjects.code})
          </p>
          {profile.role === 'admin' && (
            <Link
              href={`/admin/topics/${params.topicId}/quizzes/new`}
              className="btn-primary"
            >
              Add New Quiz
            </Link>
          )}
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No quizzes available for this topic yet. Check back later or ask your instructor to add some.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{quiz.title}</h2>
                  <p className="text-muted-foreground">{quiz.description || 'No description available'}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {quiz.question_count} Questions
                    </span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {quiz.time_limit_minutes} min timer
                    </span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      Pass: {quiz.passing_percentage}%
                    </span>
                    <span className={`
                      px-3 py-1 rounded-full
                      ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                    `}>
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Link
                    href={`/quiz/${quiz.id}`}
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