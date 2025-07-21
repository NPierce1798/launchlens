'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-white flex items-center justify-center px-6 py-12">
      <main className="max-w-5xl w-full text-center space-y-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Turn Your Startup Idea Into Reality
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          The complete toolkit for validating, researching, and building your startup. From competitor analysis to MVP planning, we help you move from idea to launch with confidence.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link
            href="/search"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow"
          >
            Research Competitors
          </Link>
          <Link
            href="/mvp-builder"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow"
          >
            Build Your MVP Plan
          </Link>
          <a
            href="#features"
            className="text-blue-600 hover:underline text-base font-medium py-3 px-6"
          >
            Explore Features
          </a>
        </div>

        <div id="features" className="pt-16 border-t border-gray-300 dark:border-gray-700 text-left space-y-8">
          <h2 className="text-2xl font-semibold text-center">Everything You Need to Build Smart</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-600">Research & Validate</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Discover real competitors instantly. Get detailed profiles with strengths, weaknesses, and market gaps to understand where you fit in the landscape.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-green-600">Plan Your MVP</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Step-by-step MVP builder with smart scoping tools to identify must-have features, prioritize development, and create focused roadmaps.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-purple-600">AI-Powered Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get intelligent recommendations on timelines, budgets, risk factors, and strategic advice tailored to your specific startup idea.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-indigo-600">Professional Reports</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate comprehensive MVP plans with pitch deck integration, exportable to PDF for presentations and team alignment.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-gray-300 dark:border-gray-700 text-left space-y-8">
          <h2 className="text-2xl font-semibold text-center">Two Powerful Tools, One Goal</h2>
          
          {/* Competitor Research Flow */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-4 text-center">🔍 Competitor Research</h3>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                <div>
                  <h4 className="font-semibold">Describe Your Startup</h4>
                  <p className="text-gray-600 dark:text-gray-300">Tell us about your problem, solution, and target market.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                <div>
                  <h4 className="font-semibold">AI Finds Competitors</h4>
                  <p className="text-gray-600 dark:text-gray-300">Our AI researches and analyzes real competitors in your space.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                <div>
                  <h4 className="font-semibold">Get Detailed Analysis</h4>
                  <p className="text-gray-600 dark:text-gray-300">Receive comprehensive reports on market positioning and opportunities.</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <Link
                href="/search"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow"
              >
                Start Researching
              </Link>
            </div>
          </div>

          {/* MVP Builder Flow */}
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-600 mb-4 text-center">🚀 MVP Builder</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">1</div>
                  <div>
                    <h5 className="font-semibold text-sm">Define Problem & Solution</h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Articulate your problem statement and solution approach.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">2</div>
                  <div>
                    <h5 className="font-semibold text-sm">Identify Target Customers</h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Define your ideal customer profile and demographics.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">3</div>
                  <div>
                    <h5 className="font-semibold text-sm">Choose Industry Context</h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Select your market vertical for tailored insights.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">4</div>
                  <div>
                    <h5 className="font-semibold text-sm">Prioritize Features</h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Drag-and-drop features into must-have, should-have, and future categories.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">5</div>
                  <div>
                    <h5 className="font-semibold text-sm">Map User Journey</h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Define user flow and required features for each step.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">6</div>
                  <div>
                    <h5 className="font-semibold text-sm">Generate AI Insights</h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Get intelligent recommendations on timeline, budget, and risks.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">7</div>
                  <div>
                    <h5 className="font-semibold text-sm">Export Professional Report</h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Download comprehensive MVP plan with optional pitch deck.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">✨</div>
                  <div>
                    <h5 className="font-semibold text-sm">Save & Iterate</h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Edit, regenerate insights, and track multiple MVP versions.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <Link
                href="/mvp-builder"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow"
              >
                Build Your MVP Plan
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-gray-300 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to Build Your Startup?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join entrepreneurs who are turning ideas into successful businesses with data-driven insights and structured MVP planning.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/search"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow"
              >
                Research Market
              </Link>
              <Link
                href="/mvp-builder"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow"
              >
                Plan Your MVP
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}