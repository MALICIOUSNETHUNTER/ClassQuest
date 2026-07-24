# ClassQuest

> Turn Free Periods Into Learning.

ClassQuest is a mobile-first college learning platform designed to help students make productive use of free periods and spare time between classes.

Students can scan a QR code placed in their classroom or college campus to instantly access the ClassQuest platform.

The platform provides quick access to academic subjects, syllabus, quizzes, class routines, and learning progress.

---

## 🚀 Vision

ClassQuest aims to answer one simple question:

> "I have 15 minutes free between classes. What can I learn or practice right now?"

The long-term vision is to turn unused college free time into short, productive learning sessions.

---

## ✨ Core Features

### 📚 Academic Content

- Branch-wise academic structure
- Semester-wise subjects
- Subject-wise units
- Topic organization
- Syllabus access

### 📝 Quiz System

- Topic-wise quizzes
- Multiple-choice questions
- Timed quizzes
- Automatic scoring
- Instant results
- Answer explanations
- Quiz history

### 📊 Progress Tracking

- Overall performance
- Subject-wise performance
- Quiz accuracy
- Quiz history
- Weak topic identification

### 🕐 Class Routine

- Daily class schedule
- Subject timetable
- Current class highlighting
- Upcoming class information
- Free period detection

### ⚡ Free Period Mode

Students can select how much free time they have and receive suitable quiz recommendations.

Example:

```text
Available Time: 15 minutes

Recommended:
Java OOP Quick Quiz
10 Questions
Estimated Time: 12 minutes
📱 QR Code Access

Students can access ClassQuest instantly by scanning a QR code placed in classrooms or other college locations.

👥 User Roles

ClassQuest is designed around three user roles:

Student

Students can:

Browse academic content
View syllabus
View class routine
Take quizzes
View results
Track progress
Teacher / Content Manager

Teachers may manage academic content and view student performance.

Administrator

Administrators can manage:

Users
Branches
Semesters
Subjects
Units
Topics
Quizzes
Questions
Syllabus
Class routines
Announcements
Analytics
🛠️ Technology Stack

The planned technology stack includes:

Next.js
TypeScript
Tailwind CSS
shadcn/ui
Supabase
PostgreSQL
Supabase Auth
Vercel
Git
GitHub
🏗️ High-Level Architecture
                    ┌─────────────────┐
                    │    QR CODE      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   CLASSQUEST    │
                    │    WEB APP      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         Student UI     Admin Panel     QR System
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌─────────────────┐
                    │    SUPABASE     │
                    │ Auth + Database  │
                    └────────┬────────┘
                             │
                             ▼
                       PostgreSQL
📂 Project Documentation

The project currently contains the following documentation:

PROJECT_SPEC.md — Complete product requirements and feature specification.
CLAUDE.md — Development instructions and coding guidelines for Claude.

These files should be reviewed before making major architectural or development decisions.

🚧 Project Status

Current Status: Planning / Pre-Development

The project specification and AI development guidelines have been created.

The application implementation has not started yet.

🗺️ Development Roadmap
Phase 1 — Foundation
 Project setup
 Next.js configuration
 TypeScript configuration
 Tailwind CSS
 shadcn/ui
 Supabase setup
 Environment configuration
Phase 2 — Database
 Database schema
 Relationships
 Row Level Security
 Initial seed data
Phase 3 — Student Experience
 Homepage
 Student dashboard
 Subject navigation
 Unit navigation
 Topic navigation
 Syllabus
Phase 4 — Quiz System
 Quiz selection
 Quiz interface
 Timer
 Question navigation
 Score calculation
 Results
 Answer explanations
Phase 5 — Authentication
 Student authentication
 Admin authentication
 Role-based access control
Phase 6 — Admin Dashboard
 Admin dashboard
 Subject management
 Unit management
 Topic management
 Quiz management
 Question management
 Routine management
Phase 7 — Progress
 Quiz history
 Student progress
 Subject performance
 Weak topic detection
Phase 8 — QR Integration
 QR code generation
 QR access
 Classroom-specific QR codes
Phase 9 — Deployment
 Production deployment
 Domain configuration
 QR code printing
 Real-world testing
🔮 Future Features

Potential future improvements include:

Free Period Mode
Leaderboards
XP and gamification
Learning streaks
Advanced analytics
AI-generated quizzes
AI tutor
AI-powered explanations
Personalized learning recommendations
Classroom-specific analytics
🎯 Product Philosophy

ClassQuest is designed to be a real-world platform that can be used by actual college students.

The priority is:

Reliability
Simplicity
Security
Mobile usability
Performance
Maintainability

The goal is not to build every feature immediately.

The goal is to build a reliable core platform, test it with real students, and improve it based on actual usage.

📄 License

License information will be added later.

👨‍💻 Developer

ClassQuest is being developed as a student-led software project.

Developer:

Gaurav Kant Pathak
