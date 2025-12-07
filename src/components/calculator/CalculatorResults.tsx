import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, FileText, Download, Upload, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { YearlyResult, RealProfitData, CalculationParams } from '@/utils/calculatorEngine';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import RealDataUpload from './RealDataUpload';
import CompoundEffectModal from '@/components/CompoundEffectModal';
import logo from '@/assets/logo.png';

interface CalculatorResultsProps {
  results: YearlyResult[];
  params?: CalculationParams;
  onRecalculateWithRealData?: (realData: RealProfitData[]) => void;
}

const CalculatorResults = ({ results, params, onRecalculateWithRealData }: CalculatorResultsProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [exportGranularity, setExportGranularity] = useState<'yearly' | 'monthly' | 'weekly' | 'daily'>('monthly');
  const [simulationName, setSimulationName] = useState('');
  const [realProfitData, setRealProfitData] = useState<RealProfitData[]>([]);
  const [compoundEffectModalOpen, setCompoundEffectModalOpen] = useState(false);

  const isGerman = i18n.language === 'de';
  const dateLocale = isGerman ? de : enUS;

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleMonth = (year: number, month: number) => {
    const key = `${year}-${month}`;
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedMonths(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'PP', { locale: dateLocale });
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month, 1).toLocaleString(isGerman ? 'de-DE' : 'en-US', { month: 'long' });
  };

  // Calculate totals
  const allPartnerTotals = new Map<string, { name: string; level: 'L1' | 'L2'; total: number }>();
  
  const totalSummary = results.reduce(
    (acc, year) => {
      year.summary.partnerSummaries.forEach(ps => {
        const existing = allPartnerTotals.get(ps.partnerId) || { name: ps.partnerName, level: ps.level, total: 0 };
        existing.total += ps.totalCommission;
        allPartnerTotals.set(ps.partnerId, existing);
      });
      
      return {
        finalStake: year.summary.endStake,
        totalProfit: acc.totalProfit + year.summary.totalProfit,
        totalDeposits: acc.totalDeposits + year.summary.totalDeposits,
        totalWithdrawals: acc.totalWithdrawals + year.summary.totalWithdrawals,
      };
    },
    { finalStake: 0, totalProfit: 0, totalDeposits: 0, totalWithdrawals: 0 }
  );
  
  const totalL1 = Array.from(allPartnerTotals.values()).filter(p => p.level === 'L1').reduce((sum, p) => sum + p.total, 0);
  const totalL2 = Array.from(allPartnerTotals.values()).filter(p => p.level === 'L2').reduce((sum, p) => sum + p.total, 0);

  const exportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Load and add logo
    try {
      const img = new Image();
      img.src = logo;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Add logo centered
      const logoWidth = 40;
      const logoHeight = 40;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);
    } catch (e) {
      console.log('Could not load logo');
    }
    
    // Simulation name and date
    doc.setFontSize(16);
    const title = simulationName || 'Smart Compound Calculator';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 58);
    
    doc.setFontSize(10);
    const dateText = `${isGerman ? 'Erstellt am' : 'Created on'}: ${format(new Date(), 'PPP', { locale: dateLocale })}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, (pageWidth - dateWidth) / 2, 66);
    
    if (params?.startDate) {
      const startText = `${isGerman ? 'Simulationszeitraum ab' : 'Simulation period from'}: ${format(params.startDate, 'PPP', { locale: dateLocale })}`;
      const startWidth = doc.getTextWidth(startText);
      doc.text(startText, (pageWidth - startWidth) / 2, 72);
    }
    
    // Summary
    doc.setFontSize(12);
    doc.text(isGerman ? 'Zusammenfassung' : 'Summary', 14, 85);
    
    const summaryData = [
      [isGerman ? 'End-Stake' : 'Final Stake', formatCurrency(totalSummary.finalStake)],
      [isGerman ? 'Gesamtgewinn' : 'Total Profit', formatCurrency(totalSummary.totalProfit)],
      [isGerman ? 'Gesamt L1 Provision' : 'Total L1 Commission', formatCurrency(totalL1)],
      [isGerman ? 'Gesamt L2 Provision' : 'Total L2 Commission', formatCurrency(totalL2)],
      [isGerman ? 'Gesamt Einzahlungen' : 'Total Deposits', formatCurrency(totalSummary.totalDeposits)],
      [isGerman ? 'Gesamt Auszahlungen' : 'Total Withdrawals', formatCurrency(totalSummary.totalWithdrawals)],
    ];
    
    autoTable(doc, {
      startY: 90,
      head: [[isGerman ? 'Kategorie' : 'Category', isGerman ? 'Betrag' : 'Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [218, 165, 32] }, // Gold color
    });
    
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Detailed data based on granularity
    if (exportGranularity === 'yearly') {
      const yearlyData = results.map(year => [
        year.year.toString(),
        formatCurrency(year.summary.startStake),
        formatCurrency(year.summary.totalProfit),
        formatCurrency(year.summary.endStake),
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [[isGerman ? 'Jahr' : 'Year', isGerman ? 'Start-Stake' : 'Start Stake', isGerman ? 'Gewinn' : 'Profit', isGerman ? 'End-Stake' : 'End Stake']],
        body: yearlyData,
        theme: 'striped',
        headStyles: { fillColor: [218, 165, 32] },
      });
    } else if (exportGranularity === 'monthly') {
      const monthlyData: string[][] = [];
      results.forEach(year => {
        year.months.forEach(month => {
          monthlyData.push([
            `${getMonthName(month.month)} ${year.year}`,
            formatCurrency(month.summary.startStake),
            formatCurrency(month.summary.totalProfit),
            formatCurrency(month.summary.endStake),
          ]);
        });
      });
      
      autoTable(doc, {
        startY: currentY,
        head: [[isGerman ? 'Monat' : 'Month', isGerman ? 'Start-Stake' : 'Start Stake', isGerman ? 'Gewinn' : 'Profit', isGerman ? 'End-Stake' : 'End Stake']],
        body: monthlyData,
        theme: 'striped',
        headStyles: { fillColor: [218, 165, 32] },
      });
    } else if (exportGranularity === 'weekly' || exportGranularity === 'daily') {
      const detailData: (string | { content: string; styles?: any })[][] = [];
      
      results.forEach(year => {
        year.months.forEach(month => {
          if (exportGranularity === 'daily') {
            month.days.forEach(day => {
              const isNonWorkingDay = day.isWeekend || day.isVacation;
              const rowStyle = isNonWorkingDay ? { fillColor: [245, 245, 220] } : {}; // Beige for non-working days
              
              detailData.push([
                { content: formatDate(day.date), styles: rowStyle },
                { content: formatCurrency(day.stake), styles: rowStyle },
                { content: formatCurrency(day.profit), styles: rowStyle },
                { content: formatCurrency(day.newStake), styles: rowStyle },
              ]);
            });
          } else {
            // Weekly grouping
            const weeks = new Map<number, typeof month.days>();
            month.days.forEach(day => {
              const weekNum = Math.floor(day.date.getDate() / 7);
              if (!weeks.has(weekNum)) weeks.set(weekNum, []);
              weeks.get(weekNum)!.push(day);
            });
            
            weeks.forEach((days, weekNum) => {
              const weekProfit = days.reduce((sum, d) => sum + d.profit, 0);
              const weekendDays = days.filter(d => d.isWeekend || d.isVacation);
              const hasNonWorkingDays = weekendDays.length > 0;
              const rowStyle = hasNonWorkingDays ? { fillColor: [245, 245, 220] } : {};
              
              detailData.push([
                { content: `${isGerman ? 'KW' : 'W'}${weekNum + 1} ${getMonthName(month.month)}`, styles: rowStyle },
                { content: formatCurrency(days[0].stake), styles: rowStyle },
                { content: formatCurrency(weekProfit), styles: rowStyle },
                { content: formatCurrency(days[days.length - 1].newStake), styles: rowStyle },
              ]);
            });
          }
        });
      });
      
      autoTable(doc, {
        startY: currentY,
        head: [[isGerman ? 'Zeitraum' : 'Period', isGerman ? 'Stake' : 'Stake', isGerman ? 'Gewinn' : 'Profit', isGerman ? 'Neuer Stake' : 'New Stake']],
        body: detailData,
        theme: 'striped',
        headStyles: { fillColor: [218, 165, 32] },
      });
    }
    
    doc.save(`${simulationName || 'compound-calculator'}-results.pdf`);
    
    toast({
      title: isGerman ? 'PDF exportiert' : 'PDF exported',
      description: isGerman ? 'Die Datei wurde heruntergeladen' : 'The file has been downloaded',
    });
  };

  const exportCSV = () => {
    const headers = [
      isGerman ? 'Datum' : 'Date',
      'Stake',
      isGerman ? 'Gewinn' : 'Profit',
      isGerman ? 'Partner Prov.' : 'Partner Comm.',
      isGerman ? 'Einzahlung' : 'Deposit',
      isGerman ? 'Auszahlung' : 'Withdrawal',
      isGerman ? 'Neuer Stake' : 'New Stake',
      isGerman ? 'Wochenende' : 'Weekend',
      isGerman ? 'Urlaub' : 'Vacation',
    ];
    
    const rows: string[][] = [headers];
    
    results.forEach(year => {
      year.months.forEach(month => {
        month.days.forEach(day => {
          const partnerCommissionsTotal = day.partnerCommissions.reduce((sum, pc) => sum + pc.commission, 0);
          rows.push([
            formatDate(day.date),
            day.stake.toFixed(2),
            day.profit.toFixed(2),
            partnerCommissionsTotal.toFixed(2),
            day.deposit.toFixed(2),
            day.withdrawal.toFixed(2),
            day.newStake.toFixed(2),
            day.isWeekend ? 'X' : '',
            day.isVacation ? 'X' : '',
          ]);
        });
      });
    });
    
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${simulationName || 'compound-calculator'}-results.csv`;
    link.click();
    
    toast({
      title: isGerman ? 'CSV exportiert' : 'CSV exported',
      description: isGerman ? 'Die Datei wurde heruntergeladen' : 'The file has been downloaded',
    });
  };

  const handleRealDataChange = (data: RealProfitData[]) => {
    setRealProfitData(data);
  };

  const generateAssetReport = () => {
    if (realProfitData.length === 0) {
      toast({
        title: isGerman ? 'Fehler' : 'Error',
        description: isGerman ? 'Bitte laden Sie zuerst Echtdaten hoch' : 'Please upload real data first',
        variant: 'destructive',
      });
      return;
    }
    
    if (onRecalculateWithRealData) {
      onRecalculateWithRealData(realProfitData);
      toast({
        title: isGerman ? 'Asset-Report erstellt' : 'Asset Report Generated',
        description: isGerman ? 'Die Simulation wurde mit Echtdaten neu berechnet' : 'The simulation has been recalculated with real data',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Real Data Upload - moved to results */}
      <Card className="metallic-frame">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="text-gold" size={20} />
            {t('calculator.results.realData')}
          </CardTitle>
          <CardDescription>{t('calculator.results.realDataDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RealDataUpload onDataChange={handleRealDataChange} currentData={realProfitData} />
          {realProfitData.length > 0 && onRecalculateWithRealData && (
            <Button 
              onClick={generateAssetReport} 
              className="w-full bg-gradient-to-r from-gold via-gold-dark to-gold hover:shadow-lg hover:shadow-gold/50"
            >
              {t('calculator.results.generateAssetReport')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="metallic-frame border-gold/30">
        <CardHeader>
          <CardTitle className="text-2xl">{t('calculator.results.summary')}</CardTitle>
          <CardDescription>{isGerman ? 'Gesamtübersicht Ihrer Simulation' : 'Overview of your simulation'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('calculator.results.finalStake')}</p>
              <p className="text-2xl font-bold text-gold">{formatCurrency(totalSummary.finalStake)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('calculator.results.totalProfit')}</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSummary.totalProfit)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('calculator.results.totalL1')}</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalL1)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('calculator.results.totalL2')}</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalL2)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('calculator.results.totalDeposits')}</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSummary.totalDeposits)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('calculator.results.totalWithdrawals')}</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSummary.totalWithdrawals)}</p>
            </div>
          </div>
          
          {/* Partner Breakdown */}
          {allPartnerTotals.size > 0 && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-3">{isGerman ? 'Provisionen nach Partner' : 'Commissions by Partner'}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {Array.from(allPartnerTotals.entries()).map(([id, data]) => (
                  <div key={id} className="flex justify-between items-center p-3 bg-background rounded">
                    <span className="font-medium">
                      {data.name || (isGerman ? 'Unbenannt' : 'Unnamed')} ({data.level})
                    </span>
                    <span className="text-gold font-semibold">{formatCurrency(data.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Export Options */}
          <div className="mt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('calculator.results.simulationName')}</Label>
                <Input
                  value={simulationName}
                  onChange={(e) => setSimulationName(e.target.value)}
                  placeholder={isGerman ? 'Name der Simulation' : 'Simulation name'}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('calculator.results.exportGranularity')}</Label>
                <Select value={exportGranularity} onValueChange={(v: any) => setExportGranularity(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">{t('calculator.results.yearly')}</SelectItem>
                    <SelectItem value="monthly">{t('calculator.results.monthlyExport')}</SelectItem>
                    <SelectItem value="weekly">{t('calculator.results.weekly')}</SelectItem>
                    <SelectItem value="daily">{t('calculator.results.daily')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={exportPDF} variant="outline" className="flex-1 border-gold text-gold hover:bg-gold/10">
                <FileText className="mr-2" size={16} />
                {t('calculator.results.exportPDF')}
              </Button>
              <Button onClick={exportCSV} variant="outline" className="flex-1 border-gold text-gold hover:bg-gold/10">
                <Download className="mr-2" size={16} />
                {t('calculator.results.exportCSV')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compound Effect Visualization Toggle Button */}
      {params && (
        <Card className="metallic-frame border-gold/30">
          <CardContent className="pt-6">
            <Button
              onClick={() => setCompoundEffectModalOpen(true)}
              className="w-full bg-gradient-to-r from-gold via-gold-dark to-gold hover:shadow-lg hover:shadow-gold/50 text-lg py-6"
            >
              <Sparkles className="mr-2" size={20} />
              💫 Zinseszins-Effekt anzeigen
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-3">
              Entdecken Sie den Unterschied zwischen Compound Interest und linearem Wachstum
            </p>
          </CardContent>
        </Card>
      )}

      {/* Compound Effect Modal */}
      {params && (
        <CompoundEffectModal
          open={compoundEffectModalOpen}
          onOpenChange={setCompoundEffectModalOpen}
          results={results}
          params={params}
        />
      )}

      {/* Detailed Results Table */}
      <Card className="metallic-frame">
        <CardHeader>
          <CardTitle>{isGerman ? 'Detaillierte Ergebnisse' : 'Detailed Results'}</CardTitle>
          <CardDescription>{isGerman ? 'Aufschlüsselung nach Jahr, Monat und Tag' : 'Breakdown by year, month and day'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.map(year => (
              <div key={year.year} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleYear(year.year)}
                >
                  <div className="flex items-center gap-2">
                    {expandedYears.has(year.year) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <span className="font-semibold text-lg">{isGerman ? 'Jahr' : 'Year'} {year.year}</span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <span>Start: {formatCurrency(year.summary.startStake)}</span>
                    <span className="text-gold font-medium">{isGerman ? 'Ende' : 'End'}: {formatCurrency(year.summary.endStake)}</span>
                  </div>
                </div>
                
                {expandedYears.has(year.year) && (
                  <div className="p-4 space-y-2">
                    {year.months.map(month => (
                      <div key={`${year.year}-${month.month}`} className="border rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between p-3 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => toggleMonth(year.year, month.month)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedMonths.has(`${year.year}-${month.month}`) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <span className="font-medium">{getMonthName(month.month)}</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span>{isGerman ? 'Gewinn' : 'Profit'}: {formatCurrency(month.summary.totalProfit)}</span>
                            <span>{isGerman ? 'Ende' : 'End'}: {formatCurrency(month.summary.endStake)}</span>
                          </div>
                        </div>
                        
                        {expandedMonths.has(`${year.year}-${month.month}`) && (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{isGerman ? 'Datum' : 'Date'}</TableHead>
                                  <TableHead className="text-right">Stake</TableHead>
                                  <TableHead className="text-right">{isGerman ? 'Gewinn' : 'Profit'}</TableHead>
                                  <TableHead className="text-right">{isGerman ? 'Partner Prov.' : 'Partner Comm.'}</TableHead>
                                  <TableHead className="text-right">{isGerman ? 'Einzahlung' : 'Deposit'}</TableHead>
                                  <TableHead className="text-right">{isGerman ? 'Auszahlung' : 'Withdrawal'}</TableHead>
                                  <TableHead className="text-right">{isGerman ? 'Neuer Stake' : 'New Stake'}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {month.days.map((day, index) => {
                                  const totalPartnerCommissions = day.partnerCommissions.reduce((sum, pc) => sum + pc.commission, 0);
                                  const partnerDetails = day.partnerCommissions.map(pc => 
                                    `${pc.partnerName || (isGerman ? 'Unbenannt' : 'Unnamed')} (${pc.level}): ${formatCurrency(pc.commission)}`
                                  ).join(', ');
                                  
                                  const isNonWorkingDay = day.isWeekend || day.isVacation;
                                  
                                  return (
                                    <TableRow 
                                      key={index}
                                      className={isNonWorkingDay ? 'bg-muted/50 text-muted-foreground' : ''}
                                    >
                                      <TableCell className="font-medium">
                                        {formatDate(day.date)}
                                        {day.isWeekend && <span className="ml-2 text-xs text-muted-foreground">(WE)</span>}
                                        {day.isVacation && <span className="ml-2 text-xs text-orange-500">(V)</span>}
                                      </TableCell>
                                      <TableCell className="text-right">{formatCurrency(day.stake)}</TableCell>
                                      <TableCell className="text-right text-green-600">{formatCurrency(day.profit)}</TableCell>
                                      <TableCell className="text-right text-blue-600" title={partnerDetails}>
                                        {totalPartnerCommissions > 0 ? formatCurrency(totalPartnerCommissions) : '-'}
                                      </TableCell>
                                      <TableCell className="text-right">{day.deposit > 0 ? formatCurrency(day.deposit) : '-'}</TableCell>
                                      <TableCell className="text-right">{day.withdrawal > 0 ? formatCurrency(day.withdrawal) : '-'}</TableCell>
                                      <TableCell className="text-right font-semibold">{formatCurrency(day.newStake)}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorResults;