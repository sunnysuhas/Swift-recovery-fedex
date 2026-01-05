import { useState } from 'react';
import { BotMessageSquare, FileText, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { generateCaseActionPlan } from '@/ai/flows/generate-case-action-plan';
import type { Case, DCA } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { useUser } from '@/components/providers/local-auth-provider';
import { updateCase } from '@/actions/cases';
import { useToast } from '@/hooks/use-toast';

type GeneratePlanActionProps = {
  caseItem: Case;
  dca: DCA | undefined;
};

export function GeneratePlanAction({ caseItem, dca }: GeneratePlanActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionPlan, setActionPlan] = useState('');
  const { user } = useUser();
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsOpen(true);
    if (actionPlan) return; // Don't re-generate if we already have a plan

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

  const handleSavePlan = async () => {
    if (!user || !actionPlan) return;
    setIsSaving(true);
    try {
      await updateCase(caseItem.id, { actionPlan });
      toast({
        title: 'Action Plan Saved',
        description: 'The AI-generated plan has been added to the case history.',
      });
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the action plan. Please try again.',
      });
    } finally {
      setIsSaving(false);
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
          <ScrollArea className="h-[calc(100%-12rem)] mt-4 pr-4">
            <div className="p-4 bg-muted/50 rounded-lg min-h-[200px] whitespace-pre-wrap font-sans">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground animate-pulse">Generating plan...</p>
                </div>
              ) : (
                <p className="text-sm">{actionPlan || caseItem.actionPlan}</p>
              )}
            </div>
          </ScrollArea>
          <SheetFooter className='pt-4'>
            <Button onClick={handleSavePlan} disabled={isSaving || isLoading || !actionPlan}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Plan
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
