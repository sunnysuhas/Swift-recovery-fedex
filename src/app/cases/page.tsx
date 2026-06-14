'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CasesTable } from '@/components/cases/cases-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCases } from '@/actions/cases';
import { getDcas } from '@/actions/dcas';
import { useUser } from '@/components/providers/local-auth-provider';
import { Case, DCA } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertTriangle, FileText, Sparkles } from 'lucide-react';

function CasesPageContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  const [allCases, setAllCases] = useState<Case[] | null>(null);
  const [dcas, setDcas] = useState<DCA[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [casesData, dcasData] = await Promise.all([getCases(user.uid, user.role), getDcas()]);
        setAllCases(casesData as unknown as Case[]);
        setDcas(dcasData as unknown as DCA[]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const filterCases = (cases: Case[] | null) => {
    if (!cases) return [];
    if (!searchQuery) return cases;
    return cases.filter(c => c.debtor.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const filteredCases = filterCases(allCases);

  const newCases = filteredCases.filter(c => c.status === 'New');
  const assignedCases = filteredCases.filter(c => c.status === 'Assigned');
  const atRiskCases = filteredCases.filter(c => c.slaStatus === 'At Risk' || c.slaStatus === 'Breached');

  // Compute metrics for the KPI ribbon
  const totalOutstanding = filteredCases ? filteredCases.reduce((acc, curr) => acc + curr.amount, 0) : 0;
  const avgProb = filteredCases && filteredCases.length > 0 
    ? Math.round(filteredCases.reduce((acc, curr) => acc + (curr.recoveryProbability || 0), 0) / filteredCases.length) 
    : 0;
  const highPriorityCount = filteredCases ? filteredCases.filter(c => (c.priorityScore || 0) >= 80).length : 0;
  const atRiskCount = filteredCases ? filteredCases.filter(c => c.slaStatus === 'At Risk' || c.slaStatus === 'Breached').length : 0;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50/20 dark:bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Recovery Portfolio
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit and route outstanding corporate receivables
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Outstanding"
          value={isLoading ? <Skeleton className="h-7 w-24" /> : `$${totalOutstanding.toLocaleString()}`}
          change="Total value of loaded accounts"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Average Recovery Rate"
          value={isLoading ? <Skeleton className="h-7 w-12" /> : `${avgProb}%`}
          change="AI predicted probability average"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Priority Accounts"
          value={isLoading ? <Skeleton className="h-7 w-12" /> : highPriorityCount.toString()}
          change="Priority coefficient > 80"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="SLA Risk Pipeline"
          value={isLoading ? <Skeleton className="h-7 w-12" /> : atRiskCount.toString()}
          change="Accounts requiring immediate triage"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Main Grid: 2/3 Content and 1/3 Side Context Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3): Cases Tabs and Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendations panel */}
          <Card className="shadow-none border-border/40 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-sm font-bold">AI Portfolio Recommendations</CardTitle>
              </div>
              <CardDescription className="text-[11px]">
                Tactical execution rules suggested by Gemini 2.5 Flash
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                💡 **Route Optimization**: High-value cases (&gt;$10k) with &gt;75% recovery probability should be immediately assigned to **Apex Financial Recovery** to maximize yield speed.
              </p>
              <p>
                ⚠️ **Risk Mitigation**: The portfolio contains **{atRiskCount}** accounts approaching SLA breaches. We suggest issuing an automated RPA demand brief warning to prevent loss coefficients.
              </p>
            </CardContent>
          </Card>

          {/* Cases Table Card */}
          <Card className="shadow-none border-border/40">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Active Accounts Grid</CardTitle>
                <CardDescription className="text-[10px]">Filter, inspect, and assign outstanding receivables</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="all">
                <div className="flex items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="all">All ({filteredCases?.length || 0})</TabsTrigger>
                    <TabsTrigger value="new">New ({newCases.length})</TabsTrigger>
                    <TabsTrigger value="assigned">Assigned ({assignedCases.length})</TabsTrigger>
                    <TabsTrigger value="at_risk">At Risk ({atRiskCases.length})</TabsTrigger>
                  </TabsList>
                </div>
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <>
                    <TabsContent value="all">
                      <CasesTable cases={filteredCases} dcas={dcas || []} />
                    </TabsContent>
                    <TabsContent value="new">
                      <CasesTable cases={newCases} dcas={dcas || []} />
                    </TabsContent>
                    <TabsContent value="assigned">
                      <CasesTable cases={assignedCases} dcas={dcas || []} />
                    </TabsContent>
                    <TabsContent value="at_risk">
                      <CasesTable cases={atRiskCases} dcas={dcas || []} />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3): Context Panel & Activity Insights */}
        <div className="lg:col-span-1 space-y-6">
          {/* Activity Insights / Recent Actions */}
          <Card className="shadow-none border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Activity Insights</CardTitle>
                  <CardDescription className="text-[10px]">Recent ledger modifications</CardDescription>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono font-semibold px-1.5 bg-card">
                  Real-time
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">DCA Assignment Updated</p>
                  <p className="text-muted-foreground text-[10px]">Case #case_102 assigned to Apex Financial.</p>
                  <p className="text-muted-foreground/60 text-[9px] mt-0.5">3 mins ago</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">SLA RPA Triggered</p>
                  <p className="text-muted-foreground text-[10px]">Auto-escalation warning issued on Case #case_105.</p>
                  <p className="text-muted-foreground/60 text-[9px] mt-0.5">14 mins ago</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Partial Receipt Recorded</p>
                  <p className="text-muted-foreground text-[10px]">$2,400 payment received from Customer 54.</p>
                  <p className="text-muted-foreground/60 text-[9px] mt-0.5">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context Panel (Triage Guide) */}
          <Card className="shadow-none border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Triage Playbook</CardTitle>
              <CardDescription className="text-[10px]">Quick operator actions checklist</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="border border-border/40 rounded p-2.5 bg-slate-50/10 dark:bg-card">
                <span className="font-bold block mb-1 text-[11px]">Level 1 Escalation</span>
                <p className="text-muted-foreground text-[10px] leading-relaxed">
                  For new cases overdue by less than 60 days. Prioritize automated agency assignment and initial AI yield check.
                </p>
              </div>
              <div className="border border-border/40 rounded p-2.5 bg-slate-50/10 dark:bg-card">
                <span className="font-bold block mb-1 text-[11px]">Level 2 Warning</span>
                <p className="text-muted-foreground text-[10px] leading-relaxed">
                  For mid-tier cases approaching SLA breach. Generate executive summaries to support negotiated discount offerings.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AllCasesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <CasesPageContent />
    </Suspense>
  );
}
