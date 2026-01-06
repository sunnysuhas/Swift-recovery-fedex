
import { NextRequest, NextResponse } from 'next/server';

// In a real scenario, this would call a Python service or load ONNX model.
// For now, we use the TS logic implementation.
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, daysOverdue, historyScore } = body;

        // Simplified logic mirroring the training data generator
        // recover_prob = (history/100)*0.4 + (1 - days/365)*0.4

        const normDays = Math.min((daysOverdue || 30) / 365, 1);
        const normHistory = (historyScore || 50) / 100;

        let probability = (normHistory * 0.4) + ((1 - normDays) * 0.4) + 0.1; // Base bias
        probability = Math.min(Math.max(probability, 0), 1) * 100;

        return NextResponse.json({
            success: true,
            recoveryProbability: Math.round(probability),
            confidence: 'High'
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Prediction failed' }, { status: 500 });
    }
}
