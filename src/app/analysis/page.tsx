'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import HealthIndicators from '../components/HealthIndicators';
import RecommendationsList from '../components/RecommendationsList';
import { useAuth } from '@/lib/contexts/AuthContext';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

export default function Analysis() {
  const { user, loading: authLoading } = useAuth();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // In a real app, you'd fetch this from your database
    // For demo purposes, we're using localStorage
    const storedData = localStorage.getItem('bloodworkAnalysis');
    
    if (storedData) {
      try {
        setAnalysisData(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to parse analysis data:', error);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 mt-8">
          <h1 className="text-2xl font-bold mb-6">Bloodwork Analysis</h1>
          
          {error && (
            <div className="bg-red-100 p-4 mb-6 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-center text-gray-600">Analyzing your bloodwork results...</p>
            {/* Loading spinner or animation */}
          </div>
        </div>
      </>
    );
  }

  if (!analysisData) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 mt-8">
          <h1 className="text-2xl font-bold mb-6">Bloodwork Analysis</h1>
          
          {error && (
            <div className="bg-red-100 p-4 mb-6 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="bg-white p-6 text-center rounded-lg shadow">
            <p className="text-gray-500 mb-4">You don&apos;t have any analysis results yet.</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Upload Your Bloodwork
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 mt-8">
        <h1 className="text-2xl font-bold mb-6">Bloodwork Analysis</h1>
        
        {error && (
          <div className="bg-red-100 p-4 mb-6 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Your Bloodwork Analysis</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Summary</h2>
            <p className="text-gray-700">{analysisData.summary}</p>
          </div>
          
          <HealthIndicators 
            goodResults={analysisData.goodResults || []} 
            improvementNeeded={analysisData.improvementNeeded || []} 
          />
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Your Results in Detail</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biomarker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysisData.biomarkers && analysisData.biomarkers.map((biomarker: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{biomarker.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biomarker.value} {biomarker.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biomarker.referenceRange}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${biomarker.status === 'normal' ? 'bg-green-100 text-green-800' : 
                            biomarker.status === 'high' ? 'bg-red-100 text-red-800' : 
                            biomarker.status === 'low' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {biomarker.status.charAt(0).toUpperCase() + biomarker.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Health Improvement Plan</h2>
            <RecommendationsList recommendations={analysisData.recommendations || []} />
          </div>
        </div>
      </div>
    </>
  );
} 