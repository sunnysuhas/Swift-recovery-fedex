import type { Case, DCA, AuditLog, CaseStatus, SlaStatus } from './types';

const DCAs: DCA[] = [
  { id: 'dca-1', name: 'Global Recovery Inc.', recoveryRate: 78, activeCases: 150, manager: 'Alice Johnson' },
  { id: 'dca-2', name: 'Credit Solutions LLC', recoveryRate: 85, activeCases: 200, manager: 'Bob Williams' },
  { id: 'dca-3', name: 'Apex Financial', recoveryRate: 72, activeCases: 120, manager: 'Charlie Brown' },
  { id: 'dca-4', name: 'National Debt Agency', recoveryRate: 65, activeCases: 300, manager: 'Diana Prince' },
];

const mockCases: Case[] = [
  {
    id: 'CASE-001',
    debtor: { name: 'John Doe Corp', accountId: 'CUST-1001' },
    amount: 15000,
    currency: 'USD',
    aging: 95,
    priorityScore: 95,
    status: 'Assigned',
    assignedDCA: 'dca-2',
    slaStatus: 'At Risk',
    lastCommunication: '2024-06-15',
    paymentBehavior: 'Historically pays late, but eventually pays in full. No response to recent invoices.',
    caseHistory: '2024-05-01: Invoice #123 sent. 2024-06-01: Reminder sent. 2024-06-15: Phone call, no answer. 2024-07-01: Assigned to Credit Solutions LLC.',
  },
  {
    id: 'CASE-002',
    debtor: { name: 'Jane Smith Enterprises', accountId: 'CUST-1002' },
    amount: 7500,
    currency: 'USD',
    aging: 45,
    priorityScore: 78,
    status: 'Contact Made',
    assignedDCA: 'dca-1',
    slaStatus: 'On Track',
    lastCommunication: '2024-07-10',
    paymentBehavior: 'Good payment history. First time with a significant overdue balance.',
    caseHistory: '2024-06-10: Invoice #124 sent. 2024-07-05: Assigned to Global Recovery Inc. 2024-07-10: Initial contact made, debtor promised to review.',
  },
  {
    id: 'CASE-003',
    debtor: { name: 'Acme Innovations', accountId: 'CUST-1003' },
    amount: 25000,
    currency: 'USD',
    aging: 180,
    priorityScore: 98,
    status: 'In Dispute',
    assignedDCA: 'dca-2',
    slaStatus: 'Breached',
    lastCommunication: '2024-07-05',
    paymentBehavior: 'Frequent disputes, often requires legal intervention to collect.',
    caseHistory: '2024-02-01: Invoice #101 sent. Multiple reminders. 2024-05-01: Assigned to Credit Solutions LLC. 2024-07-05: Debtor disputed the charges via email.',
  },
  {
    id: 'CASE-004',
    debtor: { name: 'Momentum Tech', accountId: 'CUST-1004' },
    amount: 5200,
    currency: 'USD',
    aging: 32,
    priorityScore: 65,
    status: 'New',
    assignedDCA: 'Unassigned',
    slaStatus: 'On Track',
    lastCommunication: '2024-07-01',
    paymentBehavior: 'New customer, no payment history.',
    caseHistory: '2024-07-01: Invoice #125 sent.',
  },
  {
    id: 'CASE-005',
    debtor: { name: 'Starlight Industries', accountId: 'CUST-1005' },
    amount: 120000,
    currency: 'USD',
    aging: 150,
    priorityScore: 99,
    status: 'Assigned',
    assignedDCA: 'dca-3',
    slaStatus: 'At Risk',
    lastCommunication: '2024-07-02',
    paymentBehavior: 'Large company, complex payment process. Has paid large sums in the past but always after significant delays.',
    caseHistory: '2024-03-01: Invoice #110 sent. 2024-06-15: Escalated to collections. 2024-07-02: Assigned to Apex Financial.',
  },
  {
    id: 'CASE-006',
    debtor: { name: 'River Logistics', accountId: 'CUST-1006' },
    amount: 2100,
    currency: 'USD',
    aging: 68,
    priorityScore: 72,
    status: 'Payment Negotiated',
    assignedDCA: 'dca-1',
    slaStatus: 'On Track',
    lastCommunication: '2024-07-18',
    paymentBehavior: 'Generally reliable, but facing short-term cash flow issues.',
    caseHistory: '2024-05-15: Invoice #115 sent. 2024-07-01: Assigned to Global Recovery Inc. 2024-07-18: Payment plan agreed upon.',
  },
  {
    id: 'CASE-007',
    debtor: { name: 'Phoenix Group', accountId: 'CUST-1007' },
    amount: 300,
    currency: 'USD',
    aging: 120,
    priorityScore: 40,
    status: 'Closed - Unresolved',
    assignedDCA: 'dca-4',
    slaStatus: 'Breached',
    lastCommunication: '2024-05-20',
    paymentBehavior: 'Debtor unresponsive, likely out of business.',
    caseHistory: '2024-04-01: Invoice #112 sent. 2024-05-01: Assigned to National Debt Agency. 2024-05-20: Final attempt, no response. Case recommended for write-off.',
  },
  {
    id: 'CASE-008',
    debtor: { name: 'Jupiter Systems', accountId: 'CUST-1008' },
    amount: 8900,
    currency: 'USD',
    aging: 85,
    priorityScore: 88,
    status: 'Assigned',
    assignedDCA: 'dca-2',
    slaStatus: 'On Track',
    lastCommunication: '2024-07-20',
    paymentBehavior: 'Sporadic payments, but usually pays after multiple reminders.',
    caseHistory: '2024-05-01: Invoice #118 sent. 2024-07-15: Assigned to Credit Solutions LLC. 2024-07-20: Initial reminder sent by DCA.',
  },
];


const mockAuditLogs: AuditLog[] = [
    { id: 'LOG-001', timestamp: new Date('2024-07-01 10:00:00'), user: 'System', action: 'Case Created', details: 'Case CASE-001 created for John Doe Corp, amount $15,000' },
    { id: 'LOG-002', timestamp: new Date('2024-07-01 11:30:00'), user: 'collections_mgr_1', action: 'Case Assigned', details: 'Case CASE-001 assigned to Credit Solutions LLC' },
    { id: 'LOG-003', timestamp: new Date('2024-07-10 14:05:00'), user: 'dca_agent_bob', action: 'Status Update', details: 'Case CASE-002 status changed to "Contact Made"' },
    { id: 'LOG-004', timestamp: new Date('2024-07-15 09:00:00'), user: 'finance_admin_sue', action: 'Viewed Case', details: 'Viewed details for high-priority case CASE-003' },
    { id: 'LOG-005', timestamp: new Date('2024-07-18 16:20:00'), user: 'dca_agent_alice', action: 'Status Update', details: 'Case CASE-006 status changed to "Payment Negotiated"' },
];

export const getCases = (): Case[] => mockCases;
export const getCaseById = (id: string): Case | undefined => mockCases.find(c => c.id === id);
export const getDcas = (): DCA[] => DCAs;
export const getDcaById = (id: string): DCA | undefined => DCAs.find(d => d.id === id);
export const getAuditLogsByCaseId = (caseId: string): AuditLog[] => mockAuditLogs.filter(log => log.details.includes(caseId));

export const getPriorityCases = (): Case[] => mockCases.filter(c => c.priorityScore > 90).sort((a, b) => b.priorityScore - a.priorityScore);

export const getRecoveryData = () => [
  { month: 'Jan', rate: 65 },
  { month: 'Feb', rate: 68 },
  { month: 'Mar', rate: 70 },
  { month: 'Apr', rate: 72 },
  { month: 'May', rate: 69 },
  { month: 'Jun', rate: 71 },
];

export const getAgingData = () => [
  { range: '0-30 Days', value: 150000 },
  { range: '31-60 Days', value: 250000 },
  { range: '61-90 Days', value: 450000 },
  { range: '91-120 Days', value: 300000 },
  { range: '>120 Days', value: 800000 },
];

export const getDcaPerformance = () => DCAs.map(dca => ({ name: dca.name, 'Recovery Rate': dca.recoveryRate }));
