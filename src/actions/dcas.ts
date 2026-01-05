'use server';

import { db } from '@/lib/db';
import { dcas } from '@/lib/db/schema';

export async function getDcas() {
    return await db.select().from(dcas);
}

export async function createDca(data: any) {
    const newDca = {
        id: data.id || `dca-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        recoveryRate: data.recoveryRate,
        activeCases: data.activeCases,
        manager: data.manager,
        logoUrl: data.logoUrl,
        createdAt: new Date(),
    };
    await db.insert(dcas).values(newDca);
    return newDca;
}

export async function batchCreateDcas(items: any[]) {
    const values = items.map(data => ({
        id: data.id || `dca-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        recoveryRate: data.recoveryRate,
        activeCases: data.activeCases,
        manager: data.manager,
        logoUrl: data.logoUrl,
        createdAt: new Date(),
    }));

    if (values.length > 0) {
        await db.insert(dcas).values(values);
    }
    return { count: values.length };
}
