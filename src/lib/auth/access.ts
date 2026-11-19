// src/lib/auth/access.ts

export interface AdminAccessIdentity {
  role?: string | null;
  displayName?: string | null;
  email?: string | null;
  allowedEmails?: string[];
}

const ALLOWED_EXACT_LABELS = new Set(['vincent', 'test user']);
const ALLOWED_COMPACT_LABELS = new Set(['vincent', 'testuser']);

/**
 * Normalizes a display name or email local-part for resilient case- and punctuation-insensitive matching.
 */
export function normalizeAccountLabel(value?: string | null): string {
  if (!value) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Parses a comma-separated list of emails from an environment variable.
 */
export function parseAllowedEmails(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function matchesAllowedAccountLabel(rawLabel?: string | null): boolean {
  const normalized = normalizeAccountLabel(rawLabel);
  if (!normalized) return false;

  if (ALLOWED_EXACT_LABELS.has(normalized)) {
    return true;
  }

  // Handle Google OAuth / full name variants (e.g. "Vincent Alfian Artha" or "Test User 1")
  if (normalized.startsWith('vincent ') || normalized.startsWith('test user ')) {
    return true;
  }

  const compact = normalized.replace(/\s+/g, '');
  if (ALLOWED_COMPACT_LABELS.has(compact)) {
    return true;
  }

  return false;
}

/**
 * Checks whether the current user is allowed to access admin & testing-only tools
 * (e.g. Web Push background testing panel & research JSON export on Profile page).
 *
 * Authorized when ANY of the following holds:
 * 1. Profile role in Supabase is 'ADMIN'
 * 2. User email matches server-configured ADMIN_FEATURE_EMAILS allowlist
 * 3. Account display name (or email local-part fallback) matches Admin "Vincent" or "Test User"
 */
export function hasAdminOrTestAccess(identity: AdminAccessIdentity): boolean {
  if (identity.role?.trim().toUpperCase() === 'ADMIN') {
    return true;
  }

  const normalizedEmail = identity.email?.trim().toLowerCase() || '';
  if (normalizedEmail && identity.allowedEmails && identity.allowedEmails.length > 0) {
    const allowedSet = new Set(identity.allowedEmails.map((e) => e.trim().toLowerCase()));
    if (allowedSet.has(normalizedEmail)) {
      return true;
    }
  }

  if (matchesAllowedAccountLabel(identity.displayName)) {
    return true;
  }

  if (!identity.displayName && normalizedEmail.includes('@')) {
    const emailLocalPart = normalizedEmail.split('@')[0];
    if (matchesAllowedAccountLabel(emailLocalPart)) {
      return true;
    }
  }

  return false;
}
