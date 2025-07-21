'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-white flex items-center justify-center px-6 py-12">
      <main className="max-w-4xl w-full text-center space-y-10">
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
            Get Started
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
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-600">Validate Your Idea</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Discover real competitors instantly. Get detailed profiles with strengths, weaknesses, and market gaps to understand where you fit.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-600">Plan Your MVP</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Smart scoping tools help you identify must-have features, estimate timelines, and create a focused development roadmap.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-600">Build Your Pitch</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create compelling pitch decks with templates designed by successful fundraisers and backed by real market data.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-600">Make Data-Driven Decisions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every recommendation is backed by real market research and competitor intelligence, not guesswork.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-gray-300 dark:border-gray-700 text-left space-y-8">
          <h2 className="text-2xl font-semibold text-center">How It Works</h2>
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
              <div>
                <h4 className="font-semibold">Describe Your Startup Idea</h4>
                <p className="text-gray-600 dark:text-gray-300">Tell us about your problem, solution, and target market in your own words.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
              <div>
                <h4 className="font-semibold">Get Smart Analysis</h4>
                <p className="text-gray-600 dark:text-gray-300">Our AI researches competitors, analyzes market gaps, and identifies opportunities.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
              <div>
                <h4 className="font-semibold">Build With Confidence</h4>
                <p className="text-gray-600 dark:text-gray-300">Use our tools to scope your MVP, plan your roadmap, and create your pitch deck.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-gray-300 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to Build Your Startup?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join entrepreneurs who are turning ideas into successful businesses with data-driven insights.
            </p>
            <Link
              href="/search"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow inline-block"
            >
              Start Validating Today
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}