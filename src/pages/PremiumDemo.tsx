/**
 * Premium Demo Page - Showcase for premium compound effect visualizations
 * 
 * This page demonstrates the three premium visualization variants:
 * - Showstopper
 * - Elegant
 * - Explosive
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import CompoundEffectNivo from '@/components/CompoundEffectNivo';

const PremiumDemo = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isGerman = i18n.language === 'de';

  // Default values for demonstration
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(30);
  const [monthlyContribution, setMonthlyContribution] = useState(500);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value >= 0) {
        setter(value);
      }
    };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header with controls */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isGerman ? 'Zurück' : 'Back'}
            </Button>
          </div>
          
          <div className="font-semibold">Compound Calculator</div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => i18n.changeLanguage('de')}
              className={i18n.language === 'de' ? 'bg-accent' : ''}
            >
              🇩🇪
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => i18n.changeLanguage('en')}
              className={i18n.language === 'en' ? 'bg-accent' : ''}
            >
              EN
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">
              {isGerman ? 'Zinseszins Visualisierung' : 'Compound Interest Visualization'}
            </h1>
          </div>
          
          <p className="text-muted-foreground text-lg max-w-3xl">
            {isGerman 
              ? 'Erleben Sie die Kraft des Zinseszins-Effekts mit einer klaren und eleganten Visualisierung. Die Nivo-Chart zeigt deutlich den dramatischen Unterschied zwischen linearem und exponentiellem Wachstum.'
              : 'Experience the power of compound interest with a clear and elegant visualization. The Nivo chart clearly shows the dramatic difference between linear and exponential growth.'}
          </p>
        </div>

        {/* Control Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {isGerman ? '⚙️ Einstellungen' : '⚙️ Settings'}
            </CardTitle>
            <CardDescription>
              {isGerman 
                ? 'Passen Sie die Parameter an, um verschiedene Szenarien zu erkunden'
                : 'Adjust the parameters to explore different scenarios'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principal">
                  {isGerman ? 'Startkapital ($)' : 'Initial Investment ($)'}
                </Label>
                <Input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={handleInputChange(setPrincipal)}
                  min="0"
                  step="1000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rate">
                  {isGerman ? 'Jährliche Rendite (%)' : 'Annual Return (%)'}
                </Label>
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={handleInputChange(setRate)}
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="years">
                  {isGerman ? 'Zeitraum (Jahre)' : 'Time Period (Years)'}
                </Label>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={handleInputChange(setYears)}
                  min="1"
                  max="50"
                  step="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthly">
                  {isGerman ? 'Monatliche Einzahlung ($)' : 'Monthly Contribution ($)'}
                </Label>
                <Input
                  id="monthly"
                  type="number"
                  value={monthlyContribution}
                  onChange={handleInputChange(setMonthlyContribution)}
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization */}
        <Card className="metallic-frame border-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-gold" size={20} />
              {isGerman ? 'Zinseszins-Effekt Visualisierung' : 'Compound Interest Effect Visualization'}
            </CardTitle>
            <CardDescription>
              {isGerman 
                ? 'Vergleich: Mit Reinvestition vs. Ohne Reinvestition' 
                : 'Comparison: With Reinvestment vs. Without Reinvestment'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompoundEffectNivo
              principal={principal}
              rate={rate}
              years={years}
              monthlyContribution={monthlyContribution}
            />
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isGerman ? '💫 Über die Visualisierung' : '💫 About the Visualization'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-2">
                {isGerman ? 'Diese Visualisierung nutzt:' : 'This visualization uses:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{isGerman ? 'Nivo Line Chart für klare Darstellung' : 'Nivo Line Chart for clear presentation'}</li>
                <li>{isGerman ? 'Responsive Design für alle Geräte' : 'Responsive design for all devices'}</li>
                <li>{isGerman ? 'Dark Mode Unterstützung' : 'Dark mode support'}</li>
                <li>{isGerman ? 'Interaktive Tooltips' : 'Interactive tooltips'}</li>
                <li>{isGerman ? 'Gold/Metallic CI-Design' : 'Gold/Metallic CI design'}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PremiumDemo;
