/**
 * CompoundEffectElegant - Premium "Elegant" Visualization
 * 
 * Features:
 * - Liquid fill gauge for advantage display
 * - Particle trail along compound line
 * - Spotlight effect for dramatic reveal
 * - Smooth, sophisticated animations
 */

import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Liquid } from '@ant-design/plots';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import '../styles/premium-effects.css';

interface CompoundEffectElegantProps {
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

export const CompoundEffectElegant: React.FC<CompoundEffectElegantProps> = ({
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

  const finalCompound = chartData[chartData.length - 1]?.compound || 0;
  const finalLinear = chartData[chartData.length - 1]?.linear || 0;
  const difference = finalCompound - finalLinear;
  const advantagePercent = finalCompound > 0 ? (difference / finalCompound) * 100 : 0;

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const liquidConfig = {
    percent: advantagePercent / 100,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: {
      length: 128,
    },
    style: {
      fill: '#10b981',
      shadowColor: 'rgba(16, 185, 129, 0.5)',
      shadowBlur: 20,
    },
    statistic: {
      title: {
        formatter: () => 'Advantage',
        style: {
          fontSize: '14px',
          fill: 'rgba(0,0,0,0.65)',
        },
      },
      content: {
        formatter: () => `${advantagePercent.toFixed(1)}%`,
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          fill: '#10b981',
        },
      },
    },
  };

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
    <div 
      ref={containerRef} 
      className={`premium-chart-container elegant glass-card ${isVisible ? 'spotlight-reveal' : ''}`}
    >
      {/* Particle background effect */}
      {isVisible && (
        <div className="particles-container">
          <Particles
            id="elegant-particles"
            init={particlesInit}
            options={{
              particles: {
                color: { value: '#10b981' },
                number: { 
                  value: window.innerWidth < 768 ? 30 : 50,
                  density: {
                    enable: true,
                    area: 800
                  }
                },
                move: { 
                  enable: true,
                  speed: 2,
                  direction: 'right',
                  random: false,
                  straight: false,
                  outModes: {
                    default: 'out'
                  }
                },
                size: { 
                  value: 3,
                  random: true
                },
                opacity: {
                  value: 0.5,
                  random: true
                },
                links: {
                  enable: false
                }
              },
              background: {
                color: 'transparent'
              },
              fpsLimit: 60,
              interactivity: {
                events: {
                  onHover: {
                    enable: true,
                    mode: 'repulse'
                  }
                },
                modes: {
                  repulse: {
                    distance: 100,
                    duration: 0.4
                  }
                }
              }
            }}
          />
        </div>
      )}

      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#10b981' }}>
            ✨ The Elegant Difference
          </h3>
          <p className="text-sm opacity-80">
            Experience the sophisticated beauty of exponential growth
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart - takes 3 columns */}
          <div className="lg:col-span-3">
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
                    strokeDasharray="0"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Liquid Gauge - takes 1 column */}
          <div className="lg:col-span-1 flex flex-col justify-center">
            <div style={{ height: '200px' }}>
              <Liquid {...liquidConfig} />
            </div>
            <div className="text-center mt-4">
              <div className="text-sm opacity-70 mb-2">Compound Advantage</div>
              <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                ${difference.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="glass-card p-4">
            <div className="text-sm opacity-70 mb-1">Final Compound Balance</div>
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
              ${finalCompound.toLocaleString()}
            </div>
            <div className="text-xs opacity-60 mt-1">
              With {rate}% annual return over {years} years
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="text-sm opacity-70 mb-1">Final Linear Balance</div>
            <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
              ${finalLinear.toLocaleString()}
            </div>
            <div className="text-xs opacity-60 mt-1">
              Without compound interest effect
            </div>
          </div>
        </div>

        {/* Investment details */}
        <div className="mt-4 p-4 glass-card text-sm opacity-80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <span className="font-semibold">Initial Investment:</span> ${principal.toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Annual Rate:</span> {rate}%
            </div>
            <div>
              <span className="font-semibold">Time Period:</span> {years} years
            </div>
            <div>
              <span className="font-semibold">Monthly Addition:</span> ${monthlyContribution.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundEffectElegant;
