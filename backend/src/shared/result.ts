import { DomainError } from './errors/domain-error'

export type Result<T, E extends DomainError = DomainError> =
  | { success: true; data: T }
  | { success: false; error: E }

export const Ok = <T>(data: T): Result<T, never> => ({ success: true, data })
export const Err = <E extends DomainError>(error: E): Result<never, E> => ({ success: false, error })
