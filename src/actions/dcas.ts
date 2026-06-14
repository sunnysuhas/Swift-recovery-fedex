'use server';

import { db } from '@/lib/db';
import { dcas } from '@/lib/db/schema';

export async function getDcas() {
    const results = await db.select().from(dcas);
    return results.map(d => ({
        ...d,
        recoveryRate: d.performanceScore || 0,
    }));
}

export async function createDca(data: any) {
    const performanceScore = parseFloat(data.recoveryRate || data.performanceScore || 0);
    const newDca = {
        id: data.id || `dca-${Math.random().toString(36).substring(2, 11)}`,
        name: data.name,
        performanceScore,
        activeCases: parseInt(data.activeCases || 0),
        manager: data.manager,
        logoUrl: data.logoUrl,
        createdAt: new Date(),
    };
    await db.insert(dcas).values(newDca);
    return {
        ...newDca,
        recoveryRate: performanceScore
    };
}

export async function batchCreateDcas(items: any[]) {
    const values = items.map(data => {
        const performanceScore = parseFloat(data.recoveryRate || data.performanceScore || 0);
        return {
            id: data.id || `dca-${Math.random().toString(36).substring(2, 11)}`,
            name: data.name,
            performanceScore,
            activeCases: parseInt(data.activeCases || 0),
            manager: data.manager,
            logoUrl: data.logoUrl,
            createdAt: new Date(),
        };
    });

    if (values.length > 0) {
        await db.insert(dcas).values(values);
    }
    return { count: values.length };
}
