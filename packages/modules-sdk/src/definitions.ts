import {
  MODULE_RESOURCE_TYPE,
  MODULE_SCOPE,
  ModuleDefinition,
} from "@medusajs/types"

import { upperCaseFirst } from "@medusajs/utils"

export enum Modules {
  LINK = "linkModules",
  EVENT_BUS = "eventBus",
  STOCK_LOCATION = "stockLocationService",
  INVENTORY = "inventoryService",
  CACHE = "cacheService",
  PRODUCT = "productService",
  PRICING = "pricingService",
  PROMOTION = "promotion",
  AUTHENTICATION = "authentication",
  WORKFLOW_ENGINE = "workflows",
  CART = "cart",
  CUSTOMER = "customer",
  PAYMENT = "payment",
}

export enum ModuleRegistrationName {
  EVENT_BUS = "eventBusModuleService",
  STOCK_LOCATION = "stockLocationService",
  INVENTORY = "inventoryService",
  CACHE = "cacheService",
  PRODUCT = "productModuleService",
  PRICING = "pricingModuleService",
  PROMOTION = "promotionModuleService",
  AUTHENTICATION = "authenticationModuleService",
  WORKFLOW_ENGINE = "workflowsModuleService",
  CART = "cartModuleService",
  CUSTOMER = "customerModuleService",
  PAYMENT = "paymentModuleService",
}

export const MODULE_PACKAGE_NAMES = {
  [Modules.LINK]: "@medusajs/link-modules",
  [Modules.PRODUCT]: "@medusajs/product",
  [Modules.EVENT_BUS]: "@medusajs/event-bus-local",
  [Modules.STOCK_LOCATION]: "@medusajs/stock-location",
  [Modules.INVENTORY]: "@medusajs/inventory",
  [Modules.CACHE]: "@medusajs/cache-inmemory",
  [Modules.PRICING]: "@medusajs/pricing",
  [Modules.PROMOTION]: "@medusajs/promotion",
  [Modules.AUTHENTICATION]: "@medusajs/authentication",
  [Modules.WORKFLOW_ENGINE]: "@medusajs/workflow-engine-inmemory",
  [Modules.CART]: "@medusajs/cart",
  [Modules.CUSTOMER]: "@medusajs/customer",
  [Modules.PAYMENT]: "@medusajs/payment",
}

export const ModulesDefinition: { [key: string | Modules]: ModuleDefinition } =
  {
    [Modules.EVENT_BUS]: {
      key: Modules.EVENT_BUS,
      isLegacy: true,
      registrationName: ModuleRegistrationName.EVENT_BUS,
      defaultPackage: MODULE_PACKAGE_NAMES[Modules.EVENT_BUS],
      label: upperCaseFirst(ModuleRegistrationName.EVENT_BUS),
      canOverride: true,
      isRequired: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.STOCK_LOCATION]: {
      key: Modules.STOCK_LOCATION,
      isLegacy: true,
      registrationName: ModuleRegistrationName.STOCK_LOCATION,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.STOCK_LOCATION),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["eventBusService"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.INVENTORY]: {
      key: Modules.INVENTORY,
      isLegacy: true,
      registrationName: ModuleRegistrationName.INVENTORY,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.INVENTORY),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["eventBusService"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.CACHE]: {
      key: Modules.CACHE,
      isLegacy: true,
      registrationName: ModuleRegistrationName.CACHE,
      defaultPackage: MODULE_PACKAGE_NAMES[Modules.CACHE],
      label: upperCaseFirst(ModuleRegistrationName.CACHE),
      isRequired: true,
      canOverride: true,
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.PRODUCT]: {
      key: Modules.PRODUCT,
      registrationName: ModuleRegistrationName.PRODUCT,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.PRODUCT),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: [ModuleRegistrationName.EVENT_BUS, "logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.PRICING]: {
      key: Modules.PRICING,
      registrationName: ModuleRegistrationName.PRICING,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.PRICING),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.PROMOTION]: {
      key: Modules.PROMOTION,
      registrationName: ModuleRegistrationName.PROMOTION,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.PROMOTION),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.AUTHENTICATION]: {
      key: Modules.AUTHENTICATION,
      registrationName: ModuleRegistrationName.AUTHENTICATION,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.AUTHENTICATION),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.WORKFLOW_ENGINE]: {
      key: Modules.WORKFLOW_ENGINE,
      registrationName: ModuleRegistrationName.WORKFLOW_ENGINE,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.WORKFLOW_ENGINE),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.CART]: {
      key: Modules.CART,
      registrationName: ModuleRegistrationName.CART,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.CART),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.CUSTOMER]: {
      key: Modules.CUSTOMER,
      registrationName: ModuleRegistrationName.CUSTOMER,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.CUSTOMER),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
    [Modules.PAYMENT]: {
      key: Modules.PAYMENT,
      registrationName: ModuleRegistrationName.PAYMENT,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.PAYMENT),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
  }

export const MODULE_DEFINITIONS: ModuleDefinition[] =
  Object.values(ModulesDefinition)

export default MODULE_DEFINITIONS
