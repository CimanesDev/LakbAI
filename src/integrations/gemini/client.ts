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
  isPremium: boolean = false,
  accommodation?: {
    name: string;
    location: string;
    check_in?: string;
    check_out?: string;
  }
): Promise<ItineraryDay[]> {
  console.log('Generating itinerary with premium:', isPremium);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const basePrompt = `Create a detailed ${duration}-day travel itinerary for ${destination} in the Philippines with the following preferences:
- Transportation: ${transportation.join(', ')}
- Interests: ${interests.join(', ')}
${budget ? `- Total Budget: ₱${budget.toLocaleString()} (approximately ₱${Math.floor(budget / duration).toLocaleString()} per day)` : ''}
${accommodation ? `- Accommodation: ${accommodation.name} in ${accommodation.location}${accommodation.check_in ? ` (Check-in: ${accommodation.check_in})` : ''}${accommodation.check_out ? ` (Check-out: ${accommodation.check_out})` : ''}` : ''}

Important Guidelines:
${accommodation ? '- Skip check-in/check-out activities since accommodation is already arranged\n' : ''}- Allocate the budget realistically across activities, transportation, and meals
- Include a mix of free/inexpensive and premium experiences
- For each activity, provide detailed cost breakdowns including:
  * Entry fees
  * Transportation costs
  * Meal costs
  * Any additional expenses
- Ensure the total cost of activities per day stays within the daily budget
- Include budget-saving tips and alternatives where possible

Make the itinerary realistic, considering:
- Travel time between locations
- Opening hours of attractions
- Local transportation options and costs
- Weather considerations
- Cultural experiences
- Local cuisine recommendations
- Peak/off-peak pricing
- Seasonal variations in costs`;

  const premiumPrompt = `
For each day, provide:
- day: number
- title: string
- activities: array of objects, each with:
  - time: string
  - activity: string
  - location: string
  - description: string
  - estimated_cost: number (detailed breakdown)
  - transportation: string
  - duration: string
  - tips: string[] (include budget-saving tips)
  - alternatives: array of objects with:
      - activity: string
      - location: string
      - description: string
      - estimated_cost: number
      - budget_saving: string (explain how this saves money)
  - transportation_details: object with:
      - mode: string
      - duration: string
      - cost: number
      - tips: string[] (include budget-saving options)
  - dining_options: array of objects with:
      - name: string
      - cuisine: string
      - price_range: string
      - must_try: string[]
      - location: string
      - estimated_cost: number
      - budget_tips: string[]
  - photo_spots: string[]
  - local_events: string[]
  - best_times: string[]
  - budget_tips: string[]
  - hidden_gems: string[] (include free/inexpensive options)
  - cultural_info: string
  - local_events: string[]
  - safety_tips: string[]
  - etiquette: string[]

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
            "estimated_cost": 50,
            "budget_saving": "Saves ₱50 by using public transport"
          }
        ],
        "transportation_details": {
          "mode": "Taxi",
          "duration": "30 min",
          "cost": 100,
          "tips": ["Tip A"]
        },
        "dining_options": [
          {
            "name": "Sample Restaurant",
            "cuisine": "Local",
            "price_range": "₱₱",
            "must_try": ["Dish 1"],
            "location": "Sample Location",
            "estimated_cost": 500,
            "budget_tips": ["Lunch specials available"]
          }
        ],
        "photo_spots": ["Spot 1"],
        "local_events": ["Event 1"],
        "best_times": ["Morning"],
        "budget_tips": ["Tip 1"],
        "hidden_gems": ["Free spot 1"],
        "cultural_info": "Info",
        "safety_tips": ["Tip 1"],
        "etiquette": ["Tip 1"]
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
   - Estimated cost (in PHP) with breakdown
   - Basic transportation information and costs
   - General tips including budget-saving options`;

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
      "transportation": string,
      "duration": string,
      "tips": string[],
      "alternatives": [
        {
          "activity": string,
          "location": string,
          "description": string,
          "estimated_cost": number,
          "budget_saving": string
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
          "location": string,
          "estimated_cost": number,
          "budget_tips": string[]
        }
      ],
      "photo_spots": string[],
      "local_events": string[],
      "best_times": string[],
      "budget_tips": string[],
      "hidden_gems": string[],
      "cultural_info": string,
      "safety_tips": string[],
      "etiquette": string[]` : ''}
    }
  ]
}

IMPORTANT: 
1. Return ONLY a valid JSON array
2. Ensure all costs are realistic and within the budget
3. Include detailed cost breakdowns for each activity
4. Provide budget-saving alternatives where possible
5. Do not include any markdown formatting, backticks, or additional text`;

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