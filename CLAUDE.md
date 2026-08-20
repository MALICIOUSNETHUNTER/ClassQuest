# ClassQuest — Claude Development Instructions

## 1. Role

You are the primary AI coding assistant for the ClassQuest project.

Your responsibility is to help design, implement, debug, test, and improve the ClassQuest application according to the requirements defined in `PROJECT_SPEC.md`.

Always read and understand `PROJECT_SPEC.md` before making significant architectural or implementation decisions.

---

# 2. Project Context

ClassQuest is a mobile-first college learning platform.

Its primary purpose is to help students make productive use of free periods by providing quick access to:

- Academic subjects
- Units and topics
- Syllabus
- Quizzes
- Quiz results
- Learning progress
- Class routine
- Free Period Mode

The platform is intended to be used by real college students through QR codes placed in classrooms.

The project should be treated as a real-world production-oriented application, not as a simple tutorial project.

---

# 3. Source of Truth

`PROJECT_SPEC.md` is the primary source of truth for product requirements.

Before implementing a feature:

1. Read the relevant requirements in `PROJECT_SPEC.md`.
2. Understand how the feature fits into the existing architecture.
3. Check whether the feature already exists.
4. Avoid duplicating existing functionality.
5. Consider database relationships and security implications.

If a requirement is ambiguous or contradictory, do not silently make major assumptions.

Explain the ambiguity and propose the safest solution before implementing it.

---

# 4. Development Philosophy

Build the application incrementally.

Do not attempt to generate the entire application in one step.

Work feature by feature.

Each implementation should:

1. Understand the current codebase.
2. Identify affected files.
3. Plan the change.
4. Implement the change.
5. Check for errors.
6. Test the feature.
7. Verify that existing functionality still works.

Prefer small, controlled changes over massive rewrites.

---

# 5. Technology Stack

The preferred stack is:

Frontend:
- Next.js
- TypeScript

Styling:
- Tailwind CSS
- shadcn/ui

Backend:
- Next.js server-side functionality

Database:
- Supabase PostgreSQL

Authentication:
- Supabase Auth

Deployment:
- Vercel

Version Control:
- Git
- GitHub

Do not introduce additional frameworks or major dependencies without a clear reason.

If a different technology is genuinely better for a specific requirement, explain the tradeoff before changing the stack.

---

# 6. Code Quality

Write clean, readable, maintainable code.

Follow these principles:

- Use TypeScript properly.
- Avoid unnecessary `any`.
- Use reusable components.
- Keep components focused.
- Avoid duplicated logic.
- Use meaningful variable and function names.
- Keep files reasonably sized.
- Separate UI, business logic, and data access where practical.
- Prefer simple solutions over unnecessary abstraction.
- Avoid premature optimization.
- Do not create unnecessary files or dependencies.

Code should be understandable by a student developer who is learning from the project.

---

# 7. Database Rules

Use Supabase PostgreSQL as the primary database.

Database design should maintain:

- Proper relationships
- Foreign keys
- Data integrity
- Appropriate indexes
- Clear naming conventions

Do not hardcode academic data that should be stored in the database.

Academic content such as:

- Branches
- Semesters
- Subjects
- Units
- Topics
- Quizzes
- Questions
- Class routines

must be designed to be managed dynamically.

Before changing the database schema:

1. Explain the proposed change.
2. Identify affected tables.
3. Consider existing data.
4. Consider migration requirements.

Never casually delete or restructure existing data.

---

# 8. Authentication and Authorization

Authentication must be handled securely.

Use Supabase Auth.

The application should support role-based access.

Expected roles include:

- Student
- Teacher / Content Manager
- Administrator

Students must not have administrative permissions.

Administrators must have protected access to the admin dashboard.

Always enforce authorization on the server side.

Do not rely only on hiding UI elements to protect privileged functionality.

---

# 9. Security Rules

Never expose:

- API keys
- Database secrets
- Service role keys
- Authentication secrets

in client-side code or Git repositories.

Use environment variables for secrets.

Validate user input.

Protect server-side operations.

Use Supabase Row Level Security where appropriate.

Do not bypass security rules just to make development easier.

If a security concern is discovered, explain it clearly and fix it.

---

# 10. UI/UX Principles

ClassQuest is mobile-first.

Most students will access the platform by scanning a QR code using a smartphone.

Therefore:

- Prioritize mobile layouts.
- Ensure buttons are touch-friendly.
- Keep navigation simple.
- Avoid unnecessary popups.
- Use clear typography.
- Provide loading states.
- Provide empty states.
- Provide error states.
- Make important actions obvious.

The interface should feel modern, clean, and fast.

The application should work well on:

- Mobile
- Tablet
- Desktop

---

# 11. Student Experience

The student experience should be the highest priority.

The primary flow should remain simple:

QR Code
→ ClassQuest
→ Select Branch/Semester
→ Dashboard
→ Subject
→ Unit
→ Topic
→ Quiz
→ Results

Avoid unnecessary steps.

Students should be able to reach a quiz quickly.

The application should make the Free Period Mode easy to discover.

---

# 12. Quiz System Rules

The quiz engine must correctly handle:

- Question loading
- Answer selection
- Question navigation
- Timer
- Submission
- Score calculation
- Correct answers
- Incorrect answers
- Unanswered questions
- Results
- Explanations
- Quiz attempts

Never calculate important scores only on the client side.

Server-side validation should be used where appropriate.

Students must not be able to manipulate quiz results by modifying client-side JavaScript.

---

# 13. Admin Dashboard

The admin dashboard should be separate from the student experience.

Admin functionality should support CRUD operations for appropriate entities.

Expected management areas include:

- Users
- Branches
- Semesters
- Subjects
- Units
- Topics
- Quizzes
- Questions
- Syllabus
- Class Routine
- Announcements

The admin interface should prioritize efficiency and clarity.

---

# 14. Free Period Mode

Free Period Mode is an important feature of ClassQuest.

The basic flow is:

Student selects available time
→ System finds suitable quizzes
→ System recommends quiz
→ Student starts quiz

Initial recommendation logic may be simple.

Possible factors:

- Estimated quiz duration
- Available time
- Student's weak topics
- Previous performance

Do not implement complex AI recommendations in the initial MVP.

Start with deterministic and understandable logic.

---

# 15. AI Features

AI features are future functionality.

Do not add AI features to the MVP unless explicitly requested.

Potential future features include:

- AI quiz generation
- AI tutor
- AI explanations
- Personalized learning recommendations

When AI features are eventually implemented:

- AI-generated content must be reviewable.
- Administrators should approve generated quiz questions before publishing.
- AI should not be trusted blindly for academic correctness.

---

# 16. Error Handling

The application should handle errors gracefully.

Do not leave users with:

- Blank screens
- Unhandled exceptions
- Cryptic error messages

Provide useful feedback.

For example:

"Unable to load quizzes. Please try again."

instead of exposing raw database errors.

Log useful technical information where appropriate without exposing sensitive information to users.

---

# 17. Loading and Empty States

Every data-driven page should consider:

- Loading state
- Empty state
- Error state

Examples:

If there are no quizzes:

"No quizzes are available for this topic yet."

If no syllabus exists:

"The syllabus has not been added yet."

Do not leave blank screens without explanation.

---

# 18. Development Workflow

For each feature:

### Step 1
Understand the requirement.

### Step 2
Inspect the existing project.

### Step 3
Identify affected files.

### Step 4
Explain the implementation plan briefly.

### Step 5
Implement the feature.

### Step 6
Run appropriate checks.

### Step 7
Fix errors.

### Step 8
Summarize what changed.

After completing a feature, clearly state:

- Files created
- Files modified
- Database changes
- Environment variables required
- Commands to run
- How to test the feature

---

# 19. Do Not Overwrite Working Code

Never rewrite large parts of the project without a strong reason.

Before modifying existing functionality:

- Understand the current implementation.
- Preserve working behavior.
- Make targeted changes.

If a major refactor is necessary, explain why first.

---

# 20. Git Practices

Use Git regularly.

Create meaningful commits after completing logical features.

Example:

- `feat: add quiz engine`
- `feat: add admin question management`
- `fix: correct quiz score calculation`
- `refactor: simplify subject navigation`

Do not commit:

- `.env`
- Secrets
- API keys
- Database passwords
- Private credentials

---

# 21. Dependency Management

Before adding a new package:

1. Check whether the existing stack already provides the required functionality.
2. Prefer existing dependencies.
3. Avoid unnecessary packages.
4. Use well-maintained libraries.

Do not install packages simply because they are convenient if the functionality can be implemented cleanly with existing tools.

---

# 22. Communication Style

When working on the project:

- Be concise.
- Explain important decisions.
- Do not overwhelm with unnecessary explanations.
- Clearly mention errors and blockers.
- If requirements are unclear, ask before making major assumptions.
- Do not claim a feature is complete without verifying it.

When presenting code changes, summarize the important parts.

---

# 23. Testing

Test features before considering them complete.

At minimum, verify:

- Happy path
- Invalid input
- Empty data
- Loading states
- Error states
- Authentication
- Authorization
- Mobile responsiveness

For critical functionality such as quiz scoring and permissions, perform additional testing.

---

# 24. MVP Discipline

The MVP should remain focused.

Do not add advanced features prematurely.

Prioritize:

1. Core student experience
2. Academic content
3. Quiz engine
4. Results
5. Authentication
6. Admin management
7. Progress
8. QR access

Avoid implementing AI, complex gamification, advanced analytics, or unnecessary features until the core platform is stable.

---

# 25. Important Instruction

Before starting implementation of a major feature, always consider:

- Does this already exist?
- Does this match PROJECT_SPEC.md?
- Does this affect the database?
- Does this affect authentication?
- Does this affect authorization?
- Does this affect existing functionality?
- Is this required for the MVP?

If the feature is not required for the current development phase, do not implement it unless explicitly requested.

---

# 26. Final Principle

Build ClassQuest as if real college students will use it.

Prioritize:

- Reliability
- Security
- Simplicity
- Performance
- Mobile usability
- Maintainability

The goal is not to generate the maximum amount of code.

The goal is to build a useful, reliable, real-world product.

---

# 27. Current Project Progress / Implementation Status

## STUDENT-FACING FEATURES
✅ **Homepage** - Fully implemented modern landing page with responsive educational/SaaS UI, purple/indigo visual theme, hero section, feature highlights, statistics, CTA sections, and QR code display
✅ **Student Dashboard** - Complete with personalized welcome, subject statistics, quiz statistics, average score, study streak, recent quiz activity, Supabase integration, loading/error states
✅ **Student Profile** - View/edit profile with form validation, role/academic information, save/cancel functionality, client component conversion completed
✅ **Syllabus** - Subjects filtered by student's branch/semester, responsive subject cards, loading/error/empty states
✅ **Free Period Mode** - Time selection, quiz filtering by estimated time, quiz start functionality, responsive UI
✅ **Academic Navigation** - Complete student-facing hierarchy implemented:
  - Dashboard → Subjects → Subject Detail → Unit Detail → Topic → Topic Quizzes → Quiz Detail → Start Quiz → Quiz Attempt → Quiz Submission → Quiz Results
  - Routes implemented: /subjects, /subjects/[subjectId], /subjects/[subjectId]/units/[unitId], /topics/[topicId]/quizzes, /quiz/[quizId], /quiz-attempts/new?quizId=..., /quiz-attempts/[attemptId], /quiz-attempts/[attemptId]/results
✅ **Quiz System** - Complete student-facing quiz system:
  - Quiz detail page, branch/semester access validation, quiz attempt creation
  - Quiz taking interface with question navigation, answer selection, timer
  - Automatic submission on timer expiration, quiz scoring, percentage/pass-fail calculation
  - Individual answer persistence, quiz results with answer review
  - Attempt history displayed on dashboard
  - Quiz attempt creation flow implemented via /app/(student)/quiz-attempts/new/page.tsx and /lib/actions/quiz.ts

## ADMIN MANAGEMENT FEATURES
✅ **Branch Management** - Full CRUD complete:
  - Routes: /admin/branches, /admin/branches/new, /admin/branches/[branchId]/edit
  - Features: Admin-only auth, name/code/description fields, automatic uppercase branch codes
  - Dependency-safe deletion (prevents deletion when semesters exist), loading/error/success states

✅ **Semester Management** - Full CRUD complete:
  - Routes: /admin/semesters, /admin/semesters/new, /admin/semesters/[semesterId]/edit
  - Features: Branch selection, required name/number/branch, positive integer validation
  - Duplicate semester prevention within same branch, prevents deletion when subjects exist
  - Admin-only authorization, loading/error/empty/success states

✅ **Subject Management** - Full CRUD complete:
  - Routes: /admin/subjects, /admin/subjects/new, /admin/subjects/[subjectId]/edit
  - Features: Semester selection, optional code/description, duplicate name prevention per semester
  - Prevents deletion when units exist, displays semester/branch relationships
  - Admin-only authorization

✅ **Unit Management** - Full CRUD complete:
  - Routes: /admin/units, /admin/units/new, /admin/units/[unitId]/edit
  - Features: Subject selection, required name/subject, optional description
  - Prevents deletion when topics exist, displays subject/semester/branch relationships
  - Admin-only authorization

✅ **Topic Management** - Full CRUD complete:
  - Routes: /admin/topics, /admin/topics/new, /admin/topics/[topicId]/edit
  - Features: Unit selection, required name/unit, optional description
  - Duplicate topic name prevention within same unit, prevents deletion when quizzes exist
  - Displays unit/subject/semester/branch relationships, admin-only authorization
  - Loading/error/empty/success states

## ADMIN HIERARCHY STATUS
✅ Branch → ✅ Semester → ✅ Subject → ✅ Unit → ✅ Topic → ✅ Quiz → ✅ Questions

## NEXT PLANNED FEATURE
**ADMIN QUESTION MANAGEMENT** - COMPLETED
- Routes: /admin/questions, /admin/questions/new, /admin/questions/[questionId]/edit
- Features: Full CRUD implementation with validation, duplicate prevention, dependency safety
- Status: FULLY IMPLEMENTED

## FOLLOWING FEATURES (After Question Management)
- Announcements
- Class Routines  
- User Management (if required)

## IMPORTANT DEVELOPMENT RULES (REITERATED)
- Follow established admin CRUD patterns from Branch/Semester/Subject/Unit/Topic Management
- Reuse existing authentication and admin role-checking patterns
- Reuse existing Supabase query patterns
- Maintain existing ClassQuest UI/UX and Tailwind styling
- Respect existing database schema exactly (do not invent fields)
- Do not modify unrelated files
- Do not fix unrelated bugs during feature implementation
- Do not implement future features unless explicitly requested
- Before implementing new features, inspect actual database schema and existing student-facing code
- Report files created/modified, functionality implemented, validation checks, dependency checks, and build results when available

## CURRENT DEVELOPMENT STATE
- **Student Core Experience**: ~95% complete
- **Admin Content Management**: Completed academic hierarchy
  - Completed: Branch → Semester → Subject → Unit → Topic → Quiz → Question
  - Next major feature: Announcements

==================================================
28. Current Project Progress / Session Handoff
==================================================

## 28.1 PROJECT OVERVIEW
ClassQuest is a Next.js + TypeScript + Tailwind CSS + Supabase academic/quiz platform.

The project contains:
- Student-facing features
- Admin content management
- Authentication
- Academic hierarchy
- Quiz system

## 28.2 COMPLETED STUDENT-FACING FEATURES
✅ **Homepage** - Fully implemented modern landing page with responsive educational/SaaS UI, purple/indigo visual theme, hero section, feature highlights, statistics, CTA sections, and QR code display
✅ **Student Dashboard** - Complete with personalized welcome, subject statistics, quiz statistics, average score, study streak, recent quiz activity, Supabase integration, loading/error states
✅ **Student Profile** - View/edit profile with form validation, role/academic information, save/cancel functionality, client component conversion completed
✅ **Syllabus** - Subjects filtered by student's branch/semester, responsive subject cards, loading/error/empty states
✅ **Free Period Mode** - Time selection, quiz filtering by estimated time, quiz start functionality, responsive UI
✅ **Academic Navigation** - Complete student-facing hierarchy implemented:
  - Dashboard → Subjects → Subject Detail → Unit Detail → Topic → Topic Quizzes → Quiz Detail → Start Quiz → Quiz Attempt → Quiz Submission → Quiz Results
  - Routes implemented: /subjects, /subjects/[subjectId], /subjects/[subjectId]/units/[unitId], /topics/[topicId]/quizzes, /quiz/[quizId], /quiz-attempts/new?quizId=..., /quiz-attempts/[attemptId], /quiz-attempts/[attemptId]/results
✅ **Quiz System** - Complete student-facing quiz system:
  - Quiz detail page, branch/semester access validation, quiz attempt creation
  - Quiz taking interface with question navigation, answer selection, timer
  - Automatic submission on timer expiration, quiz scoring, percentage/pass-fail calculation
  - Individual answer persistence, quiz results with answer review
  - Attempt history displayed on dashboard
  - Quiz attempt creation flow implemented via /app/(student)/quiz-attempts/new/page.tsx and /lib/actions/quiz.ts

## 28.3 COMPLETED ADMIN CONTENT MANAGEMENT
✅ **Branch Management** - Full CRUD complete:
  - Routes: /admin/branches, /admin/branches/new, /admin/branches/[branchId]/edit
  - Features: Admin-only auth, name/code/description fields, automatic uppercase branch codes
  - Dependency-safe deletion (prevents deletion when semesters exist), loading/error/success states

✅ **Semester Management** - Full CRUD complete:
  - Routes: /admin/semesters, /admin/semesters/new, /admin/semesters/[semesterId]/edit
  - Features: Branch selection, required name/number/branch, positive integer validation
  - Duplicate semester prevention within same branch, prevents deletion when subjects exist
  - Admin-only authorization, loading/error/empty/success states

✅ **Subject Management** - Full CRUD complete:
  - Routes: /admin/subjects, /admin/subjects/new, /admin/subjects/[subjectId]/edit
  - Features: Semester selection, optional code/description, duplicate name prevention per semester
  - Prevents deletion when units exist, displays semester/branch relationships
  - Admin-only authorization

✅ **Unit Management** - Full CRUD complete:
  - Routes: /admin/units, /admin/units/new, /admin/units/[unitId]/edit
  - Features: Subject selection, required name/subject, optional description
  - Prevents deletion when topics exist, displays subject/semester/branch relationships
  - Admin-only authorization

✅ **Topic Management** - Full CRUD complete:
  - Routes: /admin/topics, /admin/topics/new, /admin/topics/[topicId]/edit
  - Features: Unit selection, required name/unit, optional description
  - Duplicate topic name prevention within same unit, prevents deletion when quizzes exist
  - Displays unit/subject/semester/branch relationships, admin-only authorization
  - Loading/error/empty/success states

✅ **Quiz Management** - Full CRUD complete:
  - Routes: /admin/quizzes, /admin/quizzes/new, /admin/quizzes/[quizId]/edit
  - Features: Admin-only auth, title/description/difficulty/timeLimit/passingPercentage fields, topic relationship
  - Dependency-safe deletion (prevents deletion when questions or attempts exist), loading/error/success states
  - Admin-only authorization, loading/error/empty/success states

✅ **Question Management** - Full CRUD complete:
  - Routes: /admin/questions, /admin/questions/new, /admin/questions/[questionId]/edit
  - Features: Full CRUD implementation with validation, duplicate prevention, dependency safety
  - Status: FULLY IMPLEMENTED

All admin features follow the established architecture:
- Admin-only authorization using getProfileClient()
- Existing Supabase client patterns
- Standard CRUD operations
- Loading/error/empty/success states
- Form validation
- Duplicate prevention where applicable
- Dependency-safe deletion
- Consistent Tailwind/shadcn UI patterns

## 28.4 COMPLETED QUESTION_COUNT TRACKING
Recent work has been done to implement question_count tracking functionality:

**Intended behavior:**
- Creating a question increments the associated quiz's question_count
- Deleting a question decrements the associated quiz's question_count
- Moving a question from one quiz to another decrements the old quiz count and increments the new quiz count
- Editing a question without changing quiz_id should not change question counts

**Files involved:**
- app/admin/questions/new/page.tsx
- app/admin/questions/[questionId]/edit/page.tsx
- app/admin/questions/page.tsx

**IMPORTANT:** The implementation has NOT yet been fully verified. The next debugging session MUST verify that the Supabase API used for increment/decrement is actually valid.

There was a suspicious reference in the implementation to something resembling: `supabase.sqlcolumn_name` which must be inspected in the actual source code.

Do not assume the question_count implementation is correct until it has been verified.

## 28.5 CURRENT CODEBASE VERIFICATION STATUS
The latest full verification was performed AFTER previous agent work completed.

**Current results:**

**TypeScript:**
- Command: `npx tsc --noEmit`
- Status: FAIL
- Errors: 12
- Main issues:
  - .next/types module resolution issues
  - Missing/invalid Supabase .sql usage or typing
  - Incorrect Promise .data / .error access
  - Missing React imports
  - State setter type mismatches
- Affected areas include:
  - .next/types/app/admin/page.ts
  - app/admin/questions/[questionId]/edit/page.tsx
  - app/admin/questions/page.tsx
  - app/admin/quizzes/[quizId]/edit/page.tsx
  - app/admin/quizzes/new/page.tsx
  - app/admin/topics/new/page.tsx
  - components/auth/sign-in-form.tsx
  - components/auth/sign-up-form.tsx

**ESLint:**
- Command: `npm run lint`
- Status: FAIL
- Errors: 28
- Warnings: 2
- Main issues:
  - React Hooks called conditionally
  - Hooks called after early returns
  - Missing useEffect dependencies
  - JSX unescaped quotes/apostrophes
- Affected areas include:
  - app/admin/branches/**
  - app/admin/semesters/**
  - app/admin/subjects/**
  - app/admin/units/**
  - app/admin/topics/**
  - app/admin/quizzes/**
  - app/admin/questions/**
  - app/(student)/quiz-attempts/[attemptId]/page.tsx
  - components/auth/sign-in-form.tsx
  - components/auth/sign-up-form.tsx

**Production Build:**
- Command: `npm run build`
- Status: FAIL
- The build is currently blocked by the TypeScript/ESLint issues above.

**IMPORTANT:**
These errors are NOT fixed yet.
The project is NOT currently in a clean build state.
Do not describe the project as production-ready.

## 28.6 IMPORTANT WORKFLOW DISCOVERY
Previous debugging sessions involved multiple agents and lengthy audits.

We discovered that repeatedly auditing the codebase without fixing errors wastes significant time.

The next session should NOT begin with another broad audit.

Instead, immediately begin targeted fixing.

The next task is to fix the existing TypeScript and ESLint errors and repeatedly verify until:
- npx tsc --noEmit → 0 errors
- npm run lint → 0 errors
- npm run build → SUCCESS

Do not claim completion without actually running the final verification commands.

## 28.7 NEXT SESSION DEBUGGING STRATEGY
The next session should use the following strategy:
- Use Fast Mode if available.
- Use targeted parallel agents only when their file scopes do not overlap.
- Do not allow multiple agents to modify the same files simultaneously.
- Avoid repeated broad audits.
- Fix actual errors immediately.
- Verify after fixes.
- Continue iterating until all checks pass.

Suggested division:
- **Agent 1**: TypeScript errors
- **Agent 2**: ESLint / React Hooks errors
- **Agent 3**: JSX escaping and remaining lint issues
- **Agent 4**: Final verification and monitoring

**IMPORTANT:** Agents must have non-overlapping file scopes to avoid conflicting edits.

## 28.8 NEXT DEBUGGING PROMPT
The next session should use the targeted fixing prompt prepared at the end of the previous session.

The goal is: "Stop auditing. Start fixing."

The fix loop should be:
1. TypeScript → Fix → Verify
2. ESLint → Fix → Verify
3. Build → Fix → Verify
4. Repeat until: TypeScript = 0 errors, ESLint = 0 errors, Production build = SUCCESS

Do not:
- Disable TypeScript
- Disable ESLint rules
- Add broad eslint-disable comments
- Use @ts-ignore or @ts-nocheck to hide errors
- Edit generated .next files directly
- Rewrite working features unnecessarily
- Change database schema unnecessarily

## 28.9 FULL-PROOF TESTING STATUS
Full-proof functional testing has NOT started yet.

It should begin only after the codebase reaches:
- TypeScript: 0 errors
- ESLint: 0 errors
- Production build: SUCCESS

After that, test systematically:

**A. Authentication**
- Sign up
- Sign in
- Sign out
- Password reset
- Password update
- Protected routes
- Admin/student authorization

**B. Admin hierarchy**
Branch → Semester → Subject → Unit → Topic → Quiz → Question
Test:
- Create
- Read
- Update
- Delete
- Validation
- Duplicate prevention
- Dependency protection

**C. Quiz system**
- Quiz creation
- Question creation
- Question count
- Question editing
- Question deletion
- Moving questions between quizzes
- Quiz attempts
- Timer
- Scoring
- Passing percentage
- Results
- Attempt history

**D. Student experience**
- Dashboard
- Profile
- Syllabus
- Academic navigation
- Free Period
- Quiz discovery
- Quiz taking
- Results

**E. Security**
- RLS policies
- Direct URL access
- Student attempting admin routes
- Unauthorized data modification
- Admin access restrictions

**F. Edge cases**
- Empty database
- Missing relationships
- Invalid IDs
- Duplicate records
- Dependency deletion
- Network/database failures
- Refresh during operations
- Rapid repeated operations

## 28.10 CURRENT PROJECT STATE
The ClassQuest academic content hierarchy is now implemented through:
Branch → Semester → Subject → Unit → Topic → Quiz → Question

The major feature-building phase is substantially complete.

The project is now entering the:
"Codebase Stabilization → Verification → Full-Proof Testing" phase.

The immediate priority is NOT adding another major feature.

The immediate priority is:
1. Fix TypeScript errors.
2. Fix ESLint errors.
3. Make production build pass.
4. Verify question_count implementation.
5. Begin comprehensive functional testing.
6. Perform security/RLS testing.
7. Perform UI/responsive testing.
8. Perform performance testing.
9. Prepare for release readiness.

==================================================
FINAL HANDOFF NOTE
==================================================

When starting the next Claude Code session, read this CLAUDE.md file first.

Do not assume the previous session's fixes are complete.

Start from the latest verified state documented above.

The first task tomorrow is to fix the currently known TypeScript and ESLint errors, not to perform another broad audit.

After all checks pass, proceed to full-proof testing.

**NOTE**: Do not make any code changes other than updating this documentation unless explicitly instructed.
