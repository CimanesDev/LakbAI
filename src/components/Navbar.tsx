import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Calendar, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: any;
  onSignOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

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
              <img 
                src="/images/1.png" 
                alt="LakbAI Logo" 
                className="h-12 w-auto object-contain" 
              />
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-[#0032A0]" />
            ) : (
              <Menu className="h-6 w-6 text-[#0032A0]" />
            )}
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-[#0032A0]/70 text-sm">
                  Hello, <span className="font-semibold text-[#0032A0]">{user.user_metadata.full_name}</span>! 👋
                </span>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/planning')}
                  className="flex items-center gap-2 hover:bg-[#0032A0]/10 hover:text-[#0032A0] transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Plan Trip
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/dashboard')}
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
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/planning')}
                  className="flex items-center gap-2 hover:bg-[#0032A0]/10 hover:text-[#0032A0] transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Plan Trip
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/auth')}
                  className="hover:bg-[#0032A0]/10 hover:text-[#0032A0]"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => handleNavigation('/auth')}
                  className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#0032A0]/20">
            {user ? (
              <div className="flex flex-col gap-3">
                <span className="text-[#0032A0]/70 text-sm px-2">
                  Hello, <span className="font-semibold text-[#0032A0]">{user.user_metadata.full_name}</span>! 👋
                </span>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/planning')}
                  className="flex items-center gap-2 hover:bg-[#0032A0]/10 hover:text-[#0032A0] transition-colors justify-start"
                >
                  <Calendar className="h-4 w-4" />
                  Plan Trip
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/dashboard')}
                  className="flex items-center gap-2 hover:bg-[#0032A0]/10 hover:text-[#0032A0] transition-colors justify-start"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onSignOut} 
                  className="flex items-center gap-2 border-[#0032A0]/20 text-[#0032A0] hover:bg-[#0032A0]/10 justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/planning')}
                  className="flex items-center gap-2 hover:bg-[#0032A0]/10 hover:text-[#0032A0] transition-colors justify-start"
                >
                  <Calendar className="h-4 w-4" />
                  Plan Trip
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/auth')}
                  className="hover:bg-[#0032A0]/10 hover:text-[#0032A0] justify-start"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => handleNavigation('/auth')}
                  className="bg-[#0032A0] hover:bg-[#0032A0]/90 text-white justify-start"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
