/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { SetRelation, Merge } from "../core/ModelUtils"

/**
 * The details of the refund to create.
 */
export interface AdminPostPaymentRefundsReq {
  /**
   * The amount to refund.
   */
  amount: number
  /**
   * The reason for the Refund.
   */
  reason: string
  /**
   * A note with additional details about the Refund.
   */
  note?: string
}
