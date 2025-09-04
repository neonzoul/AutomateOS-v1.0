// ::Component:: RunPanel

'use client';

import React from 'react';

/**
 * RunPanel (shell)
 * - Sprint 1: purely presentational
 * - Sprint 2: wire to startRun() + /v1/runs polling
 */
export function RunPanel() {
  // Stubbed status; we’ll replace with store-backed data in Sprint 2
  const statusText = 'No runs yet';

  return (
    <aside
      className="p-4 space-y-3"
      aria-label="Run Panel"
      data-testid="run-panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Run</h3>

        {/* Disabled in Sprint 1 */}
        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          disabled
          aria-disabled="true"
          title="Run (disabled in Sprint 1)"
          data-testid="run-button"
        >
          Run
        </button>
      </div>

      <div className="text-sm text-gray-500" data-testid="run-status">
        {statusText}
      </div>
    </aside>
  );
}
