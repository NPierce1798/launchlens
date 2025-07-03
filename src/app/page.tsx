'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-white flex items-center justify-center px-6 py-12">
      <main className="max-w-4xl w-full text-center space-y-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Validate Your Startup Idea Instantly
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Enter your business concept and get a list of real-world competitors with summaries, strengths, and gaps — all in seconds. Skip the guesswork and get clarity.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link
            href="/search"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow"
          >
            Try It Now
          </Link>
          <a
            href="#how-it-works"
            className="text-blue-600 hover:underline text-base font-medium py-3 px-6"
          >
            How it Works
          </a>
        </div>

        <div id="how-it-works" className="pt-16 border-t border-gray-300 dark:border-gray-700 text-left space-y-8">
          <h2 className="text-2xl font-semibold text-center">How It Works</h2>
          <ul className="space-y-6 max-w-xl mx-auto">
            <li>
              <strong>1. Describe your idea.</strong> Provide basic details like the problem, target customer, and industry.
            </li>
            <li>
              <strong>2. Let AI analyze it.</strong> Our AI extracts key traits and searches for real companies solving similar problems.
            </li>
            <li>
              <strong>3. Review your competitors.</strong> Get brief profiles with founding dates, success factors, weaknesses, and links.
            </li>
          </ul>
        </div>

        <div className="pt-16 border-t border-gray-300 dark:border-gray-700 text-left space-y-8">
          <h2 className='text-2xl font-semibold text-center'>Coming Soon:</h2>
            <ul className="space-y-6 max-w-xl mx-auto">
              <li>
                <strong>- MVP Assist.</strong> Need help planning your MVP? We&apos;re putting together a guide and toolkit to help with the whole process start to finish.
              </li>
              <li>
                <strong>- Pitch Deck Builder</strong> We want you to be successful so we&apos;re working with lead fundraisers to put together a tool to help you create an effective pitchdeck.
              </li>
            </ul>
        </div>

        
      </main>
    </div>
  );
}