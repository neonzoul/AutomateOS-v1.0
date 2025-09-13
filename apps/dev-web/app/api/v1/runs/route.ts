import { NextRequest, NextResponse } from 'next/server';
import { createRun } from './store';

/**
 * POST /api/v1/runs
 * Creates a new workflow run and returns the run ID
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body (workflow data)
    const body = await request.json().catch(() => ({}));

    // Create new run
    const run = createRun(body);

    // Return run ID and initial status
    return NextResponse.json(
      {
        id: run.id,
        status: run.status,
        createdAt: run.createdAt,
      },
      { status: 202 } // 202 Accepted
    );
  } catch (error) {
    console.error('Error creating run:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create run',
          requestId: `req_${Date.now()}`,
        },
      },
      { status: 500 }
    );
  }
}
