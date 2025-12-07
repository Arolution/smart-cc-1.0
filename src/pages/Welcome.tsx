import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    t('welcome.features.daily'),
    t('welcome.features.compound'),
    t('welcome.features.tiers'),
    t('welcome.features.referral'),
    t('welcome.features.simulation'),
    t('welcome.features.export'),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <div className="text-center space-y-4 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            {t('welcome.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('welcome.description')}
          </p>
        </div>

        <Card className="border-gold/20 shadow-lg animate-in slide-in-from-bottom duration-700">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="text-gold" />
              {t('welcome.features.title')}
            </CardTitle>
            <CardDescription>
              Entdecke die umfangreichen Möglichkeiten des Calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 animate-in slide-in-from-left duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="text-gold flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center animate-in fade-in duration-700 delay-300">
          <Button
            size="lg"
            onClick={() => navigate('/disclaimer')}
            className="bg-gradient-to-r from-gold via-gold-dark to-gold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300 group"
          >
            {t('welcome.continue')}
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
