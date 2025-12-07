import { useEffect, useState } from 'react';
import logo from '@/assets/logo.png';

interface CalculatingAnimationProps {
  isCalculating: boolean;
}

const CalculatingAnimation = ({ isCalculating }: CalculatingAnimationProps) => {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isCalculating) {
      setVisible(true);
      const pulseInterval = setInterval(() => {
        setPulse(prev => !prev);
      }, 600);
      return () => clearInterval(pulseInterval);
    } else {
      // Fade out animation
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isCalculating]);

  if (!visible && !isCalculating) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
        isCalculating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo with pulsing animation */}
        <div 
          className={`relative transition-all duration-500 ${
            pulse ? 'scale-110 drop-shadow-[0_0_30px_hsl(45,100%,51%)]' : 'scale-100 drop-shadow-[0_0_10px_hsl(45,100%,51%)]'
          }`}
        >
          {/* Outer glow ring */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              pulse ? 'scale-150 opacity-0' : 'scale-100 opacity-50'
            }`}
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 51% / 0.4) 0%, transparent 70%)',
            }}
          />
          
          {/* Inner glow ring */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              pulse ? 'scale-125 opacity-30' : 'scale-100 opacity-60'
            }`}
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 51% / 0.6) 0%, transparent 60%)',
            }}
          />
          
          {/* Logo */}
          <img 
            src={logo} 
            alt="Loading" 
            className="w-32 h-32 object-contain relative z-10"
            style={{
              filter: `drop-shadow(0 0 ${pulse ? '20px' : '10px'} hsl(45 100% 51% / 0.8))`,
            }}
          />
          
          {/* Rotating ring */}
          <div 
            className="absolute inset-[-10px] rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: 'hsl(45 100% 51%)',
              borderRightColor: 'hsl(45 100% 51% / 0.3)',
              animationDuration: '1.5s',
            }}
          />
          
          {/* Counter-rotating ring */}
          <div 
            className="absolute inset-[-20px] rounded-full border border-transparent"
            style={{
              borderBottomColor: 'hsl(45 100% 51% / 0.5)',
              borderLeftColor: 'hsl(45 100% 51% / 0.2)',
              animation: 'spin 2s linear infinite reverse',
            }}
          />
        </div>
        
        {/* Text */}
        <div className="text-center">
          <p className="text-xl font-semibold text-gold animate-pulse">
            Berechnung läuft...
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Simulation wird durchgeführt
          </p>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gold"
              style={{
                animation: `pulse 1s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculatingAnimation;