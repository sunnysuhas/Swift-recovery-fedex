import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Case } from '@/lib/types';
import { Button } from '../ui/button';
import { ArrowUpRight } from 'lucide-react';

type PriorityCasesTableProps = {
  cases: Case[];
};

export function PriorityCasesTable({ cases }: PriorityCasesTableProps) {
  const getPriorityBadgeVariant = (priority: number) => {
    if (priority > 95) return 'destructive';
    if (priority > 85) return 'secondary';
    return 'default';
  };

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case ID</TableHead>
            <TableHead>Debtor</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Priority</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseItem) => (
            <TableRow key={caseItem.id}>
              <TableCell className="font-medium">{caseItem.id}</TableCell>
              <TableCell>{caseItem.debtor.name}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: caseItem.currency,
                }).format(caseItem.amount)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getPriorityBadgeVariant(caseItem.priorityScore)}>
                  {caseItem.priorityScore}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/cases/${caseItem.id}`}>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
