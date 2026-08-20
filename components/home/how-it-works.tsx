import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        How ClassQuest Works
      </h2>

      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
          <p className="text-gray-600">
            Scan the unique QR code displayed in your classroom to instantly access ClassQuest.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Access Resources</h3>
          <p className="text-gray-600">
            Browse notes, quizzes, syllabi, and other learning materials for your courses.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Learn & Grow</h3>
          <p className="text-gray-600">
            Study smarter with personalized quizzes, track your progress, and achieve your academic goals.
          </p>
        </div>
      </div>
    </div>
  );
}