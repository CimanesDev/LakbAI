import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import TripPlanningForm from "@/components/TripPlanningForm";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const Planning = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AnimatedBackground />
      <Navbar user={user} onSignOut={handleSignOut} />
      <section className="container mx-auto px-4 py-16">
        <TripPlanningForm />
      </section>
    </div>
  );
};

export default Planning; 