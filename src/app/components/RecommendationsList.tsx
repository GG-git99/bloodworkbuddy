'use client';

import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface RecommendationItem {
  id: string;
  text: string;
  category: 'dietary' | 'supplements' | 'lifestyle' | 'medical';
  priority: 'high' | 'medium' | 'low';
}

export default function RecommendationsList({ 
  recommendations 
}: { 
  recommendations: RecommendationItem[] 
}) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  
  const toggleItem = (id: string) => {
    if (checkedItems.includes(id)) {
      setCheckedItems(checkedItems.filter(item => item !== id));
    } else {
      setCheckedItems([...checkedItems, id]);
    }
  };
  
  const categoryMap = {
    dietary: { label: 'Dietary Changes', bg: 'bg-green-100', text: 'text-green-800' },
    supplements: { label: 'Supplements', bg: 'bg-blue-100', text: 'text-blue-800' },
    lifestyle: { label: 'Lifestyle Changes', bg: 'bg-purple-100', text: 'text-purple-800' },
    medical: { label: 'Medical Follow-up', bg: 'bg-red-100', text: 'text-red-800' },
  };
  
  // Group recommendations by category
  const categorized = recommendations.reduce((acc, rec) => {
    const category = rec.category as keyof typeof categoryMap;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rec);
    return acc;
  }, {} as Record<keyof typeof categoryMap, RecommendationItem[]>);
  
  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No specific recommendations needed. All results look good!</p>
      </div>
    );
  }
  
  return (
    <div>
      {Object.entries(categorized).map(([category, items]) => (
        items.length > 0 && (
          <div key={category} className="mb-8">
            <h3 className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${categoryMap[category as keyof typeof categoryMap].bg} ${categoryMap[category as keyof typeof categoryMap].text}`}>
              {categoryMap[category as keyof typeof categoryMap].label}
            </h3>
            
            <div className="bg-white rounded-lg shadow-md">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 border-b last:border-0 flex items-start ${
                    checkedItems.includes(item.id) ? 'bg-gray-50' : ''
                  }`}
                >
                  <div 
                    onClick={() => toggleItem(item.id)}
                    className={`w-6 h-6 rounded-md border mr-3 flex-shrink-0 cursor-pointer flex items-center justify-center ${
                      checkedItems.includes(item.id) 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {checkedItems.includes(item.id) && <CheckIcon className="w-4 h-4" />}
                  </div>
                  
                  <div className={checkedItems.includes(item.id) ? 'text-gray-500 line-through' : ''}>
                    <p className="font-medium">{item.text}</p>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        item.priority === 'high' ? 'bg-red-100 text-red-800' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">Progress: {checkedItems.length} of {recommendations.length} completed</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(checkedItems.length / recommendations.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 