'use client';

import { useState } from 'react';
import { Sparkles, FileSpreadsheet, Loader2, AlertCircle, ShieldCheck, ListTodo, ClipboardCopy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { analyzeCsvDataAction } from '@/actions/ai-actions';
import { useToast } from '@/hooks/use-toast';

type AICsvProfilerProps = {
  fileName: string;
  rowCount: number;
  previewRows: any[];
  dataType: 'cases' | 'dcas';
};

export function AICsvProfiler({ fileName, rowCount, previewRows, dataType }: AICsvProfilerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    dataQualityScore: number;
    missingFields: string[];
    invalidFormats: string[];
    duplicateDetection: string[];
    assignmentSuggestions: string[];
    summary: string;
  } | null>(null);

  const handleRunProfiler = async () => {
    setLoading(true);
    try {
      const previewSlice = previewRows.slice(0, 4);
      const previewStr = JSON.stringify(previewSlice);

      const res = await analyzeCsvDataAction({
        fileName,
        rowCount,
        previewRows: previewStr,
        dataType,
      });

      setAnalysis(res);
      toast({
        title: 'Audit Complete',
        description: 'AI data quality check finished successfully.',
      });
    } catch (error) {
      console.error('Error analyzing CSV:', error);
      toast({
        variant: 'destructive',
        title: 'CSV Audit Failed',
        description: 'Unable to profile data quality parameters.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-none border-border/40 bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            AI CSV Quality Auditor
          </CardTitle>
          <CardDescription className="text-[10px]">Data profiling, validation checks & allocation guidelines</CardDescription>
        </div>
        {!analysis && !loading && (
          <Button size="sm" onClick={handleRunProfiler} disabled={rowCount === 0} className="h-7 text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" />
            Audit File
          </Button>
        )}
        {analysis && (
          <Button size="sm" variant="outline" onClick={handleRunProfiler} disabled={loading} className="h-7 text-[10px]">
            <RefreshCw className="h-3 w-3 mr-1" />
            Re-audit
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 text-xs">
        {!analysis && !loading ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileSpreadsheet className="h-9 w-9 text-muted-foreground/30 mb-2" />
            <p className="text-[11px] text-muted-foreground max-w-xs mb-3">
              Trigger a structured schema check to find duplicates, formatting errors, and missing fields.
            </p>
            <Button size="sm" variant="outline" onClick={handleRunProfiler} disabled={rowCount === 0}>
              Verify File Integrity
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
            <p className="text-[11px] text-muted-foreground animate-pulse">
              Parsing headers, checking values for negative amounts, and executing duplicate search...
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            {/* Quality Score Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-muted-foreground uppercase tracking-wider">File Compliance Score</span>
                <span className="text-foreground">{analysis.dataQualityScore}/100</span>
              </div>
              <Progress value={analysis.dataQualityScore} className="h-2" />
            </div>

            {/* Quality Summary */}
            <div className="text-[11px] leading-relaxed text-muted-foreground bg-muted/20 border border-border/30 p-3 rounded whitespace-pre-wrap">
              <span className="font-bold text-foreground block mb-1 uppercase tracking-wider text-[8px] text-primary">Profiler Summary</span>
              {analysis.summary}
            </div>

            {/* Anomalies & Duplicates Grid */}
            <div className="grid gap-3 md:grid-cols-2">
              {/* Warnings / Invalid formats / Missing fields */}
              <div className="p-3 rounded bg-card border border-border/30 space-y-2">
                <span className="font-bold text-[9px] uppercase tracking-wider text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Format & Missing Checks
                </span>
                {analysis.missingFields.length === 0 && analysis.invalidFormats.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">Compliance check passed.</p>
                ) : (
                  <div className="space-y-2">
                    {analysis.missingFields.length > 0 && (
                      <div>
                        <span className="text-[8px] font-bold text-muted-foreground block uppercase">Missing Headers:</span>
                        <ul className="text-[10px] text-muted-foreground list-disc pl-3 mt-0.5 space-y-0.5">
                          {analysis.missingFields.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                    {analysis.invalidFormats.length > 0 && (
                      <div>
                        <span className="text-[8px] font-bold text-muted-foreground block uppercase">Invalid Formats:</span>
                        <ul className="text-[10px] text-muted-foreground list-disc pl-3 mt-0.5 space-y-0.5">
                          {analysis.invalidFormats.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Duplicates */}
              <div className="p-3 rounded bg-card border border-border/30 space-y-2">
                <span className="font-bold text-[9px] uppercase tracking-wider text-amber-600 flex items-center gap-1">
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  Duplicate Search
                </span>
                {analysis.duplicateDetection.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">No duplicate rows detected.</p>
                ) : (
                  <ul className="text-[10px] text-muted-foreground list-disc pl-3 space-y-0.5">
                    {analysis.duplicateDetection.map((d, i) => (
                      <li key={i} className="truncate max-w-[160px]">{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Opportunities & suggestions */}
            <div className="p-3 rounded bg-card border border-border/30 space-y-2">
              <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Suggested Router Rules
              </span>
              {analysis.assignmentSuggestions.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">No custom routing recommendations generated.</p>
              ) : (
                <ul className="text-[10px] text-muted-foreground list-disc pl-3 space-y-0.5">
                  {analysis.assignmentSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
