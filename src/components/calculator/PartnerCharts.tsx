import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { PartnerSummary, YearlyResult } from '@/utils/calculatorEngine';

interface PartnerChartsProps {
  results: YearlyResult[];
}

const COLORS = ['#D4AF37', '#C5A028', '#B8860B', '#8B7500', '#6B5900', '#FFD700', '#F0C000', '#E0B000'];

const PartnerCharts = ({ results }: PartnerChartsProps) => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  // Aggregate all partner data
  const allPartnerTotals = new Map<string, { name: string; level: 'L1' | 'L2'; total: number }>();
  
  results.forEach(year => {
    year.summary.partnerSummaries.forEach(ps => {
      const existing = allPartnerTotals.get(ps.partnerId) || { name: ps.partnerName, level: ps.level, total: 0 };
      existing.total += ps.totalCommission;
      allPartnerTotals.set(ps.partnerId, existing);
    });
  });

  if (allPartnerTotals.size === 0) {
    return null;
  }

  // Prepare data for pie chart
  const pieData = Array.from(allPartnerTotals.entries()).map(([id, data]) => ({
    id,
    name: data.name || (isGerman ? 'Unbenannt' : 'Unnamed'),
    value: data.total,
    level: data.level,
  }));

  // Prepare data for bar chart - monthly breakdown
  const monthlyData: { month: string; [key: string]: number | string }[] = [];
  
  results.forEach(year => {
    year.months.forEach(month => {
      const monthName = new Date(year.year, month.month, 1).toLocaleString(isGerman ? 'de-DE' : 'en-US', { 
        month: 'short', 
        year: '2-digit' 
      });
      
      const monthEntry: { month: string; [key: string]: number | string } = { month: monthName };
      
      month.summary.partnerSummaries.forEach(ps => {
        const partnerName = ps.partnerName || `${ps.level}-${ps.partnerId.slice(-4)}`;
        monthEntry[partnerName] = ps.totalCommission;
      });
      
      monthlyData.push(monthEntry);
    });
  });

  // Get unique partner names for bar chart
  const partnerNames = Array.from(allPartnerTotals.entries()).map(([id, data]) => 
    data.name || `${data.level}-${id.slice(-4)}`
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalL1 = Array.from(allPartnerTotals.values())
    .filter(p => p.level === 'L1')
    .reduce((sum, p) => sum + p.total, 0);
    
  const totalL2 = Array.from(allPartnerTotals.values())
    .filter(p => p.level === 'L2')
    .reduce((sum, p) => sum + p.total, 0);

  const levelPieData = [
    { name: 'L1', value: totalL1 },
    { name: 'L2', value: totalL2 },
  ].filter(d => d.value > 0);

  return (
    <Card className="metallic-frame">
      <CardHeader>
        <CardTitle>
          {isGerman ? 'Partner-Provisionen Analyse' : 'Partner Commissions Analysis'}
        </CardTitle>
        <CardDescription>
          {isGerman 
            ? 'Übersicht der Provisionen nach Partner und Level'
            : 'Overview of commissions by partner and level'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Partner Distribution Pie Chart */}
          <div className="space-y-2">
            <h4 className="font-medium text-center">
              {isGerman ? 'Verteilung nach Partner' : 'Distribution by Partner'}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* L1 vs L2 Pie Chart */}
          <div className="space-y-2">
            <h4 className="font-medium text-center">
              {isGerman ? 'L1 vs L2 Provisionen' : 'L1 vs L2 Commissions'}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={levelPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  labelLine={true}
                >
                  <Cell fill="#D4AF37" />
                  <Cell fill="#8B7500" />
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Commission Bar Chart */}
        {monthlyData.length > 0 && monthlyData.length <= 24 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-medium text-center">
              {isGerman ? 'Monatliche Provisionen' : 'Monthly Commissions'}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                {partnerNames.map((name, index) => (
                  <Bar 
                    key={name} 
                    dataKey={name} 
                    fill={COLORS[index % COLORS.length]} 
                    stackId="a"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Partner Summary Table */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {Array.from(allPartnerTotals.entries()).map(([id, data], index) => (
            <div 
              key={id} 
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="font-medium">{data.name || (isGerman ? 'Unbenannt' : 'Unnamed')}</p>
                  <p className="text-sm text-muted-foreground">{data.level}</p>
                </div>
              </div>
              <span className="font-semibold text-gold">{formatCurrency(data.total)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerCharts;