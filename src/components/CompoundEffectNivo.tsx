import { useMemo, useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { motion } from 'framer-motion';
import { YearlyResult } from '@/utils/calculatorEngine';

interface CompoundEffectNivoProps {
  compoundResults: YearlyResult[];
  linearResults: YearlyResult[];
  difference: number;
  percentageGain: number;
}

const CompoundEffectNivo = ({
  compoundResults,
  linearResults,
  difference,
  percentageGain,
}: CompoundEffectNivoProps) => {
  const [animatedDifference, setAnimatedDifference] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animate counter for difference
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const stepValue = difference / steps;
    const stepPercentage = percentageGain / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setAnimatedDifference(stepValue * currentStep);
      setAnimatedPercentage(stepPercentage * currentStep);

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedDifference(difference);
        setAnimatedPercentage(percentageGain);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [difference, percentageGain]);

  // Prepare data for Nivo
  const chartData = useMemo(() => {
    const compoundData: { x: string; y: number }[] = [];
    const linearData: { x: string; y: number }[] = [];

    let compoundTotal = 0;
    let linearTotal = 0;

    compoundResults.forEach((year) => {
      year.months.forEach((month) => {
        const monthName = new Date(year.year, month.month, 1).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        compoundTotal += month.summary.totalProfit;
        compoundData.push({ x: monthName, y: compoundTotal });
      });
    });

    linearResults.forEach((year) => {
      year.months.forEach((month) => {
        const monthName = new Date(year.year, month.month, 1).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        linearTotal += month.summary.totalProfit;
        linearData.push({ x: monthName, y: linearTotal });
      });
    });

    return [
      {
        id: 'Compound Interest',
        data: compoundData,
        color: '#10b981',
      },
      {
        id: 'Linear Growth',
        data: linearData,
        color: '#ef4444',
      },
    ];
  }, [compoundResults, linearResults]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Animated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/30"
        >
          <p className="text-sm text-muted-foreground mb-2">💰 Zinseszins-Vorteil</p>
          <p className="text-3xl font-bold text-green-500">
            +{formatCurrency(animatedDifference)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/30"
        >
          <p className="text-sm text-muted-foreground mb-2">📈 Mehr Gewinn</p>
          <p className="text-3xl font-bold text-blue-500">
            {animatedPercentage.toFixed(1)}% mehr!
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[400px] w-full bg-background/50 rounded-lg p-4 border"
      >
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 120, bottom: 60, left: 80 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false,
          }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Zeit',
            legendOffset: 50,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Kumulativer Gewinn',
            legendOffset: -60,
            legendPosition: 'middle',
            format: (value) => formatCurrency(value),
          }}
          enableGridX={false}
          colors={(d) => d.color || '#10b981'}
          lineWidth={3}
          pointSize={6}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          enableArea={true}
          areaOpacity={0.15}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
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
                  fill: 'hsl(var(--muted-foreground))',
                },
              },
              legend: {
                text: {
                  fill: 'hsl(var(--foreground))',
                  fontSize: 14,
                },
              },
            },
            grid: {
              line: {
                stroke: 'hsl(var(--border))',
                strokeWidth: 1,
              },
            },
            legends: {
              text: {
                fill: 'hsl(var(--foreground))',
              },
            },
            tooltip: {
              container: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                fontSize: 12,
                borderRadius: 4,
                boxShadow: '0 3px 9px rgba(0, 0, 0, 0.5)',
                padding: 8,
              },
            },
          }}
          animate={true}
          motionConfig="wobbly"
        />
      </motion.div>

      {/* Legend Info */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Mit Zinseszins (Reinvestiert)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Ohne Zinseszins (Linear)</span>
        </div>
      </div>
    </div>
  );
};

export default CompoundEffectNivo;
