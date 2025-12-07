/**
 * CompoundEffectExplosive - Premium "Explosive" Visualization
 * 
 * Features:
 * - Shockwave reveal with motion animation
 * - Fireworks effect for large differences (>$10k)
 * - 3D bar extrusion effect for difference display
 * - High-energy visual presentation
 */

import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { Fireworks } from '@fireworks-js/react';
import '../styles/premium-effects.css';

interface CompoundEffectExplosiveProps {
  principal?: number;
  rate?: number;
  years?: number;
  monthlyContribution?: number;
}

interface ChartDataPoint {
  year: number;
  compound: number;
  linear: number;
  difference: number;
}

export const CompoundEffectExplosive: React.FC<CompoundEffectExplosiveProps> = ({
  principal = 10000,
  rate = 7,
  years = 30,
  monthlyContribution = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate compound vs linear growth
  useEffect(() => {
    const data: ChartDataPoint[] = [];
    let compoundBalance = principal;
    let linearBalance = principal;
    const monthlyRate = rate / 100 / 12;

    for (let year = 0; year <= years; year++) {
      const compound = Math.round(compoundBalance * 100) / 100;
      const linear = Math.round(linearBalance * 100) / 100;
      
      data.push({
        year,
        compound,
        linear,
        difference: compound - linear
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

  const finalCompound = chartData[chartData.length - 1]?.compound || 0;
  const finalLinear = chartData[chartData.length - 1]?.linear || 0;
  const difference = finalCompound - finalLinear;

  // Show fireworks if difference is large
  useEffect(() => {
    if (isVisible && difference > 10000) {
      // Check if user prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (!prefersReducedMotion) {
        setShowFireworks(true);
        const timer = setTimeout(() => setShowFireworks(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, difference]);

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
            💥 Difference: ${(payload[0].value - payload[1].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const DifferenceTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: ChartDataPoint }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-2 text-xs">
          <p>Year {payload[0].payload.year}</p>
          <p className="font-bold" style={{ color: '#10b981' }}>
            +${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className="premium-chart-container explosive glass-card">
      {/* Fireworks effect for large differences */}
      {showFireworks && (
        <Fireworks
          options={{
            rocketsPoint: {
              min: 0,
              max: 100
            },
            hue: {
              min: 150,
              max: 170
            },
            brightness: {
              min: 50,
              max: 80
            },
            speed: 3
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5
          }}
        />
      )}

      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#10b981' }}>
            💥 The Explosive Advantage
          </h3>
          <p className="text-sm opacity-80">
            Witness the explosive power of compound interest in action
          </p>
        </div>

        {/* Main chart with shockwave animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isVisible ? { scale: 1 } : { scale: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
          className="shockwave-container"
        >
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
                  strokeWidth={4}
                  name="💥 Compound Growth"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3D-style difference bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6"
        >
          <h4 className="text-lg font-semibold mb-3" style={{ color: '#10b981' }}>
            💸 Yearly Advantage Growth
          </h4>
          <div className="relative" style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.filter((_, i) => i % Math.ceil(years / 10) === 0)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="year" />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<DifferenceTooltip />} />
                <Bar 
                  dataKey="difference" 
                  fill="#10b981"
                  className="bar-3d"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Explosive stats display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        >
          <div className="glass-card p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="text-sm opacity-70 mb-1">🚀 Final Compound</div>
              <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                ${finalCompound.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="text-sm opacity-70 mb-1">📊 Final Linear</div>
              <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                ${finalLinear.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="text-sm opacity-70 mb-1">💥 Explosive Gain</div>
              <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                ${difference.toLocaleString()}
              </div>
              {difference > 10000 && (
                <div className="text-xs mt-1 font-bold animate-pulse">
                  🎆 FIREWORKS ACTIVATED!
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Investment details */}
        <div className="mt-4 p-4 glass-card text-sm opacity-80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <span className="font-semibold">💰 Initial:</span> ${principal.toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">📈 Rate:</span> {rate}%
            </div>
            <div>
              <span className="font-semibold">⏱️ Period:</span> {years} years
            </div>
            <div>
              <span className="font-semibold">💵 Monthly:</span> ${monthlyContribution.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundEffectExplosive;
