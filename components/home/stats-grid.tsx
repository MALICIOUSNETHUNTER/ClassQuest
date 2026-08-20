export function StatsGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Trusted by Students Everywhere
      </h2>

      <div className="grid md:grid-cols-4 gap-8 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">10K+</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Active Students
          </h3>
          <p className="text-gray-600">
            Join thousands of students using ClassQuest daily
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">500+</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Courses Covered
          </h3>
          <p className="text-gray-600">
            Comprehensive coverage across all major subjects
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">95%</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Satisfied Users
          </h3>
          <p className="text-gray-600">
            Students report improved grades and study efficiency
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-indigo-600 text-2xl">24/7</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Always Available
          </h3>
          <p className="text-gray-600">
            Access your materials anytime, anywhere
          </p>
        </div>
      </div>
    </div>
  );
}