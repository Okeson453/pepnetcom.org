export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  session: (token: string) => `session:${token}`,
  rolePermissions: (roleId: string) => `role:permissions:${roleId}`,
  settings: (key: string) => `setting:${key}`,
  signalFeed: 'signals:live:feed',
  signal: (id: string) => `signal:${id}`,
  rateLimit: (key: string) => `ratelimit:${key}`,
} as const
