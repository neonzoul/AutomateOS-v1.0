import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { RunPanel } from './RunPanel';

describe('RunPanel (shell)', () => {
  it('renders a disabled run button and a stub status', () => {
    render(<RunPanel />);
    expect(screen.getByLabelText(/Run Panel/i)).toBeInTheDocument();
    const btn = screen.getByTestId('run-button') as HTMLButtonElement;
    const status = screen.getByTestId('run-status');
    expect(btn).toBeInTheDocument();
    expect(btn.disabled).toBe(true);
    expect(status.textContent).toMatch(/No runs yet/i);
  });
});
