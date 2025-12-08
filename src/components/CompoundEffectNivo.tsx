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

  // Calculate compound interest data (with reinvestment)
  const generateCompoundData = (): DataPoint[] => {
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
  };

  // Calculate linear data (without reinvestment)
  const generateLinearData = (): DataPoint[] => {
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
  };

  const data: ChartData[] = [
    {
      id: isGerman ? 'Mit Reinvestition' : 'With Reinvestment',
      data: generateCompoundData(),
    },
    {
      id: isGerman ? 'Ohne Reinvestition' : 'Without Reinvestment',
      data: generateLinearData(),
    },
  ];

  return (
    <div style={{ height: '400px', width: '100%' }}>
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
        tooltip={({ point }) => (
          <div
            style={{
              background: 'white',
              padding: '9px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <strong>{point.serieId}</strong>
            <br />
            {isGerman ? 'Jahr' : 'Year'}: {point.data.x}
            <br />
            {isGerman ? 'Wert' : 'Value'}:{' '}
            {new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(point.data.y as number)}
          </div>
        )}
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
        }}
      />
    </div>
  );
};

export default CompoundEffectNivo;
