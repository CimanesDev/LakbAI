import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

export const PricingCard = ({ title, price, description, features, buttonText, popular = false }: PricingCardProps) => {
  return (
    <Card className={`relative group transition-all duration-500 hover:scale-105 ${
      popular 
        ? 'border-0 bg-[#0032A0] text-white shadow-2xl scale-105' 
        : 'border border-[#0032A0]/20 bg-gray-100 hover:shadow-2xl'
    }`}>
      {popular && (
        <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-[#FED141] text-[#0032A0] px-4 md:px-6 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center shadow-lg">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Most Sulit! 🔥
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pb-4 md:pb-6 pt-6 md:pt-8">
        <CardTitle className={`text-xl md:text-2xl font-bold ${popular ? 'text-white' : 'text-[#0032A0]'}`}>
          {title}
        </CardTitle>
        <div className="mt-4 md:mt-6">
          <span className={`text-3xl md:text-4xl font-bold ${popular ? 'text-white' : 'text-[#0032A0]'}`}>
            {price}
          </span>
        </div>
        <p className={`mt-2 md:mt-3 text-base md:text-lg ${popular ? 'text-white/90' : 'text-[#0032A0]/70'}`}>
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="px-4 md:px-6">
        <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg
                className={`h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 ${popular ? 'text-white' : 'text-[#0032A0]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className={`text-sm md:text-base ${popular ? 'text-white/90' : 'text-[#0032A0]/70'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
        
        <Button
          className={`w-full text-sm md:text-base ${
            popular
              ? 'bg-white text-[#0032A0] hover:bg-white/90'
              : 'bg-[#0032A0] text-white hover:bg-[#0032A0]/90'
          }`}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};
