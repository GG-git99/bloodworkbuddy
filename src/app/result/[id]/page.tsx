'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getBloodworkResult } from '@/lib/firebase/firebaseUtils';
import Navbar from '@/app/components/Navbar';
import ResultDisplay from '@/app/components/ResultDisplay';
import Link from 'next/link';

export default function ResultDetail() {
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchResult = async () => {
      if (user && id) {
        try {
          setLoading(true);
          setError('');
          const data = await getBloodworkResult(id);
          
          // Make sure the user owns this result
          if (data.userId !== user.uid) {
            throw new Error("You don't have permission to view this result");
          }
          
          setResult(data);
        } catch (err: any) {
          console.error('Error fetching result:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user && id) {
      fetchResult();
    }
  }, [user, id]);

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 mt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bloodwork Result</h1>
          <Link
            href="/history"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to History
          </Link>
        </div>
        
        {error ? (
          <div className="bg-red-100 p-6 rounded-lg shadow text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <Link
              href="/history"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Back to History
            </Link>
          </div>
        ) : (
          result && <ResultDisplay result={result} />
        )}
      </div>
    </>
  );
} 