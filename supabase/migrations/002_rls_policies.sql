-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Branches policies
-- Everyone can view branches (for dropdowns in forms)
CREATE POLICY "Everyone can view branches" ON branches
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete branches
CREATE POLICY "Only admins can manage branches" ON branches
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Semesters policies
-- Everyone can view semesters (for dropdowns in forms)
CREATE POLICY "Everyone can view semesters" ON semesters
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete semesters
CREATE POLICY "Only admins can manage semesters" ON semesters
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Subjects policies
-- Admins can view all subjects
CREATE POLICY "Admins can view all subjects" ON subjects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view subjects (simplified for now - we'll refine later if needed)
CREATE POLICY "Everyone can view subjects" ON subjects
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete subjects
CREATE POLICY "Only admins can manage subjects" ON subjects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Units policies
-- Admins can view all units
CREATE POLICY "Admins can view all units" ON units
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view units (simplified)
CREATE POLICY "Everyone can view units" ON units
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete units
CREATE POLICY "Only admins can manage units" ON units
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Topics policies
-- Admins can view all topics
CREATE POLICY "Admins can view all topics" ON topics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view topics (simplified)
CREATE POLICY "Everyone can view topics" ON topics
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete topics
CREATE POLICY "Only admins can manage topics" ON topics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Quizzes policies
-- Admins can view all quizzes
CREATE POLICY "Admins can view all quizzes" ON quizzes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view quizzes (simplified)
CREATE POLICY "Everyone can view quizzes" ON quizzes
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete quizzes
CREATE POLICY "Only admins can manage quizzes" ON quizzes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Questions policies
-- Admins can view all questions
CREATE POLICY "Admins can view all questions" ON questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view questions (simplified)
CREATE POLICY "Everyone can view questions" ON questions
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete questions
CREATE POLICY "Only admins can manage questions" ON questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Quiz attempts policies
-- Users can create their own quiz attempts
CREATE POLICY "Users can create own quiz attempts" ON quiz_attempts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own quiz attempts
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts" ON quiz_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Quiz answers policies
-- Users can create answers for their own attempts
CREATE POLICY "Users can create answers for own attempts" ON quiz_answers
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz_attempts
    WHERE id = attempt_id AND user_id = auth.uid()
  )
);

-- Users can view answers for their own attempts
CREATE POLICY "Users can view answers for own attempts" ON quiz_answers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quiz_attempts
    WHERE id = attempt_id AND user_id = auth.uid()
  )
);

-- Admins can view all quiz answers
CREATE POLICY "Admins can view all quiz answers" ON quiz_answers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Class routines policies
-- Admins can view all class routines
CREATE POLICY "Admins can view all class routines" ON class_routines
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view class routines (simplified)
CREATE POLICY "Everyone can view class routines" ON class_routines
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete class routines
CREATE POLICY "Only admins can manage class routines" ON class_routines
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Announcements policies
-- Admins can view all announcements
CREATE POLICY "Admins can view all announcements" ON announcements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view announcements (simplified)
CREATE POLICY "Everyone can view announcements" ON announcements
FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete announcements
CREATE POLICY "Only admins can manage announcements" ON announcements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
