import { Modules } from "@medusajs/modules-sdk"
import { composeLinkName } from "./utils"

export const LINKS = {
  ProductVariantInventoryItem: composeLinkName(
    Modules.PRODUCT,
    "variant_id",
    Modules.INVENTORY,
    "inventory_item_id"
  ),
  ProductVariantPriceSet: composeLinkName(
    Modules.PRODUCT,
    "variant_id",
    Modules.PRICING,
    "price_set_id"
  ),

  // Internal services
  ProductShippingProfile: composeLinkName(
    Modules.PRODUCT,
    "variant_id",
    "shippingProfileService",
    "profile_id"
  ),
  ProductSalesChannel: composeLinkName(
    Modules.PRODUCT,
    "product_id",
    "salesChannelService",
    "sales_channel_id"
  ),
  CartSalesChannel: composeLinkName(
    "cartService",
    "cart_id",
    "salesChannelService",
    "sales_channel_id"
  ),
  OrderSalesChannel: composeLinkName(
    "orderService",
    "order_id",
    "salesChannelService",
    "sales_channel_id"
  ),
  PublishableApiKeySalesChannel: composeLinkName(
    "publishableApiKeyService",
    "publishable_key_id",
    "salesChannelService",
    "sales_channel_id"
  ),
}
