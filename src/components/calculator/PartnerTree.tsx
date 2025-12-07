import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, User, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Partner } from '@/utils/calculatorEngine';

interface PartnerTreeProps {
  partners: Partner[];
  onPartnersChange: (partners: Partner[]) => void;
}

const PartnerTree = ({ partners, onPartnersChange }: PartnerTreeProps) => {
  const { t } = useTranslation();
  const [expandedL1, setExpandedL1] = useState<Set<string>>(new Set());

  const l1Partners = partners.filter(p => p.level === 'L1');
  const l2Partners = partners.filter(p => p.level === 'L2');

  const addL1Partner = () => {
    const newPartner: Partner = {
      id: `l1-${Date.now()}-${Math.random()}`,
      name: '',
      initialStake: 0,
      level: 'L1',
    };
    onPartnersChange([...partners, newPartner]);
    setExpandedL1(prev => new Set([...prev, newPartner.id]));
  };

  const addL2Partner = (parentL1Id: string) => {
    const newPartner: Partner = {
      id: `l2-${Date.now()}-${Math.random()}`,
      name: '',
      initialStake: 0,
      level: 'L2',
      parentL1Id,
    };
    onPartnersChange([...partners, newPartner]);
  };

  const removePartner = (id: string) => {
    // If removing L1, also remove all their L2s
    const partnerToRemove = partners.find(p => p.id === id);
    if (partnerToRemove?.level === 'L1') {
      onPartnersChange(partners.filter(p => p.id !== id && p.parentL1Id !== id));
    } else {
      onPartnersChange(partners.filter(p => p.id !== id));
    }
  };

  const updatePartner = (id: string, field: keyof Partner, value: any) => {
    onPartnersChange(partners.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleL1Expand = (id: string) => {
    setExpandedL1(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getL2sForL1 = (l1Id: string) => {
    return l2Partners.filter(p => p.parentL1Id === l1Id);
  };

  return (
    <Card className="metallic-frame">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-gold" size={20} />
            {t('calculator.setup.referrals')}
          </CardTitle>
          <CardDescription>{t('calculator.setup.referralsDesc')}</CardDescription>
        </div>
        <Button onClick={addL1Partner} size="sm" variant="outline" className="border-gold text-gold hover:bg-gold/10">
          <Plus className="mr-2" size={16} />
          {t('calculator.setup.addL1')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {l1Partners.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
            <Users className="mx-auto mb-2 text-gold/50" size={32} />
            <p>{t('calculator.setup.noL1Partners')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {l1Partners.map((l1Partner) => {
              const l2s = getL2sForL1(l1Partner.id);
              const isExpanded = expandedL1.has(l1Partner.id);
              
              return (
                <div key={l1Partner.id} className="border rounded-lg overflow-hidden bg-card">
                  {/* L1 Partner Row */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gold/10 to-transparent">
                    <button
                      onClick={() => toggleL1Expand(l1Partner.id)}
                      className="flex-none p-1 rounded hover:bg-muted transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="text-gold" size={18} />
                      ) : (
                        <ChevronRight className="text-gold" size={18} />
                      )}
                    </button>
                    
                    <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-gold/20">
                      <User className="text-gold" size={18} />
                    </div>
                    
                    <div className="flex-none">
                      <span className="text-xs font-semibold text-gold bg-gold/20 px-2 py-1 rounded">L1</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        value={l1Partner.name}
                        onChange={(e) => updatePartner(l1Partner.id, 'name', e.target.value)}
                        placeholder={t('calculator.setup.partnerName')}
                        className="bg-background"
                      />
                      <Input
                        type="number"
                        value={l1Partner.initialStake || ''}
                        onChange={(e) => updatePartner(l1Partner.id, 'initialStake', Number(e.target.value))}
                        placeholder={t('calculator.setup.partnerStake')}
                        min={0}
                        className="bg-background"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => addL2Partner(l1Partner.id)} 
                      size="sm" 
                      variant="ghost"
                      className="text-gold hover:bg-gold/10"
                    >
                      <Plus size={14} className="mr-1" />
                      L2
                    </Button>
                    
                    <Button 
                      onClick={() => removePartner(l1Partner.id)} 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  {/* L2 Partners */}
                  {isExpanded && l2s.length > 0 && (
                    <div className="border-t bg-muted/30">
                      {l2s.map((l2Partner, index) => (
                        <div 
                          key={l2Partner.id} 
                          className={`flex items-center gap-3 p-4 pl-16 ${index < l2s.length - 1 ? 'border-b' : ''}`}
                        >
                          {/* Tree line connector */}
                          <div className="absolute left-8 w-6 h-px bg-gold/30" style={{ marginTop: '-1px' }} />
                          
                          <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                            <User className="text-muted-foreground" size={14} />
                          </div>
                          
                          <div className="flex-none">
                            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">L2</span>
                          </div>
                          
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <Input
                              value={l2Partner.name}
                              onChange={(e) => updatePartner(l2Partner.id, 'name', e.target.value)}
                              placeholder={t('calculator.setup.partnerName')}
                              className="bg-background"
                            />
                            <Input
                              type="number"
                              value={l2Partner.initialStake || ''}
                              onChange={(e) => updatePartner(l2Partner.id, 'initialStake', Number(e.target.value))}
                              placeholder={t('calculator.setup.partnerStake')}
                              min={0}
                              className="bg-background"
                            />
                          </div>
                          
                          <Button 
                            onClick={() => removePartner(l2Partner.id)} 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isExpanded && l2s.length === 0 && (
                    <div className="border-t bg-muted/30 p-4 pl-16 text-center text-muted-foreground text-sm">
                      Keine L2-Partner. Klicken Sie auf "+L2" um Partner hinzuzufügen.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerTree;