import { type Timestamp } from 'firebase/firestore';

export type CaseStatus =
  | 'New'
  | 'Assigned'
  | 'Contact Made'
  | 'Payment Negotiated'
  | 'In Dispute'
  | 'Resolved'
  | 'Closed - Unresolved';

export type SlaStatus = 'On Track' | 'At Risk' | 'Breached';

export interface Debtor {
  name: string;
  accountId: string;
}

export interface Case {
  id: string;
  debtor: Debtor;
  amount: number;
  currency: string;
  aging: number; // days
  priorityScore: number;
  status: CaseStatus;
  assignedDCA: string; // DCA ID
  slaStatus: SlaStatus;
  lastCommunication: string;
  paymentBehavior: string;
  caseHistory: string;
  actionPlan?: string;
}

export interface DCA {
  id: string;
  name: string;
  recoveryRate: number;
  activeCases: number;
  manager: string;
  logoUrl?: string;
}

export interface AuditLog {
  id: string;
  caseId: string;
  timestamp: Timestamp;
  user: string;
  userId: string;
  action: string;
  details: string;
}

export interface RecoveryDataPoint {
  month: string;
  rate: number;
}

export interface AgingDataPoint {
  range: string;
  value: number;
}

export interface DcaPerformanceDataPoint {
  name: string;
  'Recovery Rate': number;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string;
    role: 'Admin' | 'DCA_Agent';
    dcaId?: string; // Which DCA the user belongs to
}
