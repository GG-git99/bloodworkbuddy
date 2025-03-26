'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMostRecentBloodworkResult } from '@/lib/firebase/firebaseUtils';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import ResultDisplay from '@/app/components/ResultDisplay';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [latestResult, setLatestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLatestResult = async () => {
      if (user) {
        try {
          setIsLoading(true);
          setError('');
          const result = await getMostRecentBloodworkResult(user.uid);
          setLatestResult(result);
        } catch (err: any) {
          console.error('Error fetching latest result:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchLatestResult();
    }
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 mt-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                  <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 mt-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 p-4 mb-6 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Latest Analysis</h2>
          <Link
            href="/history"
            className="text-blue-600 hover:text-blue-800"
          >
            View All History →
          </Link>
        </div>
        
        {latestResult ? (
          <ResultDisplay result={latestResult} />
        ) : (
          <div className="bg-white p-6 text-center rounded-lg shadow">
            <p className="text-gray-500 mb-4">You don't have any bloodwork analyses yet.</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Upload Your First Bloodwork
            </Link>
          </div>
        )}
      </div>
    </>
  );
} 