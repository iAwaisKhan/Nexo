import { describe, it, expect } from 'vitest';
import { useAuthStore } from '../../store/useAuthStore';

describe('Auth Store (Zustand)', () => {
  it('should have initial unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
  });
});
