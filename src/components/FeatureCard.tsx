import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="group border border-[#0032A0]/20 bg-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-4 bg-[#0032A0]/5 rounded-2xl w-fit shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-110">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold text-[#0032A0] group-hover:text-[#0032A0] transition-colors duration-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-center text-[#0032A0]/70 text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};
