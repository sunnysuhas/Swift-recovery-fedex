export type CaseStatus =
  | 'New'
  | 'Assigned'
  | 'Contact Made'
  | 'Payment Negotiated'
  | 'In Dispute'
  | 'Resolved'
  | 'Closed - Unresolved';

export type SlaStatus = 'On Track' | 'At Risk' | 'Breached';

export interface Case {
  id: string;
  debtor: {
    name: string;
    accountId: string;
  };
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
  timestamp: Date;
  user: string;
  action: string;
  details: string;
}
