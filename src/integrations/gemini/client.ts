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
    local_phrases?: string[];
    emergency_contacts?: string[];
    photo_spots?: string[];
    hidden_gems?: string[];
    cultural_info?: string;
    local_events?: string[];
    budget_tips?: string[];
    safety_tips?: string[];
    etiquette?: string[];
    best_times?: string[];
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
  console.log('Generating itinerary with premium:', isPremium);
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
- day: number
- title: string
- activities: array of objects, each with:
  - time: string
  - activity: string
  - location: string
  - description: string
  - estimated_cost: number
  - transportation: string
  - duration: string
  - tips: string[]
  - alternatives: array of objects with:
      - activity: string
      - location: string
      - description: string
      - estimated_cost: number
  - transportation_details: object with:
      - mode: string
      - duration: string
      - cost: number
      - tips: string[]
  - photo_spots: string[]
  - local_events: string[]
  - best_times: string[]

Return ONLY a valid JSON array of days, like this:
[
  {
    "day": 1,
    "title": "Sample Day",
    "activities": [
      {
        "time": "8:00 AM",
        "activity": "Sample Activity",
        "location": "Sample Location",
        "description": "Sample Description",
        "estimated_cost": 100,
        "transportation": "Taxi",
        "duration": "2 hours",
        "tips": ["Tip 1", "Tip 2"],
        "alternatives": [
          {
            "activity": "Alt Activity",
            "location": "Alt Location",
            "description": "Alt Description",
            "estimated_cost": 50
          }
        ],
        "transportation_details": {
          "mode": "Taxi",
          "duration": "30 min",
          "cost": 100,
          "tips": ["Tip A"]
        },
        "photo_spots": ["Spot 1"],
        "local_events": ["Event 1"],
        "best_times": ["Morning"]
      }
    ]
  }
]

Do NOT include any other fields. Do NOT include markdown, comments, or extra text. Return ONLY a valid JSON array.`;

  const standardPrompt = `
For each day, provide:
1. A basic title
2. A list of activities with:
   - Time
   - Activity name
   - Location
   - Brief description
   - Estimated cost (in PHP)
   - Basic transportation information
   - General tips`;

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
      "estimated_cost": number,
      "transportation": string${isPremium ? `,
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
      "photo_spots": string[],
      "local_events": string[],
      "best_times": string[]` : ''}
    }
  ]
}

IMPORTANT: Return ONLY a valid JSON array. Do not include any markdown formatting, backticks, or additional text.`;

  try {
    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response text to ensure it's valid JSON
    const cleanedText = text
      .replace(/```json\n?/g, '') // Remove ```json
      .replace(/```\n?/g, '')     // Remove ```
      .replace(/^\[/, '[')        // Ensure starts with [
      .replace(/\]$/, ']')        // Ensure ends with ]
      .trim();                    // Remove extra whitespace
    
    console.log('Raw Gemini Response:', text);
    console.log('Cleaned Response:', cleanedText);
    
    try {
      // Parse the JSON response
      const itinerary = JSON.parse(cleanedText);
      console.log('Parsed Itinerary:', itinerary);
      
      // Validate the itinerary structure
      if (!Array.isArray(itinerary)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each day
      itinerary.forEach((day, index) => {
        if (!day.day || !day.title || !Array.isArray(day.activities)) {
          throw new Error(`Invalid day structure at index ${index}`);
        }
        
        // Validate each activity
        day.activities.forEach((activity, actIndex) => {
          if (!activity.time || !activity.activity || !activity.location || !activity.description) {
            throw new Error(`Invalid activity structure at day ${index}, activity ${actIndex}`);
          }
        });
      });
      
      return itinerary;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Problematic JSON:', cleanedText);
      throw new Error('Invalid JSON response from AI. Please try again.');
    }
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
} 