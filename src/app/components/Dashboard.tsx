import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Biomarker {
  name: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  referenceRange: string;
}

interface AnalysisResult {
  id: string;
  biomarkers: Biomarker[];
  summary: string;
  recommendations: string[];
  timestamp: string;
}

export default function Dashboard({ analysisId }: { analysisId: string }) {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function fetchResults() {
      try {
        // In a real app, you'd fetch from your API
        const response = await fetch(`/api/user-data?id=${analysisId}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (analysisId) {
      fetchResults();
    }
  }, [analysisId]);
  
  if (isLoading) {
    return <div className="flex justify-center p-12">Loading results...</div>;
  }
  
  if (!results) {
    return <div className="p-8">No results found</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Bloodwork Results</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
        <p className="text-gray-700">{results.summary}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Biomarkers</h2>
          <div className="space-y-4">
            {results.biomarkers.map((marker, index) => (
              <div key={index} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{marker.name}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    marker.status === 'normal' ? 'bg-green-100 text-green-800' :
                    marker.status === 'high' ? 'bg-red-100 text-red-800' :
                    marker.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {marker.value} {marker.unit}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Reference range: {marker.referenceRange}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>
          <ul className="list-disc pl-5 space-y-2">
            {results.recommendations.map((rec, index) => (
              <li key={index} className="text-gray-700">{rec}</li>
            ))}
          </ul>
          
          <button 
            onClick={() => router.push(`/recommendations?id=${analysisId}`)}
            className="mt-6 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Detailed Checklist
          </button>
        </div>
      </div>
    </div>
  );
} 