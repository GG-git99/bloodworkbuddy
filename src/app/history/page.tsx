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
          console.error('Error fetching bloodwork history:', err);
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
        setBloodworkHistory(bloodworkHistory.filter(item => item.id !== resultId));
      } catch (err: any) {
        console.error('Error deleting result:', err);
        alert(`Failed to delete result: ${err.message}`);
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
              <div key={i} className="flex-1 space-y-2 py-2 bg-gray-100 rounded p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
        <h1 className="text-2xl font-bold mb-6">Bloodwork History</h1>
        
        {error && (
          <div className="bg-red-100 p-4 mb-6 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {bloodworkHistory.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {bloodworkHistory.map((result) => (
                <li key={result.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {result.displayDate || new Date(result.timestamp).toLocaleDateString()}
                      </h3>
                      <p className="mt-1 text-gray-500 line-clamp-2">{result.summary}</p>
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
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white p-6 text-center rounded-lg shadow">
            <p className="text-gray-500 mb-4">You don&apos;t have any bloodwork analyses yet.</p>
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