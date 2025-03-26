import { useState } from 'react';

interface ResultDisplayProps {
  result: any;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState('biomarkers');
  
  if (!result) return null;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Result header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {result.displayDate || new Date(result.timestamp).toLocaleDateString()}
          </h2>
        </div>
        <p className="mt-2 text-gray-600">{result.summary}</p>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('biomarkers')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'biomarkers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Biomarkers
          </button>
          <button
            onClick={() => setActiveTab('advice')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'advice'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Health Advice
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'biomarkers' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Biomarker
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Range
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.biomarkers.map((biomarker: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {biomarker.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {biomarker.value} {biomarker.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {biomarker.referenceRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        biomarker.status === 'normal' ? 'bg-green-100 text-green-800' :
                        biomarker.status === 'high' ? 'bg-red-100 text-red-800' :
                        biomarker.status === 'low' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {biomarker.status.charAt(0).toUpperCase() + biomarker.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'advice' && (
          <div className="space-y-6">
            {/* Nutrition & Energy */}
            {result.healthAdvice.nutrition && (
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">Nutrition & Energy</h3>
                <p className="text-gray-700">{result.healthAdvice.nutrition}</p>
              </div>
            )}
            
            {/* Hydration */}
            {result.healthAdvice.hydration && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Hydration</h3>
                <p className="text-gray-700">{result.healthAdvice.hydration}</p>
              </div>
            )}
            
            {/* Immunity */}
            {result.healthAdvice.immunity && (
              <div className="bg-yellow-50 p-4 rounded-md">
                <h3 className="font-medium text-yellow-800 mb-2">Immunity</h3>
                <p className="text-gray-700">{result.healthAdvice.immunity}</p>
              </div>
            )}
            
            {/* Inflammation */}
            {result.healthAdvice.inflammation && (
              <div className="bg-red-50 p-4 rounded-md">
                <h3 className="font-medium text-red-800 mb-2">Inflammation</h3>
                <p className="text-gray-700">{result.healthAdvice.inflammation}</p>
              </div>
            )}
            
            {/* Lifestyle */}
            {result.healthAdvice.lifestyle && (
              <div className="bg-indigo-50 p-4 rounded-md">
                <h3 className="font-medium text-indigo-800 mb-2">Lifestyle</h3>
                <p className="text-gray-700">{result.healthAdvice.lifestyle}</p>
              </div>
            )}
            
            {/* When to re-check */}
            {result.healthAdvice.followUp && (
              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="font-medium text-purple-800 mb-2">When to re-check</h3>
                <p className="text-gray-700">{result.healthAdvice.followUp}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 