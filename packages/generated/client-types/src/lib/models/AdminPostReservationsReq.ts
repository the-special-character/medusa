/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { SetRelation, Merge } from "../core/ModelUtils"

/**
 * The details of the reservation to create.
 */
export interface AdminPostReservationsReq {
  /**
   * The ID of the line item of the reservation.
   */
  line_item_id?: string
  /**
   * The ID of the location of the reservation.
   */
  location_id: string
  /**
   * The ID of the inventory item the reservation is associated with.
   */
  inventory_item_id: string
  /**
   * The quantity to reserve.
   */
  quantity: number
  /**
   * The reservation's description.
   */
  description?: string
  /**
   * An optional set of key-value pairs with additional information.
   */
  metadata?: Record<string, any>
}
