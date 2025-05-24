import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, Calendar, Clock, DollarSign, Plane, ArrowRight, Trash2, AlertCircle, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Input } from "@/components/ui/input";
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
import { AnimatedBackground } from "@/components/AnimatedBackground";

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

type SortOption = 'newest' | 'oldest' | 'budget-high' | 'budget-low' | 'duration-long' | 'duration-short';

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

  // Calculate total budget and remaining budget
  const totalBudget = itineraries.reduce((sum, it) => sum + (it.budget || 0), 0);
  const totalSpent = itineraries.reduce((sum, it) => {
    return sum + ((it.budget || 0) * 0.3);
  }, 0);
  const remainingBudget = totalBudget - totalSpent;

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

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AnimatedBackground />
      
      <Navbar user={user} onSignOut={handleSignOut} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold text-[#0032A0]">
                Welcome back, {user?.user_metadata?.full_name || 'Traveler'} 👋
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#0032A0]/10 text-[#0032A0] text-sm rounded-full font-medium">
                  {user?.user_metadata?.subscription_tier || 'Free'} Tier
                </span>
                {(!user?.user_metadata?.subscription_tier || user?.user_metadata?.subscription_tier === 'Free') && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[#0032A0] text-[#0032A0] hover:bg-[#0032A0] hover:text-white transition-colors"
                    onClick={() => navigate('/pricing')}
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-[#0032A0]/70">
              Manage your travel itineraries and plan your next adventure
            </p>
          </div>
          <Button 
            onClick={() => navigate('/planning')} 
            className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white px-6 py-2 text-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Plan New Trip
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0032A0]/50" />
              <Input
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-[300px] border-[#0032A0]/20 focus:border-[#0032A0]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-[#0032A0]/20 text-[#0032A0] hover:bg-[#0032A0]/10">
                  Sort by
                  <ChevronDown className="h-4 w-4" />
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
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 border-[#0032A0]/20 text-[#0032A0] hover:bg-[#0032A0]/10"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="max-w-7xl mx-auto mb-8 bg-white border border-[#0032A0]/20 shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-[#0032A0]">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {allInterests.map((interest) => (
                      <Button
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedInterests(prev =>
                          prev.includes(interest)
                            ? prev.filter(i => i !== interest)
                            : [...prev, interest]
                        )}
                        className={selectedInterests.includes(interest)
                          ? 'bg-[#0032A0] text-white'
                          : 'hover:bg-[#0032A0]/10 text-[#0032A0] border-[#0032A0]'
                        }
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-[#0032A0]">Transportation</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTransportation.map((transport) => (
                      <Button
                        key={transport}
                        variant={selectedTransportation.includes(transport) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTransportation(prev =>
                          prev.includes(transport)
                            ? prev.filter(t => t !== transport)
                            : [...prev, transport]
                        )}
                        className={selectedTransportation.includes(transport)
                          ? 'bg-[#0032A0] text-white'
                          : 'hover:bg-[#0032A0]/10 text-[#0032A0] border-[#0032A0]'
                        }
                      >
                        {transport}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0032A0] mx-auto"></div>
            <p className="mt-4 text-[#0032A0]/70">Loading your trips...</p>
          </div>
        ) : filteredItineraries.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center py-12 bg-white border border-[#0032A0]/20 shadow-xl">
            <CardContent>
              <div className="p-4 bg-[#0032A0] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Plane className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#0032A0] mb-3">
                {itineraries.length === 0 ? "No trips yet" : "No trips match your filters"}
              </h3>
              <p className="text-[#0032A0]/70 mb-8 text-lg">
                {itineraries.length === 0 
                  ? "Start planning your first adventure with LakbAI"
                  : "Try adjusting your search or filters"}
              </p>
              <Button 
                onClick={() => navigate('/planning')}
                className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white px-8 py-6 text-lg"
              >
                Plan Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Budget Tracker */}
              <Card className="lg:col-span-1 bg-white border border-[#0032A0]/20 shadow-xl h-fit">
                <CardHeader className="bg-[#0032A0] text-white rounded-t-lg py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-4 w-4" />
                        Budget Overview
                      </CardTitle>
                      <CardDescription className="text-white/90 text-sm">
                        Track your travel expenses
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₱{totalBudget.toLocaleString()}</p>
                      <p className="text-sm text-white/90">Total Budget</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-[#BF0D3E]/5 rounded-lg">
                      <h3 className="text-sm font-medium text-[#0032A0] mb-1">Spent</h3>
                      <p className="text-xl font-bold text-[#BF0D3E]">₱{totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-[#FED141]/5 rounded-lg">
                      <h3 className="text-sm font-medium text-[#0032A0] mb-1">Remaining</h3>
                      <p className="text-xl font-bold text-[#FED141]">₱{remainingBudget.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-[#0032A0]/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0032A0] transition-all duration-500"
                      style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Trips Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredItineraries.map((itinerary) => (
                    <Card 
                      key={itinerary.id} 
                      className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer bg-white border border-[#0032A0]/20"
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

                        <div className="mt-6 flex justify-between items-center">
                          <Button 
                            variant="ghost" 
                            className="group-hover:text-[#0032A0] transition-colors"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#BF0D3E] hover:text-[#BF0D3E] hover:bg-[#BF0D3E]/10"
                            onClick={(e) => handleDeleteClick(e, itinerary.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#0032A0]">Delete Trip</AlertDialogTitle>
              <AlertDialogDescription className="text-[#0032A0]/70">
                Are you sure you want to delete this trip? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#0032A0]/20 text-[#0032A0] hover:bg-[#0032A0]/10">Cancel</AlertDialogCancel>
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
    </div>
  );
};

export default Dashboard;
