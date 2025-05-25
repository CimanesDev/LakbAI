import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, Calendar, Clock, DollarSign, Plane, ArrowRight, Trash2, AlertCircle, Search, Filter, ChevronDown, ChevronUp, Heart, Sparkles, Crown, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Input } from "@/components/ui/input";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Chatbot } from '@/components/Chatbot';

type SortOption = 'newest' | 'oldest' | 'budget-high' | 'budget-low' | 'duration-long' | 'duration-short';

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  duration: number;
  budget: number;
  transportation: string[];
  interests: string[];
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [filteredItineraries, setFilteredItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTransportation, setSelectedTransportation] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isPremium = user?.user_metadata?.subscription_tier === 'Premium';

  useEffect(() => {
    if (user) {
      fetchItineraries();
      
      // Only check and update tier if not already premium
      if (user.email === 'cimanesdev@gmail.com' && user.user_metadata?.subscription_tier !== 'Premium') {
        updateUserTier();
      }
    }
  }, [user]);

  useEffect(() => {
    filterAndSortItineraries();
  }, [itineraries, searchQuery, sortBy, selectedInterests, selectedTransportation]);

  const fetchItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching itineraries:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load itineraries",
        });
      } else {
        setItineraries(data || []);
        setFilteredItineraries(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItineraries = () => {
    let filtered = [...itineraries];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(it => 
        it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply interest filters
    if (selectedInterests.length > 0) {
      filtered = filtered.filter(it =>
        selectedInterests.some(interest => it.interests.includes(interest))
      );
    }

    // Apply transportation filters
    if (selectedTransportation.length > 0) {
      filtered = filtered.filter(it =>
        selectedTransportation.some(transport => it.transportation.includes(transport))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'budget-high':
        filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case 'budget-low':
        filtered.sort((a, b) => (a.budget || 0) - (b.budget || 0));
        break;
      case 'duration-long':
        filtered.sort((a, b) => b.duration - a.duration);
        break;
      case 'duration-short':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
    }

    setFilteredItineraries(filtered);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, itineraryId: string) => {
    e.stopPropagation();
    setItineraryToDelete(itineraryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itineraryToDelete) return;

    try {
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', itineraryToDelete);

      if (error) {
        throw error;
      }

      setItineraries(prev => prev.filter(it => it.id !== itineraryToDelete));
      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete trip",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItineraryToDelete(null);
    }
  };

  // Calculate total budget and average duration
  const totalBudget = itineraries.reduce((sum, it) => sum + (it.budget || 0), 0);
  const averageDuration = itineraries.length > 0 
    ? Math.round(itineraries.reduce((sum, it) => sum + it.duration, 0) / itineraries.length)
    : 0;

  // Get unique interests and transportation options for filters
  const allInterests = Array.from(new Set(itineraries.flatMap(it => it.interests)));
  const allTransportation = Array.from(new Set(itineraries.flatMap(it => it.transportation)));

  const updateUserTier = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { subscription_tier: 'Premium' }
      });

      if (error) {
        console.error('Error updating user tier:', error);
        return;
      }

      // Force a page refresh to get the updated user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating user tier:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <Navbar user={user} onSignOut={() => signOut().then(() => navigate('/'))} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0032A0] mx-auto"></div>
            <p className="mt-4 text-[#0032A0] font-medium">Loading your adventures...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <SEO
        title="Dashboard"
        description="Plan, organize, and relive your Philippine journeys with LakbAI. View your travel itineraries, track your budget, and discover new destinations."
        keywords="Philippine travel dashboard, travel planning, itinerary management, trip tracking, budget management"
      />

      <AnimatedBackground />
      <Navbar user={user} onSignOut={() => signOut().then(() => navigate('/'))} />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section with Premium Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-[#0032A0]">Your Travel Adventures</h1>
            {isPremium ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#FED141] rounded-full" aria-label="Premium User Badge">
                <Crown className="h-5 w-5 text-[#0032A0]" />
                <span className="text-[#0032A0] font-medium">Premium</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#0032A0]/10 rounded-full" aria-label="Free User Badge">
                <span className="text-[#0032A0] font-medium">Free</span>
              </div>
            )}
          </div>
          <p className="text-lg text-[#0032A0]/80">Plan, organize, and relive your Philippine journeys</p>
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4"
            >
              <Button
                onClick={() => navigate('/#pricing')}
                className="bg-[#FED141] hover:bg-[#FED141]/90 text-[#0032A0] font-medium"
                aria-label="Upgrade to Premium"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-[#0032A0]/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#0032A0]/10 rounded-full">
                  <Plane className="h-6 w-6 text-[#0032A0]" />
                </div>
                <div>
                  <p className="text-sm text-[#0032A0]/60">Total Trips</p>
                  <p className="text-2xl font-bold text-[#0032A0]">{itineraries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-[#0032A0]/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#BF0D3E]/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-[#BF0D3E]" />
                </div>
                <div>
                  <p className="text-sm text-[#0032A0]/60">Total Budget</p>
                  <p className="text-2xl font-bold text-[#0032A0]">₱{totalBudget.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-[#0032A0]/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FED141]/10 rounded-full">
                  <Clock className="h-6 w-6 text-[#FED141]" />
                </div>
                <div>
                  <p className="text-sm text-[#0032A0]/60">Avg. Trip Duration</p>
                  <p className="text-2xl font-bold text-[#0032A0]">{averageDuration} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0032A0]/40" />
                <Input
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-[#0032A0]/20 focus:border-[#0032A0] w-full"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/80 backdrop-blur-sm border-[#0032A0]/20 hover:bg-[#0032A0]/10 text-[#0032A0]"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-[#0032A0]/20 hover:bg-[#0032A0]/10 text-[#0032A0]"
                  >
                    Sort by
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('budget-high')}>Highest Budget</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('budget-low')}>Lowest Budget</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('duration-long')}>Longest Duration</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('duration-short')}>Shortest Duration</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => navigate('/plan')}
                className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Trip
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-[#0032A0]/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-[#0032A0] mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {allInterests.map((interest) => (
                      <Button
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedInterests(prev =>
                            prev.includes(interest)
                              ? prev.filter(i => i !== interest)
                              : [...prev, interest]
                          );
                        }}
                        className={selectedInterests.includes(interest)
                          ? 'bg-[#0032A0] text-white'
                          : 'bg-white/80 backdrop-blur-sm border-[#0032A0]/20 hover:bg-[#0032A0]/10 text-[#0032A0]'
                        }
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#0032A0] mb-2">Transportation</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTransportation.map((transport) => (
                      <Button
                        key={transport}
                        variant={selectedTransportation.includes(transport) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedTransportation(prev =>
                            prev.includes(transport)
                              ? prev.filter(t => t !== transport)
                              : [...prev, transport]
                          );
                        }}
                        className={selectedTransportation.includes(transport)
                          ? 'bg-[#0032A0] text-white'
                          : 'bg-white/80 backdrop-blur-sm border-[#0032A0]/20 hover:bg-[#0032A0]/10 text-[#0032A0]'
                        }
                      >
                        {transport}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Premium Feature Lock */}
          {!isPremium && itineraries.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-[#0032A0]/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-[#0032A0]" />
                  <div>
                    <h3 className="text-[#0032A0] font-medium">Free Plan Limit Reached</h3>
                    <p className="text-sm text-[#0032A0]/70">Upgrade to Premium to create unlimited trips</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-[#FED141] hover:bg-[#FED141]/90 text-[#0032A0] font-medium"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Trip Cards Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItineraries.map((itinerary, index) => (
            <motion.div
              key={itinerary.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border-[#0032A0]/20"
                onClick={() => navigate(`/itinerary/${itinerary.id}`)}
              >
                <CardHeader className="bg-[#0032A0] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {itinerary.title}
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    {itinerary.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-[#0032A0]/70">
                      <Clock className="h-4 w-4 text-[#0032A0]" />
                      {itinerary.duration} days
                    </div>
                    {itinerary.budget && (
                      <div className="flex items-center gap-2 text-sm text-[#0032A0]/70">
                        <DollarSign className="h-4 w-4 text-[#BF0D3E]" />
                        ₱{itinerary.budget.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-[#0032A0]/70">
                      <Calendar className="h-4 w-4 text-[#FED141]" />
                      Created {formatDate(itinerary.created_at)}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {itinerary.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#BF0D3E]/10 text-[#BF0D3E] text-xs rounded-full font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                      {itinerary.interests.length > 3 && (
                        <span className="px-3 py-1 bg-[#0032A0]/10 text-[#0032A0] text-xs rounded-full font-medium">
                          +{itinerary.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#0032A0] hover:text-[#0032A0]/80 hover:bg-[#0032A0]/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/itinerary/${itinerary.id}`);
                      }}
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#BF0D3E] hover:text-[#BF0D3E]/80 hover:bg-[#BF0D3E]/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(e, itinerary.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredItineraries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="p-4 bg-[#0032A0] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-[#0032A0] mb-3">No Trips Found</h3>
            <p className="text-[#0032A0]/80 mb-8">
              {searchQuery || selectedInterests.length > 0 || selectedTransportation.length > 0
                ? "Try adjusting your filters or search terms"
                : "Start planning your next adventure!"}
            </p>
            <Button
              onClick={() => navigate('/planning')}
              className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Planning
            </Button>
          </motion.div>
        )}
      </main>

      {/* Add Chatbot */}
      <Chatbot itineraries={itineraries} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0032A0]">Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/80 backdrop-blur-sm border-[#0032A0]/20 hover:bg-[#0032A0]/10 text-[#0032A0]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-[#BF0D3E] hover:bg-[#BF0D3E]/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
