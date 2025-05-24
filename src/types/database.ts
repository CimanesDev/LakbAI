import type { ItineraryDay } from '@/integrations/gemini/client';

export interface DatabaseItinerary {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  duration: number;
  budget: number;
  transportation: string[];
  interests: string[];
  itinerary_data: Json;
  created_at: string;
  updated_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export function parseItineraryData(data: Json): ItineraryDay[] | null {
  if (!data) return null;
  try {
    const parsed = JSON.parse(JSON.stringify(data)) as ItineraryDay[];
    console.log('Parsed Itinerary Data:', JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (error) {
    console.error('Error parsing itinerary data:', error);
    return null;
  }
}

export function stringifyItineraryData(data: ItineraryDay[]): Json {
  try {
    const stringified = JSON.parse(JSON.stringify(data));
    console.log('Stringified Itinerary Data:', JSON.stringify(stringified, null, 2));
    return stringified;
  } catch (error) {
    console.error('Error stringifying itinerary data:', error);
    throw error;
  }
} 