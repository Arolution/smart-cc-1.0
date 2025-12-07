import { useMemo, useState, useEffect } from 'react';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLegend,
  VictoryBar,
  VictoryGroup,
} from 'victory';
import { motion } from 'framer-motion';
import { YearlyResult } from '@/utils/calculatorEngine';

interface CompoundEffectVictoryProps {
  compoundResults: YearlyResult[];
  linearResults: YearlyResult[];
  difference: number;
  percentageGain: number;
}

const CompoundEffectVictory = ({
  compoundResults,
  linearResults,
  difference,
  percentageGain,
}: CompoundEffectVictoryProps) => {
  const [animatedDifference, setAnimatedDifference] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animate counter with spring effect
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepValue = difference / steps;
    const stepPercentage = percentageGain / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      // Add easing function for spring effect
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      setAnimatedDifference(difference * eased);
      setAnimatedPercentage(percentageGain * eased);

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedDifference(difference);
        setAnimatedPercentage(percentageGain);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [difference, percentageGain]);

  // Prepare data for Victory
  const { lineData, barData } = useMemo(() => {
    const compoundLine: { x: number; y: number; label: string }[] = [];
    const linearLine: { x: number; y: number; label: string }[] = [];
    const yearlyBars: { year: string; compound: number; linear: number }[] = [];

    let compoundTotal = 0;
    let linearTotal = 0;
    let monthIndex = 0;

    compoundResults.forEach((year, yearIdx) => {
      let yearCompoundProfit = 0;
      let yearLinearProfit = 0;

      year.months.forEach((month, monthIdx) => {
        const monthName = new Date(year.year, month.month, 1).toLocaleDateString('en-US', {
          month: 'short',
        });
        compoundTotal += month.summary.totalProfit;
        yearCompoundProfit += month.summary.totalProfit;

        compoundLine.push({
          x: monthIndex,
          y: compoundTotal,
          label: `${monthName}: $${compoundTotal.toFixed(0)}`,
        });

        monthIndex++;
      });

      // Get corresponding linear data
      if (linearResults[yearIdx]) {
        linearResults[yearIdx].months.forEach((month) => {
          linearTotal += month.summary.totalProfit;
          yearLinearProfit += month.summary.totalProfit;
        });
      }

      yearlyBars.push({
        year: year.year.toString(),
        compound: yearCompoundProfit,
        linear: yearLinearProfit,
      });
    });

    // Reset and build linear line
    linearTotal = 0;
    monthIndex = 0;
    linearResults.forEach((year) => {
      year.months.forEach((month) => {
        const monthName = new Date(year.year, month.month, 1).toLocaleDateString('en-US', {
          month: 'short',
        });
        linearTotal += month.summary.totalProfit;

        linearLine.push({
          x: monthIndex,
          y: linearTotal,
          label: `${monthName}: $${linearTotal.toFixed(0)}`,
        });

        monthIndex++;
      });
    });

    return {
      lineData: { compound: compoundLine, linear: linearLine },
      barData: yearlyBars,
    };
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/30"
        >
          <p className="text-sm text-muted-foreground mb-2">💰 Zinseszins-Vorteil</p>
          <p className="text-3xl font-bold text-emerald-500">
            +{formatCurrency(animatedDifference)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
          className="p-6 bg-gradient-to-br from-violet-500/10 to-violet-600/10 rounded-lg border border-violet-500/30"
        >
          <p className="text-sm text-muted-foreground mb-2">📈 Mehr Gewinn</p>
          <p className="text-3xl font-bold text-violet-500">
            {animatedPercentage.toFixed(1)}% mehr!
          </p>
        </motion.div>
      </div>

      {/* Area + Line Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="bg-background/50 rounded-lg p-4 border"
      >
        <h3 className="text-lg font-semibold mb-4">Kumulativer Gewinn über Zeit</h3>
        <div className="h-[400px]">
          <VictoryChart
            theme={VictoryTheme.material}
            containerComponent={
              <VictoryVoronoiContainer
                labels={({ datum }) => datum.label}
                labelComponent={<VictoryTooltip style={{ fontSize: 10 }} />}
              />
            }
            animate={{
              duration: 1500,
              onLoad: { duration: 1500 },
            }}
          >
            <VictoryLegend
              x={50}
              y={10}
              orientation="horizontal"
              gutter={20}
              style={{ labels: { fontSize: 12 } }}
              data={[
                { name: 'Mit Zinseszins', symbol: { fill: '#10b981' } },
                { name: 'Ohne Zinseszins', symbol: { fill: '#ef4444' } },
              ]}
            />

            <VictoryAxis
              style={{
                axis: { stroke: 'hsl(var(--border))' },
                tickLabels: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
              }}
              label="Monate"
            />

            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: 'hsl(var(--border))' },
                tickLabels: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
                grid: { stroke: 'hsl(var(--border))', strokeDasharray: '4, 4' },
              }}
              tickFormat={(t) => `$${(t / 1000).toFixed(0)}k`}
            />

            {/* Area for compound interest */}
            <VictoryArea
              data={lineData.compound}
              style={{
                data: {
                  fill: '#10b981',
                  fillOpacity: 0.2,
                  stroke: '#10b981',
                  strokeWidth: 0,
                },
              }}
            />

            {/* Compound line */}
            <VictoryLine
              data={lineData.compound}
              style={{
                data: {
                  stroke: '#10b981',
                  strokeWidth: 3,
                },
              }}
            />

            {/* Linear line */}
            <VictoryLine
              data={lineData.linear}
              style={{
                data: {
                  stroke: '#ef4444',
                  strokeWidth: 2,
                  strokeDasharray: '5, 5',
                },
              }}
            />
          </VictoryChart>
        </div>
      </motion.div>

      {/* Side-by-side Bar Chart for Yearly Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="bg-background/50 rounded-lg p-4 border"
      >
        <h3 className="text-lg font-semibold mb-4">Jährlicher Gewinnvergleich</h3>
        <div className="h-[300px]">
          <VictoryChart
            domainPadding={20}
            theme={VictoryTheme.material}
            animate={{
              duration: 2000,
              onLoad: { duration: 1000 },
            }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: 'hsl(var(--border))' },
                tickLabels: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' },
              }}
            />

            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: 'hsl(var(--border))' },
                tickLabels: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
                grid: { stroke: 'hsl(var(--border))', strokeDasharray: '4, 4' },
              }}
              tickFormat={(t) => `$${(t / 1000).toFixed(0)}k`}
            />

            <VictoryGroup offset={20} colorScale={['#10b981', '#ef4444']}>
              <VictoryBar
                data={barData.map((d) => ({ x: d.year, y: d.compound }))}
                labels={({ datum }) => formatCurrency(datum.y)}
                labelComponent={<VictoryTooltip />}
              />
              <VictoryBar
                data={barData.map((d) => ({ x: d.year, y: d.linear }))}
                labels={({ datum }) => formatCurrency(datum.y)}
                labelComponent={<VictoryTooltip />}
              />
            </VictoryGroup>

            <VictoryLegend
              x={50}
              y={10}
              orientation="horizontal"
              gutter={20}
              style={{ labels: { fontSize: 12 } }}
              data={[
                { name: 'Mit Zinseszins', symbol: { fill: '#10b981' } },
                { name: 'Ohne Zinseszins', symbol: { fill: '#ef4444' } },
              ]}
            />
          </VictoryChart>
        </div>
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

export default CompoundEffectVictory;
