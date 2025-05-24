import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: any;
  onSignOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-50 border-b border-[#0032A0]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-[#0032A0]/10 p-0"
            >
              <img src="/images/1.png" alt="LakbAI Logo" className="h-12 w-auto" />
            </Button>
          </div>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[#0032A0]/70 text-sm hidden sm:block">
                Hello, <span className="font-semibold text-[#0032A0]">{user.user_metadata.full_name}</span>! 👋
              </span>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/planning')}
                className="flex items-center gap-2 hover:bg-[#0032A0]/10 hover:text-[#0032A0] transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Plan Trip
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 hover:bg-[#0032A0]/10 hover:text-[#0032A0] transition-colors"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={onSignOut} 
                className="flex items-center gap-2 border-[#0032A0]/20 text-[#0032A0] hover:bg-[#0032A0]/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/planning')}
                className="flex items-center gap-2 hover:bg-[#0032A0]/10 hover:text-[#0032A0] transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Plan Trip
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="hover:bg-[#0032A0]/10 hover:text-[#0032A0]"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
