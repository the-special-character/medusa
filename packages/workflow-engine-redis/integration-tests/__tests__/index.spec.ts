import { MedusaApp } from "@medusajs/modules-sdk"
import {
  TransactionStepTimeoutError,
  TransactionTimeoutError,
} from "@medusajs/orchestration"
import { RemoteJoinerQuery } from "@medusajs/types"
import { TransactionHandlerType } from "@medusajs/utils"
import { IWorkflowsModuleService } from "@medusajs/workflows-sdk"
import { knex } from "knex"
import { setTimeout } from "timers/promises"
import "../__fixtures__"
import { DB_URL, TestDatabase } from "../utils"

const sharedPgConnection = knex<any, any>({
  client: "pg",
  searchPath: process.env.MEDUSA_WORKFLOW_ENGINE_DB_SCHEMA,
  connection: {
    connectionString: DB_URL,
    debug: false,
  },
})

const afterEach_ = async () => {
  await TestDatabase.clearTables(sharedPgConnection)
}

describe("Workflow Orchestrator module", function () {
  describe("Testing basic workflow", function () {
    let workflowOrcModule: IWorkflowsModuleService
    let query: (
      query: string | RemoteJoinerQuery | object,
      variables?: Record<string, unknown>
    ) => Promise<any>

    afterEach(afterEach_)

    beforeAll(async () => {
      const {
        runMigrations,
        query: remoteQuery,
        modules,
      } = await MedusaApp({
        sharedResourcesConfig: {
          database: {
            connection: sharedPgConnection,
          },
        },
        modulesConfig: {
          workflows: {
            resolve: __dirname + "/../..",
            options: {
              redis: {
                url: "localhost:6379",
              },
            },
          },
        },
      })

      query = remoteQuery

      await runMigrations()

      workflowOrcModule =
        modules.workflows as unknown as IWorkflowsModuleService
    })

    afterEach(afterEach_)

    it("should return a list of workflow executions and remove after completed when there is no retentionTime set", async () => {
      await workflowOrcModule.run("workflow_1", {
        input: {
          value: "123",
        },
        throwOnError: true,
      })

      let executionsList = await query({
        workflow_executions: {
          fields: ["workflow_id", "transaction_id", "state"],
        },
      })

      expect(executionsList).toHaveLength(1)

      const { result } = await workflowOrcModule.setStepSuccess({
        idempotencyKey: {
          action: TransactionHandlerType.INVOKE,
          stepId: "new_step_name",
          workflowId: "workflow_1",
          transactionId: executionsList[0].transaction_id,
        },
        stepResponse: { uhuuuu: "yeaah!" },
      })

      executionsList = await query({
        workflow_executions: {
          fields: ["id"],
        },
      })

      expect(executionsList).toHaveLength(0)
      expect(result).toEqual({
        done: {
          inputFromSyncStep: "oh",
        },
      })
    })

    it("should return a list of workflow executions and keep it saved when there is a retentionTime set", async () => {
      await workflowOrcModule.run("workflow_2", {
        input: {
          value: "123",
        },
        throwOnError: true,
        transactionId: "transaction_1",
      })

      let executionsList = await query({
        workflow_executions: {
          fields: ["id"],
        },
      })

      expect(executionsList).toHaveLength(1)

      await workflowOrcModule.setStepSuccess({
        idempotencyKey: {
          action: TransactionHandlerType.INVOKE,
          stepId: "new_step_name",
          workflowId: "workflow_2",
          transactionId: "transaction_1",
        },
        stepResponse: { uhuuuu: "yeaah!" },
      })

      executionsList = await query({
        workflow_executions: {
          fields: ["id"],
        },
      })

      expect(executionsList).toHaveLength(1)
    })

    it("should revert the entire transaction when a step timeout expires", async () => {
      const { transaction, result, errors } = await workflowOrcModule.run(
        "workflow_step_timeout",
        {
          input: {
            myInput: "123",
          },
          throwOnError: false,
        }
      )

      expect(transaction.flow.state).toEqual("reverted")
      expect(result).toEqual({
        myInput: "123",
      })
      expect(errors).toHaveLength(1)
      expect(errors[0].action).toEqual("step_1")
      expect(errors[0].error).toBeInstanceOf(TransactionStepTimeoutError)
    })

    it("should revert the entire transaction when the transaction timeout expires", async () => {
      const { transaction, result, errors } = await workflowOrcModule.run(
        "workflow_transaction_timeout",
        {
          input: {},
          transactionId: "trx",
          throwOnError: false,
        }
      )

      expect(transaction.flow.state).toEqual("reverted")
      expect(result).toEqual({ executed: true })
      expect(errors).toHaveLength(1)
      expect(errors[0].action).toEqual("step_1")
      expect(
        TransactionTimeoutError.isTransactionTimeoutError(errors[0].error)
      ).toBe(true)
    })

    it("should revert the entire transaction when a step timeout expires in a async step", async () => {
      await workflowOrcModule.run("workflow_step_timeout_async", {
        input: {
          myInput: "123",
        },
        transactionId: "transaction_1",
        throwOnError: false,
      })

      await setTimeout(200)

      const { transaction, result, errors } = await workflowOrcModule.run(
        "workflow_step_timeout_async",
        {
          input: {
            myInput: "123",
          },
          transactionId: "transaction_1",
          throwOnError: false,
        }
      )

      expect(transaction.flow.state).toEqual("reverted")
      expect(result).toEqual(undefined)
      expect(errors).toHaveLength(1)
      expect(errors[0].action).toEqual("step_1_async")
      expect(
        TransactionStepTimeoutError.isTransactionStepTimeoutError(
          errors[0].error
        )
      ).toBe(true)
    })

    it("should revert the entire transaction when the transaction timeout expires in a transaction containing an async step", async () => {
      await workflowOrcModule.run("workflow_transaction_timeout_async", {
        input: {},
        transactionId: "transaction_1",
        throwOnError: false,
      })

      await setTimeout(200)

      const { transaction, result, errors } = await workflowOrcModule.run(
        "workflow_transaction_timeout_async",
        {
          input: {},
          transactionId: "transaction_1",
          throwOnError: false,
        }
      )

      expect(transaction.flow.state).toEqual("reverted")
      expect(result).toEqual(undefined)
      expect(errors).toHaveLength(1)
      expect(errors[0].action).toEqual("step_1")
      expect(
        TransactionTimeoutError.isTransactionTimeoutError(errors[0].error)
      ).toBe(true)
    })
  })
})
