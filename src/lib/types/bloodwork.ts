export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface BloodworkAnalysis {
  id: string;
  userId: string;
  imageUrl?: string;
  biomarkers: Biomarker[];
  summary: string;
  goodResults: {
    name: string;
    value: number;
    unit: string;
  }[];
  improvementNeeded: {
    name: string;
    value: number;
    unit: string;
    recommendation: string;
  }[];
  recommendations: {
    id: string;
    text: string;
    category: 'dietary' | 'supplements' | 'lifestyle' | 'medical';
    priority: 'high' | 'medium' | 'low';
  }[];
  createdAt: Date;
} 