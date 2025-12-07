import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Toggle } from '@/components/ui/toggle';
import { calculateCompound, CalculationParams, TransactionPlan, YearlyResult, Partner, RealProfitData } from '@/utils/calculatorEngine';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PartnerTree from './PartnerTree';
import CalculatingAnimation from './CalculatingAnimation';

interface CalculatorSetupProps {
  onCalculate: (results: YearlyResult[], params: CalculationParams) => void;
}

const CalculatorSetup = ({ onCalculate }: CalculatorSetupProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  const [initialStake, setInitialStake] = useState<number>(1000);
  const [durationYears, setDurationYears] = useState<string>('1');
  const [durationMonths, setDurationMonths] = useState<string>('0');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [restakingDays, setRestakingDays] = useState<number[]>([1, 2, 3, 4, 5]); // All weekdays by default
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [deposits, setDeposits] = useState<TransactionPlan[]>([]);
  const [withdrawals, setWithdrawals] = useState<TransactionPlan[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const isGerman = i18n.language === 'de';
  const dateLocale = isGerman ? de : enUS;

  const weekdays = [
    { day: 1, label: t('calculator.setup.monday') },
    { day: 2, label: t('calculator.setup.tuesday') },
    { day: 3, label: t('calculator.setup.wednesday') },
    { day: 4, label: t('calculator.setup.thursday') },
    { day: 5, label: t('calculator.setup.friday') },
  ];

  const toggleRestakingDay = (day: number) => {
    setRestakingDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const addDeposit = () => {
    setDeposits([...deposits, { frequency: 'monthly', amount: 0 }]);
  };

  const addWithdrawal = () => {
    setWithdrawals([...withdrawals, { frequency: 'monthly', amount: 0 }]);
  };

  const removeDeposit = (index: number) => {
    setDeposits(deposits.filter((_, i) => i !== index));
  };

  const removeWithdrawal = (index: number) => {
    setWithdrawals(withdrawals.filter((_, i) => i !== index));
  };

  const updateDeposit = (index: number, field: keyof TransactionPlan, value: any) => {
    const updated = [...deposits];
    updated[index] = { ...updated[index], [field]: value };
    setDeposits(updated);
  };

  const updateWithdrawal = (index: number, field: keyof TransactionPlan, value: any) => {
    const updated = [...withdrawals];
    updated[index] = { ...updated[index], [field]: value };
    setWithdrawals(updated);
  };

  const handleCalculate = async () => {
    if (initialStake < 200) {
      toast({
        title: isGerman ? 'Fehler' : 'Error',
        description: isGerman ? 'Mindestinvestment beträgt $200' : 'Minimum investment is $200',
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);

    // Small delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    const params: CalculationParams = {
      initialStake,
      durationYears: parseInt(durationYears),
      durationMonths: parseInt(durationMonths),
      partners,
      deposits,
      withdrawals,
      startDate,
      restakingDays,
    };

    const results = calculateCompound(params);
    
    setIsCalculating(false);
    onCalculate(results, params);
    
    toast({
      title: t('calculator.setup.calculationSuccess'),
      description: t('calculator.setup.simulationComplete'),
    });
  };

  return (
    <>
      <CalculatingAnimation isCalculating={isCalculating} />
      
      <div className="space-y-6">
        {/* Simulation Settings */}
        <Card className="metallic-frame">
          <CardHeader>
            <CardTitle>{t('calculator.setup.simulationSettings')}</CardTitle>
            <CardDescription>{t('calculator.setup.simulationSettingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Start Date and Initial Stake */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('calculator.setup.startDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gold" />
                      {startDate ? format(startDate, "PPP", { locale: dateLocale }) : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initialStake">{t('calculator.setup.initialStake')}</Label>
                <Input
                  id="initialStake"
                  type="number"
                  value={initialStake}
                  onChange={(e) => setInitialStake(Number(e.target.value))}
                  min={200}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="years">{t('calculator.setup.years')}</Label>
                <Select value={durationYears} onValueChange={setDurationYears}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="months">{t('calculator.setup.months')}</Label>
                <Select value={durationMonths} onValueChange={setDurationMonths}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Restaking Days */}
            <div className="space-y-3">
              <div>
                <Label>{t('calculator.setup.restakingDays')}</Label>
                <p className="text-sm text-muted-foreground">{t('calculator.setup.restakingDaysDesc')}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {weekdays.map(({ day, label }) => (
                  <Toggle
                    key={day}
                    pressed={restakingDays.includes(day)}
                    onPressedChange={() => toggleRestakingDay(day)}
                    className={cn(
                      "data-[state=on]:bg-gold data-[state=on]:text-primary-foreground",
                      "border border-input hover:bg-gold/10"
                    )}
                  >
                    {label}
                  </Toggle>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners Tree */}
        <PartnerTree partners={partners} onPartnersChange={setPartners} />

        {/* Deposits */}
        <Card className="metallic-frame">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('calculator.setup.deposits')}</CardTitle>
              <CardDescription>{isGerman ? 'Regelmäßige Einzahlungen planen' : 'Plan regular deposits'}</CardDescription>
            </div>
            <Button onClick={addDeposit} size="sm" variant="outline" className="border-gold text-gold hover:bg-gold/10">
              <Plus className="mr-2" size={16} />
              {t('calculator.setup.addDeposit')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {deposits.map((deposit, index) => (
              <div key={index} className="flex gap-4 items-end p-4 bg-muted/50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>{t('calculator.setup.frequency')}</Label>
                  <Select
                    value={deposit.frequency}
                    onValueChange={(value) => updateDeposit(index, 'frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t('calculator.setup.monthly')}</SelectItem>
                      <SelectItem value="quarterly">{t('calculator.setup.quarterly')}</SelectItem>
                      <SelectItem value="yearly">{t('calculator.setup.yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>{t('calculator.setup.amount')}</Label>
                  <Input
                    type="number"
                    value={deposit.amount || 0}
                    onChange={(e) => updateDeposit(index, 'amount', Number(e.target.value))}
                    min={0}
                  />
                </div>
                <Button onClick={() => removeDeposit(index)} variant="destructive" size="icon">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {deposits.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {isGerman ? 'Keine Einzahlungen geplant' : 'No deposits planned'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Withdrawals */}
        <Card className="metallic-frame">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('calculator.setup.withdrawals')}</CardTitle>
              <CardDescription>{isGerman ? 'Regelmäßige Auszahlungen planen' : 'Plan regular withdrawals'}</CardDescription>
            </div>
            <Button onClick={addWithdrawal} size="sm" variant="outline" className="border-gold text-gold hover:bg-gold/10">
              <Plus className="mr-2" size={16} />
              {t('calculator.setup.addWithdrawal')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {withdrawals.map((withdrawal, index) => (
              <div key={index} className="flex gap-4 items-end p-4 bg-muted/50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>{t('calculator.setup.frequency')}</Label>
                  <Select
                    value={withdrawal.frequency}
                    onValueChange={(value) => updateWithdrawal(index, 'frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t('calculator.setup.monthly')}</SelectItem>
                      <SelectItem value="quarterly">{t('calculator.setup.quarterly')}</SelectItem>
                      <SelectItem value="yearly">{t('calculator.setup.yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>{t('calculator.setup.amount')}</Label>
                  <Input
                    type="number"
                    value={withdrawal.amount || 0}
                    onChange={(e) => updateWithdrawal(index, 'amount', Number(e.target.value))}
                    min={0}
                  />
                </div>
                <Button onClick={() => removeWithdrawal(index)} variant="destructive" size="icon">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {withdrawals.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {isGerman ? 'Keine Auszahlungen geplant' : 'No withdrawals planned'}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleCalculate}
            size="lg"
            disabled={isCalculating}
            className="bg-gradient-to-r from-gold via-gold-dark to-gold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300 min-w-[200px]"
          >
            {t('calculator.setup.calculate')}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CalculatorSetup;