import type { ConsultationRequest, StudentApplication, University, Country } from '@prisma/client'

export interface ApplicationWithDetails extends StudentApplication {
  university: University
  country: Country
}
