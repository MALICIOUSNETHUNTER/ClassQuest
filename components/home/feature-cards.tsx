export function FeatureCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h.01"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Quick Access</h3>
        </div>
        <p className="text-gray-600">
          Instantly access notes, quizzes, syllabi, and class routines with just a scan of the QR code.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Trusted Content</h3>
        </div>
        <p className="text-gray-600">
          All content is curated by educators and aligned with your curriculum for maximum learning impact.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Made for Students</h3>
        </div>
        <p className="text-gray-600">
          Designed by students, for students. Focused on making the most of your free time between classes.
        </p>
      </div>
    </div>
  );
}