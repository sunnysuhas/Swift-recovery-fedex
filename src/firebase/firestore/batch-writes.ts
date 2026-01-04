'use client';
import { writeBatch, doc, Firestore, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Case, DCA, AuditLog } from '@/lib/types';
import { User } from 'firebase/auth';

function findValue(data: any, keys: string[]): any {
    const dataKeys = Object.keys(data).reduce((acc, key) => {
        acc[key.toLowerCase()] = key;
        return acc;
    }, {} as Record<string, string>);

    for (const key of keys) {
        const foundKey = dataKeys[key.toLowerCase()];
        if (foundKey && data[foundKey] !== undefined) {
            return data[foundKey];
        }
    }
    return undefined;
}


function parseCase(data: any): Omit<Case, 'id'> {
    const debtorName = findValue(data, ['debtorName', 'debtor_name', 'Debtor Name', 'debtor']);
    const debtorAccountId = findValue(data, ['debtorAccountId', 'debtor_accountId', 'Debtor Account ID', 'accountId']);

    return {
        debtor: {
        name: debtorName,
        accountId: debtorAccountId,
        },
        amount: parseFloat(findValue(data, ['amount', 'Amount'])),
        currency: findValue(data, ['currency', 'Currency']) || 'USD',
        aging: parseInt(findValue(data, ['aging', 'Aging']), 10),
        priorityScore: parseInt(findValue(data, ['priorityScore', 'Priority Score']), 10),
        status: findValue(data, ['status', 'Status']),
        assignedDCA: findValue(data, ['assignedDCA', 'Assigned DCA']),
        slaStatus: findValue(data, ['slaStatus', 'SLA Status']),
        lastCommunication: findValue(data, ['lastCommunication', 'Last Communication']),
        paymentBehavior: findValue(data, ['paymentBehavior', 'Payment Behavior']),
        caseHistory: findValue(data, ['caseHistory', 'Case History']),
        actionPlan: findValue(data, ['actionPlan', 'Action Plan']) || ''
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

export function updateCaseStatus(db: Firestore, caseId: string, newStatus: Case['status'], user: User) {
    const caseRef = doc(db, 'cases', caseId);
    const auditLogRef = doc(db, 'auditLogs', `log-${Date.now()}`);
    const batch = writeBatch(db);

    batch.update(caseRef, { status: newStatus });
    
    batch.set(auditLogRef, {
      id: auditLogRef.id,
      caseId: caseId,
      timestamp: serverTimestamp(),
      user: user.displayName || user.email,
      userId: user.uid,
      action: 'Status Updated',
      details: `Status changed to ${newStatus}`
    });

    return batch.commit().catch((error) => {
      console.error('Update status error:', error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `/cases/${caseId}`,
          operation: 'update',
          requestResourceData: { status: newStatus },
        })
      );
      throw error;
    });
}

export function saveActionPlan(db: Firestore, caseId: string, actionPlan: string, user: User) {
    const caseRef = doc(db, 'cases', caseId);
    const auditLogRef = doc(db, 'auditLogs', `log-${Date.now()}`);
    const batch = writeBatch(db);

    batch.update(caseRef, { actionPlan });
    
    batch.set(auditLogRef, {
      id: auditLogRef.id,
      caseId: caseId,
      timestamp: serverTimestamp(),
      user: user.displayName || user.email,
      userId: user.uid,
      action: 'Action Plan Saved',
      details: 'AI-generated action plan was saved to the case.'
    });

    return batch.commit().catch((error) => {
      console.error('Save action plan error:', error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `/cases/${caseId}`,
          operation: 'update',
          requestResourceData: { actionPlan: actionPlan.substring(0, 100) + '...' },
        })
      );
      throw error;
    });
}
