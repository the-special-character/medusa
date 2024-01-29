import { AuthProviderDTO } from "./auth-provider"

export type AuthUserDTO = {
  id: string
  provider_id: string
  entity_id: string
  provider: AuthProviderDTO
  provider_metadata?: Record<string, unknown>
  user_metadata: Record<string, unknown>
  app_metadata: Record<string, unknown>
}

export type CreateAuthUserDTO = {
  entity_id: string
  provider_id: string
  provider_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
}

export type UpdateAuthUserDTO = {
  id: string
  provider_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
}

export type FilterableAuthUserProps = {}
