import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, MapPin, Clock, Users, Star, Menu, Heart, Camera, Coffee, Github, Linkedin, Coffee as CoffeeIcon, Sparkles } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCard } from "@/components/PricingCard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { motion } from "framer-motion";

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
      <section className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-[#0032A0] text-white rounded-full text-sm font-medium">
                  Made for Filipinos, By a Filipino
                </span>
              </div>
              
              <div className="relative">
                <h2 className="text-2xl md:text-4xl font-bold text-[#0032A0] mb-2">
                  Tara na't mag
                </h2>
                <img 
                  src="/images/hero.png" 
                  alt="LakbAI Logo" 
                  className="h-32 md:h-56 w-auto transform hover:scale-105 transition-transform duration-300 mx-auto lg:mx-0 object-contain" 
                />
              </div>
              
              <p className="text-xl md:text-2l text-[#0032A0]/70 mt-8 mb-12 leading-relaxed">
                Your AI travel buddy that knows the Philippines inside out. <br/>
                Let's turn your dream trip into reality! 
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

            {/* Right Column - Images */}
            <div className="relative w-full h-[340px] md:h-[420px] lg:h-[500px] hidden md:flex items-center justify-center">
              <img
                src="/images/5.png"
                alt="Background Layer"
                className="hidden md:block absolute left-[40%] top-[25%] w-[380px] md:w-[500px] lg:w-[800px] -translate-x-1/4 -translate-y-1/2 z-10 opacity-100 drop-shadow-2xl select-none pointer-events-none"
                aria-hidden="true"
              />
            
              <img
                src="/images/4.png"
                alt="Middle Layer"
                className="hidden md:block absolute left-[95%] top-[65%] w-56 md:w-80 lg:w-[500px] -translate-x-1/2 -translate-y-1/2 z-15 opacity-100 drop-shadow-2xl select-none pointer-events-none"
                aria-hidden="true"
              />
          
              <img
                src="/images/3.png"
                alt="Top Layer"
                className="hidden md:block absolute left-[40%] -bottom-[20%] w-40 md:w-56 lg:w-[480px] -translate-x-[65%] -translate-y-1/8 z-20 drop-shadow-2xl select-none pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <span className="inline-block px-4 py-2 bg-[#0032A0]/10 text-[#0032A0] rounded-full text-sm font-medium mb-4">
            Why LakbAI?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0032A0] mb-4 md:mb-6">
            Features Made for Travelers
          </h2>
          <p className="text-lg md:text-xl text-[#0032A0]/70 max-w-3xl mx-auto px-4">
            Not just AI - it has heart! Designed specifically for your travel style and budget.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-4 md:px-0">
          <FeatureCard
            icon={<MapPin className="h-6 w-6 md:h-8 md:w-8 text-[#0032A0]" />}
            title="Hidden Gems"
            description="Discover amazing destinations from mountains to islands. Local favorites that aren't tourist traps!"
          />
          <FeatureCard
            icon={<Clock className="h-6 w-6 md:h-8 md:w-8 text-[#0032A0]" />}
            title="Optimized Schedules"
            description="Perfect timing for everything! No rushing, no exhaustion. Everything just right."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6 md:h-8 md:w-8 text-[#0032A0]" />}
            title="Budget-Friendly Plans"
            description="Whether you're on a tight budget or splurging, we have plans for you. From backpacker to luxury trips."
          />
          <FeatureCard
            icon={<Coffee className="h-6 w-6 md:h-8 md:w-8 text-[#0032A0]" />}
            title="Local Food Spots"
            description="Not just tourist restaurants - we'll show you the hidden gems that locals love!"
          />
          <FeatureCard
            icon={<Camera className="h-6 w-6 md:h-8 md:w-8 text-[#0032A0]" />}
            title="Instagram-worthy Spots"
            description="For the photo enthusiasts! All the best spots for your social media feed."
          />
          <FeatureCard
            icon={<Heart className="h-6 w-6 md:h-8 md:w-8 text-[#0032A0]" />}
            title="Made with Love"
            description="Not just code - it has heart! Created by travelers who understand your needs."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <span className="inline-block px-4 py-2 bg-[#0032A0]/10 text-[#0032A0] rounded-full text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0032A0] mb-4 md:mb-6">
            Affordable and Worth It! 
          </h2>
          <p className="text-lg md:text-xl text-[#0032A0]/70 max-w-3xl mx-auto px-4">
            Choose what fits your budget. All plans are high-quality and worth every penny!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto px-4 md:px-0">
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
          <div className="relative">
            <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-[200px]">
              <div className="bg-[#FED141] text-[#0032A0] px-4 md:px-6 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Most Sulit! 🔥
              </div>
            </div>
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
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#0032A0] mb-4 md:mb-6">
            What Fellow Travelers Say 
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-4 md:px-0">
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
              <CardContent className="p-4 md:p-6">
                <div className="flex mb-3 md:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 md:h-5 md:w-5 text-[#FED141] fill-current" />
                  ))}
                </div>
                <p className="text-sm md:text-base text-[#0032A0]/70 mb-3 md:mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-[#0032A0] text-sm md:text-base">{testimonial.name}</p>
                  <p className="text-xs md:text-sm text-[#0032A0]/70">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002366] text-white relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center mb-4 md:mb-6">
                <img 
                  src="/images/1.png" 
                  alt="LakbAI Logo" 
                  className="h-6 md:h-8 w-auto mr-3" 
                />
              </div>
              <p className="text-sm md:text-base text-white/70 mb-4 max-w-md">
                Best AI Travel Planner for Filipinos.<br/>Made by @CimanesDev
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/cimanesdev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5 md:h-6 md:w-6" />
                </a>
                <a 
                  href="https://linkedin.com/in/cimanesdev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5 md:h-6 md:w-6" />
                </a>
                <a 
                  href="https://buymeacoffee.com/cimanesdev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <CoffeeIcon className="h-5 w-5 md:h-6 md:w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#features" className="hover:text-white transition-colors text-sm md:text-base">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors text-sm md:text-base">Pricing</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors text-sm md:text-base">Sign Up</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Support</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-white/70">
            <p className="text-sm md:text-base">&copy; 2025 LakbAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
