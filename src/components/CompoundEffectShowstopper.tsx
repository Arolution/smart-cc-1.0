/**
 * CompoundEffectShowstopper - Premium "Showstopper" Visualization
 * 
 * Features:
 * - Neon glow pulse effect on compound interest line
 * - Confetti explosion on chart reveal
 * - Morphing numbers with spring animation
 * - Glassmorphism card container
 */

import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSpring, animated } from '@react-spring/web';
import confetti from 'canvas-confetti';
import { formatCurrency } from '@/utils/formatters';
import '../styles/premium-effects.css';

interface CompoundEffectShowstopperProps {
  principal?: number;
  rate?: number;
  years?: number;
  monthlyContribution?: number;
}

interface ChartDataPoint {
  year: number;
  compound: number;
  linear: number;
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const { number } = useSpring({
    number: value,
    from: { number: 0 },
    config: { tension: 20, friction: 10 }
  });

  return (
    <animated.span className="number-morph">
      {number.to((n) => formatCurrency(n))}
    </animated.span>
  );
};

export const CompoundEffectShowstopper: React.FC<CompoundEffectShowstopperProps> = ({
  principal = 10000,
  rate = 7,
  years = 30,
  monthlyContribution = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate compound vs linear growth
  useEffect(() => {
    const data: ChartDataPoint[] = [];
    let compoundBalance = principal;
    let linearBalance = principal;
    const monthlyRate = rate / 100 / 12;

    for (let year = 0; year <= years; year++) {
      data.push({
        year,
        compound: Math.round(compoundBalance * 100) / 100,
        linear: Math.round(linearBalance * 100) / 100
      });

      // Calculate next year
      for (let month = 0; month < 12; month++) {
        compoundBalance = compoundBalance * (1 + monthlyRate) + monthlyContribution;
        linearBalance = linearBalance + (principal * (rate / 100 / 12)) + monthlyContribution;
      }
    }

    setChartData(data);
  }, [principal, rate, years, monthlyContribution]);

  // Intersection Observer for visibility detection
  useEffect(() => {
    const currentRef = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible]);

  // Confetti effect when visible
  useEffect(() => {
    if (isVisible && chartData.length > 0) {
      // Check if user prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (!prefersReducedMotion) {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const colors = ['#10b981', '#22c55e', '#86efac'];

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: colors
          });

          if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
          }
        };

        frame();
      }
    }
  }, [isVisible, chartData]);

  const finalCompound = chartData[chartData.length - 1]?.compound || 0;
  const finalLinear = chartData[chartData.length - 1]?.linear || 0;
  const difference = finalCompound - finalLinear;
  const percentageGain = finalLinear > 0 ? ((difference / finalLinear) * 100) : 0;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: ChartDataPoint }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-semibold mb-1">Year {payload[0].payload.year}</p>
          <p style={{ color: '#10b981' }}>
            Compound: ${payload[0].value.toLocaleString()}
          </p>
          <p style={{ color: '#ef4444' }}>
            Linear: ${payload[1].value.toLocaleString()}
          </p>
          <p className="font-bold mt-1">
            Difference: ${(payload[0].value - payload[1].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className="premium-chart-container showstopper glass-card">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#10b981' }}>
          🎆 The Showstopper Effect
        </h3>
        <p className="text-sm opacity-80">
          Watch the magic of compound interest unfold with spectacular visual effects
        </p>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="linear" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Linear Growth"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="compound" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Compound Growth"
              dot={false}
              className="compound-line-glow"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats with animated numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="glass-card p-4 text-center">
          <div className="text-sm opacity-70 mb-1">Final Compound Balance</div>
          <div className="text-xl font-bold" style={{ color: '#10b981' }}>
            <AnimatedNumber value={finalCompound} />
          </div>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="text-sm opacity-70 mb-1">Final Linear Balance</div>
          <div className="text-xl font-bold" style={{ color: '#ef4444' }}>
            <AnimatedNumber value={finalLinear} />
          </div>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="text-sm opacity-70 mb-1">Compound Advantage</div>
          <div className="text-xl font-bold" style={{ color: '#10b981' }}>
            <AnimatedNumber value={difference} />
          </div>
          <div className="text-xs opacity-70 mt-1">
            (+{percentageGain.toFixed(1)}% more)
          </div>
        </div>
      </div>

      {/* Investment details */}
      <div className="mt-4 p-4 glass-card text-sm opacity-80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <span className="font-semibold">Initial:</span> ${principal.toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Rate:</span> {rate}%
          </div>
          <div>
            <span className="font-semibold">Period:</span> {years} years
          </div>
          <div>
            <span className="font-semibold">Monthly:</span> ${monthlyContribution.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundEffectShowstopper;
