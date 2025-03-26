'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUserBloodworkHistory, deleteBloodworkResult } from '@/lib/firebase/firebaseUtils';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [bloodworkHistory, setBloodworkHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchBloodworkHistory = async () => {
      if (user) {
        try {
          setIsLoading(true);
          setError('');
          const history = await getUserBloodworkHistory(user.uid);
          setBloodworkHistory(history);
        } catch (err: any) {
          console.error('Error fetching history:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchBloodworkHistory();
    }
  }, [user]);

  const handleDelete = async (resultId: string) => {
    if (confirm('Are you sure you want to delete this result?')) {
      try {
        await deleteBloodworkResult(resultId);
        // Update the list after deletion
        setBloodworkHistory(bloodworkHistory.filter(item => item.id !== resultId));
      } catch (err: any) {
        console.error('Error deleting result:', err);
        setError(`Failed to delete: ${err.message}`);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 mt-8">
          <h1 className="text-2xl font-bold mb-6">Bloodwork History</h1>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
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
          <h1 className="text-2xl font-bold">Bloodwork History</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-100 p-4 mb-6 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {bloodworkHistory.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {bloodworkHistory.map((result) => (
                <li key={result.id} className="hover:bg-gray-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {result.displayDate || new Date(result.timestamp).toLocaleDateString()}
                        </h3>
                        <p className="text-gray-500 text-sm truncate mt-1">
                          {result.summary.substring(0, 150)}
                          {result.summary.length > 150 ? '...' : ''}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/result/${result.id}`}
                          className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDelete(result.id)}
                          className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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