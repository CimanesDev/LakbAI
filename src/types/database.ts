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
    return JSON.parse(JSON.stringify(data)) as ItineraryDay[];
  } catch (error) {
    console.error('Error parsing itinerary data:', error);
    return null;
  }
}

export function stringifyItineraryData(data: ItineraryDay[]): Json {
  return JSON.parse(JSON.stringify(data));
} 