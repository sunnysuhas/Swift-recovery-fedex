'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, BadgePercent, Clock, HelpCircle, Save, Loader2, RefreshCw, MessageSquare, AlertOctagon, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { updateCase } from '@/actions/cases';
import { getDcas } from '@/actions/dcas';
import { runCaseIntelligenceAction } from '@/actions/ai-actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { Case, DCA } from '@/lib/types';

type AICaseAnalysisDashboardProps = {
  caseItem: Case;
  dca: DCA | undefined;
};

export function AICaseAnalysisDashboard({ caseItem, dca }: AICaseAnalysisDashboardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // AI results state
  const [probability, setProbability] = useState<number | null>(caseItem.recoveryProbability || null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High' | 'Critical' | null>(null);
  const [expectedRecovery, setExpectedRecovery] = useState<number | null>(null);
  const [recommendedDCA, setRecommendedDCA] = useState<string>('');
  const [timelineForecast, setTimelineForecast] = useState<string>('');
  const [strategyName, setStrategyName] = useState<string>('');
  const [actionSteps, setActionSteps] = useState<string[]>([]);
  const [suggestedDiscount, setSuggestedDiscount] = useState<number>(0);
  const [escalationPath, setEscalationPath] = useState<string>('');
  const [dcaIdToAssign, setDcaIdToAssign] = useState<string>('');

  // Initial load
  useEffect(() => {
    if (caseItem.actionPlan) {
      try {
        if (caseItem.actionPlan.trim().startsWith('{')) {
          const parsed = JSON.parse(caseItem.actionPlan);
          setStrategyName(parsed.strategyName || 'AI Strategy Audit');
          setActionSteps(parsed.actionSteps || []);
          setSuggestedDiscount(parsed.suggestedDiscount || 0);
          setEscalationPath(parsed.escalationPath || parsed.escalationRecommendation || '');
          setRiskLevel(parsed.riskLevel || parsed.riskClassification || null);
          setConfidence(parsed.confidence || parsed.confidenceScore || 85);
          setExpectedRecovery(parsed.expectedRecoveryAmount || parsed.expectedRecovery || null);
          setRecommendedDCA(parsed.recommendedDCA || '');
          setTimelineForecast(parsed.timelineForecast || '');
          if (parsed.factors) setFactors(parsed.factors);
        } else {
          setStrategyName('AI Customized Recovery Strategy');
          setActionSteps(caseItem.actionPlan.split('\n').filter(Boolean));
        }
      } catch (e) {
        setStrategyName('Saved Action Plan');
        setActionSteps([caseItem.actionPlan]);
      }
    }
  }, [caseItem]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const historyStr = typeof caseItem.caseHistory === 'string'
        ? caseItem.caseHistory
        : JSON.stringify(caseItem.caseHistory || []);

      // Load active DCA list to pass names for intelligent routing matching
      const dcasData = await getDcas();
      const dcaListSummary = dcasData.map(d => `${d.name} (Recovery Rate: ${d.recoveryRate}%, Active Cases: ${d.activeCases})`).join(', ');

      const res = await runCaseIntelligenceAction({
        debtAmount: caseItem.amount,
        aging: caseItem.aging,
        paymentBehavior: caseItem.paymentBehavior || 'No response recorded',
        caseHistory: historyStr,
        dcaNameList: dcaListSummary || 'Apex Financial (85%), Credit Solutions (82%), Zenith Collections (65%)',
      });

      setProbability(res.recoveryProbability);
      setConfidence(res.confidenceScore);
      setFactors(res.keyFactors);
      setRiskLevel(res.riskClassification);
      setExpectedRecovery(res.expectedRecoveryAmount);
      setRecommendedDCA(res.recommendedDCA);
      setTimelineForecast(res.timelineForecast);
      setStrategyName('Operational AI Plan');
      setActionSteps(res.actionSteps);
      setSuggestedDiscount(res.suggestedDiscount);
      setEscalationPath(res.escalationRecommendation);

      const matched = dcasData.find(d => 
        d.name.toLowerCase() === res.recommendedDCA.toLowerCase() || 
        d.name.toLowerCase().includes(res.recommendedDCA.toLowerCase()) ||
        res.recommendedDCA.toLowerCase().includes(d.name.toLowerCase())
      );
      if (matched) {
        setDcaIdToAssign(matched.id);
      }

      toast({
        title: 'AI Audit Finished',
        description: 'Operational parameters loaded successfully.',
      });
    } catch (error) {
      console.error('Error running case audit:', error);
      toast({
        variant: 'destructive',
        title: 'Audit Failed',
        description: 'AI model failed during evaluation.',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async () => {
    if (probability === null || !actionSteps.length) return;
    setSaving(true);
    try {
      const fullAnalysisPayload = {
        strategyName: 'Operational AI Plan',
        actionSteps,
        suggestedDiscount,
        escalationRecommendation: escalationPath,
        riskClassification: riskLevel,
        expectedRecoveryAmount: expectedRecovery,
        recommendedDCA,
        timelineForecast,
        confidenceScore: confidence,
        factors,
      };

      await updateCase(caseItem.id, {
        recoveryProbability: probability,
        actionPlan: JSON.stringify(fullAnalysisPayload),
        assignedDcaId: dcaIdToAssign || caseItem.assignedDCA || null,
        status: caseItem.status === 'New' ? 'Assigned' : caseItem.status,
      });

      toast({
        title: 'Audit Committed',
        description: 'Collection strategy updated on case ledger.',
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (error) {
      console.error('Failed to save audit:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Unable to commit AI strategy to database.',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  return (
    <Card className="shadow-none border-border/40 bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Operations Audit
          </CardTitle>
          <CardDescription className="text-[10px]">Cognitive case routing & recovery predictions</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={runAnalysis}
          disabled={loading}
          className="h-7 text-[10px] font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-150"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Audit Case
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4 text-xs">
        {probability === null && !loading ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-2 animate-bounce" />
            <p className="text-[11px] text-muted-foreground max-w-[200px] mb-3">
              Trigger a structured case audit using Gemini 2.5 Flash to predict yields and optimize routing.
            </p>
            <Button size="sm" onClick={runAnalysis}>
              Auditing Ledger
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary KPI predictions */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3.5 rounded border border-border/30 bg-muted/20">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Recovery Probability</span>
                <span className="text-xl font-extrabold text-foreground font-mono block mt-1">{probability}%</span>
                {confidence && (
                  <span className="text-[9px] text-muted-foreground">({confidence}% confidence)</span>
                )}
              </div>
              <div className="p-3.5 rounded border border-border/30 bg-muted/20">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Expected Recovery</span>
                <span className="text-xl font-extrabold text-foreground font-mono block mt-1">
                  ${expectedRecovery ? Math.round(expectedRecovery).toLocaleString() : Math.round(caseItem.amount * ((probability ?? 0) / 100)).toLocaleString()}
                </span>
                <span className="text-[9px] text-muted-foreground">Yield prediction</span>
              </div>
            </div>

            {/* Risk & Matching details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                <span className="text-muted-foreground">Debtor Risk Tier</span>
                <Badge variant="outline" className={`text-[10px] uppercase font-bold ${getRiskBadgeColor(riskLevel || 'Low')}`}>
                  {riskLevel || 'Low'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                <span className="text-muted-foreground">Recommended DCA</span>
                <span className="font-bold text-foreground truncate max-w-[150px]">{recommendedDCA || dca?.name || 'Apex Financial'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                <span className="text-muted-foreground">Timeline Forecast</span>
                <span className="font-medium text-foreground">{timelineForecast || 'Immediate contact'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                <span className="text-muted-foreground">Suggested Discount</span>
                <span className="font-mono font-bold text-foreground">{suggestedDiscount}% cap</span>
              </div>
            </div>

            {/* Action checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-muted-foreground font-semibold block">Suggested Actions Checklist</span>
              <div className="space-y-1.5">
                {actionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-normal text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Escalation criteria */}
            {escalationPath && (
              <div className="p-2.5 rounded bg-red-500/5 border border-red-500/10 flex items-start gap-2">
                <AlertOctagon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-red-700 dark:text-red-400">
                  <span className="font-bold uppercase tracking-wider block text-[8px] mb-0.5 text-red-500">Escalation Trigger</span>
                  {escalationPath}
                </div>
              </div>
            )}

            {/* Key factors badges */}
            {factors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {factors.slice(0, 3).map((f, i) => (
                  <span key={i} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/30">
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Save Button */}
            {strategyName !== 'Saved Action Plan' && (
              <Button
                onClick={saveAnalysis}
                disabled={saving}
                className="w-full h-8 mt-2 text-xs font-semibold"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-2" />
                )}
                Save Audit Strategy
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
