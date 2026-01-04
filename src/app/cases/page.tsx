'use client';

import AppHeader from '@/components/layout/header';
import { CasesTable } from '@/components/cases/cases-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Case, DCA } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AllCasesPage() {
  const firestore = useFirestore();

  const casesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'cases') : null), [firestore]);
  const { data: cases, isLoading: casesLoading } = useCollection<Case>(casesQuery);

  const dcasQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'dcas') : null), [firestore]);
  const { data: dcas, isLoading: dcasLoading } = useCollection<DCA>(dcasQuery);
  
  const newCasesQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'cases'), where('status', '==', 'New')) : null), [firestore]);
  const { data: newCases } = useCollection<Case>(newCasesQuery);

  const assignedCasesQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'cases'), where('status', '==', 'Assigned')) : null), [firestore]);
  const { data: assignedCases } = useCollection<Case>(assignedCasesQuery);

  const atRiskCasesQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'cases'), where('slaStatus', 'in', ['At Risk', 'Breached'])) : null), [firestore]);
  const { data: atRiskCases } = useCollection<Case>(atRiskCasesQuery);

  const isLoading = casesLoading || dcasLoading;

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="All Cases" />
      <div className="flex-1 p-4 md:p-6">
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
                <CasesTable cases={cases || []} dcas={dcas || []} />
              </TabsContent>
              <TabsContent value="new">
                <CasesTable cases={newCases || []} dcas={dcas || []} />
              </TabsContent>
              <TabsContent value="assigned">
                <CasesTable cases={assignedCases || []} dcas={dcas || []} />
              </TabsContent>
              <TabsContent value="at_risk">
                <CasesTable cases={atRiskCases || []} dcas={dcas || []} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </main>
  );
}
