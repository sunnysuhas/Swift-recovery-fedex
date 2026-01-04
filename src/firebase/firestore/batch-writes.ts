'use client';
import {
  writeBatch,
  doc,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Case, DCA } from '@/lib/types';

function parseCase(data: any): Omit<Case, 'id'> {
    return {
      debtor: {
        name: data.debtorName || data.debtor_name || data['debtor.name'],
        accountId: data.debtorAccountId || data.debtor_accountId || data['debtor.accountId']
      },
      amount: parseFloat(data.amount),
      currency: data.currency,
      aging: parseInt(data.aging, 10),
      priorityScore: parseInt(data.priorityScore, 10),
      status: data.status,
      assignedDCA: data.assignedDCA,
      slaStatus: data.slaStatus,
      lastCommunication: data.lastCommunication,
      paymentBehavior: data.paymentBehavior,
      caseHistory: data.caseHistory
    };
  }
  
  function parseDca(data: any): Omit<DCA, 'id'> {
    return {
      name: data.name,
      recoveryRate: parseFloat(data.recoveryRate),
      activeCases: parseInt(data.activeCases, 10),
      manager: data.manager,
      logoUrl: data.logoUrl || ''
    };
  }

export function batchWriteCases(db: Firestore, data: any[]) {
    const batch = writeBatch(db);
    data.forEach((item) => {
        const caseId = `case-${Math.random().toString(36).substring(2, 9)}`;
        const docRef = doc(db, 'cases', caseId);
        const parsedData = parseCase(item);
        batch.set(docRef, { ...parsedData, id: caseId });
    });
    return batch.commit().catch(error => {
        console.error("Batch write error:", error);
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: '/cases',
                operation: 'write',
                requestResourceData: data,
            })
        )
        throw error;
    })
}

export function batchWriteDcas(db: Firestore, data: any[]) {
    const batch = writeBatch(db);
    data.forEach((item) => {
        const dcaId = `dca-${Math.random().toString(36).substring(2, 9)}`;
        const docRef = doc(db, 'dcas', dcaId);
        const parsedData = parseDca(item);
        batch.set(docRef, { ...parsedData, id: dcaId });
    });
    return batch.commit().catch(error => {
        console.error("Batch write error:", error);
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: '/dcas',
                operation: 'write',
                requestResourceData: data,
            })
        )
        throw error;
    })
}
