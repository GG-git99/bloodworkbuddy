'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { saveBloodworkData } from '@/lib/firebase/firebaseUtils';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BiomarkerEntry {
  id: string;
  name: string;
  value: string;
  unit: string;
  referenceMin: string;
  referenceMax: string;
}

export default function ManualEntry() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biomarkers, setBiomarkers] = useState<BiomarkerEntry[]>([
    { id: '1', name: '', value: '', unit: '', referenceMin: '', referenceMax: '' }
  ]);
  const [labName, setLabName] = useState('');
  const [testDate, setTestDate] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();
  
  const addBiomarker = () => {
    setBiomarkers([
      ...biomarkers,
      { 
        id: Date.now().toString(), 
        name: '', 
        value: '', 
        unit: '', 
        referenceMin: '', 
        referenceMax: '' 
      }
    ]);
  };
  
  const removeBiomarker = (id: string) => {
    if (biomarkers.length === 1) return;
    setBiomarkers(biomarkers.filter(b => b.id !== id));
  };
  
  const updateBiomarker = (id: string, field: keyof BiomarkerEntry, value: string) => {
    setBiomarkers(biomarkers.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Basic validation
    if (!testDate) {
      setError('Please enter the test date');
      return;
    }
    
    const emptyFields = biomarkers.some(b => !b.name || !b.value || !b.unit || !b.referenceMin || !b.referenceMax);
    if (emptyFields) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = {
        labName,
        testDate,
        biomarkers: biomarkers.map(b => ({
          id: b.id,
          name: b.name,
          value: parseFloat(b.value),
          unit: b.unit,
          referenceMin: parseFloat(b.referenceMin),
          referenceMax: parseFloat(b.referenceMax)
        })),
        userId: user.uid
      };
      
      await saveBloodworkData(user.uid, data);
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error saving bloodwork:', error);
      setError(error.message || 'Failed to save bloodwork');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Enter Bloodwork Manually</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 p-3 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Lab Name</label>
          <input 
            type="text" 
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1">Test Date</label>
          <input 
            type="date" 
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {biomarkers.map(b => (
          <div key={b.id}>
            <label className="block text-gray-700 mb-1">{b.name}</label>
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={b.value}
                onChange={(e) => updateBiomarker(b.id, 'value', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input 
                type="text" 
                value={b.unit}
                onChange={(e) => updateBiomarker(b.id, 'unit', e.target.value)}
                className="w-16 px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input 
                type="text" 
                value={b.referenceMin}
                onChange={(e) => updateBiomarker(b.id, 'referenceMin', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input 
                type="text" 
                value={b.referenceMax}
                onChange={(e) => updateBiomarker(b.id, 'referenceMax', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <button 
                type="button"
                onClick={() => removeBiomarker(b.id)}
                className="px-2 text-red-500"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        <button 
          type="button"
          onClick={addBiomarker}
          className="text-blue-600 hover:underline"
        >
          Add Biomarker
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Bloodwork'}
        </button>
      </form>
    </div>
  );
} 