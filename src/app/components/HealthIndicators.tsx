import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface HealthIndicatorsProps {
  goodResults: Array<{
    name: string;
    value: string | number;
    unit: string;
  }>;
  improvementNeeded: Array<{
    name: string;
    value: string | number;
    unit: string;
    recommendation: string;
  }>;
}

export default function HealthIndicators({ 
  goodResults, 
  improvementNeeded 
}: HealthIndicatorsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-xl font-semibold text-green-800 flex items-center">
          <CheckCircleIcon className="w-6 h-6 mr-2" />
          Optimal Results
        </h3>
        
        <div className="mt-4 space-y-3">
          {goodResults.length > 0 ? (
            goodResults.map((result, index) => (
              <div key={index} className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                <span className="font-medium">{result.name}:</span>
                <span className="ml-2">{result.value} {result.unit}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No optimal results found in this test.</p>
          )}
        </div>
      </div>
      
      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <h3 className="text-xl font-semibold text-red-800 flex items-center">
          <XCircleIcon className="w-6 h-6 mr-2" />
          Areas for Improvement
        </h3>
        
        <div className="mt-4 space-y-4">
          {improvementNeeded.length > 0 ? (
            improvementNeeded.map((result, index) => (
              <div key={index} className="pb-3 border-b border-red-200 last:border-0">
                <div className="flex items-center">
                  <XCircleIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <span className="font-medium">{result.name}:</span>
                  <span className="ml-2">{result.value} {result.unit}</span>
                </div>
                <p className="mt-1 text-sm text-red-700 pl-7">{result.recommendation}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">All results are within normal ranges. Great job!</p>
          )}
        </div>
      </div>
    </div>
  );
} 