import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Clock, DollarSign, Car, Plane, ArrowLeft, Sparkles, ChevronLeft, ChevronRight, Utensils, Cloud, MessageSquare, Camera, Gem, PiggyBank, Shield, Heart, RefreshCw, Phone, Landmark, ChevronDown, ChevronUp, Info, Lightbulb, Wallet, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { generateItinerary } from '@/integrations/gemini/client';
import type { ItineraryDay } from '@/integrations/gemini/client';
import type { DatabaseItinerary, Accommodation } from '@/types/database';
import { parseItineraryData, stringifyItineraryData } from '@/types/database';
import { ActivityEditor } from '@/components/ActivityEditor';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Itinerary = Omit<DatabaseItinerary, 'user_id' | 'updated_at'> & {
  itinerary_data: ItineraryDay[] | null;
  accommodation?: Accommodation;
};

const PremiumFeatureSummary = ({ activity, detailsOpen }: { activity: any, detailsOpen: boolean }) => {
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
  tooltip,
  isOpen
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  tooltip: string;
  isOpen: boolean;
}) => {
  return (
    <div className="bg-[#0032A0]/5 p-4 rounded-lg">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="w-full flex items-center justify-between text-sm font-semibold text-[#0032A0]"
            >
              <div className="flex items-center gap-2">
                {icon}
                {title}
                <Info className="h-3 w-3 text-[#0032A0]/50" />
              </div>
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
        const { user_id, updated_at, itinerary_data, accommodation, ...rest } = data as unknown as DatabaseItinerary;
        setItinerary({
          ...rest,
          itinerary_data: parseItineraryData(itinerary_data),
          accommodation: accommodation ? JSON.parse(JSON.stringify(accommodation)) as Accommodation : undefined
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
        isPremium,
        itinerary.accommodation
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
    const currentDayActivities = itinerary?.itinerary_data?.[currentDay - 1]?.activities || [];
    const detailsOpen = openDetailsIdx === idx;

    return (
      <div className="relative">
        {/* Timeline connector */}
        {idx < currentDayActivities.length - 1 && (
          <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-[#0032A0]/20" />
        )}
        <div className="flex gap-6">
          {/* Time indicator */}
          <div className="flex-shrink-0 w-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0032A0] text-white flex items-center justify-center font-semibold text-base p-2">
              <span className="leading-tight">{activity.time}</span>
            </div>
          </div>
          {/* Activity content */}
          <div className="flex-grow">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{activity.activity}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 text-[#0032A0]" />
                      {activity.location}
                    </div>
                    <p className="text-gray-700 mb-4">{activity.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {activity.estimated_cost && (
                        <div className="bg-[#0032A0]/5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#0032A0] flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4" />
                          ₱{activity.estimated_cost?.toLocaleString()}
                        </div>
                      )}
                      {activity.transportation && (
                        <div className="bg-[#BF0D3E]/5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#BF0D3E] flex items-center gap-1.5">
                          {getTransportationIcon(activity.transportation)}
                          {activity.transportation}
                        </div>
                      )}
                      {activity.duration && (
                        <div className="bg-[#FED141]/5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#FED141] flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {activity.duration}
                        </div>
                      )}
                    </div>
                  </div>
                  {isPremium && !detailsOpen && (
                    <button
                      onClick={() => toggleDetails(idx)}
                      className="flex-shrink-0 px-4 py-2 bg-[#0032A0] text-white rounded-lg text-sm font-medium hover:bg-[#002366] transition flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Show More Details
                    </button>
                  )}
                </div>
                {/* Premium Details Vertical Stack */}
                {isPremium && detailsOpen && (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                    {activity.tips && activity.tips.length > 0 && (
                      <div className="bg-[#F5F8FF] rounded-lg p-4 border border-[#0032A0]/10">
                        <div className="flex items-center gap-2 mb-2 text-[#0032A0] font-semibold text-base">
                          <Lightbulb className="w-4 h-4 text-yellow-500" /> Pro Tips
                        </div>
                        <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                          {activity.tips.map((tip: string, i: number) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activity.transportation_details && (
                      <div className="bg-[#F5F8FF] rounded-lg p-4 border border-[#0032A0]/10">
                        <div className="flex items-center gap-2 mb-2 text-[#0032A0] font-semibold text-base">
                          <Car className="w-4 h-4 text-blue-500" /> Transportation Details
                        </div>
                        <div className="text-xs text-gray-700">
                          <div className="flex justify-between mb-1">
                            <span>Mode</span>
                            <span className="font-medium">{activity.transportation_details.mode}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Duration</span>
                            <span className="font-medium">{activity.transportation_details.duration}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Cost</span>
                            <span className="font-medium">₱{activity.transportation_details.cost?.toLocaleString()}</span>
                          </div>
                          {activity.transportation_details.tips && (
                            <div className="mt-2">
                              <span className="font-medium">Tips:</span>
                              <ul className="list-disc list-inside text-xs text-gray-600">
                                {activity.transportation_details.tips.map((tip: string, i: number) => (
                                  <li key={i}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {activity.photo_spots && activity.photo_spots.length > 0 && (
                      <div className="bg-[#F5F8FF] rounded-lg p-4 border border-[#0032A0]/10">
                        <div className="flex items-center gap-2 mb-2 text-[#0032A0] font-semibold text-base">
                          <Camera className="w-4 h-4 text-purple-500" /> Photo Spots
                        </div>
                        <ul className="list-disc list-inside text-xs text-gray-700">
                          {activity.photo_spots.map((spot: string, i: number) => (
                            <li key={i}>{spot}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activity.best_times && activity.best_times.length > 0 && (
                      <div className="bg-[#F5F8FF] rounded-lg p-4 border border-[#0032A0]/10">
                        <div className="flex items-center gap-2 mb-2 text-[#0032A0] font-semibold text-base">
                          <Clock className="w-4 h-4 text-green-500" /> Best Times
                        </div>
                        <ul className="list-disc list-inside text-xs text-gray-700">
                          {activity.best_times.map((time: string, i: number) => (
                            <li key={i}>{time}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Add more premium sections here as needed, following the same pattern */}
                    <button
                      onClick={() => toggleDetails(idx)}
                      className="w-full mt-2 px-4 py-2 bg-[#0032A0] text-white rounded-lg text-sm font-medium hover:bg-[#002366] transition flex items-center justify-center gap-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                      Hide Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (itinerary?.itinerary_data) {
      console.log('Current Itinerary Data:', JSON.stringify(itinerary.itinerary_data, null, 2));
    }
  }, [itinerary]);

  const handleDownloadPDF = () => {
    if (!itinerary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Add header with logo-like styling
    doc.setFillColor(0, 50, 160); // #0032A0
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255);
    doc.text(itinerary.title, margin, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255, 0.9);
    doc.text(itinerary.destination, margin, 35);

    // Add trip details in a modern card style
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 50, 160);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, 50, contentWidth, 45, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`Duration: ${itinerary.duration} days`, margin + 10, 65);
    doc.text(`Budget: ₱${itinerary.budget?.toLocaleString()}`, margin + 10, 75);
    doc.text(`Created: ${new Date(itinerary.created_at).toLocaleDateString()}`, margin + 10, 85);

    let yPos = 105;

    // Add each day's activities
    itinerary.itinerary_data?.forEach((day, dayIndex) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Day header with background
      doc.setFillColor(0, 50, 160);
      doc.rect(0, yPos - 10, pageWidth, 20, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor(255);
      doc.text(`Day ${day.day}: ${day.title}`, margin, yPos);
      yPos += 20;

      // Activities table with improved styling
      const tableData = day.activities.map(activity => [
        activity.time,
        activity.activity,
        activity.location,
        activity.description,
        `₱${activity.estimated_cost?.toLocaleString() || '0'}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Time', 'Activity', 'Location', 'Description', 'Cost']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 50, 160],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 10,
          cellPadding: 5
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;
    });

    // Save the PDF
    doc.save(`${itinerary.title.toLowerCase().replace(/\s+/g, '-')}-itinerary.pdf`);
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
    <div className="min-h-screen bg-gray-50">
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
            <Card className="bg-white border border-gray-200 shadow-lg sticky top-8">
              <CardHeader className="bg-[#0032A0] text-white rounded-t-lg p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold mb-1">
                      {itinerary.title}
                    </CardTitle>
                    <CardDescription className="text-white/90 text-base">
                      {itinerary.destination}
                    </CardDescription>
                  </div>
                  {user?.user_metadata?.subscription_tier === 'Premium' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-sm rounded border border-white/20">
                      <Sparkles className="h-3 w-3 text-[#FED141]" />
                      <span className="text-xs font-medium text-white">Premium</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {/* Trip Overview */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                      <Clock className="h-3 w-3 text-[#0032A0]" />
                      Duration
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {itinerary.duration} days
                    </div>
                  </div>
                  {itinerary.budget && (
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                        <DollarSign className="h-3 w-3 text-[#BF0D3E]" />
                        Budget
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">
                        ₱{itinerary.budget.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
                {/* Accommodation Section */}
                <div className="bg-gray-50 p-2 rounded">
                  <h4 className="font-semibold mb-1 text-gray-900 flex items-center gap-1 text-sm">
                    <Landmark className="h-3 w-3 text-[#0032A0]" />
                    Accommodation
                  </h4>
                  <div className="space-y-1">
                    {itinerary.accommodation ? (
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{itinerary.accommodation.name}</p>
                        <p className="text-xs text-gray-600">{itinerary.accommodation.location}</p>
                        {itinerary.accommodation.check_in && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            Check-in: {itinerary.accommodation.check_in}
                          </p>
                        )}
                        {itinerary.accommodation.check_out && (
                          <p className="text-xs text-gray-600">
                            Check-out: {itinerary.accommodation.check_out}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600">
                        No accommodation details provided
                      </div>
                    )}
                  </div>
                </div>
                {/* Transportation Section */}
                <div className="bg-gray-50 p-2 rounded">
                  <h4 className="font-semibold mb-1 text-gray-900 flex items-center gap-1 text-sm">
                    <Car className="h-3 w-3 text-[#0032A0]" />
                    Transportation
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {itinerary.transportation.map((transport, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-2 py-0.5 bg-[#0032A0]/10 text-[#0032A0] text-xs rounded font-medium"
                      >
                        {getTransportationIcon(transport)}
                        {transport}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Interests Section */}
                <div className="bg-gray-50 p-2 rounded">
                  <h4 className="font-semibold mb-1 text-gray-900 flex items-center gap-1 text-sm">
                    <Heart className="h-3 w-3 text-[#0032A0]" />
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {itinerary.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-[#BF0D3E]/10 text-[#BF0D3E] text-xs rounded font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="space-y-2">
                  {itinerary.itinerary_data && (
                    <Button 
                      onClick={handleDownloadPDF}
                      className="w-full bg-[#0032A0] hover:bg-[#0032A0]/90 text-white flex items-center justify-center gap-2 h-10 text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  )}
                  {!itinerary.itinerary_data && (
                    <Button 
                      onClick={generateAIItinerary}
                      disabled={generatingAI}
                      className="w-full bg-[#0032A0] hover:bg-[#0032A0]/90 text-white h-10 text-sm"
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
                </div>
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
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {/* Day Navigation Tabs */}
                  <div className="flex items-center border-b border-gray-200">
                    {Array.from({ length: itinerary.duration }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        onClick={() => setCurrentDay(day)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                          currentDay === day
                            ? 'text-[#0032A0]'
                            : 'text-gray-600 hover:text-[#0032A0] hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Day {day}
                        </span>
                        {currentDay === day && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0032A0]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Current Day Header */}
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-[#0032A0] font-medium mb-1">Day {currentDay}</div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {currentDayData.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))}
                          disabled={currentDay === 1}
                          className="hover:text-[#BF0D3E]"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentDay(prev => Math.min(itinerary.duration, prev + 1))}
                          disabled={currentDay === itinerary.duration}
                          className="hover:text-[#BF0D3E]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activities Timeline */}
                <div className="space-y-8">
                  {itinerary.itinerary_data?.[currentDay - 1]?.activities.map((activity, index) => (
                    renderActivity(activity, index)
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
