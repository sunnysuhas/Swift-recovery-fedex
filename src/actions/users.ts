'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getUsers() {
    return await db.select().from(users);
}

export async function getUser(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
}

export async function createUser(data: any) {
    const newUser = {
        id: data.id || `user-${Math.random().toString(36).substr(2, 9)}`,
        email: data.email,
        displayName: data.displayName,
        role: data.role || 'DCA_Agent',
        photoUrl: data.photoUrl,
        createdAt: new Date(),
    };
    await db.insert(users).values(newUser);
    return newUser;
}

export async function updateUser(uid: string, data: any) {
    await db.update(users).set(data).where(eq(users.id, uid));
    return { ...data, id: uid };
}
