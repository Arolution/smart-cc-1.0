import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import * as d3 from 'd3';
import { YearlyResult } from '@/utils/calculatorEngine';

interface CompoundEffectD3Props {
  compoundResults: YearlyResult[];
  linearResults: YearlyResult[];
  difference: number;
  percentageGain: number;
}

const CompoundEffectD3 = ({
  compoundResults,
  linearResults,
  difference,
  percentageGain,
}: CompoundEffectD3Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animatedDifference, setAnimatedDifference] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
  } | null>(null);
  const controls = useAnimation();

  // Animate counter with morphing effect
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      // Smooth easing
      const progress = currentStep / steps;
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

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

  // Prepare data and draw D3 chart
  const chartData = useMemo(() => {
    const compoundData: { month: number; value: number; label: string }[] = [];
    const linearData: { month: number; value: number; label: string }[] = [];

    let compoundTotal = 0;
    let linearTotal = 0;
    let monthIndex = 0;

    compoundResults.forEach((year) => {
      year.months.forEach((month) => {
        const monthName = new Date(year.year, month.month, 1).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        compoundTotal += month.summary.totalProfit;
        compoundData.push({
          month: monthIndex,
          value: compoundTotal,
          label: `${monthName}: $${compoundTotal.toFixed(0)}`,
        });
        monthIndex++;
      });
    });

    monthIndex = 0;
    linearResults.forEach((year) => {
      year.months.forEach((month) => {
        const monthName = new Date(year.year, month.month, 1).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        linearTotal += month.summary.totalProfit;
        linearData.push({
          month: monthIndex,
          value: linearTotal,
          label: `${monthName}: $${linearTotal.toFixed(0)}`,
        });
        monthIndex++;
      });
    });

    return { compound: compoundData, linear: linearData };
  }, [compoundResults, linearResults]);

  // Draw D3 chart
  useEffect(() => {
    if (!svgRef.current || chartData.compound.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, chartData.compound.length - 1])
      .range([0, innerWidth]);

    const yMax = Math.max(
      d3.max(chartData.compound, (d) => d.value) || 0,
      d3.max(chartData.linear, (d) => d.value) || 0
    );

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-width', 1);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(12, chartData.compound.length))
      .tickFormat((d) => `M${(d as number) + 1}`);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `$${(d as number / 1000).toFixed(0)}k`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'hsl(var(--muted-foreground))');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', 'hsl(var(--muted-foreground))');

    // Area for compound (gradient fill)
    const area = d3
      .area<{ month: number; value: number }>()
      .x((d) => xScale(d.month))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.3);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0);

    g.append('path')
      .datum(chartData.compound)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Line generator
    const line = d3
      .line<{ month: number; value: number }>()
      .x((d) => xScale(d.month))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Compound line with glow effect
    const compoundPath = g
      .append('path')
      .datum(chartData.compound)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)')
      .attr('d', line);

    // Add glow filter
    const filter = defs.append('filter').attr('id', 'glow');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Animate path drawing
    const pathLength = compoundPath.node()?.getTotalLength() || 0;
    compoundPath
      .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Linear line (dashed)
    const linearPath = g
      .append('path')
      .datum(chartData.linear)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', line);

    // Animate linear path
    const linearPathLength = linearPath.node()?.getTotalLength() || 0;
    linearPath
      .attr('stroke-dasharray', `${linearPathLength} ${linearPathLength}`)
      .attr('stroke-dashoffset', linearPathLength)
      .transition()
      .duration(2000)
      .delay(200)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0)
      .attr('stroke-dasharray', '5,5');

    // Interactive points for compound line
    g.selectAll('.compound-point')
      .data(chartData.compound)
      .enter()
      .append('circle')
      .attr('class', 'compound-point')
      .attr('cx', (d) => xScale(d.month))
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 0)
      .attr('fill', '#10b981')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).transition().duration(200).attr('r', 6);
        setHoveredPoint({
          x: event.pageX,
          y: event.pageY,
          value: d.value,
          label: d.label,
        });
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(200).attr('r', 4);
        setHoveredPoint(null);
      })
      .transition()
      .delay((d, i) => 2000 + i * 50)
      .duration(300)
      .attr('r', 4);

  }, [chartData]);

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
      {/* Animated Stats with Glow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-500/50 shadow-lg shadow-green-500/20"
        >
          <p className="text-sm text-muted-foreground mb-2">💰 Zinseszins-Vorteil</p>
          <motion.p
            className="text-3xl font-bold text-green-500"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: 0 }}
          >
            +{formatCurrency(animatedDifference)}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/50 shadow-lg shadow-purple-500/20"
        >
          <p className="text-sm text-muted-foreground mb-2">📈 Mehr Gewinn</p>
          <motion.p
            className="text-3xl font-bold text-purple-500"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, delay: 0.1, repeat: 0 }}
          >
            {animatedPercentage.toFixed(1)}% mehr!
          </motion.p>
        </motion.div>
      </div>

      {/* D3 Chart with self-drawing lines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-background/50 rounded-lg p-4 border relative"
      >
        <h3 className="text-lg font-semibold mb-4">Custom D3 Visualization</h3>
        <svg
          ref={svgRef}
          className="w-full h-[400px]"
          style={{ overflow: 'visible' }}
        />

        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 px-3 py-2 bg-background border rounded shadow-lg text-sm pointer-events-none"
            style={{
              left: hoveredPoint.x + 10,
              top: hoveredPoint.y - 40,
            }}
          >
            <p className="font-semibold">{hoveredPoint.label}</p>
            <p className="text-green-500">{formatCurrency(hoveredPoint.value)}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Legend Info with Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex flex-wrap gap-4 justify-center text-sm"
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-4 h-4 rounded-full bg-green-500"
            animate={{ boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0.7)', '0 0 0 8px rgba(16, 185, 129, 0)'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span>Mit Zinseszins (Reinvestiert)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Ohne Zinseszins (Linear)</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CompoundEffectD3;
