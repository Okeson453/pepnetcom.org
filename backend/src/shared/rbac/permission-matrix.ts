export type Role = 'ADMIN' | 'CLIENT' | 'WRITER' | 'PUBLIC'

export type Permission =
  | 'users:read' | 'users:write' | 'users:admin'
  | 'orders:read' | 'orders:write' | 'orders:admin'
  | 'siwes:read' | 'siwes:write' | 'siwes:admin'
  | 'academic:read' | 'academic:write' | 'academic:admin'
  | 'strategies:read' | 'strategies:write' | 'strategies:admin'
  | 'consultant:read' | 'consultant:write' | 'consultant:admin'
  | 'marketing:read' | 'marketing:write' | 'marketing:admin'
  | 'signals:read' | 'signals:write' | 'signals:admin'
  | 'payments:read' | 'payments:write' | 'payments:admin'
  | 'cms:read' | 'cms:write' | 'cms:admin'
  | 'communication:read' | 'communication:write' | 'communication:admin'
  | 'analytics:read' | 'analytics:write' | 'analytics:admin'
  | 'tickets:read' | 'tickets:write' | 'tickets:admin'
  | 'settings:read' | 'settings:write' | 'settings:admin'

const allPermissions: Permission[] = [
  'users:read', 'users:write', 'users:admin',
  'orders:read', 'orders:write', 'orders:admin',
  'siwes:read', 'siwes:write', 'siwes:admin',
  'academic:read', 'academic:write', 'academic:admin',
  'strategies:read', 'strategies:write', 'strategies:admin',
  'consultant:read', 'consultant:write', 'consultant:admin',
  'marketing:read', 'marketing:write', 'marketing:admin',
  'signals:read', 'signals:write', 'signals:admin',
  'payments:read', 'payments:write', 'payments:admin',
  'cms:read', 'cms:write', 'cms:admin',
  'communication:read', 'communication:write', 'communication:admin',
  'analytics:read', 'analytics:write', 'analytics:admin',
  'tickets:read', 'tickets:write', 'tickets:admin',
  'settings:read', 'settings:write', 'settings:admin',
]

export const permissionMatrix: Record<Role, Permission[]> = {
  ADMIN: allPermissions,
  CLIENT: [
    'orders:read', 'orders:write',
    'strategies:read', 'strategies:write',
    'payments:read', 'payments:write',
    'communication:read', 'communication:write',
    'tickets:read', 'tickets:write',
  ],
  WRITER: [
    'orders:read', 'orders:write',
    'siwes:read', 'siwes:write',
    'academic:read', 'academic:write',
    'communication:read', 'communication:write',
    'tickets:read', 'tickets:write',
  ],
  PUBLIC: [
    'strategies:read',
    'cms:read',
    'consultant:read',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissionMatrix[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}
