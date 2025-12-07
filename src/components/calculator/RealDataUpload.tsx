import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, X, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RealProfitData } from '@/utils/calculatorEngine';
import { useToast } from '@/hooks/use-toast';

interface RealDataUploadProps {
  onDataChange: (data: RealProfitData[]) => void;
  currentData: RealProfitData[];
}

const RealDataUpload = ({ onDataChange, currentData }: RealDataUploadProps) => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualDate, setManualDate] = useState('');
  const [manualRate, setManualRate] = useState('');

  const isGerman = i18n.language === 'de';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row
        const dataLines = lines.slice(1);
        const parsedData: RealProfitData[] = [];
        
        for (const line of dataLines) {
          const [date, rate] = line.split(',').map(s => s.trim());
          if (date && rate) {
            const numRate = parseFloat(rate);
            if (!isNaN(numRate)) {
              parsedData.push({
                date,
                grossProfitRate: numRate / 100, // Convert percentage to decimal
              });
            }
          }
        }
        
        if (parsedData.length > 0) {
          onDataChange([...currentData, ...parsedData]);
          toast({
            title: isGerman ? 'Daten importiert' : 'Data imported',
            description: isGerman 
              ? `${parsedData.length} Datenpunkte geladen`
              : `${parsedData.length} data points loaded`,
          });
        }
      } catch (error) {
        toast({
          title: isGerman ? 'Fehler' : 'Error',
          description: isGerman 
            ? 'Datei konnte nicht gelesen werden. Format: Datum,Gewinn%'
            : 'Could not read file. Format: Date,Profit%',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addManualEntry = () => {
    if (!manualDate || !manualRate) {
      toast({
        title: isGerman ? 'Fehler' : 'Error',
        description: isGerman ? 'Bitte Datum und Gewinnrate eingeben' : 'Please enter date and profit rate',
        variant: 'destructive',
      });
      return;
    }

    const rate = parseFloat(manualRate);
    if (isNaN(rate)) {
      toast({
        title: isGerman ? 'Fehler' : 'Error',
        description: isGerman ? 'Ungültige Gewinnrate' : 'Invalid profit rate',
        variant: 'destructive',
      });
      return;
    }

    const newEntry: RealProfitData = {
      date: manualDate,
      grossProfitRate: rate / 100,
    };

    onDataChange([...currentData, newEntry]);
    setManualDate('');
    setManualRate('');
    
    toast({
      title: isGerman ? 'Datenpunkt hinzugefügt' : 'Data point added',
    });
  };

  const removeEntry = (index: number) => {
    const updated = currentData.filter((_, i) => i !== index);
    onDataChange(updated);
  };

  const clearAll = () => {
    onDataChange([]);
    toast({
      title: isGerman ? 'Alle Daten gelöscht' : 'All data cleared',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(isGerman ? 'de-DE' : 'en-US').format(date);
  };

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label>{isGerman ? 'CSV-Datei hochladen' : 'Upload CSV file'}</Label>
          <div className="text-xs text-muted-foreground mb-2">
            {isGerman ? 'Format: Datum,Gewinn% (z.B. 2024-01-15,0.8)' : 'Format: Date,Profit% (e.g. 2024-01-15,0.8)'}
          </div>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline"
            className="w-full border-gold text-gold hover:bg-gold/10"
          >
            <Upload className="mr-2 text-gold" size={16} />
            {isGerman ? 'CSV auswählen' : 'Select CSV'}
          </Button>
        </div>
      </div>

      {/* Manual Entry */}
      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label>{isGerman ? 'Datum' : 'Date'}</Label>
          <div className="relative">
            <Input
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{isGerman ? 'Bruttogewinn (%)' : 'Gross Profit (%)'}</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.8"
            value={manualRate}
            onChange={(e) => setManualRate(e.target.value)}
          />
        </div>
        <Button onClick={addManualEntry} className="bg-gold text-primary-foreground hover:bg-gold-dark">
          <Check className="mr-2" size={16} />
          {isGerman ? 'Hinzufügen' : 'Add'}
        </Button>
      </div>

      {/* Data Table */}
      {currentData.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>{isGerman ? 'Hochgeladene Daten' : 'Uploaded Data'} ({currentData.length})</Label>
            <Button onClick={clearAll} variant="destructive" size="sm">
              {isGerman ? 'Alle löschen' : 'Clear all'}
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isGerman ? 'Datum' : 'Date'}</TableHead>
                  <TableHead className="text-right">{isGerman ? 'Bruttogewinn' : 'Gross Profit'}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.slice(0, 20).map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell className="text-right text-gold">
                      {(entry.grossProfitRate * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => removeEntry(index)} 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                      >
                        <X size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {currentData.length > 20 && (
              <div className="text-center text-sm text-muted-foreground py-2">
                {isGerman 
                  ? `... und ${currentData.length - 20} weitere`
                  : `... and ${currentData.length - 20} more`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealDataUpload;