import {
  AuthenticationResponse,
  AuthenticationTypes,
  Context,
  DAL,
  FindConfig,
  InternalModuleDeclaration,
  MedusaContainer,
  ModuleJoinerConfig,
} from "@medusajs/types"

import { AuthProvider, AuthUser } from "@models"

import { joinerConfig } from "../joiner-config"
import { AuthProviderService, AuthUserService } from "@services"

import {
  AbstractAuthenticationModuleProvider,
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaError,
} from "@medusajs/utils"
import {
  AuthProviderDTO,
  AuthUserDTO,
  CreateAuthProviderDTO,
  CreateAuthUserDTO,
  FilterableAuthProviderProps,
  FilterableAuthUserProps,
  UpdateAuthUserDTO,
} from "@medusajs/types/dist/authentication/common"
import { ServiceTypes } from "@types"

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService
  authUserService: AuthUserService<any>
  authProviderService: AuthProviderService<any>
}

export default class AuthenticationModuleService<
  TAuthUser extends AuthUser = AuthUser,
  TAuthProvider extends AuthProvider = AuthProvider
> implements AuthenticationTypes.IAuthenticationModuleService
{
  __joinerConfig(): ModuleJoinerConfig {
    return joinerConfig
  }

  __hooks = {
    onApplicationStart: async () => await this.createProvidersOnLoad(),
  }

  protected __container__: MedusaContainer
  protected baseRepository_: DAL.RepositoryService

  protected authUserService_: AuthUserService<TAuthUser>
  protected authProviderService_: AuthProviderService<TAuthProvider>

  constructor(
    {
      authUserService,
      authProviderService,
      baseRepository,
    }: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    this.__container__ = arguments[0]
    this.baseRepository_ = baseRepository
    this.authUserService_ = authUserService
    this.authProviderService_ = authProviderService
  }

  async retrieveAuthProvider(
    provider: string,
    config: FindConfig<AuthProviderDTO> = {},
    sharedContext: Context = {}
  ): Promise<AuthProviderDTO> {
    const authProvider = await this.authProviderService_.retrieve(
      provider,
      config,
      sharedContext
    )

    return await this.baseRepository_.serialize<AuthenticationTypes.AuthProviderDTO>(
      authProvider,
      { populate: true }
    )
  }

  async listAuthProviders(
    filters: FilterableAuthProviderProps = {},
    config: FindConfig<AuthProviderDTO> = {},
    sharedContext: Context = {}
  ): Promise<AuthProviderDTO[]> {
    const authProviders = await this.authProviderService_.list(
      filters,
      config,
      sharedContext
    )

    return await this.baseRepository_.serialize<
      AuthenticationTypes.AuthProviderDTO[]
    >(authProviders, { populate: true })
  }

  @InjectManager("baseRepository_")
  async listAndCountAuthProviders(
    filters: FilterableAuthProviderProps = {},
    config: FindConfig<AuthProviderDTO>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<[AuthenticationTypes.AuthProviderDTO[], number]> {
    const [authProviders, count] = await this.authProviderService_.listAndCount(
      filters,
      config,
      sharedContext
    )

    return [
      await this.baseRepository_.serialize<
        AuthenticationTypes.AuthProviderDTO[]
      >(authProviders, { populate: true }),
      count,
    ]
  }

  async createAuthProvider(
    data: CreateAuthProviderDTO[],
    sharedContext?: Context
  ): Promise<AuthProviderDTO[]>

  async createAuthProvider(
    data: CreateAuthProviderDTO,
    sharedContext?: Context
  ): Promise<AuthProviderDTO>

  @InjectManager("baseRepository_")
  async createAuthProvider(
    data: CreateAuthProviderDTO | CreateAuthProviderDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    AuthenticationTypes.AuthProviderDTO | AuthenticationTypes.AuthProviderDTO[]
  > {
    const input = Array.isArray(data) ? data : [data]

    const providers = await this.createAuthProviders_(input, sharedContext)

    const serializedProviders = await this.baseRepository_.serialize<
      AuthenticationTypes.AuthProviderDTO[]
    >(providers, {
      populate: true,
    })

    return Array.isArray(data) ? serializedProviders : serializedProviders[0]
  }

  @InjectTransactionManager("baseRepository_")
  protected async createAuthProviders_(
    data: any[],
    @MedusaContext() sharedContext: Context
  ): Promise<TAuthProvider[]> {
    return await this.authProviderService_.create(data, sharedContext)
  }

  updateAuthProvider(
    data: AuthenticationTypes.UpdateAuthProviderDTO[],
    sharedContext?: Context
  ): Promise<AuthProviderDTO[]>
  updateAuthProvider(
    data: AuthenticationTypes.UpdateAuthProviderDTO,
    sharedContext?: Context
  ): Promise<AuthProviderDTO>

  @InjectManager("baseRepository_")
  async updateAuthProvider(
    data:
      | AuthenticationTypes.UpdateAuthProviderDTO[]
      | AuthenticationTypes.UpdateAuthProviderDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    AuthenticationTypes.AuthProviderDTO | AuthenticationTypes.AuthProviderDTO[]
  > {
    const input = Array.isArray(data) ? data : [data]

    const providers = await this.updateAuthProvider_(input, sharedContext)

    const serializedProviders = await this.baseRepository_.serialize<
      AuthenticationTypes.AuthProviderDTO[]
    >(providers, {
      populate: true,
    })

    return Array.isArray(data) ? serializedProviders : serializedProviders[0]
  }

  async updateAuthProvider_(
    data: AuthenticationTypes.UpdateAuthProviderDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TAuthProvider[]> {
    return await this.authProviderService_.update(data, sharedContext)
  }

  @InjectTransactionManager("baseRepository_")
  async deleteAuthProvider(
    ids: string[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    await this.authProviderService_.delete(ids, sharedContext)
  }

  @InjectManager("baseRepository_")
  async retrieveAuthUser(
    id: string,
    config: FindConfig<AuthUserDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<AuthUserDTO> {
    const authUser = await this.authUserService_.retrieve(
      id,
      config,
      sharedContext
    )

    return await this.baseRepository_.serialize<AuthenticationTypes.AuthUserDTO>(
      authUser,
      {
        exclude: ["password_hash"],
      }
    )
  }

  @InjectManager("baseRepository_")
  async listAuthUsers(
    filters: FilterableAuthUserProps = {},
    config: FindConfig<AuthUserDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<AuthUserDTO[]> {
    const authUsers = await this.authUserService_.list(
      filters,
      config,
      sharedContext
    )

    return await this.baseRepository_.serialize<
      AuthenticationTypes.AuthUserDTO[]
    >(authUsers, {
      populate: true,
    })
  }

  @InjectManager("baseRepository_")
  async listAndCountAuthUsers(
    filters: FilterableAuthUserProps = {},
    config: FindConfig<AuthUserDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<[AuthUserDTO[], number]> {
    const [authUsers, count] = await this.authUserService_.listAndCount(
      filters,
      config,
      sharedContext
    )

    return [
      await this.baseRepository_.serialize<AuthenticationTypes.AuthUserDTO[]>(
        authUsers,
        {
          populate: true,
        }
      ),
      count,
    ]
  }

  createAuthUser(
    data: CreateAuthUserDTO[],
    sharedContext?: Context
  ): Promise<AuthUserDTO[]>
  createAuthUser(
    data: CreateAuthUserDTO,
    sharedContext?: Context
  ): Promise<AuthUserDTO>

  @InjectManager("baseRepository_")
  async createAuthUser(
    data: CreateAuthUserDTO[] | CreateAuthUserDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    AuthenticationTypes.AuthUserDTO | AuthenticationTypes.AuthUserDTO[]
  > {
    const input = Array.isArray(data) ? data : [data]

    const authUsers = await this.createAuthUsers_(input, sharedContext)

    const serializedUsers = await this.baseRepository_.serialize<
      AuthenticationTypes.AuthUserDTO[]
    >(authUsers, {
      populate: true,
    })

    return Array.isArray(data) ? serializedUsers : serializedUsers[0]
  }

  @InjectTransactionManager("baseRepository_")
  protected async createAuthUsers_(
    data: CreateAuthUserDTO[],
    @MedusaContext() sharedContext: Context
  ): Promise<TAuthUser[]> {
    return await this.authUserService_.create(data, sharedContext)
  }

  updateAuthUser(
    data: UpdateAuthUserDTO[],
    sharedContext?: Context
  ): Promise<AuthUserDTO[]>
  updateAuthUser(
    data: UpdateAuthUserDTO,
    sharedContext?: Context
  ): Promise<AuthUserDTO>

  @InjectManager("baseRepository_")
  async updateAuthUser(
    data: UpdateAuthUserDTO | UpdateAuthUserDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    AuthenticationTypes.AuthUserDTO | AuthenticationTypes.AuthUserDTO[]
  > {
    const input = Array.isArray(data) ? data : [data]

    const updatedUsers = await this.updateAuthUsers_(input, sharedContext)

    const serializedUsers = await this.baseRepository_.serialize<
      AuthenticationTypes.AuthUserDTO[]
    >(updatedUsers, {
      populate: true,
    })

    return Array.isArray(data) ? serializedUsers : serializedUsers[0]
  }

  @InjectTransactionManager("baseRepository_")
  protected async updateAuthUsers_(
    data: UpdateAuthUserDTO[],
    @MedusaContext() sharedContext: Context
  ): Promise<TAuthUser[]> {
    return await this.authUserService_.update(data, sharedContext)
  }

  @InjectTransactionManager("baseRepository_")
  async deleteAuthUser(
    ids: string[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    await this.authUserService_.delete(ids, sharedContext)
  }

  protected getRegisteredAuthenticationProvider(
    provider: string
  ): AbstractAuthenticationModuleProvider {
    let containerProvider: AbstractAuthenticationModuleProvider
    try {
      containerProvider = this.__container__[`auth_provider_${provider}`]
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `AuthenticationProvider with for provider: ${provider} wasn't registered in the module. Have you configured your options correctly?`
      )
    }

    return containerProvider
  }

  async authenticate(
    provider: string,
    authenticationData: Record<string, unknown>
  ): Promise<AuthenticationResponse> {
    try {
      await this.retrieveAuthProvider(provider, {})

      const registeredProvider =
        this.getRegisteredAuthenticationProvider(provider)

      return await registeredProvider.authenticate(authenticationData)
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async validateCallback(
    provider: string,
    authenticationData: Record<string, unknown>
  ): Promise<AuthenticationResponse> {
    try {
      await this.retrieveAuthProvider(provider, {})

      const registeredProvider =
        this.getRegisteredAuthenticationProvider(provider)

      return await registeredProvider.validateCallback(authenticationData)
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  private async createProvidersOnLoad() {
    const providersToLoad = this.__container__["auth_providers"]

    const providers = await this.authProviderService_.list({
      provider: providersToLoad.map((p) => p.provider),
    })

    const loadedProvidersMap = new Map(providers.map((p) => [p.provider, p]))

    const providersToCreate: ServiceTypes.CreateAuthProviderDTO[] = []

    for (const provider of providersToLoad) {
      if (loadedProvidersMap.has(provider.provider)) {
        continue
      }

      providersToCreate.push({
        provider: provider.provider,
        name: provider.displayName,
      })
    }

    await this.authProviderService_.create(providersToCreate)
  }
}
