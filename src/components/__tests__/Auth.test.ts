import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/useAuthStore';

describe('Auth Store (Zustand)', () => {
  it('should have initial unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('setSession should update authentication state', () => {
    const store = useAuthStore.getState();
    // Simulate a session being set
    const mockSession = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      access_token: 'mock-token',
    } as any;
    store.setSession(mockSession);
    const updated = useAuthStore.getState();
    expect(updated.isAuthenticated).toBe(true);
    expect(updated.user).not.toBeNull();
  });

  it('setSession with null should clear authentication', () => {
    const store = useAuthStore.getState();
    store.setSession(null);
    const updated = useAuthStore.getState();
    expect(updated.isAuthenticated).toBe(false);
    expect(updated.user).toBeNull();
  });
});
