import type { Order, AcademicOrderDetail, Subject, Assignment } from '@prisma/client'

export interface AcademicOrderWithDetails extends Order {
  academicDetail: AcademicOrderDetail | null
}
