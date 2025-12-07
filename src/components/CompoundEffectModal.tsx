/**
 * CompoundEffectModal - Modal for displaying different compound interest visualizations
 * 
 * Features:
 * - Tab-based navigation between different visualization variants
 * - Support for standard (Nivo, Victory, D3) and premium variants
 * - Premium badges for special visualizations
 * - Responsive design with lazy loading
 */

import React, { lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import '../styles/premium-effects.css';

// Lazy load premium components for better performance
const CompoundEffectShowstopper = lazy(() => import('./CompoundEffectShowstopper'));
const CompoundEffectElegant = lazy(() => import('./CompoundEffectElegant'));
const CompoundEffectExplosive = lazy(() => import('./CompoundEffectExplosive'));

interface CompoundEffectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  principal?: number;
  rate?: number;
  years?: number;
  monthlyContribution?: number;
}

interface VisualizationVariant {
  id: string;
  label: string;
  icon: string;
  premium?: boolean;
  disabled?: boolean;
}

const variants: VisualizationVariant[] = [
  { id: 'showstopper', label: 'Showstopper', icon: '🎆', premium: true },
  { id: 'elegant', label: 'Elegant', icon: '✨', premium: true },
  { id: 'explosive', label: 'Explosive', icon: '💥', premium: true },
];

const LoadingPlaceholder = () => (
  <div className="flex items-center justify-center h-96">
    <div className="premium-loading w-full h-full rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-2">✨</div>
        <div className="text-sm opacity-70">Loading premium visualization...</div>
      </div>
    </div>
  </div>
);

export const CompoundEffectModal: React.FC<CompoundEffectModalProps> = ({
  open,
  onOpenChange,
  principal = 10000,
  rate = 7,
  years = 30,
  monthlyContribution = 500
}) => {
  const [activeTab, setActiveTab] = React.useState('showstopper');

  const commonProps = {
    principal,
    rate,
    years,
    monthlyContribution
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Compound Interest Visualizations
          </DialogTitle>
          <p className="text-sm opacity-70 mt-1">
            Explore different ways to visualize the power of compound interest
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {variants.map((variant) => (
              <TabsTrigger
                key={variant.id}
                value={variant.id}
                disabled={variant.disabled}
                className="relative"
              >
                <span className="mr-2">{variant.icon}</span>
                {variant.label}
                {variant.premium && (
                  <span className="premium-badge ml-2">WOW</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="showstopper" className="mt-0">
            <Suspense fallback={<LoadingPlaceholder />}>
              <CompoundEffectShowstopper {...commonProps} />
            </Suspense>
          </TabsContent>

          <TabsContent value="elegant" className="mt-0">
            <Suspense fallback={<LoadingPlaceholder />}>
              <CompoundEffectElegant {...commonProps} />
            </Suspense>
          </TabsContent>

          <TabsContent value="explosive" className="mt-0">
            <Suspense fallback={<LoadingPlaceholder />}>
              <CompoundEffectExplosive {...commonProps} />
            </Suspense>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <h4 className="font-semibold mb-2 text-sm">💡 Pro Tip</h4>
          <p className="text-xs opacity-80">
            Each visualization uses different effects to demonstrate the same powerful concept: 
            compound interest significantly outperforms linear growth over time. The longer your 
            investment horizon, the more dramatic the difference becomes!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompoundEffectModal;
