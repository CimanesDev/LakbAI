
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

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
        ? 'border-0 bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-2xl scale-105' 
        : 'border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl'
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Most Sulit! 🔥
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pb-6 pt-8">
        <CardTitle className={`text-2xl font-bold ${popular ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </CardTitle>
        <div className="mt-6">
          <span className={`text-4xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>
            {price}
          </span>
        </div>
        <p className={`mt-3 text-lg ${popular ? 'text-emerald-50' : 'text-gray-600'}`}>
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 px-6 pb-8">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                popular ? 'text-emerald-200' : 'text-emerald-500'
              }`} />
              <span className={`${popular ? 'text-white' : 'text-gray-600'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
        
        <Button 
          className={`w-full py-3 font-semibold text-lg transition-all duration-300 ${
            popular 
              ? 'bg-white text-emerald-600 hover:bg-gray-50 hover:scale-105 shadow-lg' 
              : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
          size="lg"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};
