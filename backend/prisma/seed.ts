import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

// §4.4 of the audit: static, human-readable seed passwords (`AdminPass123!`,
// etc.) baked into source control are fine for a throwaway local DB but are a
// real credential-leak risk the moment `db:seed` is ever pointed at a shared
// or production database — anyone with repo access effectively has the admin
// password forever, with no rotation forced. Refuse to run against production,
// and generate a fresh random password per run instead of reusing the same
// string every time; it's printed once to stdout and never persisted.
function generatePassword(): string {
  return randomBytes(18).toString('base64url')
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'Refusing to run prisma/seed.ts with NODE_ENV=production. ' +
        'Seed data (including default accounts) must never be created against a production database this way. ' +
        'If you need a first admin account in production, create one through a dedicated, audited bootstrap flow instead.',
    )
    process.exit(1)
  }
  // Create roles with permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Platform administrator' },
  })

  const clientRole = await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: { name: 'CLIENT', description: 'Standard client' },
  })

  const writerRole = await prisma.role.upsert({
    where: { name: 'WRITER' },
    update: {},
    create: { name: 'WRITER', description: 'Content writer/staff' },
  })

  // Create permissions
  const permissions = [
    { code: 'users:read', name: 'Read Users', module: 'users', action: 'read' },
    { code: 'users:write', name: 'Write Users', module: 'users', action: 'write' },
    { code: 'users:admin', name: 'Admin Users', module: 'users', action: 'admin' },
    { code: 'orders:read', name: 'Read Orders', module: 'orders', action: 'read' },
    { code: 'orders:write', name: 'Write Orders', module: 'orders', action: 'write' },
    { code: 'orders:admin', name: 'Admin Orders', module: 'orders', action: 'admin' },
    { code: 'siwes:read', name: 'Read SIWES', module: 'siwes', action: 'read' },
    { code: 'siwes:write', name: 'Write SIWES', module: 'siwes', action: 'write' },
    { code: 'siwes:admin', name: 'Admin SIWES', module: 'siwes', action: 'admin' },
    { code: 'academic:read', name: 'Read Academic', module: 'academic', action: 'read' },
    { code: 'academic:write', name: 'Write Academic', module: 'academic', action: 'write' },
    { code: 'academic:admin', name: 'Admin Academic', module: 'academic', action: 'admin' },
    { code: 'strategies:read', name: 'Read Strategies', module: 'strategies', action: 'read' },
    { code: 'strategies:write', name: 'Write Strategies', module: 'strategies', action: 'write' },
    { code: 'strategies:admin', name: 'Admin Strategies', module: 'strategies', action: 'admin' },
    { code: 'consultant:read', name: 'Read Consultant', module: 'consultant', action: 'read' },
    { code: 'consultant:write', name: 'Write Consultant', module: 'consultant', action: 'write' },
    { code: 'consultant:admin', name: 'Admin Consultant', module: 'consultant', action: 'admin' },
    { code: 'marketing:read', name: 'Read Marketing', module: 'marketing', action: 'read' },
    { code: 'marketing:write', name: 'Write Marketing', module: 'marketing', action: 'write' },
    { code: 'marketing:admin', name: 'Admin Marketing', module: 'marketing', action: 'admin' },
    { code: 'signals:read', name: 'Read Signals', module: 'signals', action: 'read' },
    { code: 'signals:write', name: 'Write Signals', module: 'signals', action: 'write' },
    { code: 'signals:admin', name: 'Admin Signals', module: 'signals', action: 'admin' },
    { code: 'payments:read', name: 'Read Payments', module: 'payments', action: 'read' },
    { code: 'payments:write', name: 'Write Payments', module: 'payments', action: 'write' },
    { code: 'payments:admin', name: 'Admin Payments', module: 'payments', action: 'admin' },
    { code: 'cms:read', name: 'Read CMS', module: 'cms', action: 'read' },
    { code: 'cms:write', name: 'Write CMS', module: 'cms', action: 'write' },
    { code: 'cms:admin', name: 'Admin CMS', module: 'cms', action: 'admin' },
    { code: 'communication:read', name: 'Read Communication', module: 'communication', action: 'read' },
    { code: 'communication:write', name: 'Write Communication', module: 'communication', action: 'write' },
    { code: 'communication:admin', name: 'Admin Communication', module: 'communication', action: 'admin' },
    { code: 'analytics:read', name: 'Read Analytics', module: 'analytics', action: 'read' },
    { code: 'analytics:write', name: 'Write Analytics', module: 'analytics', action: 'write' },
    { code: 'analytics:admin', name: 'Admin Analytics', module: 'analytics', action: 'admin' },
    { code: 'tickets:read', name: 'Read Tickets', module: 'tickets', action: 'read' },
    { code: 'tickets:write', name: 'Write Tickets', module: 'tickets', action: 'write' },
    { code: 'tickets:admin', name: 'Admin Tickets', module: 'tickets', action: 'admin' },
    { code: 'settings:read', name: 'Read Settings', module: 'settings', action: 'read' },
    { code: 'settings:write', name: 'Write Settings', module: 'settings', action: 'write' },
    { code: 'settings:admin', name: 'Admin Settings', module: 'settings', action: 'admin' },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    })
  }

  // Assign all permissions to ADMIN role
  const allPerms = await prisma.permission.findMany()
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    })
  }

  // Create users — passwords are generated fresh per run (see generatePassword
  // above) and only ever printed to stdout below, never committed to source.
  const adminPassword = generatePassword()
  const clientPassword = generatePassword()
  const writerPassword = generatePassword()

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pepnetcom.com' },
    update: {},
    create: {
      email: 'admin@pepnetcom.com',
      passwordHash: await hash(adminPassword, 12),
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: await hash(clientPassword, 12),
      firstName: 'John',
      lastName: 'Client',
      role: 'CLIENT',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })

  const writerUser = await prisma.user.upsert({
    where: { email: 'writer@example.com' },
    update: {},
    create: {
      email: 'writer@example.com',
      passwordHash: await hash(writerPassword, 12),
      firstName: 'Jane',
      lastName: 'Writer',
      role: 'WRITER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })

  // Create country
  const country = await prisma.country.upsert({
    where: { code: 'NG' },
    update: {},
    create: {
      name: 'Nigeria',
      code: 'NG',
      description: 'Federal Republic of Nigeria',
    },
  })

  // Create university
  const university = await prisma.university.upsert({
    where: { slug: 'university-of-lagos' },
    update: {},
    create: {
      name: 'University of Lagos',
      slug: 'university-of-lagos',
      countryId: country.id,
      city: 'Lagos',
      website: 'https://unilag.edu.ng',
    },
  })

  // Create subject
  const subject = await prisma.subject.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'Fundamentals of computer science',
      category: 'Computer Science',
    },
  })

  console.log('Seed completed successfully')
  console.log({ adminUser, clientUser, writerUser, country, university, subject })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
