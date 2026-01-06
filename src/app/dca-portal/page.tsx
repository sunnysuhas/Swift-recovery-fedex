
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

// This would normally fetch cases assigned to the logged-in DCA
export default function DCAPortalPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">DCA Partner Portal</h2>
                    <p className="text-muted-foreground">Welcome, Apex Financial Recovery</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">Download Report</Button>
                    <Button>Upload Updates</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assigned Cases</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">124</div>
                        <p className="text-xs text-muted-foreground">+12 since yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">82.5%</div>
                        <p className="text-xs text-muted-foreground">Top 5% of partners</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SLA At Risk</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">3</div>
                        <p className="text-xs text-muted-foreground">Action required within 24h</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Active Assignments</CardTitle>
                    <CardDescription>Manage your assigned recovery cases.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Case ID</TableHead>
                                <TableHead>Debtor</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">CASE-8392</TableCell>
                                <TableCell>John Doe</TableCell>
                                <TableCell>$4,500.00</TableCell>
                                <TableCell><Badge className="bg-red-500">High</Badge></TableCell>
                                <TableCell>In Progress</TableCell>
                                <TableCell><Button size="sm" variant="ghost">View</Button></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">CASE-9921</TableCell>
                                <TableCell>Alice Smith</TableCell>
                                <TableCell>$1,250.00</TableCell>
                                <TableCell><Badge className="bg-yellow-500">Medium</Badge></TableCell>
                                <TableCell>New Assignment</TableCell>
                                <TableCell><Button size="sm">Accept</Button></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">CASE-7732</TableCell>
                                <TableCell>Robert Johnson</TableCell>
                                <TableCell>$890.00</TableCell>
                                <TableCell><Badge className="bg-green-500">Low</Badge></TableCell>
                                <TableCell>Pending Payment</TableCell>
                                <TableCell><Button size="sm" variant="ghost">Log Payment</Button></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
