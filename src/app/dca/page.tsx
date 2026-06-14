'use client';

import { CasesTable } from '@/components/cases/cases-table';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, FileText, TrendingUp, Users, AlertTriangle, Sparkles } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getCases } from '@/actions/cases';
import { getDcas } from '@/actions/dcas';
import { useUser } from '@/components/providers/local-auth-provider';
import { useEffect, useState } from 'react';
import { Case, DCA } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DcaPortalPage() {
    const { user } = useUser();

    const [myDca, setMyDca] = useState<DCA | null>(null);
    const [myCases, setMyCases] = useState<Case[] | null>(null);
    const [allDcas, setAllDcas] = useState<DCA[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            try {
                const dcasData = await getDcas();
                setAllDcas(dcasData as unknown as DCA[]);

                // If Admin, they see "My DCA" as null or we pick the first one? 
                // Requirement: "Admin can see all data". 
                // But this page "DCA Portal" is specific to ONE DCA view typically.
                // For now, if Admin, we just show ALL assigned cases or maybe let them pick?
                // Minimal change: If Admin, get ALL cases (assignments) and show them.

                const myDcaFound = dcasData.find((d: any) => d.id === user.dcaId) || null;
                setMyDca(myDcaFound as unknown as DCA);

                const casesData = await getCases(user.uid, user.role);
                // Filter client side for extra safety if needed, or rely on server.
                // If Admin, casesData is ALL cases. 
                // If DCA agent, casesData is THEIR cases.

                let myCasesFound = casesData;
                if (user.role !== 'Admin') {
                    myCasesFound = casesData.filter((c: any) => c.assignedDCA === user.dcaId);
                }

                setMyCases(myCasesFound as unknown as Case[]);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [user]);

    const userProfile = user;

    if (userProfile && userProfile.role !== 'DCA_Agent' && userProfile.role !== 'Admin') {
        return (
            <div className="flex-1 p-4 md:p-6 space-y-6 flex items-center justify-center">
                <Card className='w-full max-w-md'>
                    <CardHeader className='items-center text-center'>
                        <AlertTriangle className='w-12 h-12 text-destructive' />
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>This portal is for DCA Agents only. Your role is: {userProfile.role}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const atRiskCasesCount = myCases?.filter(c => c.slaStatus === 'At Risk' || c.slaStatus === 'Breached').length || 0;
    const totalDebt = myCases?.reduce((sum, c) => sum + c.amount, 0) || 0;

    return (
        <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50/20 dark:bg-background min-h-screen">
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                        Agency Operations Hub
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isLoading ? <Skeleton className="h-4 w-48" /> : `Operations and active assignments for ${myDca?.name || 'partner agencies'}`}
                    </p>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Assigned Cases"
                    value={isLoading ? <Skeleton className="h-6 w-12" /> : myCases?.length.toString() || '0'}
                    change={isLoading ? ' ' : `${myCases?.filter(c => c.status === 'New').length || 0} new`}
                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                />
                <KpiCard
                    title="Total Debt Assigned"
                    value={isLoading ? <Skeleton className="h-6 w-24" /> : `$${totalDebt.toLocaleString()}`}
                    change="in active collections"
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                />
                <KpiCard
                    title="Your Recovery Rate"
                    value={isLoading ? <Skeleton className="h-6 w-16" /> : `${myDca?.recoveryRate || 0}%`}
                    change="All-time performance"
                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                />
                <KpiCard
                    title="At-Risk SLAs"
                    value={isLoading ? <Skeleton className="h-6 w-12" /> : atRiskCasesCount.toString()}
                    change="Require immediate attention"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            {/* High density split screen grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-none border-border/40">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold">Your Assigned Cases</CardTitle>
                            <CardDescription className="text-[10px]">Manage your active collection portfolio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-96 w-full" /> : <CasesTable cases={myCases || []} dcas={allDcas || []} />}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* AI Workload recommendation */}
                    <Card className="shadow-none border-border/40 bg-gradient-to-r from-primary/5 to-secondary/5">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-bold">AI Hub Recommendations</CardTitle>
                            </div>
                            <CardDescription className="text-[10px]">Workload prioritization hints</CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-2">
                            <p>
                                🎯 **Priority Directives**: There are **{atRiskCasesCount}** cases approaching SLA breach thresholds. Focus initial outbound communication on these to maintain performance score requirements.
                            </p>
                            <p>
                                📈 **Potential Yields**: Average recovery rate is **{myDca?.recoveryRate || 0}%**. AI suggests focusing on accounts with aging &lt; 90 days where probability coefficients are highest.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Context Panel: Performance Metrics */}
                    <Card className="shadow-none border-border/40">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold">Agency Compliance</CardTitle>
                            <CardDescription className="text-[10px]">System quality check status</CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs space-y-3">
                            <div className="flex justify-between items-center py-1 border-b border-border/20">
                                <span className="text-muted-foreground">SLA Compliance Rate</span>
                                <span className="font-semibold">98.4%</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-border/20">
                                <span className="text-muted-foreground">Average Response Time</span>
                                <span className="font-semibold">14.2 hours</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground">Data Integration Status</span>
                                <span className="text-green-500 font-semibold">Active</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
