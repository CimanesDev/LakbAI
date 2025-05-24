import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, MapPin, Clock, Users, Star, Menu, Heart, Camera, Coffee, Github, Linkedin, Coffee as CoffeeIcon } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCard } from "@/components/PricingCard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";

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
    <div className="min-h-screen bg-gray-50 relative">
      <AnimatedBackground />

      {/* Navigation */}
      <Navbar user={user} onSignOut={handleSignOut} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center relative z-10">
        <div className="max-w-5xl mx-auto relative">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-[#0032A0] text-white rounded-full text-sm font-medium">
              Made for Filipinos, By a Filipino
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-bold text-[#0032A0] mb-2">
                Tara na't mag
              </h2>
              <img 
                src="/images/1.png" 
                alt="LakbAI Logo" 
                className="h-40 md:h-56 w-auto transform hover:scale-105 transition-transform duration-300" 
              />
            </div>
            
            <p className="text-xl md:text-2xl text-[#0032A0]/70 mt-8 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your AI travel buddy that knows the Philippines inside out. <br/>
              Let's turn your dream trip into reality! 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-[#0032A0] hover:bg-[#0032A0]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                onClick={() => navigate('/planning')}
              >
                <Plane className="mr-3 h-6 w-6" />
                Start Planning
              </Button>
              {!user && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-6 border-2 border-[#0032A0] text-[#0032A0] hover:bg-[#0032A0]/10 transition-all duration-300" 
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#0032A0]/10 text-[#0032A0] rounded-full text-sm font-medium mb-4">
            Why LakbAI?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0032A0] mb-6">
            Features Made for Travelers
          </h2>
          <p className="text-xl text-[#0032A0]/70 max-w-3xl mx-auto">
            Not just AI - it has heart! Designed specifically for your travel style and budget.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MapPin className="h-8 w-8 text-[#0032A0]" />}
            title="Hidden Gems"
            description="Discover amazing destinations from mountains to islands. Local favorites that aren't tourist traps!"
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8 text-[#0032A0]" />}
            title="Optimized Schedules"
            description="Perfect timing for everything! No rushing, no exhaustion. Everything just right."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-[#0032A0]" />}
            title="Budget-Friendly Plans"
            description="Whether you're on a tight budget or splurging, we have plans for you. From backpacker to luxury trips."
          />
          <FeatureCard
            icon={<Coffee className="h-8 w-8 text-[#0032A0]" />}
            title="Local Food Spots"
            description="Not just tourist restaurants - we'll show you the hidden gems that locals love!"
          />
          <FeatureCard
            icon={<Camera className="h-8 w-8 text-[#0032A0]" />}
            title="Instagram-worthy Spots"
            description="For the photo enthusiasts! All the best spots for your social media feed."
          />
          <FeatureCard
            icon={<Heart className="h-8 w-8 text-[#0032A0]" />}
            title="Made with Love"
            description="Not just code - it has heart! Created by travelers who understand your needs."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#0032A0]/10 text-[#0032A0] rounded-full text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0032A0] mb-6">
            Affordable and Worth It! 
          </h2>
          <p className="text-xl text-[#0032A0]/70 max-w-3xl mx-auto">
            Choose what fits your budget. All plans are high-quality and worth every penny!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Basic Plan"
            price="FREE"
            description="Perfect for first-time users"
            features={[
              "1 Itinerary per day",
              "3 max trips on dashboard",
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
              "Local food recommendations"
            ]}
            buttonText="Start Free Trial"
            popular={true}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0032A0] mb-6">
            What Fellow Travelers Say 
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Albert Caro",
              location: "Manila",
              text: "Amazing! Our trip to Palawan was perfect. All recommendations were spot-on!",
              rating: 5
            },
            {
              name: "Rizamae Obias",
              location: "Bicol",
              text: "As a frequent traveler, the AI suggestions are super helpful. Planning trips is now a breeze.",
              rating: 5
            },
            {
              name: "Dale De Guzman",
              location: "Batangas",
              text: "Perfect for budget travelers like me. Saved a lot without compromising on experiences!",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="border border-[#0032A0]/20 bg-white">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#FED141] fill-current" />
                  ))}
                </div>
                <p className="text-[#0032A0]/70 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-[#0032A0]">{testimonial.name}</p>
                  <p className="text-sm text-[#0032A0]/70">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002366] text-white relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <img 
                  src="/images/1.png" 
                  alt="LakbAI Logo" 
                  className="h-8 w-auto mr-3" 
                />
              </div>
              <p className="text-white/70 mb-4 max-w-md">
                Best AI Travel Planner for Filipinos.<br/>Made by @CimanesDev
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/cimanesdev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Github className="h-6 w-6" />
                </a>
                <a 
                  href="https://linkedin.com/in/cimanesdev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
                <a 
                  href="https://buymeacoffee.com/cimanesdev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <CoffeeIcon className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors">Sign Up</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/70">
            <p>&copy; 2025 LakbAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
