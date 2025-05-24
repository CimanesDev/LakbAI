
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="group border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/90">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl w-fit shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-110">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};
