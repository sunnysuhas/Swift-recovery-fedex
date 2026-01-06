
import { NextRequest, NextResponse } from 'next/server';
import { calculatePriorityScore } from '@/lib/logic/priority';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { cases } = body; // Array of case objects

        if (!Array.isArray(cases)) {
            return NextResponse.json({ success: false, error: 'cases must be an array' }, { status: 400 });
        }

        const prioritized = cases.map((c: any) => {
            const score = calculatePriorityScore({
                recoveryProbability: c.recoveryProbability || 50,
                amount: c.amount,
                daysOverdue: c.daysOverdue || c.aging,
                sleeUrgency: c.slaUrgency || 0
            });
            return { ...c, priorityScore: score };
        });

        // Sort desc
        prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

        return NextResponse.json({ success: true, count: prioritized.length, data: prioritized });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Prioritization failed' }, { status: 500 });
    }
}
