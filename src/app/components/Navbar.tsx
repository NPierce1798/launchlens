'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Search, BarChart3, User, LogOut, Menu, X, Target, Wrench } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-gray-800/50 backdrop-blur-xl text-white w-full px-6 py-4 border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            href="/" 
            className="text-2xl font-bold tracking-tight hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <BarChart3 size={20} className="text-white" />
            </div>
            LaunchLens
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                <BarChart3 size={16} />
                Home
              </Link>
              <Link 
                href="/search" 
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                <Target size={16} />
                Competitor Analysis
              </Link>
              <Link 
                href="/mvp-builder" 
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                <Wrench size={16} />
                MVP Builder
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  <User size={16} />
                  Dashboard
                </Link>
              )}
            </div>

            {/* Auth Controls */}
            <div className="flex items-center gap-4 pl-6 border-l border-gray-700/50">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  <User size={14} />
                  Log in
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-sm">
          <div className="bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 p-6 mt-16">
            <div className="flex flex-col gap-6">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-4">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium text-lg p-3 hover:bg-gray-700/30 rounded-lg"
                >
                  <BarChart3 size={20} />
                  Home
                </Link>
                <Link 
                  href="/search" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium text-lg p-3 hover:bg-gray-700/30 rounded-lg"
                >
                  <Target size={20} />
                  Competitor Analysis
                </Link>
                <Link 
                  href="/mvp-builder" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium text-lg p-3 hover:bg-gray-700/30 rounded-lg"
                >
                  <Wrench size={20} />
                  MVP Builder
                </Link>
                {user && (
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium text-lg p-3 hover:bg-gray-700/30 rounded-lg"
                  >
                    <User size={20} />
                    Dashboard
                  </Link>
                )}
              </div>

              {/* Mobile Auth Section */}
              <div className="pt-6 border-t border-gray-700/50">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 p-3 bg-gray-700/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Logged in as {user.email}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    <User size={16} />
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}