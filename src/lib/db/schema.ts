import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    displayName: text('display_name'),
    role: text('role').notNull().default('Analyst'), // 'Admin' | 'Analyst' | 'DCA_Agent'
    passwordHash: text('password_hash'),
    dcaId: text('dca_id'),
    photoUrl: text('photo_url'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const dcas = sqliteTable('dcas', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    performanceScore: real('performance_score').default(0),
    totalCases: integer('total_cases').default(0),
    recoveredAmount: real('recovered_amount').default(0),
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
    recoveryProbability: real('recovery_probability').default(0),
    status: text('status').notNull().default('New'),
    assignedDcaId: text('assigned_dca_id'),
    slaStatus: text('sla_status').default('On Track'),
    slaUrgency: real('sla_urgency').default(0),
    lastCommunication: text('last_communication'),
    paymentBehavior: text('payment_behavior'),
    caseHistory: text('case_history'), // JSON string
    actionPlan: text('action_plan'), // JSON string or text represents action plan
    ownerId: text('owner_id'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const payments = sqliteTable('payments', {
    id: text('id').primaryKey(),
    caseId: text('case_id').notNull(), // Should be foreign key to cases.id technically, but SQLite enforcement optional
    amount: real('amount').notNull(),
    paymentDate: integer('payment_date', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    status: text('status').notNull().default('Completed'),
    notes: text('notes'),
});

export const slaTracking = sqliteTable('sla_tracking', {
    id: text('id').primaryKey(),
    caseId: text('case_id').notNull(),
    slaDeadline: integer('sla_deadline', { mode: 'timestamp' }),
    status: text('status').notNull().default('Active'),
    breachFlag: integer('breach_flag', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
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
