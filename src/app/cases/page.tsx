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

  // const isLoading = casesLoading || dcasLoading; // Removed undefined variables

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">All Cases</h2>
      </div>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="at_risk">At Risk</TabsTrigger>
          </TabsList>
        </div>
        {isLoading ? <Skeleton className="mt-4 h-[400px] w-full" /> : (
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
