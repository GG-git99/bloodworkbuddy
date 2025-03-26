import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Generate a simple ID without uuid
    const analysisId = Date.now().toString();
    
    // For now, use a mock response for testing
    // This will help us verify that the API route is working
    const mockAnalysisResult = {
      biomarkers: [
        {
          name: "Hemoglobin",
          value: "14.2",
          unit: "g/dL",
          status: "normal",
          referenceRange: "13.5-17.5"
        },
        {
          name: "White Blood Cell Count",
          value: "7.5",
          unit: "10^3/μL",
          status: "normal",
          referenceRange: "4.5-11.0"
        },
        {
          name: "Cholesterol",
          value: "220",
          unit: "mg/dL",
          status: "high",
          referenceRange: "125-200"
        }
      ],
      summary: "Your bloodwork results indicate generally good health with slightly elevated cholesterol levels.",
      goodResults: [
        {
          name: "Hemoglobin",
          value: "14.2",
          unit: "g/dL"
        },
        {
          name: "White Blood Cell Count",
          value: "7.5",
          unit: "10^3/μL"
        }
      ],
      improvementNeeded: [
        {
          name: "Cholesterol",
          value: "220",
          unit: "mg/dL",
          recommendation: "Consider dietary changes to reduce cholesterol, such as limiting saturated fats and increasing fiber intake."
        }
      ],
      recommendations: [
        {
          id: "1",
          text: "Reduce intake of saturated fats from red meat and dairy",
          category: "dietary",
          priority: "high"
        },
        {
          id: "2",
          text: "Increase consumption of soluble fiber from oats, beans, and fruits",
          category: "dietary",
          priority: "medium"
        },
        {
          id: "3",
          text: "Consider daily exercise of at least 30 minutes",
          category: "lifestyle",
          priority: "medium"
        }
      ]
    };
    
    // Return mock data for now
    return NextResponse.json({
      analysisId,
      ...mockAnalysisResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error.message },
      { status: 500 }
    );
  }
} 