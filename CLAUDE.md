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

# END OF CLAUDE DEVELOPMENT INSTRUCTIONS
