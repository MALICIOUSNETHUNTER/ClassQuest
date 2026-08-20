export function FeaturesSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Why Students Love ClassQuest
      </h2>

      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
            <span className="text-indigo-600 text-xl">⚡</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Quick Access</h3>
            <p className="text-gray-600">
              Instantly access all your course materials with just a scan.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
            <span className="text-indigo-600 text-xl">📚</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Trusted Content</h3>
            <p className="text-gray-600">
              All materials are curated by educators and aligned with your curriculum.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
            <span className="text-indigo-600 text-xl">👨‍🎓</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Made for Students</h3>
            <p className="text-gray-600">
              Designed specifically for college students to make the most of free time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}