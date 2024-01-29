import { PromotionTypes } from "@medusajs/types"
import {
  ApplicationMethodAllocation,
  ApplicationMethodTargetType,
  ComputedActions,
  MedusaError,
} from "@medusajs/utils"
import { areRulesValidForContext } from "../validations"
import { computeActionForBudgetExceeded } from "./usage"

export function getComputedActionsForShippingMethods(
  promotion: PromotionTypes.PromotionDTO,
  shippingMethodApplicationContext: PromotionTypes.ComputeActionContext[ApplicationMethodTargetType.SHIPPING_METHODS],
  methodIdPromoValueMap: Map<string, number>
): PromotionTypes.ComputeActions[] {
  const applicableShippingItems: PromotionTypes.ComputeActionContext[ApplicationMethodTargetType.SHIPPING_METHODS] =
    []

  if (!shippingMethodApplicationContext) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `"shipping_methods" should be present as an array in the context for computeActions`
    )
  }

  for (const shippingMethodContext of shippingMethodApplicationContext) {
    const isPromotionApplicableToItem = areRulesValidForContext(
      promotion.application_method?.target_rules!,
      shippingMethodContext
    )

    if (!isPromotionApplicableToItem) {
      continue
    }

    applicableShippingItems.push(shippingMethodContext)
  }

  return applyPromotionToShippingMethods(
    promotion,
    applicableShippingItems,
    methodIdPromoValueMap
  )
}

export function applyPromotionToShippingMethods(
  promotion: PromotionTypes.PromotionDTO,
  shippingMethods: PromotionTypes.ComputeActionContext[ApplicationMethodTargetType.SHIPPING_METHODS],
  methodIdPromoValueMap: Map<string, number>
): PromotionTypes.ComputeActions[] {
  const { application_method: applicationMethod } = promotion
  const allocation = applicationMethod?.allocation!
  const computedActions: PromotionTypes.ComputeActions[] = []

  if (allocation === ApplicationMethodAllocation.EACH) {
    for (const method of shippingMethods!) {
      const appliedPromoValue = methodIdPromoValueMap.get(method.id) || 0
      const promotionValue = parseFloat(applicationMethod!.value!)
      const applicableTotal = method.unit_price - appliedPromoValue
      const amount = Math.min(promotionValue, applicableTotal)

      if (amount <= 0) {
        continue
      }

      const budgetExceededAction = computeActionForBudgetExceeded(
        promotion,
        amount
      )

      if (budgetExceededAction) {
        computedActions.push(budgetExceededAction)

        continue
      }

      methodIdPromoValueMap.set(method.id, appliedPromoValue + amount)

      computedActions.push({
        action: ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT,
        shipping_method_id: method.id,
        amount,
        code: promotion.code!,
      })
    }
  }

  if (allocation === ApplicationMethodAllocation.ACROSS) {
    const totalApplicableValue = shippingMethods!.reduce((acc, method) => {
      const appliedPromoValue = methodIdPromoValueMap.get(method.id) || 0

      return acc + method.unit_price - appliedPromoValue
    }, 0)

    if (totalApplicableValue <= 0) {
      return computedActions
    }

    for (const method of shippingMethods!) {
      const promotionValue = parseFloat(applicationMethod!.value!)
      const applicableTotal = method.unit_price
      const appliedPromoValue = methodIdPromoValueMap.get(method.id) || 0

      // TODO: should we worry about precision here?
      const applicablePromotionValue =
        (applicableTotal / totalApplicableValue) * promotionValue -
        appliedPromoValue

      const amount = Math.min(applicablePromotionValue, applicableTotal)

      if (amount <= 0) {
        continue
      }

      const budgetExceededAction = computeActionForBudgetExceeded(
        promotion,
        amount
      )

      if (budgetExceededAction) {
        computedActions.push(budgetExceededAction)

        continue
      }

      methodIdPromoValueMap.set(method.id, appliedPromoValue + amount)

      computedActions.push({
        action: ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT,
        shipping_method_id: method.id,
        amount,
        code: promotion.code!,
      })
    }
  }

  return computedActions
}
