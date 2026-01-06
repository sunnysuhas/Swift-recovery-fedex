import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    displayName: text('display_name'),
    role: text('role').notNull().default('DCA_Agent'), // 'Admin' | 'DCA_Agent'
    dcaId: text('dca_id'),
    photoUrl: text('photo_url'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const dcas = sqliteTable('dcas', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    recoveryRate: real('recovery_rate').default(0),
    activeCases: integer('active_cases').default(0),
    manager: text('manager'),
    logoUrl: text('logo_url'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const cases = sqliteTable('cases', {
    id: text('id').primaryKey(),
    debtorName: text('debtor_name'),
    debtorAccountId: text('debtor_account_id'),
    amount: real('amount').notNull(),
    currency: text('currency').default('USD'),
    aging: integer('aging').notNull(),
    priorityScore: integer('priority_score').default(0),
    status: text('status').notNull().default('New'),
    assignedDcaId: text('assigned_dca_id'), // Foreign key to dcas.id logically
    slaStatus: text('sla_status').default('On Track'),
    lastCommunication: text('last_communication'),
    paymentBehavior: text('payment_behavior'),
    caseHistory: text('case_history'), // JSON string or text summary
    actionPlan: text('action_plan'),
    ownerId: text('owner_id'), // User UID who owns this case
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const auditLogs = sqliteTable('audit_logs', {
    id: text('id').primaryKey(),
    caseId: text('case_id').notNull(),
    userId: text('user_id').notNull(),
    userEmail: text('user_email'),
    action: text('action').notNull(),
    details: text('details'),
    timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
