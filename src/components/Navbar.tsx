import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Plane, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: any;
  onSignOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              LakbAI
            </span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm hidden sm:block">
                Hello, <span className="font-semibold text-emerald-600">{user.user_metadata.full_name}</span>! 👋
              </span>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/planning')}
                className="flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Plan Trip
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={onSignOut} 
                className="flex items-center gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
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
                className="flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Plan Trip
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="hover:bg-emerald-50 hover:text-emerald-600"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
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
