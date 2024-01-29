import { Modules, ModulesDefinition } from "@medusajs/modules-sdk"

import { DB_URL } from "./database"

export function getInitModuleConfig() {
  const moduleOptions = {
    defaultAdapterOptions: {
      database: {
        clientUrl: DB_URL,
        schema: process.env.MEDUSA_AUTHENTICATION_DB_SCHEMA,
      },
    },
  }

  const injectedDependencies = {}

  const modulesConfig_ = {
    [Modules.AUTHENTICATION]: {
      definition: ModulesDefinition[Modules.AUTHENTICATION],
      options: moduleOptions,
    },
  }

  return {
    injectedDependencies,
    modulesConfig: modulesConfig_,
    databaseConfig: {
      clientUrl: DB_URL,
      schema: process.env.MEDUSA_AUTHENTICATION_DB_SCHEMA,
    },
    joinerConfig: [],
  }
}
