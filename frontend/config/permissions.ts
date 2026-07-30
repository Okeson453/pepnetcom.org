export type Role = "CLIENT" | "WRITER" | "ADMIN";

export type Permission =
  | "orders:read"
  | "orders:create"
  | "orders:assign"
  | "orders:manage"
  | "signals:read"
  | "signals:manage"
  | "users:manage"
  | "cms:manage"
  | "payments:manage"
  | "settings:manage";

/**
 * Coarse role -> permission map. Each dashboard page/action should check
 * against this rather than hardcoding role strings, so a future
 * fine-grained role (e.g. "SENIOR_WRITER") only needs a change here.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CLIENT: ["orders:read", "orders:create", "signals:read"],
  WRITER: ["orders:read"],
  ADMIN: [
    "orders:read",
    "orders:create",
    "orders:assign",
    "orders:manage",
    "signals:read",
    "signals:manage",
    "users:manage",
    "cms:manage",
    "payments:manage",
    "settings:manage",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
