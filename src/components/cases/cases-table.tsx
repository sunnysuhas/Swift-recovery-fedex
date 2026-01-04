'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Case, DCA, CaseStatus, SlaStatus } from '@/lib/types';
import { Card, CardContent } from '../ui/card';

type CasesTableProps = {
  cases: Case[];
  dcas: DCA[];
};

export function CasesTable({ cases, dcas }: CasesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const getStatusBadgeVariant = (status: CaseStatus) => {
    switch (status) {
      case 'Resolved':
        return 'default';
      case 'Closed - Unresolved':
      case 'In Dispute':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getSlaBadgeVariant = (status: SlaStatus) => {
    switch (status) {
      case 'On Track':
        return 'default';
      case 'At Risk':
        return 'secondary';
      case 'Breached':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const columns: ColumnDef<Case>[] = [
    {
      accessorKey: 'id',
      header: 'Case ID',
      cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'debtor',
      header: 'Debtor',
      cell: ({ row }) => {
        const debtor: { name: string } = row.getValue('debtor');
        return <div>{debtor.name}</div>;
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'aging',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Aging (Days)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue('aging')}</div>,
    },
    {
        accessorKey: 'priorityScore',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Priority
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue('priorityScore')}</div>,
      },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.getValue('status'))}>
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'assignedDCA',
      header: 'Assigned DCA',
      cell: ({ row }) => {
        const dcaId = row.getValue('assignedDCA') as string;
        const dca = dcas.find((d) => d.id === dcaId);
        return <div>{dca?.name || 'Unassigned'}</div>;
      },
    },
    {
        accessorKey: 'slaStatus',
        header: 'SLA Status',
        cell: ({ row }) => (
          <Badge variant={getSlaBadgeVariant(row.getValue('slaStatus'))}>
            {row.getValue('slaStatus')}
          </Badge>
        ),
      },
    {
      id: 'actions',
      cell: ({ row }) => {
        const caseItem = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/cases/${caseItem.id}`}>View details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Assign to DCA</DropdownMenuItem>
              <DropdownMenuItem>Update Status</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Flag for Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: cases,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <Card>
      <CardContent className="p-0">
      <div className="flex items-center p-4">
        <Input
          placeholder="Filter by debtor..."
          value={(table.getColumn('debtor')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('debtor')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === 'id' ? 'Case ID' : column.id.replace(/([A-Z])/g, ' $1')}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      </CardContent>
    </Card>
  );
}
