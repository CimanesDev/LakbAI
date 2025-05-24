import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Clock, DollarSign, Car, Plane, ArrowLeft, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  duration: number;
  budget: number;
  transportation: string[];
  interests: string[];
  itinerary_data: any;
  created_at: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: Array<{
    time: string;
    activity: string;
    location: string;
    description: string;
    estimated_cost?: number;
  }>;
}

const ItineraryView = () => {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id && user) {
      fetchItinerary();
    }
  }, [id, user]);

  const fetchItinerary = async () => {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching itinerary:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load itinerary",
        });
        navigate('/dashboard');
      } else {
        setItinerary(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIItinerary = async () => {
    if (!itinerary) return;
    
    setGeneratingAI(true);
    try {
      // This will be connected to Gemini API later
      // For now, we'll create a mock itinerary
      const mockItineraryData: ItineraryDay[] = Array.from({ length: itinerary.duration }, (_, index) => ({
        day: index + 1,
        title: `Day ${index + 1} in ${itinerary.destination}`,
        activities: [
          {
            time: "9:00 AM",
            activity: "Morning Exploration",
            location: `${itinerary.destination} City Center`,
            description: "Start your day exploring the main attractions and local culture",
            estimated_cost: 25
          },
          {
            time: "12:00 PM",
            activity: "Local Cuisine",
            location: "Popular Local Restaurant",
            description: "Experience authentic local flavors and traditional dishes",
            estimated_cost: 40
          },
          {
            time: "2:00 PM",
            activity: "Cultural Activity",
            location: "Historical Site",
            description: "Immerse yourself in the rich history and culture of the area",
            estimated_cost: 30
          },
          {
            time: "6:00 PM",
            activity: "Evening Relaxation",
            location: "Scenic Viewpoint",
            description: "Unwind and enjoy beautiful views as the day comes to an end",
            estimated_cost: 15
          }
        ]
      }));

      const { error } = await supabase
        .from('itineraries')
        .update({ itinerary_data: mockItineraryData as any })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setItinerary(prev => prev ? { ...prev, itinerary_data: mockItineraryData } : null);
      
      toast({
        title: "Success",
        description: "AI itinerary generated successfully!",
      });
    } catch (error) {
      console.error('Error generating AI itinerary:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI itinerary. Please try again.",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const getTransportationIcon = (transport: string) => {
    if (transport.toLowerCase().includes('flight') || transport.toLowerCase().includes('plane')) {
      return <Plane className="h-4 w-4" />;
    }
    return <Car className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <Navbar user={user} onSignOut={() => signOut().then(() => navigate('/'))} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading itinerary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <Navbar user={user} onSignOut={() => signOut().then(() => navigate('/'))} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const currentDayData = itinerary.itinerary_data?.[currentDay - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <Navbar user={user} onSignOut={() => signOut().then(() => navigate('/'))} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-4 hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {itinerary.title}
                </CardTitle>
                <CardDescription className="text-emerald-50 text-lg">
                  {itinerary.destination}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-blue-500" />
                    {itinerary.duration} days
                  </div>
                  {itinerary.budget && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      Budget: ₱{itinerary.budget.toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    Created {new Date(itinerary.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Transportation</h4>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.transportation.map((transport, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 text-xs rounded-full font-medium"
                      >
                        {getTransportationIcon(transport)}
                        {transport}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 text-xs rounded-full font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {!itinerary.itinerary_data && (
                  <Button 
                    onClick={generateAIItinerary}
                    disabled={generatingAI}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
                  >
                    {generatingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate AI Itinerary
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!itinerary.itinerary_data ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Itinerary Yet</h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    Click the button on the left to generate your AI-powered itinerary!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Day Navigation */}
                <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))}
                    disabled={currentDay === 1}
                    className="hover:text-emerald-600"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentDayData.title}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentDay(prev => Math.min(itinerary.duration, prev + 1))}
                    disabled={currentDay === itinerary.duration}
                    className="hover:text-emerald-600"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Activities Timeline */}
                <div className="space-y-4">
                  {currentDayData.activities.map((activity, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-24 text-center">
                            <div className="text-lg font-semibold text-emerald-600">
                              {activity.time}
                            </div>
                            {activity.estimated_cost && (
                              <div className="text-sm text-gray-500">
                                ₱{activity.estimated_cost}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {activity.activity}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 text-emerald-500" />
                              {activity.location}
                            </div>
                            <p className="text-gray-600">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;
