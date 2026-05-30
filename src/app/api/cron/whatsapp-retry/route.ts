import { NextRequest, NextResponse } from 'next/server';
import { processPendingRetries } from '@/lib/whatsapp-retry';

/**
 * POST /api/cron/whatsapp-retry
 * Process pending message retries for failed WhatsApp deliveries
 * 
 * This endpoint should be called periodically (e.g., every 5-10 minutes)
 * via a cron service like Vercel Crons, AWS EventBridge, or a separate cron service.
 * 
 * Example Vercel cron config in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/whatsapp-retry",
 *     "schedule": "*/10 * * * *"  // Every 10 minutes
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if provided
    const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
    if (cronSecret && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Processing WhatsApp message retries...');

    const result = await processPendingRetries();

    console.log('WhatsApp retry processing complete:', result);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      successful: result.successful,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing retries:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/whatsapp-retry
 * Health check / manual trigger endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const result = await processPendingRetries();

    return NextResponse.json({
      success: true,
      message: 'Manual retry trigger executed',
      processed: result.processed,
      successful: result.successful,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in retry health check:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
