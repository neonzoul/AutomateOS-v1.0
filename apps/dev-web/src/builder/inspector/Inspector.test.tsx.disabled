import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { Inspector } from './Inspector';
import { useBuilderStore } from '@/core/state';
import { useCredentialStore } from '@/core/credentials';

// Mock Web Crypto API for credential tests
const mockCrypto = {
  subtle: {
    generateKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  getRandomValues: vi.fn(),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

describe('Inspector (shell)', () => {
  beforeEach(() => {
    useBuilderStore.setState({ nodes: [], edges: [], selectedNodeId: null });
    useCredentialStore.setState({
      credentials: new Map(),
      masterKey: null,
    });
    vi.clearAllMocks();

    // Setup crypto mocks
    mockCrypto.getRandomValues.mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 256;
      }
      return array;
    });

    const mockKey = { type: 'secret', algorithm: { name: 'AES-GCM', length: 256 } };
    const mockEncryptedData = new ArrayBuffer(32);

    mockCrypto.subtle.generateKey.mockResolvedValue(mockKey);
    mockCrypto.subtle.encrypt.mockResolvedValue(mockEncryptedData);
    mockCrypto.subtle.decrypt.mockResolvedValue(new TextEncoder().encode('Bearer test-token'));
  });

  it('shows placeholder when nothing selected', () => {
    render(<Inspector />);
    expect(
      screen.getByText(/Select a node to configure its settings and bring your workflow to life/i)
    ).toBeInTheDocument();
  });

  it('shows http form when an HTTP node is selected', () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 'h1',
          type: 'http',
          position: { x: 0, y: 0 },
          data: { label: 'HTTP', config: {} },
        } as any,
      ],
      edges: [],
      selectedNodeId: 'h1',
    });

    render(<Inspector />);
    expect(screen.getByText(/Method/i)).toBeInTheDocument();
    expect(screen.getByText(/URL/i)).toBeInTheDocument();
  });

  it('shows start message when a Start node is selected', () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 's1',
          type: 'start',
          position: { x: 0, y: 0 },
          data: { label: 'Start' },
        } as any,
      ],
      edges: [],
      selectedNodeId: 's1',
    });

    render(<Inspector />);
    expect(
      screen.getByText(/This magical node starts your workflow journey/i)
    ).toBeInTheDocument();
  });

  it('updates HTTP URL via input', async () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 'h1',
          type: 'http',
          position: { x: 0, y: 0 },
          data: {
            label: 'HTTP',
            config: { method: 'GET', url: 'https://example.com' },
          },
        } as any,
      ],
      edges: [],
      selectedNodeId: 'h1',
    });

    render(<Inspector />);
    const input = screen.getByPlaceholderText(
      'https://api.example.com/endpoint'
    ) as HTMLInputElement;

    // Simulate user input
    fireEvent.change(input, { target: { value: 'https://x.test/api' } });

    // Wait for the form validation and state update
    await waitFor(() => {
      const node = useBuilderStore.getState().nodes.find((n) => n.id === 'h1');
      expect((node?.data.config as any).url).toBe('https://x.test/api');
    });
  });

  it('shows inline URL error on invalid input', async () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 'h1',
          type: 'http',
          position: { x: 0, y: 0 },
          data: { label: 'HTTP', config: { method: 'GET', url: '' } },
        } as any,
      ],
      edges: [],
      selectedNodeId: 'h1',
    });

    render(<Inspector />);
    const input = screen.getByPlaceholderText(
      'https://api.example.com/endpoint'
    ) as HTMLInputElement;

    // Enter invalid URL
    fireEvent.change(input, { target: { value: 'not-a-valid-url' } });

    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();
    });

    // Check that input has error styling
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-red-500');
  });

  it('removes error once valid URL is entered', async () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 'h1',
          type: 'http',
          position: { x: 0, y: 0 },
          data: { label: 'HTTP', config: { method: 'GET', url: '' } },
        } as any,
      ],
      edges: [],
      selectedNodeId: 'h1',
    });

    render(<Inspector />);
    const input = screen.getByPlaceholderText(
      'https://api.example.com/endpoint'
    ) as HTMLInputElement;

    // Enter invalid URL first
    fireEvent.change(input, { target: { value: 'invalid' } });

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();
    });

    // Now enter valid URL
    fireEvent.change(input, { target: { value: 'https://api.example.com' } });

    await waitFor(() => {
      expect(
        screen.queryByText(/Please enter a valid URL/i)
      ).not.toBeInTheDocument();
    });

    // Check that error styling is removed
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveClass('border-gray-300');
  });

  it('updates store when valid URL is entered after error', async () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 'h1',
          type: 'http',
          position: { x: 0, y: 0 },
          data: { label: 'HTTP', config: { method: 'GET', url: '' } },
        } as any,
      ],
      edges: [],
      selectedNodeId: 'h1',
    });

    render(<Inspector />);
    const input = screen.getByPlaceholderText(
      'https://api.example.com/endpoint'
    ) as HTMLInputElement;

    // Enter invalid URL first (should not update store)
    fireEvent.change(input, { target: { value: 'invalid-url' } });

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();
    });

    // Verify store was not updated with invalid URL
    const nodeAfterInvalid = useBuilderStore
      .getState()
      .nodes.find((n) => n.id === 'h1');
    expect((nodeAfterInvalid?.data.config as any).url).toBe('');

    // Now enter valid URL
    fireEvent.change(input, {
      target: { value: 'https://validapi.example.com' },
    });

    // Verify store is updated with valid URL
    await waitFor(() => {
      const nodeAfterValid = useBuilderStore
        .getState()
        .nodes.find((n) => n.id === 'h1');
      expect((nodeAfterValid?.data.config as any).url).toBe(
        'https://validapi.example.com'
      );
    });

    // Verify error is cleared
    expect(
      screen.queryByText(/Please enter a valid URL/i)
    ).not.toBeInTheDocument();
  });

  describe('Credential Authentication', () => {
    it('displays authentication dropdown with existing credentials', async () => {
      // Create a credential first
      const credentialStore = useCredentialStore.getState();
      await credentialStore.setCredential('test-token', 'Bearer secret123');

      useBuilderStore.setState({
        nodes: [
          {
            id: 'h1',
            type: 'http',
            position: { x: 0, y: 0 },
            data: { label: 'HTTP', config: {} },
          } as any,
        ],
        edges: [],
        selectedNodeId: 'h1',
      });

      render(<Inspector />);

      // Check that authentication field exists
      expect(screen.getByText('Authentication (optional)')).toBeInTheDocument();

      // Wait for credentials to be loaded and rendered
      await waitFor(() => {
        const authSelect = screen.getByDisplayValue('No authentication');
        expect(authSelect).toBeInTheDocument();
      });

      // Check that the credential appears as an option
      await waitFor(() => {
        expect(screen.getByText(/test-token \(Bea\*\*\*\*\*\*\*\*\*\*23\)/)).toBeInTheDocument();
      });
    });

    it('shows credential options in dropdown', async () => {
      // Create a credential first
      const credentialStore = useCredentialStore.getState();
      await credentialStore.setCredential('api-key', 'Bearer mytoken');

      useBuilderStore.setState({
        nodes: [
          {
            id: 'h1',
            type: 'http',
            position: { x: 0, y: 0 },
            data: { label: 'HTTP', config: {} },
          } as any,
        ],
        edges: [],
        selectedNodeId: 'h1',
      });

      render(<Inspector />);

      // Verify the dropdown shows the credential
      await waitFor(() => {
        expect(screen.getByText(/api-key \(Bea\*\*\*\*\*\*\*\*\*en\)/)).toBeInTheDocument();
      });

      const authSelect = screen.getByDisplayValue('No authentication');
      expect(authSelect).toBeInTheDocument();
    });

    it('shows create credential button', () => {
      useBuilderStore.setState({
        nodes: [
          {
            id: 'h1',
            type: 'http',
            position: { x: 0, y: 0 },
            data: { label: 'HTTP', config: {} },
          } as any,
        ],
        edges: [],
        selectedNodeId: 'h1',
      });

      render(<Inspector />);

      expect(screen.getByText('+ Create new credential')).toBeInTheDocument();
    });

    it('has credential creation button that can be clicked', () => {
      // Mock window.prompt to avoid jsdom error
      Object.defineProperty(window, 'prompt', {
        value: vi.fn().mockReturnValue(null),
        writable: true,
      });

      useBuilderStore.setState({
        nodes: [
          {
            id: 'h1',
            type: 'http',
            position: { x: 0, y: 0 },
            data: { label: 'HTTP', config: {} },
          } as any,
        ],
        edges: [],
        selectedNodeId: 'h1',
      });

      render(<Inspector />);

      const createButton = screen.getByText('+ Create new credential');
      expect(createButton).toBeInTheDocument();

      // Should not throw when clicked
      expect(() => fireEvent.click(createButton)).not.toThrow();
    });

    it('renders authentication dropdown for HTTP nodes', () => {
      useBuilderStore.setState({
        nodes: [
          {
            id: 'h1',
            type: 'http',
            position: { x: 0, y: 0 },
            data: {
              label: 'HTTP',
              config: {
                method: 'GET',
                url: 'https://example.com'
              }
            },
          } as any,
        ],
        edges: [],
        selectedNodeId: 'h1',
      });

      render(<Inspector />);

      // Check that the authentication section is present
      expect(screen.getByText('Authentication (optional)')).toBeInTheDocument();
      expect(screen.getByText('+ Create new credential')).toBeInTheDocument();

      // Check that we can find the auth select using a more specific query
      const selectElement = screen.getByRole('combobox', { name: /method/i });
      expect(selectElement).toBeInTheDocument();
      expect(selectElement.getAttribute('name')).toBe('method');
    });

    it('ensures no secrets are visible in UI', async () => {
      // Create credential with sensitive data
      const credentialStore = useCredentialStore.getState();
      await credentialStore.setCredential('secret-key', 'Bearer super-secret-token-12345');

      useBuilderStore.setState({
        nodes: [
          {
            id: 'h1',
            type: 'http',
            position: { x: 0, y: 0 },
            data: { label: 'HTTP', config: {} },
          } as any,
        ],
        edges: [],
        selectedNodeId: 'h1',
      });

      const { container } = render(<Inspector />);

      // Wait for masked version to appear
      await waitFor(() => {
        expect(container.textContent).toContain('Bea**********45');
      });

      // Check that the full secret is never in the DOM
      expect(container.textContent).not.toContain('super-secret-token-12345');
      expect(container.textContent).not.toContain('Bearer super-secret-token-12345');
    });
  });
});
