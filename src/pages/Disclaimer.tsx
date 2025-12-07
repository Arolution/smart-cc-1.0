import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
const Disclaimer = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [accepted, setAccepted] = useState(false);
  const handleContinue = () => {
    if (accepted) {
      navigate('/calculator');
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6 flex items-center justify-center">
      <Card className="max-w-3xl w-full border-destructive/30 shadow-xl animate-in zoom-in duration-500">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="text-destructive" size={48} />
            </div>
          </div>
          <CardTitle className="text-3xl">{t('disclaimer.title')}</CardTitle>
          <CardDescription className="text-base">
            ​
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg border border-border">
            <p className="text-foreground leading-relaxed">
              {t('disclaimer.content')}
            </p>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-card rounded-lg border border-gold/20">
            <Checkbox id="accept" checked={accepted} onCheckedChange={checked => setAccepted(checked as boolean)} className="mt-1" />
            <Label htmlFor="accept" className="text-sm font-medium leading-relaxed cursor-pointer">
              {t('disclaimer.checkbox')}
            </Label>
          </div>

          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={handleContinue} disabled={!accepted} className="bg-gradient-to-r from-gold via-gold-dark to-gold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {t('disclaimer.accept')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Disclaimer;