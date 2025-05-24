import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Clock, DollarSign, Car, Plane, ArrowLeft, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { generateItinerary } from '@/integrations/gemini/client';
import type { ItineraryDay } from '@/integrations/gemini/client';
import type { DatabaseItinerary } from '@/types/database';
import { parseItineraryData, stringifyItineraryData } from '@/types/database';
import { ActivityEditor } from '@/components/ActivityEditor';

type Itinerary = Omit<DatabaseItinerary, 'user_id' | 'updated_at'> & {
  itinerary_data: ItineraryDay[] | null;
};

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
        const { user_id, updated_at, itinerary_data, ...rest } = data as DatabaseItinerary;
        setItinerary({
          ...rest,
          itinerary_data: parseItineraryData(itinerary_data)
        });
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
      const itineraryData = await generateItinerary(
        itinerary.destination,
        itinerary.duration,
        itinerary.budget,
        itinerary.transportation,
        itinerary.interests,
        user?.user_metadata?.is_premium || false
      );

      const { error } = await supabase
        .from('itineraries')
        .update({ itinerary_data: stringifyItineraryData(itineraryData) })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setItinerary(prev => prev ? { ...prev, itinerary_data: itineraryData } : null);
      
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
    <div className="min-h-screen bg-white">
      <Navbar user={user} onSignOut={() => signOut().then(() => navigate('/'))} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-4 hover:text-[#BF0D3E]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader className="bg-[#0032A0] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {itinerary.title}
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  {itinerary.destination}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-[#0032A0]" />
                    {itinerary.duration} days
                  </div>
                  {itinerary.budget && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 text-[#BF0D3E]" />
                      Budget: ₱{itinerary.budget.toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-[#FED141]" />
                    Created {new Date(itinerary.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Transportation</h4>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.transportation.map((transport, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-[#0032A0]/10 text-[#0032A0] text-xs rounded-full font-medium"
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
                        className="px-3 py-1 bg-[#BF0D3E]/10 text-[#BF0D3E] text-xs rounded-full font-medium"
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
                    className="w-full bg-[#0032A0] hover:bg-[#0032A0]/90 text-white"
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
              <Card className="bg-white border border-gray-200 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-[#0032A0] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
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
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))}
                    disabled={currentDay === 1}
                    className="hover:text-[#BF0D3E]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="text-center">
                    <div className="text-sm text-[#0032A0] font-medium mb-1">Day {currentDay}</div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentDayData.title}
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentDay(prev => Math.min(itinerary.duration, prev + 1))}
                    disabled={currentDay === itinerary.duration}
                    className="hover:text-[#BF0D3E]"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Activities Timeline */}
                {user?.user_metadata?.is_premium ? (
                  <ActivityEditor
                    dayData={currentDayData}
                    onUpdate={(updatedDay) => {
                      const updatedItineraryData = [...(itinerary.itinerary_data || [])];
                      updatedItineraryData[currentDay - 1] = updatedDay;
                      setItinerary(prev => prev ? { ...prev, itinerary_data: updatedItineraryData } : null);
                      
                      // Update in Supabase
                      supabase
                        .from('itineraries')
                        .update({ itinerary_data: stringifyItineraryData(updatedItineraryData) })
                        .eq('id', id);
                    }}
                    alternatives={currentDayData.activities.flatMap(activity => 
                      activity.alternatives?.map(alt => ({
                        time: activity.time,
                        activity: alt.activity,
                        location: alt.location,
                        description: alt.description,
                        estimated_cost: alt.estimated_cost
                      })) || []
                    )}
                  />
                ) : (
                  <div className="space-y-4">
                    {currentDayData.activities.map((activity, index) => (
                      <Card key={index} className="bg-white border border-gray-200 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-24 text-center">
                              <div className="text-lg font-semibold text-[#0032A0]">
                                {activity.time}
                              </div>
                              {activity.estimated_cost && (
                                <div className="text-sm text-[#BF0D3E]">
                                  ₱{activity.estimated_cost}
                                </div>
                              )}
                              {activity.duration && (
                                <div className="text-sm text-gray-500">
                                  {activity.duration}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {activity.activity}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 text-[#0032A0]" />
                                {activity.location}
                              </div>
                              <p className="text-gray-600 mb-4">
                                {activity.description}
                              </p>

                              {/* Premium Features */}
                              {user?.user_metadata?.is_premium && (
                                <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                                  {/* Tips */}
                                  {activity.tips && activity.tips.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-[#0032A0] mb-2">Pro Tips</h4>
                                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        {activity.tips.map((tip, i) => (
                                          <li key={i}>{tip}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Transportation Details */}
                                  {activity.transportation_details && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-[#0032A0] mb-2">Transportation</h4>
                                      <div className="text-sm text-gray-600">
                                        <p>Mode: {activity.transportation_details.mode}</p>
                                        <p>Duration: {activity.transportation_details.duration}</p>
                                        <p>Cost: ₱{activity.transportation_details.cost}</p>
                                        {activity.transportation_details.tips.length > 0 && (
                                          <ul className="list-disc list-inside mt-1">
                                            {activity.transportation_details.tips.map((tip, i) => (
                                              <li key={i}>{tip}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Dining Options */}
                                  {activity.dining_options && activity.dining_options.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-[#0032A0] mb-2">Dining Options</h4>
                                      <div className="space-y-3">
                                        {activity.dining_options.map((option, i) => (
                                          <div key={i} className="text-sm text-gray-600">
                                            <p className="font-medium">{option.name}</p>
                                            <p>{option.cuisine} • {option.price_range}</p>
                                            <p className="text-[#BF0D3E]">Must try: {option.must_try.join(', ')}</p>
                                            <p className="text-gray-500">{option.location}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Weather Forecast */}
                                  {activity.weather_forecast && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-[#0032A0] mb-2">Weather</h4>
                                      <div className="text-sm text-gray-600">
                                        <p>{activity.weather_forecast.temperature} • {activity.weather_forecast.conditions}</p>
                                        {activity.weather_forecast.recommendations.length > 0 && (
                                          <ul className="list-disc list-inside mt-1">
                                            {activity.weather_forecast.recommendations.map((rec, i) => (
                                              <li key={i}>{rec}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Alternative Activities */}
                                  {activity.alternatives && activity.alternatives.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-[#0032A0] mb-2">Alternative Activities</h4>
                                      <div className="space-y-3">
                                        {activity.alternatives.map((alt, i) => (
                                          <div key={i} className="text-sm text-gray-600">
                                            <p className="font-medium">{alt.activity}</p>
                                            <p>{alt.location}</p>
                                            <p>{alt.description}</p>
                                            {alt.estimated_cost && (
                                              <p className="text-[#BF0D3E]">₱{alt.estimated_cost}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;
