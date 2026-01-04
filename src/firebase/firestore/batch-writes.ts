'use client';
import { writeBatch, doc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Case, DCA } from '@/lib/types';

function parseCase(data: any): Omit<Case, 'id'> {
  const debtorName = data.debtorName || data.debtor_name || data['Debtor Name'] || data.debtor;
  const debtorAccountId = data.debtorAccountId || data.debtor_accountId || data['Debtor Account ID'] || data.accountId;

  return {
    debtor: {
      name: debtorName,
      accountId: debtorAccountId,
    },
    amount: parseFloat(data.amount || data.Amount),
    currency: data.currency || data.Currency || 'USD',
    aging: parseInt(data.aging || data.Aging, 10),
    priorityScore: parseInt(data.priorityScore || data['Priority Score'], 10),
    status: data.status || data.Status,
    assignedDCA: data.assignedDCA || data['Assigned DCA'],
    slaStatus: data.slaStatus || data['SLA Status'],
    lastCommunication: data.lastCommunication || data['Last Communication'],
    paymentBehavior: data.paymentBehavior || data['Payment Behavior'],
    caseHistory: data.caseHistory || data['Case History'],
  };
}

function parseDca(data: any): Omit<DCA, 'id'> {
  return {
    name: data.name,
    recoveryRate: parseFloat(data.recoveryRate),
    activeCases: parseInt(data.activeCases, 10),
    manager: data.manager,
    logoUrl: data.logoUrl || '',
  };
}

export function batchWriteCases(db: Firestore, data: any[]) {
  const batch = writeBatch(db);
  data.forEach((item) => {
    const caseId = item.id || `case-${Math.random().toString(36).substring(2, 9)}`;
    const docRef = doc(db, 'cases', caseId);
    const parsedData = parseCase(item);
    batch.set(docRef, { ...parsedData, id: caseId });
  });
  return batch.commit().catch((error) => {
    console.error('Batch write error:', error);
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: '/cases',
        operation: 'write',
        requestResourceData: data.slice(0, 5),
      })
    );
    throw error;
  });
}

export function batchWriteDcas(db: Firestore, data: any[]) {
  const batch = writeBatch(db);
  data.forEach((item) => {
    const dcaId = item.id || `dca-${Math.random().toString(36).substring(2, 9)}`;
    const docRef = doc(db, 'dcas', dcaId);
    const parsedData = parseDca(item);
    batch.set(docRef, { ...parsedData, id: dcaId });
  });
  return batch.commit().catch((error) => {
    console.error('Batch write error:', error);
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: '/dcas',
        operation: 'write',
        requestResourceData: data.slice(0, 5),
      })
    );
    throw error;
  });
}
