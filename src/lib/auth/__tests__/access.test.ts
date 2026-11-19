// src/lib/auth/__tests__/access.test.ts
import { describe, it, expect } from 'vitest';
import {
  hasAdminOrTestAccess,
  normalizeAccountLabel,
  parseAllowedEmails,
} from '../access';

describe('hasAdminOrTestAccess', () => {
  it('grants access when profile role is ADMIN regardless of display name', () => {
    expect(hasAdminOrTestAccess({ role: 'ADMIN', displayName: 'Penguji Sidang' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'admin', displayName: 'Other User' })).toBe(true);
  });

  it('grants access for Vincent username / display name variants', () => {
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'Vincent' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'vincent' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: '  VINCENT  ' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'Vincent Alfian Artha' })).toBe(true);
  });

  it('grants access for Test User username / display name variants', () => {
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'Test User' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'test user' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'testuser' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'test_user' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'test-user' })).toBe(true);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'test.user' })).toBe(true);
  });

  it('grants access when email is in server allowlist', () => {
    const allowedEmails = parseAllowedEmails('admin@habitgrow.app, tester@habitgrow.app');
    expect(
      hasAdminOrTestAccess({
        role: 'USER',
        displayName: 'Guest',
        email: 'TESTER@habitgrow.app',
        allowedEmails,
      })
    ).toBe(true);
  });

  it('falls back to email local-part only when displayName is missing', () => {
    expect(
      hasAdminOrTestAccess({ role: 'USER', displayName: null, email: 'vincent@example.com' })
    ).toBe(true);
    expect(
      hasAdminOrTestAccess({ role: 'USER', displayName: '', email: 'test.user@example.com' })
    ).toBe(true);
    expect(
      hasAdminOrTestAccess({ role: 'USER', displayName: 'Budi', email: 'test.user@example.com' })
    ).toBe(false);
  });

  it('denies access for regular users and partial non-matching names', () => {
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'Budi Santoso' })).toBe(false);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'Vincentius' })).toBe(false);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'Tester' })).toBe(false);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'Test' })).toBe(false);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: 'User' })).toBe(false);
    expect(hasAdminOrTestAccess({ role: 'USER', displayName: null, email: 'budi@example.com' })).toBe(
      false
    );
  });

  it('normalizes account labels cleanly', () => {
    expect(normalizeAccountLabel('  Test_User-01  ')).toBe('test user 01');
    expect(normalizeAccountLabel(null)).toBe('');
  });
});
