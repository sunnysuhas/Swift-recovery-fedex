'use client';

import { useState } from 'react';
import { Sparkles, FileText, Loader2, Download, CheckCircle, RefreshCw, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateExecutiveReportAction } from '@/actions/ai-actions';
import { useToast } from '@/hooks/use-toast';

type AIExecutiveSummaryProps = {
  kpis: {
    totalOutstanding: number;
    totalRecovered: number;
    recoveryRate: number;
    activeCases: number;
    newCasesCount: number;
  } | null;
  agingData: Array<{ range: string; value: number }>;
  dcaPerformance: Array<{ name: string; 'Recovery Rate': number }>;
};

export function AIExecutiveSummary({ kpis, agingData, dcaPerformance }: AIExecutiveSummaryProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{
    reportTitle: string;
    executiveSummary: string;
    trends: string;
    risks: string;
    recommendations: string;
    pdfFormattedText: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!kpis) return;
    setLoading(true);
    try {
      const agingSummary = agingData.map((a) => `${a.range}: $${a.value.toLocaleString()}`).join(', ');
      const leaderboardSummary = dcaPerformance.map((d) => `${d.name}: ${d['Recovery Rate']}%`).join(', ');

      const res = await generateExecutiveReportAction({
        totalOutstanding: kpis.totalOutstanding,
        totalRecovered: kpis.totalRecovered,
        recoveryRate: kpis.recoveryRate,
        activeCases: kpis.activeCases,
        agingDistribution: agingSummary,
        dcaPerformance: leaderboardSummary,
      });

      setReport(res);
      toast({
        title: 'Report Compiled',
        description: 'AI Executive briefing generated from active ledger metrics.',
      });
    } catch (error) {
      console.error('Error generating AI report:', error);
      toast({
        variant: 'destructive',
        title: 'Compilation Failed',
        description: 'Unable to compile report at this time.',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReportTxt = () => {
    if (!report) return;
    try {
      const content = report.pdfFormattedText;
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${report.reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.md`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Briefing Exported',
        description: 'Markdown briefing document has been saved.',
      });
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  return (
    <Card className="shadow-none border-border/40 bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            AI Executive Command Center
          </CardTitle>
          <CardDescription className="text-[10px]">On-demand C-level briefings compiled by Gemini</CardDescription>
        </div>
        {report && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={loading} className="h-7 text-[10px] font-semibold">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
              Re-generate
            </Button>
            <Button size="sm" onClick={downloadReportTxt} className="h-7 text-[10px] font-semibold">
              <Download className="h-3 w-3 mr-1" />
              Export Briefing
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 text-xs">
        {!report && !loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <h4 className="font-bold text-xs mb-1">Audit Ledger & Write Briefing</h4>
            <p className="text-[11px] text-muted-foreground max-w-sm mb-4 leading-relaxed">
              Consolidate all database metrics, charts, and agency performance leaderboards into a cohesive C-suite briefing.
            </p>
            <Button onClick={handleGenerate} disabled={!kpis} size="sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Compile Report with Gemini
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
            <p className="text-[11px] text-muted-foreground animate-pulse">
              Auditing write-off risk patterns, evaluating DCA caseload balances, and generating briefing...
            </p>
          </div>
        ) : report ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b border-border/20 pb-2 text-foreground">{report.reportTitle}</h3>
            
            {/* Executive Summary Section */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground/90 leading-relaxed bg-muted/20 p-3.5 rounded border border-border/30 whitespace-pre-wrap">
              <span className="font-bold text-foreground block mb-1 uppercase tracking-wider text-[8px] text-primary">Executive Summary</span>
              {report.executiveSummary}
            </div>

            {/* Structured Findings */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Trends */}
              <div className="p-3.5 rounded bg-card border border-border/30 space-y-2">
                <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Monthly Velocity Trends
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{report.trends}</p>
              </div>

              {/* Risks */}
              <div className="p-3.5 rounded bg-card border border-border/30 space-y-2">
                <span className="font-bold text-[9px] uppercase tracking-wider text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Portfolio Risk Analysis
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{report.risks}</p>
              </div>

              {/* Recommendations */}
              <div className="p-3.5 rounded bg-card border border-border/30 space-y-2">
                <span className="font-bold text-[9px] uppercase tracking-wider text-primary flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Operations Actions
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{report.recommendations}</p>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
