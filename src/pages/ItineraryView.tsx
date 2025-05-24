import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Clock, DollarSign, Car, Plane, ArrowLeft, Sparkles, ChevronLeft, ChevronRight, Utensils, Cloud, MessageSquare, Camera, Gem, PiggyBank, Shield, Heart, RefreshCw, Phone, Landmark, ChevronDown, ChevronUp, Info, Lightbulb, Wallet, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { generateItinerary } from '@/integrations/gemini/client';
import type { ItineraryDay } from '@/integrations/gemini/client';
import type { DatabaseItinerary } from '@/types/database';
import { parseItineraryData, stringifyItineraryData } from '@/types/database';
import { ActivityEditor } from '@/components/ActivityEditor';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Itinerary = Omit<DatabaseItinerary, 'user_id' | 'updated_at'> & {
  itinerary_data: ItineraryDay[] | null;
};

const PremiumFeatureSummary = ({ activity }: { activity: any }) => {
  const features = [
    { icon: <Sparkles className="h-4 w-4" />, name: 'Pro Tips', count: activity.tips?.length || 0 },
    { icon: <RefreshCw className="h-4 w-4" />, name: 'Alternatives', count: activity.alternatives?.length || 0 },
    { icon: <Car className="h-4 w-4" />, name: 'Transport', count: activity.transportation_details ? 1 : 0 },
    { icon: <Utensils className="h-4 w-4" />, name: 'Dining', count: activity.dining_options?.length || 0 },
    { icon: <Cloud className="h-4 w-4" />, name: 'Weather', count: activity.weather_forecast ? 1 : 0 },
    { icon: <MessageSquare className="h-4 w-4" />, name: 'Phrases', count: activity.local_phrases?.length || 0 },
    { icon: <Phone className="h-4 w-4" />, name: 'Emergency', count: activity.emergency_contacts?.length || 0 },
    { icon: <Camera className="h-4 w-4" />, name: 'Photo Spots', count: activity.photo_spots?.length || 0 },
    { icon: <Gem className="h-4 w-4" />, name: 'Hidden Gems', count: activity.hidden_gems?.length || 0 },
    { icon: <Landmark className="h-4 w-4" />, name: 'Culture', count: activity.cultural_info ? 1 : 0 },
    { icon: <Calendar className="h-4 w-4" />, name: 'Events', count: activity.local_events?.length || 0 },
    { icon: <PiggyBank className="h-4 w-4" />, name: 'Budget Tips', count: activity.budget_tips?.length || 0 },
    { icon: <Shield className="h-4 w-4" />, name: 'Safety', count: activity.safety_tips?.length || 0 },
    { icon: <Heart className="h-4 w-4" />, name: 'Etiquette', count: activity.etiquette?.length || 0 },
    { icon: <Clock className="h-4 w-4" />, name: 'Best Times', count: activity.best_times?.length || 0 },
  ].filter(feature => feature.count > 0);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {features.map((feature, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#0032A0]/10 text-[#0032A0] text-xs rounded-full">
                {feature.icon}
                <span>{feature.name}</span>
                <span className="text-[#BF0D3E]">({feature.count})</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view {feature.name.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

const CollapsibleSection = ({ 
  title, 
  icon, 
  children, 
  tooltip 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  tooltip: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#0032A0]/5 p-4 rounded-lg">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-[#0032A0]"
            >
              <div className="flex items-center gap-2">
                {icon}
                {title}
                <Info className="h-3 w-3 text-[#0032A0]/50" />
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {isOpen && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
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
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [openDetailsIdx, setOpenDetailsIdx] = useState<number | null>(null);

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
      console.log('Premium Status:', user?.user_metadata?.subscription_tier);
      const isPremium = user?.user_metadata?.subscription_tier === 'Premium';
      console.log('Is Premium:', isPremium);

      const itineraryData = await generateItinerary(
        itinerary.destination,
        itinerary.duration,
        itinerary.budget,
        itinerary.transportation,
        itinerary.interests,
        isPremium
      );

      console.log('Generated Itinerary Data:', JSON.stringify(itineraryData, null, 2));

      if (!itineraryData || !Array.isArray(itineraryData)) {
        throw new Error('Invalid itinerary data received');
      }

      // Validate premium features if user is premium
      if (isPremium) {
        itineraryData.forEach((day, dayIndex) => {
          day.activities.forEach((activity, actIndex) => {
            if (!activity.tips || !activity.alternatives || !activity.transportation_details || 
                !activity.dining_options || !activity.weather_forecast || !activity.local_phrases || 
                !activity.emergency_contacts || !activity.photo_spots || !activity.hidden_gems || 
                !activity.cultural_info || !activity.local_events || !activity.budget_tips || 
                !activity.safety_tips || !activity.etiquette || !activity.best_times) {
              console.warn(`Missing premium features in day ${dayIndex + 1}, activity ${actIndex + 1}`);
            }
          });
        });
      }

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
    } catch (error: any) {
      console.error('Error generating AI itinerary:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate AI itinerary. Please try again.",
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

  // Helper for accordion behavior
  const handleSectionToggle = (section: string) => {
    if (allOpen) return;
    setOpenSection(openSection === section ? null : section);
  };

  const toggleDetails = (idx: number) => {
    setOpenDetailsIdx(openDetailsIdx === idx ? null : idx);
  };

  const renderActivity = (activity: any, idx: number) => {
    const isPremium = user?.user_metadata?.subscription_tier === 'Premium';
    return (
      <div className={`p-4 rounded-xl bg-white shadow-sm mb-6`}> 
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{activity.activity}</h3>
            <p className="text-sm text-gray-600">{activity.time} • {activity.location}</p>
            <p className="text-gray-700 mb-2">{activity.description}</p>
            <div className="flex flex-wrap gap-2 mb-2 text-sm">
              <div className="bg-gray-50 rounded px-3 py-1">Cost: ₱{activity.estimated_cost?.toLocaleString()}</div>
              <div className="bg-gray-50 rounded px-3 py-1">Transportation: {activity.transportation}</div>
            </div>
          </div>
          {isPremium && (
            <button
              className="mt-4 md:mt-0 md:ml-6 px-4 py-2 bg-[#0032A0] text-white rounded-lg text-sm font-medium hover:bg-[#002366] transition"
              onClick={() => toggleDetails(idx)}
            >
              {openDetailsIdx === idx ? 'Hide Details' : 'View Details'}
            </button>
          )}
        </div>
        {isPremium && openDetailsIdx === idx && (
          <div className="mt-6 border-t pt-4">
            <div className="flex flex-wrap gap-1 text-xs mb-4 border-b border-gray-200 pb-2">
              <PremiumFeatureSummary activity={activity} />
            </div>
            {activity.tips && activity.tips.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 text-[#0032A0] font-semibold mb-1"><Lightbulb className="w-4 h-4 text-yellow-500" />Pro Tips</div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">{activity.tips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}</ul>
              </div>
            )}
            {activity.alternatives && activity.alternatives.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 text-[#0032A0] font-semibold mb-1"><RefreshCw className="w-4 h-4 text-blue-500" />Alternative Activities</div>
                <div className="space-y-2">{activity.alternatives.map((alt: any, i: number) => (
                  <div key={i} className="bg-gray-50 p-2 rounded"><p className="text-sm font-medium text-gray-900">{alt.activity}</p><p className="text-xs text-gray-600">{alt.location}</p><p className="text-xs text-gray-700 mt-1">{alt.description}</p><p className="text-xs text-gray-600 mt-1">Cost: ₱{alt.estimated_cost?.toLocaleString()}</p></div>
                ))}</div>
              </div>
            )}
            {activity.transportation_details && (
              <div className="mb-2">
                <div className="flex items-center gap-2 text-[#0032A0] font-semibold mb-1"><Car className="w-4 h-4 text-blue-500" />Transportation Details</div>
                <div className="bg-gray-50 p-3 rounded"><p className="text-sm text-gray-700"><span className="font-medium">Mode:</span> {activity.transportation_details.mode}</p><p className="text-sm text-gray-700"><span className="font-medium">Duration:</span> {activity.transportation_details.duration}</p><p className="text-sm text-gray-700"><span className="font-medium">Cost:</span> ₱{activity.transportation_details.cost?.toLocaleString()}</p>{activity.transportation_details.tips && (<div className="mt-2"><p className="text-sm font-medium text-gray-700">Tips:</p><ul className="list-disc list-inside text-sm text-gray-600">{activity.transportation_details.tips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}</ul></div>)}</div>
              </div>
            )}
            {activity.alternatives && activity.alternatives.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 text-[#0032A0] font-semibold mb-1"><Camera className="w-4 h-4 text-purple-500" />Photo Spots</div>
                <div className="bg-gray-50 p-3 rounded"><ul className="list-disc list-inside text-sm text-gray-700">{activity.photo_spots?.map((spot: string, i: number) => <li key={i}>{spot}</li>)}</ul></div>
              </div>
            )}
            {activity.local_events && activity.local_events.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 text-[#0032A0] font-semibold mb-1"><Calendar className="w-4 h-4 text-blue-500" />Local Events</div>
                <div className="bg-gray-50 p-3 rounded"><ul className="list-disc list-inside text-sm text-gray-700">{activity.local_events.map((event: string, i: number) => <li key={i}>{event}</li>)}</ul></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (itinerary?.itinerary_data) {
      console.log('Current Itinerary Data:', JSON.stringify(itinerary.itinerary_data, null, 2));
    }
  }, [itinerary]);

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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {itinerary.title}
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg">
                      {itinerary.destination}
                    </CardDescription>
                  </div>
                  {user?.user_metadata?.subscription_tier === 'Premium' ? (
                    <div className="bg-[#FED141] text-[#0032A0] px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      Premium
                    </div>
                  ) : (
                    <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                      Free
                    </div>
                  )}
                </div>
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
                <div className="space-y-4">
                  {currentDayData.activities.map((activity, index) => (
                    renderActivity(activity, index)
                  ))}
                </div>

                {itinerary.itinerary_data && user?.user_metadata?.subscription_tier === 'Premium' && (
                  <Button 
                    onClick={generateAIItinerary}
                    disabled={generatingAI}
                    className="w-full bg-[#0032A0] hover:bg-[#0032A0]/90 text-white mt-4"
                  >
                    {generatingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate with Premium Features
                      </>
                    )}
                  </Button>
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
