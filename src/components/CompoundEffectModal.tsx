import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YearlyResult, CalculationParams, calculateLinearComparison } from '@/utils/calculatorEngine';
import CompoundEffectNivo from './CompoundEffectNivo';
import CompoundEffectVictory from './CompoundEffectVictory';
import CompoundEffectD3 from './CompoundEffectD3';
import { Sparkles, TrendingUp } from 'lucide-react';

interface CompoundEffectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: YearlyResult[];
  params: CalculationParams;
}

const CompoundEffectModal = ({
  open,
  onOpenChange,
  results,
  params,
}: CompoundEffectModalProps) => {
  const [selectedDemo, setSelectedDemo] = useState<'nivo' | 'victory' | 'd3'>('nivo');

  // Calculate comparison data
  const comparisonData = calculateLinearComparison(params);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalCompound = comparisonData.compoundResults.reduce(
    (sum, y) => sum + y.summary.endStake,
    0
  );
  const totalLinear =
    params.initialStake + comparisonData.comparison.totalLinearProfit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="text-gold" size={24} />
            Zinseszins-Effekt Visualisierung
          </DialogTitle>
          <DialogDescription>
            Vergleiche den Unterschied zwischen Compound Interest (Reinvestierung) und linearem
            Wachstum
          </DialogDescription>
        </DialogHeader>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 bg-gradient-to-br from-gold/10 to-gold/5 rounded-lg border border-gold/30 text-center">
            <p className="text-sm text-muted-foreground mb-1">💰 Zinseszins-Vorteil</p>
            <p className="text-2xl font-bold text-gold">
              +{formatCurrency(comparisonData.comparison.difference)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/30 text-center">
            <p className="text-sm text-muted-foreground mb-1">📈 Prozentuale Steigerung</p>
            <p className="text-2xl font-bold text-green-500">
              {comparisonData.comparison.percentageGain.toFixed(1)}% mehr!
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/30 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              <TrendingUp className="inline mr-1" size={14} />
              Gewinn-Multiplikator
            </p>
            <p className="text-2xl font-bold text-blue-500">
              {(comparisonData.comparison.totalCompoundProfit /
                comparisonData.comparison.totalLinearProfit || 1).toFixed(2)}x
            </p>
          </div>
        </div>

        {/* Comparison Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-semibold">Mit Zinseszins (Compound)</span>
            </div>
            <div className="pl-5 space-y-1 text-sm">
              <p>
                End-Stake: <span className="font-bold text-green-500">{formatCurrency(comparisonData.compoundResults[comparisonData.compoundResults.length - 1]?.summary.endStake || 0)}</span>
              </p>
              <p>
                Total Profit:{' '}
                <span className="font-bold">
                  {formatCurrency(comparisonData.comparison.totalCompoundProfit)}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-semibold">Ohne Zinseszins (Linear)</span>
            </div>
            <div className="pl-5 space-y-1 text-sm">
              <p>
                End-Stake: <span className="font-bold text-red-500">{formatCurrency(params.initialStake)}</span>
              </p>
              <p>
                Total Profit:{' '}
                <span className="font-bold">
                  {formatCurrency(comparisonData.comparison.totalLinearProfit)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Demo Selection Tabs */}
        <Tabs value={selectedDemo} onValueChange={(v) => setSelectedDemo(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nivo">
              <span className="hidden sm:inline">Nivo Charts</span>
              <span className="sm:hidden">Nivo</span>
            </TabsTrigger>
            <TabsTrigger value="victory">
              <span className="hidden sm:inline">Victory Charts</span>
              <span className="sm:hidden">Victory</span>
            </TabsTrigger>
            <TabsTrigger value="d3">
              <span className="hidden sm:inline">D3 Custom</span>
              <span className="sm:hidden">D3</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nivo" className="mt-6">
            <CompoundEffectNivo
              compoundResults={comparisonData.compoundResults}
              linearResults={comparisonData.linearResults}
              difference={comparisonData.comparison.difference}
              percentageGain={comparisonData.comparison.percentageGain}
            />
          </TabsContent>

          <TabsContent value="victory" className="mt-6">
            <CompoundEffectVictory
              compoundResults={comparisonData.compoundResults}
              linearResults={comparisonData.linearResults}
              difference={comparisonData.comparison.difference}
              percentageGain={comparisonData.comparison.percentageGain}
            />
          </TabsContent>

          <TabsContent value="d3" className="mt-6">
            <CompoundEffectD3
              compoundResults={comparisonData.compoundResults}
              linearResults={comparisonData.linearResults}
              difference={comparisonData.comparison.difference}
              percentageGain={comparisonData.comparison.percentageGain}
            />
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
          <p className="font-semibold mb-2">ℹ️ Erklärung:</p>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>
              <strong>Mit Zinseszins:</strong> Tägliche Gewinne werden sofort reinvestiert und
              generieren zusätzliche Gewinne
            </li>
            <li>
              <strong>Ohne Zinseszins:</strong> Gewinne werden "zur Seite gelegt", nur der
              ursprüngliche Stake generiert täglich Profit
            </li>
            <li>
              Der Zinseszins-Effekt wird exponentiell stärker über längere Zeiträume
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompoundEffectModal;
