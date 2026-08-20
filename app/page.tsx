import {
  HeroPill,
  ScrollDownArrow,
  StatsGrid,
  FeaturesSection,
  HowItWorks,
  CTASection,
  QRCodeSection
} from "@/components/home";

export default function Home() {
  return (
    <main className="min-h-[100vh] bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 items-start gap-12">
            {/* Left Side - Content */}
            <div className="space-y-8">
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <HeroPill variant="purple">Free Access</HeroPill>
                <HeroPill variant="indigo">Student Made</HeroPill>
                <HeroPill variant="blue">No Ads</HeroPill>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900 mb-4">
                Turn Free Periods Into Learning
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-gray-600 max-w-xl">
                Access notes, quizzes, syllabi, and other learning resources
                instantly by scanning QR codes in your classroom. Study smarter,
                not harder.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <CTASection
                  primaryText="Start Learning"
                  secondaryText="Take a Quiz"
                  primaryHref="/auth/sign-in"
                  secondaryHref="/auth/sign-up"
                />
              </div>

              {/* Features */}
              <FeaturesSection />
            </div>

            {/* Right Side - Illustration/QR */}
            <div className="relative flex items-center justify-center">
              <QRCodeSection />
              <div className="absolute -bottom-4 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 -rotate-6 w-16 h-16 border-2 border-indigo-200 rounded-full opacity-50"></div>
          <div className="absolute bottom-12 right-1/6 -rotate-12 w-20 h-20 border-2 border-purple-200 rounded-full opacity-50"></div>
          <div className="absolute top-1/3 left-1/8 w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-30 animate-pulse"></div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <HowItWorks />
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <StatsGrid />
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <CTASection
          primaryText="Get Started Today"
          secondaryText="Learn How It Works"
          primaryHref="/auth/sign-up"
          secondaryHref="#how-it-works"
          isSecondaryOutline
        />
      </section>
    </main>
  );
}