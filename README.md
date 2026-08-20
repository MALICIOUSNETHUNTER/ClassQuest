# ClassQuest

> Turn Free Periods Into Learning.

ClassQuest is a mobile-first college learning platform designed to help students make productive use of free periods and spare time between classes.

Students can scan a QR code placed in their classroom or college campus to instantly access the ClassQuest platform.

## 🚀 Vision

ClassQuest aims to answer one simple question:

> "I have 15 minutes free between classes. What can I learn or practice right now?"

The long-term vision is to turn unused college free time into short, productive learning sessions.

## ✨ Core Features (Phase 1 - Foundation)

- **Next.js 13+** with App Router and TypeScript
- **Tailwind CSS** for styling
- **Supabase** integration for backend services
- **Authentication system** with sign-in/sign-up pages
- **Protected routes** middleware
- **Responsive, mobile-first design**
- **Basic UI components** (Button, Input)
- **Environment configuration**

## 🛠️ Technology Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth)
- **Deployment**: Vercel (ready)
- **State Management**: React Context/Hooks (planned)
- **Database**: Supabase PostgreSQL (planned for Phase 2)

## 📂 Project Structure

```
classquest/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── dashboard/          # Dashboard page
│   │   └── page.tsx
│   └── auth/               # Authentication pages
│       ├── sign-in/
│       │   └── page.tsx
│       ├── sign-up/
│       │   └── page.tsx
│       └── page.tsx        # Auth index
├── components/
│   └── ui/                 # Reusable UI components
│       ├── button.tsx
│       └── input.tsx
├── lib/
│   ├── supabase.ts         # Supabase client setup
│   └── utils.ts            # Utility functions
├── middleware.ts           # Route protection
├── .env.local              # Environment variables
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd classquest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Development Phases

This implementation represents **Phase 1: Foundation** of the ClassQuest project.

### Phase 1: Foundation (Complete)
- Development environment setup
- Core Next.js application with TypeScript
- Tailwind CSS styling
- Supabase integration with SSR authentication
- Basic UI components
- Protected routes middleware
- Authentication pages (sign-in/sign-up)
- Homepage and dashboard

### Upcoming Phases
- Phase 2: Database & Authentication (Schema, RLS, complete auth system)
- Phase 3: Academic Content Management & Quiz System
- Phase 4: Student Experience Enhancement & Free Period Mode
- Phase 5: Testing & Deployment

## 📱 Mobile-First Approach

ClassQuest is designed with a mobile-first approach since students will primarily access the platform via QR codes scanned with their smartphones.

## 🔐 Security Features (Phase 1)

- Supabase Auth integration with SSR (Server-Side Rendering)
- Route protection middleware
- Environment variable management for secrets
- Prepared for Row Level Security (RLS) implementation in Phase 2

## 📝 License

License information will be added later.

## 👨‍💻 Developer

ClassQuest is being developed as a student-led software project.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.