import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, MapPin, Clock, Users, Star, Menu, Heart, Camera, Coffee } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCard } from "@/components/PricingCard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAuthAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <Navbar user={user} onSignOut={handleSignOut} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full text-sm font-medium mb-6">
              Made for Travelers, By Travelers
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Smart{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600">
              Travel Plans
            </span>
            <br />
            For Every Traveler
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-powered, perfect for your budget and preferences. From mountains to beaches, 
            let's plan your perfect trip! 🏖️✈️
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              onClick={() => navigate('/planning')}
            >
              <Plane className="mr-3 h-6 w-6" />
              Start Planning
            </Button>
            {!user && (
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-all duration-300" 
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Trusted by 10K+ travelers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.9/5 rating from reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white/60 backdrop-blur-sm rounded-3xl my-12 shadow-lg">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium mb-4">
            Why LakbAI?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Features Made for Travelers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Not just AI - it has heart! Designed specifically for your travel style and budget.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MapPin className="h-8 w-8 text-emerald-600" />}
            title="Hidden Gems"
            description="Discover amazing destinations from mountains to islands. Local favorites that aren't tourist traps!"
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8 text-blue-600" />}
            title="Optimized Schedules"
            description="Perfect timing for everything! No rushing, no exhaustion. Everything just right."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-purple-600" />}
            title="Budget-Friendly Plans"
            description="Whether you're on a tight budget or splurging, we have plans for you. From backpacker to luxury trips."
          />
          <FeatureCard
            icon={<Coffee className="h-8 w-8 text-amber-600" />}
            title="Local Food Spots"
            description="Not just tourist restaurants - we'll show you the hidden gems that locals love!"
          />
          <FeatureCard
            icon={<Camera className="h-8 w-8 text-pink-600" />}
            title="Instagram-worthy Spots"
            description="For the photo enthusiasts! All the best spots for your social media feed."
          />
          <FeatureCard
            icon={<Heart className="h-8 w-8 text-red-600" />}
            title="Made with Love"
            description="Not just code - it has heart! Created by travelers who understand your needs."
          />
        </div>
      </section>

      {/* Popular Destinations Showcase */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Popular Destinations 🏝️
          </h2>
          <p className="text-xl text-gray-600">
            These are the most recommended destinations by fellow travelers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Boracay", emoji: "🏖️", desc: "White beach paradise" },
            { name: "Palawan", emoji: "🐠", desc: "Underground river magic" },
            { name: "Baguio", emoji: "🌲", desc: "Cool mountain vibes" },
            { name: "Siargao", emoji: "🏄‍♂️", desc: "Surfing capital" },
            { name: "Bohol", emoji: "🐒", desc: "Chocolate Hills wonder" },
            { name: "Vigan", emoji: "🏛️", desc: "Heritage city charm" },
            { name: "Cebu", emoji: "🎭", desc: "Queen City adventures" },
            { name: "Camiguin", emoji: "🌋", desc: "Island born of fire" }
          ].map((dest, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{dest.emoji}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{dest.name}</h3>
                <p className="text-gray-600 text-sm">{dest.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl my-12">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Affordable and Worth It! 💸
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose what fits your budget. All plans are high-quality and worth every penny!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            title="Basic Plan"
            price="FREE"
            description="Perfect for first-time users"
            features={[
              "3 trips per month",
              "Basic recommendations",
              "Standard destinations",
              "Email support"
            ]}
            buttonText="Try Now"
            popular={false}
          />
          <PricingCard
            title="Premium Pack"
            price="₱299/month"
            description="Most popular choice"
            features={[
              "Unlimited trips",
              "Advanced AI recommendations",
              "Hidden gems inclusion",
              "Priority support",
              "Offline access",
              "Local food recommendations"
            ]}
            buttonText="Start Free Trial"
            popular={true}
          />
          <PricingCard
            title="VIP Traveler"
            price="₱599/month"
            description="For serious travel addicts"
            features={[
              "Everything in Premium Pack",
              "Real-time updates",
              "Group trip planning",
              "24/7 concierge support",
              "Custom itinerary requests",
              "Direct contact with local guides"
            ]}
            buttonText="Contact Sales"
            popular={false}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Fellow Travelers Say 💬
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Maria Santos",
              location: "Manila",
              text: "Amazing! Our trip to Palawan was perfect. All recommendations were spot-on!",
              rating: 5
            },
            {
              name: "Juan dela Cruz",
              location: "Cebu",
              text: "As a frequent traveler, the AI suggestions are super helpful. Planning trips is now a breeze.",
              rating: 5
            },
            {
              name: "Anna Reyes",
              location: "Davao",
              text: "Perfect for budget travelers like me. Saved a lot without compromising on experiences!",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <Plane className="h-8 w-8 text-emerald-400 mr-3" />
                <span className="text-2xl font-bold">LakbAI</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Ang pinaka-sulit na AI travel planner para sa mga Pinoy. 
                Gawa namin ito with love para sa mga kapwa adventure seekers! 🇵🇭
              </p>
              <div className="flex gap-4">
                <span className="text-2xl">🇵🇭</span>
                <span className="text-2xl">✈️</span>
                <span className="text-2xl">❤️</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                <li><a href="/auth" className="hover:text-emerald-400 transition-colors">Sign Up</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LakbAI. All rights reserved. Made with 💚 for Filipino travelers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
