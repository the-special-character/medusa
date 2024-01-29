import { FindConfig } from "../common"
import { IModuleService } from "../modules-sdk"
import { Context } from "../shared-context"
import {
  CartAddressDTO,
  CartDTO,
  CartLineItemDTO,
  CartShippingMethodDTO,
  FilterableAddressProps,
  FilterableCartProps,
  FilterableLineItemAdjustmentProps,
  FilterableLineItemProps,
  FilterableLineItemTaxLineProps,
  FilterableShippingMethodAdjustmentProps,
  FilterableShippingMethodProps,
  FilterableShippingMethodTaxLineProps,
  LineItemAdjustmentDTO,
  LineItemTaxLineDTO,
  ShippingMethodAdjustmentDTO,
  ShippingMethodTaxLineDTO,
} from "./common"
import {
  CreateAddressDTO,
  CreateAdjustmentDTO,
  CreateCartDTO,
  CreateLineItemDTO,
  CreateLineItemForCartDTO,
  CreateLineItemTaxLineDTO,
  CreateShippingMethodAdjustmentDTO,
  CreateShippingMethodDTO,
  CreateShippingMethodForSingleCartDTO,
  CreateShippingMethodTaxLineDTO,
  UpdateAddressDTO,
  UpdateCartDTO,
  UpdateLineItemDTO,
  UpdateLineItemTaxLineDTO,
  UpdateLineItemWithSelectorDTO,
  UpdateShippingMethodAdjustmentDTO,
  UpdateShippingMethodTaxLineDTO,
  UpsertLineItemAdjustmentDTO,
} from "./mutations"

export interface ICartModuleService extends IModuleService {
  retrieve(
    cartId: string,
    config?: FindConfig<CartDTO>,
    sharedContext?: Context
  ): Promise<CartDTO>

  list(
    filters?: FilterableCartProps,
    config?: FindConfig<CartDTO>,
    sharedContext?: Context
  ): Promise<CartDTO[]>

  listAndCount(
    filters?: FilterableCartProps,
    config?: FindConfig<CartDTO>,
    sharedContext?: Context
  ): Promise<[CartDTO[], number]>

  create(data: CreateCartDTO[], sharedContext?: Context): Promise<CartDTO[]>
  create(data: CreateCartDTO, sharedContext?: Context): Promise<CartDTO>

  update(data: UpdateCartDTO[], sharedContext?: Context): Promise<CartDTO[]>
  update(data: UpdateCartDTO, sharedContext?: Context): Promise<CartDTO>

  delete(cartIds: string[], sharedContext?: Context): Promise<void>
  delete(cartId: string, sharedContext?: Context): Promise<void>

  listAddresses(
    filters?: FilterableAddressProps,
    config?: FindConfig<CartAddressDTO>,
    sharedContext?: Context
  ): Promise<CartAddressDTO[]>

  createAddresses(
    data: CreateAddressDTO[],
    sharedContext?: Context
  ): Promise<CartAddressDTO[]>
  createAddresses(
    data: CreateAddressDTO,
    sharedContext?: Context
  ): Promise<CartAddressDTO>

  updateAddresses(
    data: UpdateAddressDTO[],
    sharedContext?: Context
  ): Promise<CartAddressDTO[]>
  updateAddresses(
    data: UpdateAddressDTO,
    sharedContext?: Context
  ): Promise<CartAddressDTO>

  deleteAddresses(ids: string[], sharedContext?: Context): Promise<void>
  deleteAddresses(ids: string, sharedContext?: Context): Promise<void>

  retrieveLineItem(
    itemId: string,
    config?: FindConfig<CartLineItemDTO>,
    sharedContext?: Context
  ): Promise<CartLineItemDTO>

  listLineItems(
    filters: FilterableLineItemProps,
    config?: FindConfig<CartLineItemDTO>,
    sharedContext?: Context
  ): Promise<CartLineItemDTO[]>

  addLineItems(data: CreateLineItemForCartDTO): Promise<CartLineItemDTO[]>
  addLineItems(data: CreateLineItemForCartDTO[]): Promise<CartLineItemDTO[]>
  addLineItems(
    cartId: string,
    items: CreateLineItemDTO[],
    sharedContext?: Context
  ): Promise<CartLineItemDTO[]>

  updateLineItems(
    data: UpdateLineItemWithSelectorDTO[]
  ): Promise<CartLineItemDTO[]>
  updateLineItems(
    selector: Partial<CartLineItemDTO>,
    data: Partial<UpdateLineItemDTO>,
    sharedContext?: Context
  ): Promise<CartLineItemDTO[]>
  updateLineItems(
    lineId: string,
    data: Partial<UpdateLineItemDTO>,
    sharedContext?: Context
  ): Promise<CartLineItemDTO>

  removeLineItems(itemIds: string[], sharedContext?: Context): Promise<void>
  removeLineItems(itemIds: string, sharedContext?: Context): Promise<void>
  removeLineItems(
    selector: Partial<CartLineItemDTO>,
    sharedContext?: Context
  ): Promise<void>

  listShippingMethods(
    filters: FilterableShippingMethodProps,
    config: FindConfig<CartShippingMethodDTO>,
    sharedContext?: Context
  ): Promise<CartShippingMethodDTO[]>

  addShippingMethods(
    data: CreateShippingMethodDTO
  ): Promise<CartShippingMethodDTO>
  addShippingMethods(
    data: CreateShippingMethodDTO[]
  ): Promise<CartShippingMethodDTO[]>
  addShippingMethods(
    cartId: string,
    methods: CreateShippingMethodForSingleCartDTO[],
    sharedContext?: Context
  ): Promise<CartShippingMethodDTO[]>

  removeShippingMethods(
    methodIds: string[],
    sharedContext?: Context
  ): Promise<void>
  removeShippingMethods(
    methodIds: string,
    sharedContext?: Context
  ): Promise<void>
  removeShippingMethods(
    selector: Partial<CartShippingMethodDTO>,
    sharedContext?: Context
  ): Promise<void>

  listLineItemAdjustments(
    filters: FilterableLineItemAdjustmentProps,
    config?: FindConfig<LineItemAdjustmentDTO>,
    sharedContext?: Context
  ): Promise<LineItemAdjustmentDTO[]>

  addLineItemAdjustments(
    data: CreateAdjustmentDTO[]
  ): Promise<LineItemAdjustmentDTO[]>
  addLineItemAdjustments(
    data: CreateAdjustmentDTO
  ): Promise<LineItemAdjustmentDTO[]>
  addLineItemAdjustments(
    cartId: string,
    data: CreateAdjustmentDTO[]
  ): Promise<LineItemAdjustmentDTO[]>

  setLineItemAdjustments(
    cartId: string,
    data: UpsertLineItemAdjustmentDTO[],
    sharedContext?: Context
  ): Promise<LineItemAdjustmentDTO[]>

  removeLineItemAdjustments(
    adjustmentIds: string[],
    sharedContext?: Context
  ): Promise<void>
  removeLineItemAdjustments(
    adjustmentIds: string,
    sharedContext?: Context
  ): Promise<void>
  removeLineItemAdjustments(
    selector: Partial<LineItemAdjustmentDTO>,
    sharedContext?: Context
  ): Promise<void>

  listShippingMethodAdjustments(
    filters: FilterableShippingMethodAdjustmentProps,
    config?: FindConfig<ShippingMethodAdjustmentDTO>,
    sharedContext?: Context
  ): Promise<ShippingMethodAdjustmentDTO[]>

  addShippingMethodAdjustments(
    data: CreateShippingMethodAdjustmentDTO[]
  ): Promise<ShippingMethodAdjustmentDTO[]>
  addShippingMethodAdjustments(
    data: CreateShippingMethodAdjustmentDTO
  ): Promise<ShippingMethodAdjustmentDTO>
  addShippingMethodAdjustments(
    cartId: string,
    data: CreateShippingMethodAdjustmentDTO[],
    sharedContext?: Context
  ): Promise<ShippingMethodAdjustmentDTO[]>

  setShippingMethodAdjustments(
    cartId: string,
    data: (
      | CreateShippingMethodAdjustmentDTO
      | UpdateShippingMethodAdjustmentDTO
    )[],
    sharedContext?: Context
  ): Promise<ShippingMethodAdjustmentDTO[]>

  removeShippingMethodAdjustments(
    adjustmentIds: string[],
    sharedContext?: Context
  ): Promise<void>
  removeShippingMethodAdjustments(
    adjustmentId: string,
    sharedContext?: Context
  ): Promise<void>
  removeShippingMethodAdjustments(
    selector: Partial<ShippingMethodAdjustmentDTO>,
    sharedContext?: Context
  ): Promise<void>

  listLineItemTaxLines(
    filters: FilterableLineItemTaxLineProps,
    config?: FindConfig<LineItemTaxLineDTO>,
    sharedContext?: Context
  ): Promise<LineItemTaxLineDTO[]>

  addLineItemTaxLines(
    taxLines: CreateLineItemTaxLineDTO[]
  ): Promise<LineItemTaxLineDTO[]>
  addLineItemTaxLines(
    taxLine: CreateLineItemTaxLineDTO
  ): Promise<LineItemTaxLineDTO>
  addLineItemTaxLines(
    cartId: string,
    taxLines: CreateLineItemTaxLineDTO[] | CreateLineItemTaxLineDTO,
    sharedContext?: Context
  ): Promise<LineItemTaxLineDTO[]>

  setLineItemTaxLines(
    cartId: string,
    taxLines: (CreateLineItemTaxLineDTO | UpdateLineItemTaxLineDTO)[],
    sharedContext?: Context
  ): Promise<LineItemTaxLineDTO[]>

  removeLineItemTaxLines(
    taxLineIds: string[],
    sharedContext?: Context
  ): Promise<void>
  removeLineItemTaxLines(
    taxLineIds: string,
    sharedContext?: Context
  ): Promise<void>
  removeLineItemTaxLines(
    selector: FilterableLineItemTaxLineProps,
    sharedContext?: Context
  ): Promise<void>

  listShippingMethodTaxLines(
    filters: FilterableShippingMethodTaxLineProps,
    config?: FindConfig<ShippingMethodTaxLineDTO>,
    sharedContext?: Context
  ): Promise<ShippingMethodTaxLineDTO[]>

  addShippingMethodTaxLines(
    taxLines: CreateShippingMethodTaxLineDTO[]
  ): Promise<ShippingMethodTaxLineDTO[]>
  addShippingMethodTaxLines(
    taxLine: CreateShippingMethodTaxLineDTO
  ): Promise<ShippingMethodTaxLineDTO>
  addShippingMethodTaxLines(
    cartId: string,
    taxLines: CreateShippingMethodTaxLineDTO[] | CreateShippingMethodTaxLineDTO,
    sharedContext?: Context
  ): Promise<ShippingMethodTaxLineDTO[]>

  setShippingMethodTaxLines(
    cartId: string,
    taxLines: (
      | CreateShippingMethodTaxLineDTO
      | UpdateShippingMethodTaxLineDTO
    )[],
    sharedContext?: Context
  ): Promise<ShippingMethodTaxLineDTO[]>

  removeShippingMethodTaxLines(
    taxLineIds: string[],
    sharedContext?: Context
  ): Promise<void>
  removeShippingMethodTaxLines(
    taxLineIds: string,
    sharedContext?: Context
  ): Promise<void>
  removeShippingMethodTaxLines(
    selector: FilterableShippingMethodTaxLineProps,
    sharedContext?: Context
  ): Promise<void>
}
