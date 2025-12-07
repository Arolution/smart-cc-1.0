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
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import CompoundEffectShowstopper from '@/components/CompoundEffectShowstopper';
import CompoundEffectElegant from '@/components/CompoundEffectElegant';
import CompoundEffectExplosive from '@/components/CompoundEffectExplosive';

const PremiumDemo = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  // Default values for demonstration
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(30);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [activeTab, setActiveTab] = useState('showstopper');

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value >= 0) {
        setter(value);
      }
    };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isGerman ? 'Zurück' : 'Back'}
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">
              {isGerman ? 'Premium Visualisierungen' : 'Premium Visualizations'}
            </h1>
          </div>
          
          <p className="text-muted-foreground text-lg max-w-3xl">
            {isGerman 
              ? 'Erleben Sie die Kraft des Zinseszins-Effekts mit drei spektakulären Visualisierungsvarianten. Jede Variante verwendet unterschiedliche Premium-Effekte, um den dramatischen Unterschied zwischen linearem und exponentiellem Wachstum zu verdeutlichen.'
              : 'Experience the power of compound interest with three spectacular visualization variants. Each variant uses different premium effects to illustrate the dramatic difference between linear and exponential growth.'}
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

        {/* Visualization Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="showstopper" className="text-base">
              🎆 {isGerman ? 'Showstopper' : 'Showstopper'}
              <span className="premium-badge ml-2">WOW</span>
            </TabsTrigger>
            <TabsTrigger value="elegant" className="text-base">
              ✨ {isGerman ? 'Elegant' : 'Elegant'}
              <span className="premium-badge ml-2">WOW</span>
            </TabsTrigger>
            <TabsTrigger value="explosive" className="text-base">
              💥 {isGerman ? 'Explosiv' : 'Explosive'}
              <span className="premium-badge ml-2">WOW</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="showstopper">
            <CompoundEffectShowstopper
              principal={principal}
              rate={rate}
              years={years}
              monthlyContribution={monthlyContribution}
            />
          </TabsContent>

          <TabsContent value="elegant">
            <CompoundEffectElegant
              principal={principal}
              rate={rate}
              years={years}
              monthlyContribution={monthlyContribution}
            />
          </TabsContent>

          <TabsContent value="explosive">
            <CompoundEffectExplosive
              principal={principal}
              rate={rate}
              years={years}
              monthlyContribution={monthlyContribution}
            />
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎆 Showstopper</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-2">
                {isGerman ? 'Effekte:' : 'Effects:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{isGerman ? 'Neon-Glühen mit Puls' : 'Neon glow with pulse'}</li>
                <li>{isGerman ? 'Konfetti-Explosion' : 'Confetti explosion'}</li>
                <li>{isGerman ? 'Animierte Zahlen' : 'Animated numbers'}</li>
                <li>{isGerman ? 'Glasmorphismus' : 'Glassmorphism'}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">✨ Elegant</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-2">
                {isGerman ? 'Effekte:' : 'Effects:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{isGerman ? 'Flüssigkeits-Anzeige' : 'Liquid fill gauge'}</li>
                <li>{isGerman ? 'Partikel-Effekt' : 'Particle trail'}</li>
                <li>{isGerman ? 'Spotlight-Reveal' : 'Spotlight reveal'}</li>
                <li>{isGerman ? 'Interaktive Partikel' : 'Interactive particles'}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💥 Explosive</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-2">
                {isGerman ? 'Effekte:' : 'Effects:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{isGerman ? 'Schockwellen-Animation' : 'Shockwave animation'}</li>
                <li>{isGerman ? 'Feuerwerk (bei >$10k)' : 'Fireworks (at >$10k)'}</li>
                <li>{isGerman ? '3D-Balken-Effekt' : '3D bar effect'}</li>
                <li>{isGerman ? 'Spring-Animationen' : 'Spring animations'}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PremiumDemo;
