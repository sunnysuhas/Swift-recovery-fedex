'use client';

import { notFound, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  User,
  Calendar,
  Shield,
  Clock,
  AlertTriangle,
  BarChart,
} from 'lucide-react';
import { CaseTimeline } from '@/components/cases/case-timeline';
import { ExplainPriorityAction } from '@/components/cases/explain-priority-action';
import { GeneratePlanAction } from '@/components/cases/generate-plan-action';
import { Case, DCA, AuditLog } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateStatusAction } from '@/components/cases/update-status-action';
import { Button } from '@/components/ui/button';
import { getCase } from '@/actions/cases';
import { getDcas } from '@/actions/dcas';
import { getAuditLogs } from '@/actions/audit-logs';
import { useUser } from '@/components/providers/local-auth-provider';
import { useEffect, useState } from 'react';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const { user } = useUser();

  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [dca, setDca] = useState<DCA | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user || !caseId) return;
      try {
        const [caseData, logsData, dcasData] = await Promise.all([
          getCase(caseId),
          getAuditLogs(caseId),
          getDcas()
        ]);

        const c = caseData as unknown as Case;
        setCaseItem(c);
        setAuditLogs(logsData as unknown as AuditLog[]);

        if (c && c.assignedDCA) {
          const dcaFound = (dcasData as any[]).find(d => d.id === c.assignedDCA);
          setDca(dcaFound as unknown as DCA);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user, caseId]);

  // const isLoading = caseLoading || dcaLoading || auditLoading; // Removed

  if (isLoading) {
    return <CaseDetailSkeleton />;
  }

  if (!caseItem) {
    return notFound();
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Resolved': return 'default';
      case 'Closed - Unresolved': case 'In Dispute': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSlaBadgeVariant = (status: string) => {
    switch (status) {
      case 'On Track': return 'default';
      case 'At Risk': return 'secondary';
      case 'Breached': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Case Details: {caseItem.id}</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Case Summary</CardTitle>
                <CardDescription>
                  Debtor: {caseItem.debtor.name}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(caseItem.status)}>
                  {caseItem.status}
                </Badge>
                <Badge variant={getSlaBadgeVariant(caseItem.slaStatus)}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {caseItem.slaStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <InfoItem
                  icon={<DollarSign />}
                  label="Amount"
                  value={new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: caseItem.currency,
                  }).format(caseItem.amount)}
                />
                <InfoItem
                  icon={<Clock />}
                  label="Aging"
                  value={`${caseItem.aging} days`}
                />
                <InfoItem
                  icon={<BarChart />}
                  label="Priority Score"
                  value={caseItem.priorityScore}
                />
                <InfoItem
                  icon={<User />}
                  label="Debtor Account"
                  value={caseItem.debtor.accountId}
                />
                <InfoItem
                  icon={<Shield />}
                  label="Assigned DCA"
                  value={dca?.name || 'Unassigned'}
                />
                <InfoItem
                  icon={<Calendar />}
                  label="Last Communication"
                  value={caseItem.lastCommunication}
                />
              </div>
              <Separator className="my-4" />
              <div>
                <h4 className="font-semibold mb-2">Customer Payment Behavior</h4>
                <p className="text-sm text-muted-foreground">{caseItem.paymentBehavior}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Case History & Audit Trail</CardTitle>
              <CardDescription>
                Chronological record of all actions and communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaseTimeline logs={auditLogs || []} caseHistory={caseItem.caseHistory} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Copilot</CardTitle>
              <CardDescription>Intelligent actions and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExplainPriorityAction caseItem={caseItem} dca={dca || undefined} />
              <GeneratePlanAction caseItem={caseItem} dca={dca || undefined} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Manual Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <UpdateStatusAction caseId={caseItem.id} currentStatus={caseItem.status} />
              <Button className='w-full justify-start' variant="outline">Log Communication</Button>
              <Button className='w-full justify-start' variant="outline">Assign to DCA</Button>
              <Button className='w-full justify-start' variant="destructive">Escalate Case</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground pt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function CaseDetailSkeleton() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Separator className="my-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
