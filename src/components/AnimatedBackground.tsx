import React from 'react';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#0032A0] rounded-full blur-3xl animate-float-slow opacity-30"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#BF0D3E] rounded-full blur-3xl animate-float-medium opacity-30"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-[#FED141] rounded-full blur-3xl animate-float-fast opacity-30"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-[#0032A0] rounded-full blur-2xl animate-float-medium opacity-20"></div>
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-[#BF0D3E] rounded-full blur-2xl animate-float-slow opacity-20"></div>
        <div className="absolute top-2/3 right-1/3 w-40 h-40 bg-[#FED141] rounded-full blur-2xl animate-float-fast opacity-20"></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/30 to-gray-50"></div>
      </div>
    </div>
  );
}; 