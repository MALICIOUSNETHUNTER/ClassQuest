# ClassQuest — Project Specification

## 1. Project Overview

ClassQuest is a mobile-first web application designed for college students to make productive use of free periods and spare time between classes.

Students can scan a QR code placed in their classroom or college campus to instantly access the ClassQuest platform.

The platform provides:

- Subject-wise learning content
- Unit and topic organization
- Syllabus
- Class routine
- Topic-wise quizzes
- Quiz results and explanations
- Student progress tracking
- Free Period Mode
- Personalized quiz recommendations
- Admin dashboard for managing academic content

The core idea is:

> Turn Free Periods Into Learning.

ClassQuest should be designed as a real-world college platform rather than a simple demo project.

---

# 2. Main Goals

The main goals of ClassQuest are:

1. Help students use free periods productively.
2. Provide quick access to academic content.
3. Allow students to test their knowledge through quizzes.
4. Organize academic content according to the actual college syllabus.
5. Provide immediate feedback after quizzes.
6. Help students identify weak topics.
7. Provide easy access to the class routine and syllabus.
8. Allow administrators to manage academic content.
9. Make the platform accessible through QR codes.
10. Create a foundation for future AI-powered learning features.

---

# 3. Target Users

ClassQuest will have three primary user roles.

## 3.1 Student

Students are the primary users.

Students can:

- Browse subjects
- Browse units
- Browse topics
- View syllabus
- View class routine
- Take quizzes
- View quiz results
- Review incorrect answers
- Read answer explanations
- Track quiz history
- Track learning progress
- Identify weak topics
- Use Free Period Mode
- Receive quiz recommendations
- View leaderboard (future feature)

Students must not be able to modify academic content.

---

## 3.2 Teacher / Content Manager

Teachers or content managers may be introduced in a future version.

They can:

- Create quizzes
- Create questions
- Edit questions
- Add explanations
- Manage learning content
- View student performance
- View topic-level performance

Teacher permissions should be more limited than administrator permissions.

---

## 3.3 Administrator

Administrators have full control over the platform.

Administrators can:

- Manage users
- Manage branches
- Manage semesters
- Manage subjects
- Manage units
- Manage topics
- Manage syllabus
- Manage quizzes
- Manage quiz questions
- Manage class routines
- Manage announcements
- View analytics

---

# 4. Academic Structure

Academic content must follow a hierarchical structure.

The structure is:

College
→ Branch
→ Semester
→ Subject
→ Unit
→ Topic
→ Quiz
→ Questions

Example:

CSE
└── Semester 5
    └── Java Programming
        ├── Unit 1
        │   ├── Java Basics
        │   ├── Variables
        │   └── Data Types
        │
        ├── Unit 2
        │   ├── Object Oriented Programming
        │   ├── Inheritance
        │   └── Polymorphism
        │
        └── Unit 3

The architecture should support multiple branches and semesters.

---

# 5. Student User Flow

The primary student flow should be:

QR Code
→ ClassQuest Website
→ Home / Landing Page
→ Select Branch
→ Select Semester
→ Student Dashboard

The student dashboard should provide access to:

- Subjects
- Quizzes
- Syllabus
- Class Routine
- My Progress
- Free Period Mode

Students should be able to navigate to a subject and then select:

Subject
→ Unit
→ Topic
→ Quiz

---

# 6. Homepage

The homepage should clearly explain the purpose of ClassQuest.

The homepage should include:

- ClassQuest branding
- Project tagline
- Short description
- Start Learning button
- Take a Quiz button
- View Routine button

The homepage should also provide quick access to:

- Subjects
- Quick Quiz
- Today's Routine
- Free Period Mode

The design should be clean, modern, responsive, and mobile-first.

---

# 7. Subject and Learning Content

Students should be able to browse academic content.

Navigation:

Subjects
→ Subject
→ Units
→ Topics

Each subject should display:

- Subject name
- Subject code (if available)
- Description
- Number of units
- Progress
- Available quizzes

Each unit should display:

- Unit name
- Unit description
- Topics
- Related quizzes

Each topic should display:

- Topic name
- Description
- Related quizzes
- Learning materials (future feature)

---

# 8. Quiz System

The quiz system is one of the core features of ClassQuest.

Version 1 should primarily support multiple-choice questions.

Each quiz should contain:

- Quiz title
- Description
- Subject
- Unit
- Topic
- Difficulty
- Number of questions
- Time limit
- Passing percentage

Each question should contain:

- Question text
- Multiple answer options
- Correct answer
- Explanation
- Difficulty level

The quiz flow should be:

Select Quiz
→ Quiz Instructions
→ Start Quiz
→ Answer Questions
→ Submit Quiz
→ Calculate Score
→ Show Results
→ Review Answers

---

# 9. Quiz Results

After completing a quiz, students should see:

- Total score
- Maximum score
- Percentage
- Number of correct answers
- Number of incorrect answers
- Number of unanswered questions
- Accuracy
- Time taken
- Pass/fail status

Students should be able to review every question.

For incorrect answers, display:

- Student's selected answer
- Correct answer
- Explanation

The goal is not only assessment but also learning.

---

# 10. Quiz History

Authenticated students should be able to view their previous quiz attempts.

Each attempt should store:

- Quiz
- Date and time
- Score
- Percentage
- Accuracy
- Time taken

Students should be able to open an attempt and review their answers.

---

# 11. Student Progress

The platform should calculate student progress based on quiz activity.

The dashboard may display:

- Overall progress
- Overall accuracy
- Total quizzes completed
- Total questions attempted
- Average score
- Subject-wise performance

Example:

Java Programming
Progress: 80%
Accuracy: 85%

DBMS
Progress: 60%
Accuracy: 72%

Networking
Progress: 45%
Accuracy: 65%

The system should identify weak topics based on low quiz accuracy.

---

# 12. Free Period Mode

Free Period Mode is a signature feature of ClassQuest.

Students can select how much free time they have.

Available options:

- 5 minutes
- 10 minutes
- 15 minutes
- 20 minutes
- 30+ minutes

The system should recommend suitable quizzes based on:

- Available time
- Estimated quiz duration
- Student's weak topics
- Previous performance
- Quiz difficulty

Example:

Student selects:

15 minutes

System recommends:

Java OOP Quick Quiz
10 Questions
Estimated Time: 12 minutes

Future versions may use AI to improve recommendations.

---

# 13. Class Routine

Students should be able to view the class routine.

The routine should support:

- Day
- Start time
- End time
- Subject
- Teacher (optional)
- Room number (optional)

The interface should highlight:

- Current class
- Upcoming class
- Free periods

If a student is currently in a free period, the application may display:

"You currently have a free period."

It may then provide a button:

"Start Free Period Mode"

---

# 14. Syllabus

Students should be able to view their complete syllabus.

The syllabus should follow:

Branch
→ Semester
→ Subject
→ Unit
→ Topics

The syllabus should be easy to browse on mobile devices.

Future versions may allow administrators to upload syllabus documents.

---

# 15. QR Code System

ClassQuest should be accessible through QR codes.

A QR code may point to:

https://classquest.example.com

Future versions may support classroom-specific QR codes.

Example:

Classroom 101 QR
→ /classroom/101

The system may eventually track:

- QR scans
- Classroom
- Number of visits
- Quiz attempts originating from that location

The first version may simply use a single QR code pointing to the homepage.

---

# 16. Authentication

ClassQuest should support authentication.

Students may initially access public content without logging in.

Authentication should be required for:

- Saving progress
- Quiz history
- Personalized recommendations
- Leaderboard
- Student profile

Administrators must authenticate before accessing the admin dashboard.

Role-based access control must be implemented.

---

# 17. Admin Dashboard

The admin dashboard should provide a centralized content management system.

The dashboard should include:

- Overview
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
- Analytics

The admin should be able to create, read, update, and delete appropriate content.

The admin dashboard must be protected from unauthorized access.

---

# 18. Admin Analytics

The platform should eventually provide analytics such as:

- Total students
- Active students
- Total quizzes taken
- Total questions answered
- Average quiz accuracy
- Most attempted quizzes
- Most difficult topics
- Subject-wise performance

Analytics should help administrators understand how students are using the platform.

---

# 19. Leaderboard

A leaderboard may be introduced after the core platform is stable.

Possible ranking metrics:

- Quiz points
- Weekly score
- Monthly score
- XP
- Learning streak

Students should have control over their public display name.

The system should avoid exposing unnecessary personal information.

---

# 20. Future AI Features

AI features should NOT be part of the initial MVP.

Possible future features:

## AI Quiz Generator

Admin provides:

- Notes
- PDF
- Study material

AI generates quiz questions.

Administrators should review generated questions before publishing them.

## AI Tutor

Students can ask questions about academic topics.

Example:

"Explain polymorphism in simple words."

## AI Personalized Recommendations

The system may consider:

- Student performance
- Weak topics
- Available free time
- Previous quiz attempts

Then recommend a suitable quiz.

---

# 21. Recommended Technology Stack

Frontend:
- Next.js
- TypeScript

UI:
- Tailwind CSS
- shadcn/ui

Backend:
- Next.js server-side functionality
- Supabase

Database:
- PostgreSQL through Supabase

Authentication:
- Supabase Auth

Deployment:
- Vercel

Version Control:
- Git
- GitHub

---

# 22. Database Entities

The initial database should be designed around the following entities:

- Profiles
- Users
- Branches
- Semesters
- Subjects
- Units
- Topics
- Quizzes
- Questions
- Quiz Attempts
- Quiz Answers
- Syllabus
- Class Routines
- Announcements

The exact database schema should be designed before implementation.

Relationships and foreign keys must maintain data integrity.

---

# 23. MVP Scope

The first production-ready MVP should include:

- Mobile-first responsive interface
- Homepage
- QR code access
- Branch selection
- Semester selection
- Student dashboard
- Subjects
- Units
- Topics
- Syllabus
- Class routine
- MCQ quizzes
- Quiz timer
- Quiz scoring
- Quiz results
- Answer explanations
- Quiz history
- Student authentication
- Admin authentication
- Admin dashboard
- Question management
- Quiz management
- Subject management
- Unit management
- Topic management
- Basic progress tracking

The MVP should be stable enough to be tested by real college students.

---

# 24. Development Roadmap

Development should be performed incrementally.

Phase 1:
Project architecture and setup

Phase 2:
Database schema and Supabase configuration

Phase 3:
Authentication and authorization

Phase 4:
Student-facing pages

Phase 5:
Academic content structure

Phase 6:
Quiz engine

Phase 7:
Quiz results and history

Phase 8:
Admin dashboard

Phase 9:
Progress tracking

Phase 10:
Class routine and syllabus

Phase 11:
QR code integration

Phase 12:
Testing and bug fixing

Phase 13:
Deployment

Phase 14:
Real-world testing with students

Future:
Free Period Mode

Future:
Leaderboard

Future:
Advanced analytics

Future:
AI features

---

# 25. Development Principles

The project must follow these principles:

1. Mobile-first design.
2. Clean and maintainable code.
3. Component-based architecture.
4. Secure authentication.
5. Proper role-based authorization.
6. Database integrity.
7. Responsive design.
8. Accessibility where practical.
9. Avoid unnecessary complexity.
10. Build incrementally.
11. Do not implement future features prematurely.
12. Do not hardcode academic data that should be stored in the database.
13. Keep configuration in environment variables.
14. Never expose secrets or API keys in frontend code.
15. Use reusable components.
16. Validate user input.
17. Handle errors gracefully.
18. Provide loading and empty states.
19. Optimize for mobile performance.
20. Keep the architecture extensible for future AI features.

---

# 26. Project Philosophy

ClassQuest is intended to become a real-world educational platform used by college students.

The application should prioritize:

- Simplicity
- Speed
- Accessibility
- Learning
- Usability
- Reliability

The first goal is not to build every possible feature.

The first goal is to build a reliable platform that students can actually use during free periods.

The MVP should be deployed and tested with real students before adding advanced features.

---

# 27. Core Product Identity

ClassQuest should answer one simple question:

> "I have 15 minutes free between classes. What can I learn or practice right now?"

The platform should make answering that question as easy as possible.

The long-term vision is:

QR Code
→ ClassQuest
→ Available Time
→ Personalized Learning
→ Quiz
→ Feedback
→ Progress
→ Better Performance

---

# END OF PROJECT SPECIFICATION
