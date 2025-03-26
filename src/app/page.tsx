'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import { saveBloodworkResult } from '@/lib/firebase/firebaseUtils';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/simple-analysis', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      setResult(data);
      
      // Save result if user is logged in
      if (user) {
        await saveBloodworkResult(user.uid, data);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(`Analysis failed: ${error.message}. Please try again with a clearer image of your bloodwork results.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndView = async () => {
    if (!result || !user) return;
    
    try {
      // Save to Firebase if not already saved
      const resultId = await saveBloodworkResult(user.uid, result);
      router.push(`/result/${resultId}`);
    } catch (error: any) {
      console.error('Error saving result:', error);
      setError(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bloodwork Buddy</h1>
          <p className="text-xl text-gray-600">Upload and analyze your blood test results</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload your bloodwork image</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer">
              <input 
                type="file" 
                id="bloodwork-upload"
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden"
              />
              
              <label htmlFor="bloodwork-upload" className="cursor-pointer">
                {preview ? (
                  <div className="relative h-64 w-full">
                    <Image 
                      src={preview} 
                      alt="Bloodwork preview" 
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop an image file here, or click to select
                    </p>
                  </div>
                )}
              </label>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={!file || isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </div>
              ) : (
                'Analyze Bloodwork'
              )}
            </button>
          </form>
        </div>
        
        {!user && !result && (
          <div className="bg-blue-50 p-4 rounded-md mb-8">
            <h3 className="font-medium text-blue-800 mb-1">Want to save your results?</h3>
            <p className="text-blue-700 mb-2">Sign in or create an account to save your blood test history and track changes over time.</p>
            <div className="flex space-x-4">
              <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
              <Link href="/register" className="text-blue-600 font-medium hover:underline">Create account</Link>
            </div>
          </div>
        )}
        
        {result && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Health Analysis</h2>
              
              {user && (
                <button
                  onClick={handleSaveAndView}
                  className="px-3 py-1 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50"
                >
                  Save & View Details
                </button>
              )}
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
                <p className="text-gray-700">{result.summary}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Biomarkers</h3>
                <div className="overflow-x-auto">
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
                      {result.biomarkers.map((biomarker: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{biomarker.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biomarker.value} {biomarker.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biomarker.referenceRange}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${biomarker.status === 'normal' ? 'bg-green-100 text-green-800' : 
                                  biomarker.status === 'high' ? 'bg-red-100 text-red-800' : 
                                  biomarker.status === 'low' ? 'bg-yellow-100 text-yellow-800' : 
                                  biomarker.status === 'borderline' ? 'bg-orange-100 text-orange-800' : 
                                  'bg-gray-100 text-gray-800'}`}
                            >
                              {biomarker.status.charAt(0).toUpperCase() + biomarker.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🩺 Health Advice</h3>
                <div className="space-y-4">
                  {result.healthAdvice && Object.entries(result.healthAdvice).map(([key, value]: [string, any]) => {
                    const colorMap: Record<string, string> = {
                      nutrition: 'blue',
                      hydration: 'teal',
                      immunity: 'green',
                      inflammation: 'amber',
                      lifestyle: 'indigo',
                      followUp: 'purple'
                    };
                    
                    const titleMap: Record<string, string> = {
                      nutrition: 'Nutrition & Energy',
                      hydration: 'Hydration',
                      immunity: 'Immunity',
                      inflammation: 'Inflammation',
                      lifestyle: 'Lifestyle',
                      followUp: 'When to re-check'
                    };
                    
                    const color = colorMap[key] || 'gray';
                    const title = titleMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
                    
                    return (
                      <div key={key} className={`bg-${color}-50 p-4 rounded-md`}>
                        <h4 className={`font-medium text-${color}-800 mb-2`}>{title}</h4>
                        <p className="text-gray-700">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {user ? (
                <div className="text-center">
                  <button
                    onClick={handleSaveAndView}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save & View Detailed Report
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-yellow-700 mb-2">
                    <strong>Create an account</strong> to save this report and track your health over time.
                  </p>
                  <div className="flex space-x-4">
                    <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Create Account
                    </Link>
                    <Link href="/login" className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
