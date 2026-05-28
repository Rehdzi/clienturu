// Canonical role values used across the app for authorization checks.
export const ADMIN_ROLE_VALUE = 'Admin';
export const STAFF_ROLE_VALUE = 'Staff';

// True if the given role list grants administrator privileges (bypasses
// ownership/identity checks).
export const isAdmin = (roles?: string[]): boolean =>
  roles?.includes(ADMIN_ROLE_VALUE) ?? false;
