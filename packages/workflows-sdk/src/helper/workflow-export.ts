import {
  DistributedTransaction,
  DistributedTransactionEvents,
  LocalWorkflow,
  TransactionHandlerType,
  TransactionState,
  TransactionStepError,
} from "@medusajs/orchestration"
import { Context, LoadedModule, MedusaContainer } from "@medusajs/types"

import { MedusaModule } from "@medusajs/modules-sdk"
import { EOL } from "os"
import { ulid } from "ulid"
import { MedusaWorkflow } from "../medusa-workflow"
import { resolveValue } from "../utils/composer"

export type FlowRunOptions<TData = unknown> = {
  input?: TData
  context?: Context
  resultFrom?: string | string[] | Symbol
  throwOnError?: boolean
  events?: DistributedTransactionEvents
}

export type FlowRegisterStepSuccessOptions<TData = unknown> = {
  idempotencyKey: string
  response?: TData
  context?: Context
  resultFrom?: string | string[] | Symbol
  throwOnError?: boolean
  events?: DistributedTransactionEvents
}

export type FlowRegisterStepFailureOptions<TData = unknown> = {
  idempotencyKey: string
  response?: TData
  context?: Context
  resultFrom?: string | string[] | Symbol
  throwOnError?: boolean
  events?: DistributedTransactionEvents
}

export type WorkflowResult<TResult = unknown> = {
  errors: TransactionStepError[]
  transaction: DistributedTransaction
  result: TResult
}

export type ExportedWorkflow<
  TData = unknown,
  TResult = unknown,
  TDataOverride = undefined,
  TResultOverride = undefined
> = {
  run: (
    args?: FlowRunOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    >
  ) => Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  >
  registerStepSuccess: (
    args?: FlowRegisterStepSuccessOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    >
  ) => Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  >
  registerStepFailure: (
    args?: FlowRegisterStepFailureOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    >
  ) => Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  >
}

export type MainExportedWorkflow<TData = unknown, TResult = unknown> = {
  // Main function on the exported workflow
  <TDataOverride = undefined, TResultOverride = undefined>(
    container?: LoadedModule[] | MedusaContainer
  ): Omit<
    LocalWorkflow,
    "run" | "registerStepSuccess" | "registerStepFailure"
  > &
    ExportedWorkflow<TData, TResult, TDataOverride, TResultOverride>

  /**
   * You can also directly call run, registerStepSuccess and registerStepFailure on the exported workflow
   */

  run<TDataOverride = undefined, TResultOverride = undefined>(
    args?: FlowRunOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    > & {
      container?: LoadedModule[] | MedusaContainer
    }
  ): Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  >

  registerStepSuccess<TDataOverride = undefined, TResultOverride = undefined>(
    args?: FlowRegisterStepSuccessOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    > & {
      container?: LoadedModule[] | MedusaContainer
    }
  ): Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  >

  registerStepFailure<TDataOverride = undefined, TResultOverride = undefined>(
    args?: FlowRegisterStepFailureOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    > & {
      container?: LoadedModule[] | MedusaContainer
    }
  ): Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  >
}

function createContextualWorkflowRunner<
  TData = unknown,
  TResult = unknown,
  TDataOverride = undefined,
  TResultOverride = undefined
>({
  workflowId,
  defaultResult,
  dataPreparation,
  options,
  container,
}: {
  workflowId: string
  defaultResult?: string | Symbol
  dataPreparation?: (data: TData) => Promise<unknown>
  options?: {
    wrappedInput?: boolean
  }
  container?: LoadedModule[] | MedusaContainer
}): Omit<LocalWorkflow, "run" | "registerStepSuccess" | "registerStepFailure"> &
  ExportedWorkflow<TData, TResult, TDataOverride, TResultOverride> {
  if (!container) {
    container = MedusaModule.getLoadedModules().map(
      (mod) => Object.values(mod)[0]
    )
  }

  const flow = new LocalWorkflow(workflowId, container)

  const originalRun = flow.run.bind(flow)
  const originalRegisterStepSuccess = flow.registerStepSuccess.bind(flow)
  const originalRegisterStepFailure = flow.registerStepFailure.bind(flow)

  const originalExecution = async (
    method,
    { throwOnError, resultFrom },
    ...args
  ) => {
    const transaction = await method.apply(method, args)

    const errors = transaction.getErrors(TransactionHandlerType.INVOKE)

    const failedStatus = [TransactionState.FAILED, TransactionState.REVERTED]
    if (failedStatus.includes(transaction.getState()) && throwOnError) {
      const errorMessage = errors
        ?.map((err) => `${err.error?.message}${EOL}${err.error?.stack}`)
        ?.join(`${EOL}`)
      throw new Error(errorMessage)
    }

    let result
    if (options?.wrappedInput) {
      result = await resolveValue(resultFrom, transaction.getContext())
    } else {
      result = transaction.getContext().invoke?.[resultFrom]
    }

    return {
      errors,
      transaction,
      result,
    }
  }

  const newRun = async (
    { input, context, throwOnError, resultFrom, events }: FlowRunOptions = {
      throwOnError: true,
      resultFrom: defaultResult,
    }
  ) => {
    resultFrom ??= defaultResult
    throwOnError ??= true

    if (typeof dataPreparation === "function") {
      try {
        const copyInput = input ? JSON.parse(JSON.stringify(input)) : input
        input = await dataPreparation(copyInput as TData)
      } catch (err) {
        if (throwOnError) {
          throw new Error(
            `Data preparation failed: ${err.message}${EOL}${err.stack}`
          )
        }
        return {
          errors: [err],
        }
      }
    }

    return await originalExecution(
      originalRun,
      { throwOnError, resultFrom },
      context?.transactionId ?? ulid(),
      input,
      context,
      events
    )
  }
  flow.run = newRun as any

  const newRegisterStepSuccess = async (
    {
      response,
      idempotencyKey,
      context,
      throwOnError,
      resultFrom,
      events,
    }: FlowRegisterStepSuccessOptions = {
      idempotencyKey: "",
      throwOnError: true,
      resultFrom: defaultResult,
    }
  ) => {
    resultFrom ??= defaultResult
    throwOnError ??= true

    return await originalExecution(
      originalRegisterStepSuccess,
      { throwOnError, resultFrom },
      idempotencyKey,
      response,
      context,
      events
    )
  }
  flow.registerStepSuccess = newRegisterStepSuccess as any

  const newRegisterStepFailure = async (
    {
      response,
      idempotencyKey,
      context,
      throwOnError,
      resultFrom,
      events,
    }: FlowRegisterStepFailureOptions = {
      idempotencyKey: "",
      throwOnError: true,
      resultFrom: defaultResult,
    }
  ) => {
    resultFrom ??= defaultResult
    throwOnError ??= true

    return await originalExecution(
      originalRegisterStepFailure,
      { throwOnError, resultFrom },
      idempotencyKey,
      response,
      context,
      events
    )
  }
  flow.registerStepFailure = newRegisterStepFailure as any

  return flow as unknown as LocalWorkflow &
    ExportedWorkflow<TData, TResult, TDataOverride, TResultOverride>
}

export const exportWorkflow = <TData = unknown, TResult = unknown>(
  workflowId: string,
  defaultResult?: string | Symbol,
  dataPreparation?: (data: TData) => Promise<unknown>,
  options?: {
    wrappedInput?: boolean
  }
): MainExportedWorkflow<TData, TResult> => {
  function exportedWorkflow<
    TDataOverride = undefined,
    TResultOverride = undefined
  >(
    container?: LoadedModule[] | MedusaContainer
  ): Omit<
    LocalWorkflow,
    "run" | "registerStepSuccess" | "registerStepFailure"
  > &
    ExportedWorkflow<TData, TResult, TDataOverride, TResultOverride> {
    return createContextualWorkflowRunner<
      TData,
      TResult,
      TDataOverride,
      TResultOverride
    >({
      workflowId,
      defaultResult,
      dataPreparation,
      options,
      container,
    })
  }

  const buildRunnerFn = <
    TAction extends "run" | "registerStepSuccess" | "registerStepFailure",
    TDataOverride,
    TResultOverride
  >(
    action: "run" | "registerStepSuccess" | "registerStepFailure",
    container?: LoadedModule[] | MedusaContainer
  ) => {
    const contextualRunner = createContextualWorkflowRunner<
      TData,
      TResult,
      TDataOverride,
      TResultOverride
    >({
      workflowId,
      defaultResult,
      dataPreparation,
      options,
      container,
    })

    return contextualRunner[action] as ExportedWorkflow<
      TData,
      TResult,
      TDataOverride,
      TResultOverride
    >[TAction]
  }

  exportedWorkflow.run = async <
    TDataOverride = undefined,
    TResultOverride = undefined
  >(
    args?: FlowRunOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    > & {
      container?: LoadedModule[] | MedusaContainer
    }
  ): Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  > => {
    const container = args?.container
    delete args?.container
    const inputArgs = { ...args } as FlowRunOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    >

    return await buildRunnerFn<"run", TDataOverride, TResultOverride>(
      "run",
      container
    )(inputArgs)
  }

  exportedWorkflow.registerStepSuccess = async <
    TDataOverride = undefined,
    TResultOverride = undefined
  >(
    args?: FlowRegisterStepSuccessOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    > & {
      container?: LoadedModule[] | MedusaContainer
    }
  ): Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  > => {
    const container = args?.container
    delete args?.container
    const inputArgs = { ...args } as FlowRegisterStepSuccessOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    >

    return await buildRunnerFn<
      "registerStepSuccess",
      TDataOverride,
      TResultOverride
    >(
      "registerStepSuccess",
      container
    )(inputArgs)
  }

  exportedWorkflow.registerStepFailure = async <
    TDataOverride = undefined,
    TResultOverride = undefined
  >(
    args?: FlowRegisterStepFailureOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    > & {
      container?: LoadedModule[] | MedusaContainer
    }
  ): Promise<
    WorkflowResult<
      TResultOverride extends undefined ? TResult : TResultOverride
    >
  > => {
    const container = args?.container
    delete args?.container
    const inputArgs = { ...args } as FlowRegisterStepFailureOptions<
      TDataOverride extends undefined ? TData : TDataOverride
    >

    return await buildRunnerFn<
      "registerStepFailure",
      TDataOverride,
      TResultOverride
    >(
      "registerStepFailure",
      container
    )(inputArgs)
  }

  MedusaWorkflow.registerWorkflow(workflowId, exportedWorkflow)
  return exportedWorkflow
}
