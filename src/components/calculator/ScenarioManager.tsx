import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Trash2, Copy, BarChart3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalculationParams, YearlyResult, Partner, TransactionPlan, RealProfitData } from '@/utils/calculatorEngine';
import { useToast } from '@/hooks/use-toast';

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: Date;
  params: CalculationParams;
  results: YearlyResult[];
}

interface ScenarioManagerProps {
  currentParams: CalculationParams | null;
  currentResults: YearlyResult[] | null;
  savedScenarios: SavedScenario[];
  onSaveScenario: (scenario: SavedScenario) => void;
  onDeleteScenario: (id: string) => void;
  onLoadScenario: (scenario: SavedScenario) => void;
}

const ScenarioManager = ({
  currentParams,
  currentResults,
  savedScenarios,
  onSaveScenario,
  onDeleteScenario,
  onLoadScenario,
}: ScenarioManagerProps) => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [scenarioName, setScenarioName] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const isGerman = i18n.language === 'de';

  const handleSave = () => {
    if (!currentParams || !currentResults) {
      toast({
        title: isGerman ? 'Fehler' : 'Error',
        description: isGerman ? 'Keine aktuelle Berechnung vorhanden' : 'No current calculation available',
        variant: 'destructive',
      });
      return;
    }

    if (!scenarioName.trim()) {
      toast({
        title: isGerman ? 'Fehler' : 'Error',
        description: isGerman ? 'Bitte einen Namen eingeben' : 'Please enter a name',
        variant: 'destructive',
      });
      return;
    }

    const newScenario: SavedScenario = {
      id: `scenario-${Date.now()}`,
      name: scenarioName.trim(),
      createdAt: new Date(),
      params: currentParams,
      results: currentResults,
    };

    onSaveScenario(newScenario);
    setScenarioName('');
    
    toast({
      title: isGerman ? 'Szenario gespeichert' : 'Scenario saved',
      description: scenarioName,
    });
  };

  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(isGerman ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getScenarioSummary = (scenario: SavedScenario) => {
    const lastYear = scenario.results[scenario.results.length - 1];
    return {
      finalStake: lastYear?.summary.endStake || 0,
      totalProfit: scenario.results.reduce((sum, y) => sum + y.summary.totalProfit, 0),
      totalCommissions: scenario.results.reduce((sum, y) => 
        sum + y.summary.partnerSummaries.reduce((ps, p) => ps + p.totalCommission, 0), 0),
    };
  };

  const scenariosToCompare = savedScenarios.filter(s => selectedForCompare.includes(s.id));

  return (
    <Card className="metallic-frame">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="text-gold" size={20} />
          {isGerman ? 'Szenarien verwalten' : 'Manage Scenarios'}
        </CardTitle>
        <CardDescription>
          {isGerman 
            ? 'Speichern und vergleichen Sie verschiedene Simulationsszenarien'
            : 'Save and compare different simulation scenarios'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Current */}
        {currentResults && (
          <div className="flex gap-4 items-end p-4 bg-muted/50 rounded-lg">
            <div className="flex-1 space-y-2">
              <Label>{isGerman ? 'Aktuelles Szenario speichern' : 'Save current scenario'}</Label>
              <Input
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder={isGerman ? 'Szenario-Name...' : 'Scenario name...'}
              />
            </div>
            <Button onClick={handleSave} className="bg-gold text-primary-foreground hover:bg-gold-dark">
              <Save className="mr-2" size={16} />
              {isGerman ? 'Speichern' : 'Save'}
            </Button>
          </div>
        )}

        {/* Saved Scenarios */}
        {savedScenarios.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg">{isGerman ? 'Gespeicherte Szenarien' : 'Saved Scenarios'}</Label>
              <Button
                onClick={() => setCompareMode(!compareMode)}
                variant={compareMode ? 'default' : 'outline'}
                size="sm"
              >
                <BarChart3 className="mr-2" size={16} />
                {isGerman ? 'Vergleichen' : 'Compare'}
              </Button>
            </div>

            <div className="space-y-2">
              {savedScenarios.map(scenario => {
                const summary = getScenarioSummary(scenario);
                const isSelected = selectedForCompare.includes(scenario.id);

                return (
                  <div 
                    key={scenario.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isSelected ? 'border-gold bg-gold/10' : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(scenario.createdAt))}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span>Start: {formatCurrency(scenario.params.initialStake)}</span>
                          <span className="text-gold">End: {formatCurrency(summary.finalStake)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {compareMode ? (
                          <Button
                            onClick={() => toggleCompareSelection(scenario.id)}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            disabled={!isSelected && selectedForCompare.length >= 3}
                          >
                            {isSelected ? '✓' : '+'}
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => onLoadScenario(scenario)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              onClick={() => onDeleteScenario(scenario.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Dialog */}
        {compareMode && selectedForCompare.length >= 2 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-gold text-primary-foreground hover:bg-gold-dark">
                <BarChart3 className="mr-2" size={16} />
                {isGerman 
                  ? `${selectedForCompare.length} Szenarien vergleichen`
                  : `Compare ${selectedForCompare.length} scenarios`}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{isGerman ? 'Szenario-Vergleich' : 'Scenario Comparison'}</DialogTitle>
                <DialogDescription>
                  {isGerman 
                    ? 'Vergleich der ausgewählten Simulationsszenarien'
                    : 'Comparison of selected simulation scenarios'}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isGerman ? 'Metrik' : 'Metric'}</TableHead>
                      {scenariosToCompare.map(s => (
                        <TableHead key={s.id} className="text-center">{s.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{isGerman ? 'Startstake' : 'Initial Stake'}</TableCell>
                      {scenariosToCompare.map(s => (
                        <TableCell key={s.id} className="text-center">
                          {formatCurrency(s.params.initialStake)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{isGerman ? 'Endstake' : 'Final Stake'}</TableCell>
                      {scenariosToCompare.map(s => {
                        const summary = getScenarioSummary(s);
                        return (
                          <TableCell key={s.id} className="text-center text-gold font-semibold">
                            {formatCurrency(summary.finalStake)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{isGerman ? 'Gesamtgewinn' : 'Total Profit'}</TableCell>
                      {scenariosToCompare.map(s => {
                        const summary = getScenarioSummary(s);
                        return (
                          <TableCell key={s.id} className="text-center text-green-600">
                            {formatCurrency(summary.totalProfit)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{isGerman ? 'Provisionen' : 'Commissions'}</TableCell>
                      {scenariosToCompare.map(s => {
                        const summary = getScenarioSummary(s);
                        return (
                          <TableCell key={s.id} className="text-center">
                            {formatCurrency(summary.totalCommissions)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{isGerman ? 'Wachstum' : 'Growth'}</TableCell>
                      {scenariosToCompare.map(s => {
                        const summary = getScenarioSummary(s);
                        const growth = ((summary.finalStake - s.params.initialStake) / s.params.initialStake * 100);
                        return (
                          <TableCell key={s.id} className="text-center font-semibold">
                            {growth.toFixed(1)}%
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{isGerman ? 'Partner' : 'Partners'}</TableCell>
                      {scenariosToCompare.map(s => (
                        <TableCell key={s.id} className="text-center">
                          {s.params.partners.length}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{isGerman ? 'Dauer' : 'Duration'}</TableCell>
                      {scenariosToCompare.map(s => (
                        <TableCell key={s.id} className="text-center">
                          {s.params.durationYears}Y {s.params.durationMonths}M
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {savedScenarios.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            {isGerman 
              ? 'Keine gespeicherten Szenarien. Führen Sie eine Berechnung durch und speichern Sie das Ergebnis.'
              : 'No saved scenarios. Run a calculation and save the result.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ScenarioManager;