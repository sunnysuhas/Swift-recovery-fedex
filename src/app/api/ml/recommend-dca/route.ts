
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dcas } from '@/lib/db/schema';
import { recommendDca } from '@/lib/logic/matching';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, caseType } = body;

        const availableDcas = await db.select().from(dcas);

        const recommendation = recommendDca(availableDcas, {
            caseAmount: amount,
            caseType: caseType
        });

        if (!recommendation) {
            return NextResponse.json({ success: false, message: 'No suitable DCA found' });
        }

        return NextResponse.json({
            success: true,
            recommendedDca: {
                id: recommendation.id,
                name: recommendation.name,
                matchScore: 95 // Mocked for API response compatibility
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Recommendation failed' }, { status: 500 });
    }
}
