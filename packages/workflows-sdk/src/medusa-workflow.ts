import { LocalWorkflow } from "@medusajs/orchestration"
import { LoadedModule, MedusaContainer } from "@medusajs/types"
import { ExportedWorkflow } from "./helper"

export class MedusaWorkflow {
  static workflows: Record<
    string,
    (
      container?: LoadedModule[] | MedusaContainer
    ) => Omit<
      LocalWorkflow,
      "run" | "registerStepSuccess" | "registerStepFailure"
    > &
      ExportedWorkflow
  > = {}

  static registerWorkflow(workflowId, exportedWorkflow) {
    MedusaWorkflow.workflows[workflowId] = exportedWorkflow
  }

  static getWorkflow(workflowId) {
    return MedusaWorkflow.workflows[workflowId]
  }
}

global.MedusaWorkflow ??= MedusaWorkflow
exports.MedusaWorkflow = global.MedusaWorkflow
