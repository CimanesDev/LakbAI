import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Array<{
    time: string;
    activity: string;
    location: string;
    description: string;
    estimated_cost?: number;
    duration?: string;
    tips?: string[];
    alternatives?: Array<{
      activity: string;
      location: string;
      description: string;
      estimated_cost?: number;
    }>;
    transportation_details?: {
      mode: string;
      duration: string;
      cost: number;
      tips: string[];
    };
    dining_options?: Array<{
      name: string;
      cuisine: string;
      price_range: string;
      must_try: string[];
      location: string;
    }>;
    weather_forecast?: {
      temperature: string;
      conditions: string;
      recommendations: string[];
    };
  }>;
  [key: string]: any;
}

export async function generateItinerary(
  destination: string,
  duration: number,
  budget: number | null,
  transportation: string[],
  interests: string[],
  isPremium: boolean = false
): Promise<ItineraryDay[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const basePrompt = `Create a detailed ${duration}-day travel itinerary for ${destination} in the Philippines with the following preferences:
- Transportation: ${transportation.join(', ')}
- Interests: ${interests.join(', ')}
${budget ? `- Budget: ₱${budget.toLocaleString()}` : ''}

Make the itinerary realistic, considering:
- Travel time between locations
- Opening hours of attractions
- Local transportation options
- Weather considerations
- Cultural experiences
- Local cuisine recommendations`;

  const premiumPrompt = `
For each day, provide:
1. A title for the day
2. A detailed list of activities with:
   - Time
   - Activity name
   - Location
   - Detailed description
   - Estimated cost (in PHP)
   - Duration of activity
   - Pro tips and recommendations
   - Alternative activities (in case of weather changes or preferences)
   - Transportation details between activities:
     * Mode of transport
     * Duration
     * Cost
     * Tips for local transport
   - Dining options near each activity:
     * Restaurant/cafe names
     * Type of cuisine
     * Price range
     * Must-try dishes
     * Location
   - Weather forecast and recommendations

Include local insights such as:
- Best times to visit each location
- Local customs and etiquette
- Hidden gems and off-the-beaten-path spots
- Photography spots
- Local phrases and language tips
- Safety tips and precautions
- Cultural significance of locations
- Local festivals or events if applicable`;

  const standardPrompt = `
For each day, provide:
1. A title for the day
2. A list of activities with:
   - Time
   - Activity name
   - Location
   - Brief description
   - Estimated cost (in PHP)`;

  const prompt = `${basePrompt}
${isPremium ? premiumPrompt : standardPrompt}

Return ONLY a valid JSON array of days, where each day has:
{
  "day": number,
  "title": string,
  "activities": [
    {
      "time": string,
      "activity": string,
      "location": string,
      "description": string,
      "estimated_cost": number${isPremium ? `,
      "duration": string,
      "tips": string[],
      "alternatives": [
        {
          "activity": string,
          "location": string,
          "description": string,
          "estimated_cost": number
        }
      ],
      "transportation_details": {
        "mode": string,
        "duration": string,
        "cost": number,
        "tips": string[]
      },
      "dining_options": [
        {
          "name": string,
          "cuisine": string,
          "price_range": string,
          "must_try": string[],
          "location": string
        }
      ],
      "weather_forecast": {
        "temperature": string,
        "conditions": string,
        "recommendations": string[]
      }` : ''}
    }
  ]
}

Do not include any markdown formatting or additional text. Return only the JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response text to ensure it's valid JSON
    const cleanedText = text
      .replace(/```json\n?/g, '') // Remove ```json
      .replace(/```\n?/g, '')     // Remove ```
      .trim();                    // Remove extra whitespace
    
    // Parse the JSON response
    const itinerary = JSON.parse(cleanedText);
    return itinerary;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
} 