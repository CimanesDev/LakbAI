import { supabase } from '@/integrations/supabase/client';
import { geminiClient } from '@/integrations/gemini/client';

interface ChatResponse {
  message: string;
  error?: string;
}

export const chatService = {
  async getResponse(
    message: string,
    selectedTripId: string | null,
    context: {
      itineraries?: Array<{
        id: string;
        title: string;
        destination: string;
        duration: number;
        budget: number;
        transportation: string[];
        interests: string[];
      }>;
    }
  ): Promise<ChatResponse> {
    try {
      // Get trip details if a specific trip is selected
      let tripDetails = null;
      if (selectedTripId && context.itineraries) {
        tripDetails = context.itineraries.find(trip => trip.id === selectedTripId);
      }

      // Generate response using Gemini AI
      const response = await geminiClient.generateResponse(message, {
        tripDetails: tripDetails ? {
          destination: tripDetails.destination,
          duration: tripDetails.duration,
          budget: tripDetails.budget,
          transportation: tripDetails.transportation,
          interests: tripDetails.interests
        } : null
      });

      return { message: response };
    } catch (error) {
      console.error('Error in chat service:', error);
      return {
        message: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}; 