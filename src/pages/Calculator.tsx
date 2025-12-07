import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import CalculatorSetup from '@/components/calculator/CalculatorSetup';
import CalculatorResults from '@/components/calculator/CalculatorResults';
import PartnerCharts from '@/components/calculator/PartnerCharts';
import ScenarioManager, { SavedScenario } from '@/components/calculator/ScenarioManager';
import { YearlyResult, CalculationParams, RealProfitData, calculateCompound } from '@/utils/calculatorEngine';

const Calculator = () => {
  const { t } = useTranslation();
  const [results, setResults] = useState<YearlyResult[] | null>(null);
  const [currentParams, setCurrentParams] = useState<CalculationParams | null>(null);
  const [activeTab, setActiveTab] = useState('setup');
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  const handleCalculate = (calculatedResults: YearlyResult[], params: CalculationParams) => {
    setResults(calculatedResults);
    setCurrentParams(params);
    setActiveTab('results');
  };

  const handleSaveScenario = (scenario: SavedScenario) => {
    setSavedScenarios(prev => [...prev, scenario]);
  };

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== id));
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setResults(scenario.results);
    setCurrentParams(scenario.params);
    setActiveTab('results');
  };

  const handleRecalculateWithRealData = (realData: RealProfitData[]) => {
    if (!currentParams) return;
    
    const newParams: CalculationParams = {
      ...currentParams,
      realProfitData: realData,
    };
    
    const newResults = calculateCompound(newParams);
    setResults(newResults);
    setCurrentParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            {t('calculator.title')}
          </h1>
        </div>

        <Card className="metallic-frame border-gold/20 shadow-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="setup" className="data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                {t('calculator.tabs.setup')}
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                disabled={!results}
                className="data-[state=active]:bg-gold data-[state=active]:text-primary-foreground"
              >
                {t('calculator.tabs.results')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="p-6 space-y-6">
              <ScenarioManager
                currentParams={currentParams}
                currentResults={results}
                savedScenarios={savedScenarios}
                onSaveScenario={handleSaveScenario}
                onDeleteScenario={handleDeleteScenario}
                onLoadScenario={handleLoadScenario}
              />
              <CalculatorSetup onCalculate={handleCalculate} />
            </TabsContent>
            
            <TabsContent value="results" className="p-6 space-y-6">
              {results && (
                <>
                  <CalculatorResults 
                    results={results} 
                    params={currentParams || undefined}
                    onRecalculateWithRealData={handleRecalculateWithRealData}
                  />
                  <PartnerCharts results={results} />
                </>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;