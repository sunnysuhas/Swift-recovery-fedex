import AppHeader from '@/components/layout/header';
import { CasesTable } from '@/components/cases/cases-table';
import { getCases, getDcas } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AllCasesPage() {
  const cases = getCases();
  const dcas = getDcas();

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
          <TabsContent value="all">
            <CasesTable cases={cases} dcas={dcas} />
          </TabsContent>
          <TabsContent value="new">
            <CasesTable
              cases={cases.filter((c) => c.status === 'New')}
              dcas={dcas}
            />
          </TabsContent>
          <TabsContent value="assigned">
            <CasesTable
              cases={cases.filter((c) => c.status === 'Assigned')}
              dcas={dcas}
            />
          </TabsContent>
          <TabsContent value="at_risk">
            <CasesTable
              cases={cases.filter((c) => c.slaStatus === 'At Risk' || c.slaStatus === 'Breached')}
              dcas={dcas}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
