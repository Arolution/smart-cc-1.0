/**
 * CompoundEffectNivo - Compound Interest Visualization using Nivo Line Chart
 * 
 * Features:
 * - Clean comparison between compound (with reinvestment) vs linear (without reinvestment)
 * - Responsive design
 * - Dark mode compatible
 * - German/English support
 * - Smooth animations
 * - Gold/Metallic CI theme integration
 */

import { ResponsiveLine } from '@nivo/line';
import { useTranslation } from 'react-i18next';
import { useSpring, animated } from '@react-spring/web';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../styles/compound-effect.css';

interface CompoundEffectNivoProps {
  principal: number;
  rate: number; // Annual rate in percentage (e.g., 10 for 10%)
  years: number;
  monthlyContribution?: number;
}

interface DataPoint {
  x: number;
  y: number;
}

interface ChartData {
  id: string;
  data: DataPoint[];
}

const CompoundEffectNivo = ({ 
  principal, 
  rate, 
  years, 
  monthlyContribution = 0 
}: CompoundEffectNivoProps) => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    setIsVisible(true);
  }, []);

  // Calculate compound interest data (with reinvestment) - memoized for performance
  const generateCompoundData = useMemo((): DataPoint[] => {
    const points: DataPoint[] = [];
    let balance = principal;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;

    for (let month = 0; month <= totalMonths; month++) {
      points.push({ x: month / 12, y: Math.round(balance) });
      if (month < totalMonths) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
      }
    }

    return points;
  }, [principal, rate, years, monthlyContribution]);

  // Calculate linear data (without reinvestment) - memoized for performance
  const generateLinearData = useMemo((): DataPoint[] => {
    const points: DataPoint[] = [];
    const monthlyProfit = principal * (rate / 100 / 12);
    const totalMonths = years * 12;

    for (let month = 0; month <= totalMonths; month++) {
      const totalProfit = monthlyProfit * month;
      const totalContributions = monthlyContribution * month;
      const balance = principal + totalProfit + totalContributions;
      points.push({ x: month / 12, y: Math.round(balance) });
    }

    return points;
  }, [principal, rate, years, monthlyContribution]);

  const data: ChartData[] = [
    {
      id: isGerman ? 'Mit Reinvestition' : 'With Reinvestment',
      data: generateCompoundData,
    },
    {
      id: isGerman ? 'Ohne Reinvestition' : 'Without Reinvestment',
      data: generateLinearData,
    },
  ];

  // Calculate final values for stats
  const compoundFinal = generateCompoundData[generateCompoundData.length - 1].y;
  const linearFinal = generateLinearData[generateLinearData.length - 1].y;
  const difference = compoundFinal - linearFinal;
  const percentageGain = ((difference / linearFinal) * 100).toFixed(1);

  // Animated Counter - respects reduced motion preference
  const { number } = useSpring({
    number: isVisible && !prefersReducedMotion ? difference : difference,
    from: { number: prefersReducedMotion ? difference : 0 },
    config: { tension: 20, friction: 10, duration: prefersReducedMotion ? 0 : 1500 }
  });

  // Mobile optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const motionConfig = isMobile || prefersReducedMotion ? "default" : {
    mass: 1,
    tension: 170,
    friction: 26,
    clamp: false,
    precision: 0.01,
    velocity: 0
  };

  return (
    <>
      {/* Stats Cards with animated counter */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/30">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="stats-card">
            <p className="text-sm text-muted-foreground mb-1">
              {isGerman ? '💰 Zinseszins-Vorteil' : '💰 Compound Advantage'}
            </p>
            <animated.p className="text-2xl font-bold text-gold">
              {number.to((n) => 
                new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(Math.floor(n))
              )}
            </animated.p>
          </div>
          <div className="stats-card">
            <p className="text-sm text-muted-foreground mb-1">
              {isGerman ? '📈 Mehrgewinn' : '📈 Additional Gain'}
            </p>
            <p className="text-2xl font-bold text-green-600">
              +{percentageGain}%
            </p>
          </div>
          <div className="stats-card">
            <p className="text-sm text-muted-foreground mb-1">
              {isGerman ? '🎯 Endwert' : '🎯 Final Value'}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              }).format(compoundFinal)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart with reveal animation and glow effect */}
      <motion.div 
        initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 0.8,
          ease: "easeOut"
        }}
        style={{ height: '400px', width: '100%' }}
        className={prefersReducedMotion ? '' : 'compound-line-glow'}
      >
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 130, bottom: 60, left: 80 }}
          xScale={{ type: 'linear', min: 0, max: years }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
          }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isGerman ? 'Jahre' : 'Years',
            legendOffset: 45,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isGerman ? 'Wert (USD)' : 'Value (USD)',
            legendOffset: -65,
            legendPosition: 'middle',
            format: (value) =>
              new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value),
          }}
          colors={['#daa520', '#64748b']} // Gold for compound, slate for linear
          lineWidth={3}
          pointSize={6}
          pointColor={{ from: 'color', modifiers: [] }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          enableArea={true}
          areaOpacity={0.1}
          useMesh={true}
          animate={true}
          motionConfig={motionConfig}
          enableSlices="x"
          sliceTooltip={({ slice }) => (
            <div
              style={{
                background: 'var(--card)',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {isGerman ? 'Jahr' : 'Year'} {slice.points[0].data.x}
              </div>
              {slice.points.map((point) => (
                <div
                  key={point.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: point.serieColor,
                      marginRight: '8px'
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>{point.serieId}:</span>
                  <span style={{ marginLeft: '8px' }}>
                    {new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(point.data.y as number)}
                  </span>
                </div>
              ))}
            </div>
          )}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 100,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: 'currentColor',
                },
              },
              legend: {
                text: {
                  fill: 'currentColor',
                },
              },
            },
            legends: {
              text: {
                fill: 'currentColor',
              },
            },
            tooltip: {
              container: {
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                border: '1px solid var(--border)',
              },
            },
            crosshair: {
              line: {
                stroke: '#daa520',
                strokeWidth: 1,
                strokeOpacity: 0.75,
              }
            }
          }}
        />
      </motion.div>
    </>
  );
};

export default CompoundEffectNivo;
