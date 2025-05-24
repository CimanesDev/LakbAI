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
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-[#FED141] text-[#0032A0] px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Most Sulit! 🔥
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pb-6 pt-8">
        <CardTitle className={`text-2xl font-bold ${popular ? 'text-white' : 'text-[#0032A0]'}`}>
          {title}
        </CardTitle>
        <div className="mt-6">
          <span className={`text-4xl font-bold ${popular ? 'text-white' : 'text-[#0032A0]'}`}>
            {price}
          </span>
        </div>
        <p className={`mt-3 text-lg ${popular ? 'text-white/90' : 'text-[#0032A0]/70'}`}>
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg
                className={`h-5 w-5 mr-3 ${popular ? 'text-white' : 'text-[#0032A0]'}`}
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
              <span className={popular ? 'text-white/90' : 'text-[#0032A0]/70'}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
        
        <Button
          className={`w-full ${
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
