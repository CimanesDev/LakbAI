import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, MapPin, Calendar, DollarSign, Car, Heart, Plane, Bus, Ship, Bus as BusIcon, Car as CarIcon, Landmark } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const TripPlanningForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [destination, setDestination] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedTransportation, setSelectedTransportation] = useState<string[]>([]);
  const [customTransportation, setCustomTransportation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [accommodationName, setAccommodationName] = useState('');
  const [accommodationLocation, setAccommodationLocation] = useState('');

  // Filipino-focused destinations
  const popularDestinations = [
    'Boracay, Aklan', 'Palawan (El Nido)', 'Baguio City', 'Siargao Island',
    'Bohol (Panglao)', 'Cebu City', 'Vigan, Ilocos Sur', 'Camiguin Island',
    'Bicol'
  ];

  const transportationOptions = [
    { name: 'Airplane', icon: <Plane className="h-4 w-4" /> },
    { name: 'Bus (Provincial)', icon: <Bus className="h-4 w-4" /> },
    { name: 'Van/FX', icon: <CarIcon className="h-4 w-4" /> },
    { name: 'Ferry/Boat', icon: <Ship className="h-4 w-4" /> },
    { name: 'Jeepney', icon: <BusIcon className="h-4 w-4" /> },
    { name: 'Private Car', icon: <Car className="h-4 w-4" /> }
  ];

  const interestOptions = [
    'Beach & Islands', 'Mountain Hiking', 'Food Trip',
    'Adventure Sports', 'Photography', 'Shopping', 'Nightlife', 
    'Nature & Wildlife', 'Cultural Experience'
  ];

  const handleDestinationSelect = (dest: string) => {
    setDestination(dest);
    setCustomDestination('');
  };

  const addCustomDestination = () => {
    if (customDestination.trim()) {
      setDestination(customDestination.trim());
      setCustomDestination('');
    }
  };

  const toggleTransportation = (transport: string) => {
    setSelectedTransportation(prev =>
      prev.includes(transport)
        ? prev.filter(t => t !== transport)
        : [...prev, transport]
    );
  };

  const addCustomTransportation = () => {
    if (customTransportation.trim() && !selectedTransportation.includes(customTransportation.trim())) {
      setSelectedTransportation(prev => [...prev, customTransportation.trim()]);
      setCustomTransportation('');
    }
  };

  const removeTransportation = (transport: string) => {
    setSelectedTransportation(prev => prev.filter(t => t !== transport));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to save your trip plan.",
      });
      navigate('/auth');
      return;
    }

    if (!destination || !duration || selectedTransportation.length === 0 || selectedInterests.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('itineraries')
        .insert({
          user_id: user.id,
          title: `Trip to ${destination}`,
          destination,
          duration: parseInt(duration),
          budget: budget ? parseFloat(budget) : null,
          transportation: selectedTransportation,
          interests: selectedInterests,
          accommodation: (accommodationName || accommodationLocation) ? {
            name: accommodationName || null,
            location: accommodationLocation || null
          } : null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success! 🎉",
        description: "Your trip plan has been saved. Let's go!",
      });

      navigate(`/itinerary/${data.id}`);
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your trip. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !destination) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a destination.",
      });
      return;
    }
    if (currentStep === 2) {
      if (!duration) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill in the duration.",
        });
        return;
      }
      if (selectedTransportation.length === 0) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please select at least one transportation option.",
        });
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-[#0032A0] text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <MapPin className="h-7 w-7" />
          Plan Your Perfect Trip! 
        </CardTitle>
        <CardDescription className="text-white/90 text-lg">
          Tell us where you want to go and what you want to do. We'll create an amazing itinerary! 
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 text-center ${
                step < currentStep
                  ? 'text-[#0032A0]'
                  : step === currentStep
                  ? 'text-[#0032A0]'
                  : 'text-[#0032A0]/40'
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  step < currentStep
                    ? 'bg-[#0032A0] text-white'
                    : step === currentStep
                    ? 'bg-[#0032A0] text-white'
                    : 'bg-[#0032A0]/20'
                }`}
              >
                {step}
              </div>
              <span className="text-sm font-medium">
                {step === 1 ? 'Destination' : step === 2 ? 'Details' : 'Interests'}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <Label className="text-lg font-semibold text-[#0032A0] flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#BF0D3E]" />
                  Where are you going? 
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {popularDestinations.map((dest) => (
                    <Button
                      key={dest}
                      type="button"
                      variant={destination === dest ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDestinationSelect(dest)}
                      className={`text-xs h-auto p-3 ${destination === dest 
                        ? 'bg-[#0032A0] text-white' 
                        : 'hover:bg-[#0032A0]/10 hover:border-[#0032A0] text-[#0032A0]'
                      }`}
                    >
                      {dest}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Input
                    placeholder="Or type another destination..."
                    value={customDestination}
                    onChange={(e) => setCustomDestination(e.target.value)}
                    className="flex-1 border-[#0032A0]/20 focus:border-[#0032A0]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomDestination}
                    disabled={!customDestination.trim()}
                    className="px-4 hover:bg-[#0032A0]/10 text-[#0032A0] border-[#0032A0]/20"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {destination && (
                  <div className="p-4 bg-[#0032A0]/5 rounded-lg border border-[#0032A0]/20">
                    <p className="text-sm font-medium text-[#0032A0]">Selected Destination:</p>
                    <p className="text-[#0032A0] font-semibold text-lg">{destination} 📍</p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="duration" className="flex items-center gap-2 text-lg font-semibold text-[#0032A0]">
                      <Calendar className="h-5 w-5 text-[#0032A0]" />
                      How many days? 📅
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 3 days"
                      required
                      className="border-[#0032A0]/20 focus:border-[#0032A0] text-lg p-3"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="budget" className="flex items-center gap-2 text-lg font-semibold text-[#0032A0]">
                      <DollarSign className="h-5 w-5 text-[#BF0D3E]" />
                      Your budget? (optional) 💰
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., 5000"
                      className="border-[#0032A0]/20 focus:border-[#0032A0] text-lg p-3"
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-[#0032A0]/5 rounded-lg p-4 border border-[#0032A0]/10">
                  <Label className="flex items-center gap-2 text-lg font-semibold text-[#0032A0]">
                    <Landmark className="h-5 w-5 text-[#0032A0]" />
                    Accommodation (optional)
                  </Label>
                  <Input
                    placeholder="Hotel/Place Name"
                    value={accommodationName}
                    onChange={e => setAccommodationName(e.target.value)}
                    className="border-[#0032A0]/20 focus:border-[#0032A0]"
                  />
                  <Input
                    placeholder="Location (City, Area, etc.)"
                    value={accommodationLocation}
                    onChange={e => setAccommodationLocation(e.target.value)}
                    className="border-[#0032A0]/20 focus:border-[#0032A0]"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-lg font-semibold text-[#0032A0]">
                    <Car className="h-5 w-5 text-[#0032A0]" />
                    Transportation 🚗
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {transportationOptions.map(({ name, icon }) => (
                      <Button
                        key={name}
                        type="button"
                        variant={selectedTransportation.includes(name) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTransportation(name)}
                        className={`text-xs h-auto p-3 flex items-center gap-2 ${
                          selectedTransportation.includes(name)
                            ? 'bg-[#0032A0] text-white'
                            : 'hover:bg-[#0032A0]/10 hover:border-[#0032A0] text-[#0032A0]'
                        }`}
                      >
                        {icon}
                        {name}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Input
                      placeholder="Or type another transportation option..."
                      value={customTransportation}
                      onChange={(e) => setCustomTransportation(e.target.value)}
                      className="flex-1 border-[#0032A0]/20 focus:border-[#0032A0]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomTransportation}
                      disabled={!customTransportation.trim()}
                      className="px-4 hover:bg-[#0032A0]/10 text-[#0032A0] border-[#0032A0]/20"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedTransportation.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTransportation.map((transport) => (
                        <Badge
                          key={transport}
                          variant="secondary"
                          className="bg-[#0032A0]/10 text-[#0032A0] hover:bg-[#0032A0]/20"
                        >
                          {transport}
                          <button
                            type="button"
                            onClick={() => removeTransportation(transport)}
                            className="ml-2 hover:text-[#BF0D3E]"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <Label className="flex items-center gap-2 text-lg font-semibold text-[#0032A0]">
                  <Heart className="h-5 w-5 text-[#BF0D3E]" />
                  What are your interests? 🎯
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <Button
                      key={interest}
                      type="button"
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleInterest(interest)}
                      className={`text-xs h-auto p-3 ${
                        selectedInterests.includes(interest)
                          ? 'bg-[#0032A0] text-white'
                          : 'hover:bg-[#0032A0]/10 hover:border-[#0032A0] text-[#0032A0]'
                      }`}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Input
                    placeholder="Or type another interest..."
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    className="flex-1 border-[#0032A0]/20 focus:border-[#0032A0]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomInterest}
                    disabled={!customInterest.trim()}
                    className="px-4 hover:bg-[#0032A0]/10 text-[#0032A0] border-[#0032A0]/20"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="bg-[#0032A0]/10 text-[#0032A0] hover:bg-[#0032A0]/20"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-2 hover:text-[#BF0D3E]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="hover:bg-[#0032A0]/10 text-[#0032A0] border-[#0032A0]/20"
              >
                Previous
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white ml-auto"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || selectedInterests.length === 0}
                className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Trip...
                  </>
                ) : (
                  'Create Trip'
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TripPlanningForm;
