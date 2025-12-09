import { describe, it, expect, beforeEach, vi } from 'bun:test';
import { useAnalyticsStore } from '@/stores/analytics-store';

// Mock the attribution functions
vi.mock('@/lib/attribution', () => ({
  captureAttribution: vi.fn(() => ({
    utm_params: { utm_source: 'google', utm_medium: 'cpc' },
    referrer: 'https://google.com',
    landing_page: '/calculator',
    session_id: 'session123',
    timestamp: Date.now(),
  })),
  getStoredAttribution: vi.fn(() => null),
  getAttributionForSubmission: vi.fn(() => ({
    utm_params: { utm_source: 'google' },
    referrer: 'https://google.com',
    landing_page: '/calculator',
    session_id: 'session123',
    timestamp: Date.now(),
  })),
}));

// Mock fetch with proper typing
const mockFetch = vi.fn() as unknown as typeof fetch & ReturnType<typeof vi.fn>;
global.fetch = mockFetch;

describe('Analytics Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAnalyticsStore.setState({
      attribution: null,
      storedAttribution: null,
      utmParams: {},
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const state = useAnalyticsStore.getState();
    expect(state.attribution).toBe(null);
    expect(state.storedAttribution).toBe(null);
    expect(state.utmParams).toEqual({});
    expect(state.isLoading).toBe(false);
  });

  it('should capture attribution', () => {
    useAnalyticsStore.getState().captureAttribution();
    const state = useAnalyticsStore.getState();
    expect(state.attribution).toBeTruthy();
    expect(state.utmParams).toEqual({ utm_source: 'google', utm_medium: 'cpc' });
  });

  it('should send attribution data', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    await useAnalyticsStore.getState().sendAttribution('test@example.com');

    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/attribution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('test@example.com'),
    });
    expect(useAnalyticsStore.getState().isLoading).toBe(false);
  });

  it('should handle send attribution error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Should not throw, just log error
    await expect(useAnalyticsStore.getState().sendAttribution()).resolves.toBeUndefined();
    expect(useAnalyticsStore.getState().isLoading).toBe(false);
  });
});
