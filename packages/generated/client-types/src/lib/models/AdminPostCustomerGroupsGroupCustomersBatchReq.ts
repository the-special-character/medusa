/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { SetRelation, Merge } from "../core/ModelUtils"

/**
 * The customers to add to the customer group.
 */
export interface AdminPostCustomerGroupsGroupCustomersBatchReq {
  /**
   * The ids of the customers to add
   */
  customer_ids: Array<{
    /**
     * ID of the customer
     */
    id: string
  }>
}
