import { Modules } from "@medusajs/modules-sdk"
import { ModuleJoinerConfig } from "@medusajs/types"
import { LINKS } from "../links"

export const ProductSalesChannel: ModuleJoinerConfig = {
  serviceName: LINKS.ProductSalesChannel,
  isLink: true,
  databaseConfig: {
    tableName: "product_sales_channel",
    idPrefix: "prodsc",
  },
  alias: [
    {
      name: "product_sales_channel",
    },
    {
      name: "product_sales_channels",
    },
  ],
  primaryKeys: ["id", "product_id", "sales_channel_id"],
  relationships: [
    {
      serviceName: Modules.PRODUCT,
      primaryKey: "id",
      foreignKey: "product_id",
      alias: "product",
    },
    {
      serviceName: "salesChannelService",
      isInternalService: true,
      primaryKey: "id",
      foreignKey: "sales_channel_id",
      alias: "sales_channel",
    },
  ],
  extends: [
    {
      serviceName: Modules.PRODUCT,
      fieldAlias: {
        sales_channels: "sales_channels_link.sales_channel",
      },
      relationship: {
        serviceName: LINKS.ProductSalesChannel,
        primaryKey: "product_id",
        foreignKey: "id",
        alias: "sales_channels_link",
        isList: true,
      },
    },
    {
      serviceName: "salesChannelService",
      relationship: {
        serviceName: LINKS.ProductSalesChannel,
        isInternalService: true,
        primaryKey: "sales_channel_id",
        foreignKey: "id",
        alias: "products_link",
        isList: true,
      },
    },
  ],
}
