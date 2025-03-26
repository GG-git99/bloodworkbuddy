import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Parse form data to get the image
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    // Convert image to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to base64 for OpenAI
    const base64Image = buffer.toString('base64');
    
    // Determine MIME type (default to jpeg if not available)
    const mimeType = image.type || 'image/jpeg';
    
    // Create data URL
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    // Analyze with OpenAI - using gpt-4o or gpt-4-turbo which support vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Updated to the current model that supports vision
      messages: [
        {
          role: "system",
          content: `You are a medical expert analyzing blood test results. 
          Extract all biomarkers, their values, units, and reference ranges.
          Determine if each value is normal, high, low, or borderline.
          Provide health advice based ONLY on the actual values in this image.
          Format response as JSON with:
          - biomarkers: array of {name, value, unit, referenceRange, status}
          - summary: brief overview of health status
          - healthAdvice: object with {nutrition, hydration, immunity, inflammation, lifestyle, followUp}`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            },
            {
              type: "text",
              text: "Analyze this blood test result image."
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });
    
    // Check if response is valid
    if (!response.choices[0]?.message?.content) {
      return NextResponse.json(
        { error: 'Failed to get analysis from OpenAI' },
        { status: 500 }
      );
    }
    
    // Parse response
    try {
      const analysisResult = JSON.parse(response.choices[0].message.content);
      
      // Validate response structure
      if (!analysisResult.biomarkers || !analysisResult.summary || !analysisResult.healthAdvice) {
        return NextResponse.json(
          { error: 'Invalid analysis result structure' },
          { status: 500 }
        );
      }
      
      // Return the real analysis
      return NextResponse.json({
        analysisId: Date.now().toString(),
        ...analysisResult,
        timestamp: new Date().toISOString()
      });
      
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse analysis result' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error:', error);
    
    // Handle specific OpenAI API errors
    if (error.name === 'OpenAIError') {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to analyze bloodwork: ${error.message}` },
      { status: 500 }
    );
  }
} 