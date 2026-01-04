'use client';

import { useState } from 'react';
import { BotMessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { generateCaseActionPlan } from '@/ai/flows/generate-case-action-plan';
import type { Case, DCA } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

type GeneratePlanActionProps = {
  caseItem: Case;
  dca: DCA | undefined;
};

export function GeneratePlanAction({ caseItem, dca }: GeneratePlanActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState('');

  const handleGeneratePlan = async () => {
    setIsOpen(true);
    if(actionPlan) return; // Don't re-generate if we already have a plan
    
    setIsLoading(true);
    try {
      const result = await generateCaseActionPlan({
        debtAmount: caseItem.amount,
        aging: caseItem.aging,
        customerPaymentBehavior: caseItem.paymentBehavior,
        historicalDCAperformance: dca ? `${dca.name} has a ${dca.recoveryRate}% recovery rate.` : 'No DCA assigned yet.',
      });
      // Simple markdown-like formatting for display
      const formattedPlan = result.actionPlan
        .split('\n')
        .map(line => {
            if (line.startsWith('* ')) return `• ${line.substring(2)}`;
            if (line.match(/^\d+\./)) return `\n${line}`;
            return line;
        })
        .join('\n');
      setActionPlan(formattedPlan);
    } catch (error) {
      console.error('Failed to generate action plan:', error);
      setActionPlan('Sorry, I was unable to generate an action plan at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="w-full justify-start"
        variant="outline"
        onClick={handleGeneratePlan}
        disabled={isLoading}
      >
        <FileText className="mr-2 h-4 w-4" />
        Generate Action Plan
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>AI-Generated Action Plan</SheetTitle>
            <SheetDescription>
              A recommended strategy for case {caseItem.id}.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100%-8rem)] mt-4 pr-4">
            <div className="p-4 bg-muted/50 rounded-lg min-h-[200px] whitespace-pre-wrap font-sans">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground animate-pulse">Generating plan...</p>
                </div>
              ) : (
                <p className="text-sm">{actionPlan}</p>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
