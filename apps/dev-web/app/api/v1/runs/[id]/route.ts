import { NextRequest, NextResponse } from 'next/server';
import { getRun } from '../store';

/**
 * GET /api/v1/runs/:id
 * Retrieves run status and details, advancing state machine on each poll
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get run and advance state based on poll count
    const run = getRun(id);

    if (!run) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Run with id ${id} not found`,
            requestId: `req_${Date.now()}`,
          },
        },
        { status: 404 }
      );
    }

    // Return run details matching API contract
    return NextResponse.json({
      id: run.id,
      status: run.status,
      createdAt: run.createdAt,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      steps: run.steps,
      logs: run.logs,
    });
  } catch (error) {
    console.error('Error fetching run:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch run',
          requestId: `req_${Date.now()}`,
        },
      },
      { status: 500 }
    );
  }
}
