import { IPromotionModuleService } from "@medusajs/types"
import { PromotionType } from "@medusajs/utils"
import { SqlEntityManager } from "@mikro-orm/postgresql"
import { createCampaigns } from "../../../__fixtures__/campaigns"
import { MikroOrmWrapper } from "../../../utils"
import { getInitModuleConfig } from "../../../utils/get-init-module-config"
import { Modules } from "@medusajs/modules-sdk"
import { initModules } from "medusa-test-utils"

jest.setTimeout(30000)

describe("Promotion Service: computeActions", () => {
  let service: IPromotionModuleService
  let repositoryManager: SqlEntityManager
  let shutdownFunc: () => void

  beforeAll(async () => {
    const initModulesConfig = getInitModuleConfig()

    const { medusaApp, shutdown } = await initModules(initModulesConfig)

    service = medusaApp.modules[Modules.PROMOTION]

    shutdownFunc = shutdown
  })

  afterAll(async () => {
    shutdownFunc()
  })

  beforeEach(async () => {
    await MikroOrmWrapper.setupDatabase()
    repositoryManager = MikroOrmWrapper.forkManager()
  })

  afterEach(async () => {
    await MikroOrmWrapper.clearDatabase()
  })

  describe("when code is not present in database", () => {
    it("should throw error when code in promotions array does not exist", async () => {
      const error = await service
        .computeActions(["DOES_NOT_EXIST"], {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 100,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_tshirt",
              },
            },
            {
              id: "item_cotton_sweater",
              quantity: 5,
              unit_price: 150,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_sweater",
              },
            },
          ],
        })
        .catch((e) => e)

      expect(error.message).toContain(
        "Promotion for code (DOES_NOT_EXIST) not found"
      )
    })

    it("should throw error when code in items adjustment does not exist", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "200",
            max_quantity: 1,
          },
        },
      ])

      const error = await service
        .computeActions(["PROMOTION_TEST"], {
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 100,
              adjustments: [
                {
                  id: "test-adjustment",
                  code: "DOES_NOT_EXIST",
                },
              ],
            },
            {
              id: "item_cotton_sweater",
              quantity: 5,
              unit_price: 150,
            },
          ],
        })
        .catch((e) => e)

      expect(error.message).toContain(
        "Applied Promotion for code (DOES_NOT_EXIST) not found"
      )
    })

    it("should throw error when code in shipping adjustment does not exist", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "200",
            max_quantity: 1,
          },
        },
      ])

      const error = await service
        .computeActions(["PROMOTION_TEST"], {
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 100,
            },
            {
              id: "item_cotton_sweater",
              quantity: 5,
              unit_price: 150,
              adjustments: [
                {
                  id: "test-adjustment",
                  code: "DOES_NOT_EXIST",
                },
              ],
            },
          ],
        })
        .catch((e) => e)

      expect(error.message).toContain(
        "Applied Promotion for code (DOES_NOT_EXIST) not found"
      )
    })
  })

  describe("when promotion is for items and allocation is each", () => {
    it("should compute the correct item amendments", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "200",
            max_quantity: 1,
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        items: [
          {
            id: "item_cotton_tshirt",
            quantity: 1,
            unit_price: 100,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_tshirt",
            },
          },
          {
            id: "item_cotton_sweater",
            quantity: 5,
            unit_price: 150,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_sweater",
            },
          },
        ],
      })

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 100,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 150,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute the correct item amendments when there are multiple promotions to apply", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "30",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const [createdPromotionTwo] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "50",
            max_quantity: 1,
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 50,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_tshirt",
              },
            },
            {
              id: "item_cotton_sweater",
              quantity: 1,
              unit_price: 150,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_sweater",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 30,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 30,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 20,
          code: "PROMOTION_TEST_2",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 50,
          code: "PROMOTION_TEST_2",
        },
      ])
    })

    it("should not compute actions when applicable total is 0", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "500",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const [createdPromotionTwo] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "50",
            max_quantity: 1,
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 50,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_tshirt",
              },
            },
            {
              id: "item_cotton_sweater",
              quantity: 1,
              unit_price: 150,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_sweater",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 50,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 150,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute budget exceeded action when applicable total exceeds campaign budget for type spend", async () => {
      await createCampaigns(repositoryManager)

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          campaign_id: "campaign-id-1",
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "500",
            max_quantity: 5,
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        items: [
          {
            id: "item_cotton_tshirt",
            quantity: 5,
            unit_price: 1000,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_tshirt",
            },
          },
        ],
      })

      expect(result).toEqual([
        { action: "campaignBudgetExceeded", code: "PROMOTION_TEST" },
      ])
    })

    it("should compute budget exceeded action when applicable total exceeds campaign budget for type usage", async () => {
      await createCampaigns(repositoryManager)

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          campaign_id: "campaign-id-2",
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "500",
            max_quantity: 5,
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      await service.updateCampaigns({
        id: "campaign-id-2",
        budget: { used: 1000 },
      })

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        items: [
          {
            id: "item_cotton_tshirt",
            quantity: 5,
            unit_price: 1000,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_tshirt",
            },
          },
        ],
      })

      expect(result).toEqual([
        { action: "campaignBudgetExceeded", code: "PROMOTION_TEST" },
      ])
    })
  })

  describe("when promotion is for items and allocation is across", () => {
    it("should compute the correct item amendments", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "across",
            value: "400",
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        items: [
          {
            id: "item_cotton_tshirt",
            quantity: 2,
            unit_price: 100,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_tshirt",
            },
          },
          {
            id: "item_cotton_sweater",
            quantity: 2,
            unit_price: 300,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_sweater",
            },
          },
        ],
      })

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 100,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 300,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute the correct item amendments when there are multiple promotions to apply", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "across",
            value: "30",
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const [createdPromotionTwo] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "across",
            value: "50",
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 50,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_tshirt",
              },
            },
            {
              id: "item_cotton_sweater",
              quantity: 1,
              unit_price: 150,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_sweater",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 7.5,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 22.5,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 12.5,
          code: "PROMOTION_TEST_2",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 37.5,
          code: "PROMOTION_TEST_2",
        },
      ])
    })

    it("should not compute actions when applicable total is 0", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "across",
            value: "500",
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const [createdPromotionTwo] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "across",
            value: "50",
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 50,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_tshirt",
              },
            },
            {
              id: "item_cotton_sweater",
              quantity: 1,
              unit_price: 150,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_sweater",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 50,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 150,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 12.5,
          code: "PROMOTION_TEST_2",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 37.5,
          code: "PROMOTION_TEST_2",
        },
      ])
    })

    it("should compute budget exceeded action when applicable total exceeds campaign budget for type spend", async () => {
      await createCampaigns(repositoryManager)

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          campaign_id: "campaign-id-1",
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "across",
            value: "1500",
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        items: [
          {
            id: "item_cotton_tshirt",
            quantity: 5,
            unit_price: 1000,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_tshirt",
            },
          },
        ],
      })

      expect(result).toEqual([
        { action: "campaignBudgetExceeded", code: "PROMOTION_TEST" },
      ])
    })

    it("should compute budget exceeded action when applicable total exceeds campaign budget for type usage", async () => {
      await createCampaigns(repositoryManager)

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          campaign_id: "campaign-id-2",
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "across",
            value: "500",
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      await service.updateCampaigns({
        id: "campaign-id-2",
        budget: { used: 1000 },
      })

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        items: [
          {
            id: "item_cotton_tshirt",
            quantity: 5,
            unit_price: 1000,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_tshirt",
            },
          },
        ],
      })

      expect(result).toEqual([
        { action: "campaignBudgetExceeded", code: "PROMOTION_TEST" },
      ])
    })
  })

  describe("when promotion is for shipping_method and allocation is each", () => {
    it("should compute the correct shipping_method amendments", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "each",
            value: "200",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        shipping_methods: [
          {
            id: "shipping_method_express",
            unit_price: 250,
            shipping_option: {
              id: "express",
            },
          },
          {
            id: "shipping_method_standard",
            unit_price: 150,
            shipping_option: {
              id: "standard",
            },
          },
          {
            id: "shipping_method_snail",
            unit_price: 200,
            shipping_option: {
              id: "snail",
            },
          },
        ],
      })

      expect(result).toEqual([
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 200,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_standard",
          amount: 150,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute the correct item amendments when there are multiple promotions to apply", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "each",
            value: "200",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const [createdPromotionTwo] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "each",
            value: "200",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          shipping_methods: [
            {
              id: "shipping_method_express",
              unit_price: 250,
              shipping_option: {
                id: "express",
              },
            },
            {
              id: "shipping_method_standard",
              unit_price: 150,
              shipping_option: {
                id: "standard",
              },
            },
            {
              id: "shipping_method_snail",
              unit_price: 200,
              shipping_option: {
                id: "snail",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 200,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_standard",
          amount: 150,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 50,
          code: "PROMOTION_TEST_2",
        },
      ])
    })

    it("should not compute actions when applicable total is 0", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "each",
            value: "500",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const [createdPromotionTwo] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "each",
            value: "200",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          shipping_methods: [
            {
              id: "shipping_method_express",
              unit_price: 250,
              shipping_option: {
                id: "express",
              },
            },
            {
              id: "shipping_method_standard",
              unit_price: 150,
              shipping_option: {
                id: "standard",
              },
            },
            {
              id: "shipping_method_snail",
              unit_price: 200,
              shipping_option: {
                id: "snail",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 250,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_standard",
          amount: 150,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute budget exceeded action when applicable total exceeds campaign budget for type spend", async () => {
      await createCampaigns(repositoryManager)

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          campaign_id: "campaign-id-1",
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "each",
            value: "1200",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        shipping_methods: [
          {
            id: "shipping_method_express",
            unit_price: 1200,
            shipping_option: {
              id: "express",
            },
          },
        ],
      })

      expect(result).toEqual([
        { action: "campaignBudgetExceeded", code: "PROMOTION_TEST" },
      ])
    })

    it("should compute budget exceeded action when applicable total exceeds campaign budget for type usage", async () => {
      await createCampaigns(repositoryManager)

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          campaign_id: "campaign-id-2",
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "each",
            value: "1200",
            max_quantity: 2,
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      await service.updateCampaigns({
        id: "campaign-id-2",
        budget: { used: 1000 },
      })

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        shipping_methods: [
          {
            id: "shipping_method_express",
            unit_price: 1200,
            shipping_option: {
              id: "express",
            },
          },
        ],
      })

      expect(result).toEqual([
        { action: "campaignBudgetExceeded", code: "PROMOTION_TEST" },
      ])
    })
  })

  describe("when promotion is for shipping_method and allocation is across", () => {
    it("should compute the correct shipping_method amendments", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "across",
            value: "200",
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        shipping_methods: [
          {
            id: "shipping_method_express",
            unit_price: 500,
            shipping_option: {
              id: "express",
            },
          },
          {
            id: "shipping_method_standard",
            unit_price: 100,
            shipping_option: {
              id: "standard",
            },
          },
          {
            id: "shipping_method_snail",
            unit_price: 200,
            shipping_option: {
              id: "snail",
            },
          },
        ],
      })

      expect(result).toEqual([
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 166.66666666666669,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_standard",
          amount: 33.33333333333333,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute the correct item amendments when there are multiple promotions to apply", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "across",
            value: "200",
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const [createdPromotion2] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "across",
            value: "200",
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          shipping_methods: [
            {
              id: "shipping_method_express",
              unit_price: 500,
              shipping_option: {
                id: "express",
              },
            },
            {
              id: "shipping_method_standard",
              unit_price: 100,
              shipping_option: {
                id: "standard",
              },
            },
            {
              id: "shipping_method_snail",
              unit_price: 200,
              shipping_option: {
                id: "snail",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 166.66666666666669,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_standard",
          amount: 33.33333333333333,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 83.33333333333331,
          code: "PROMOTION_TEST_2",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_standard",
          amount: 16.66666666666667,
          code: "PROMOTION_TEST_2",
        },
      ])
    })

    it("should not compute actions when applicable total is 0", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "across",
            value: "1000",
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const [createdPromotion2] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "across",
            value: "200",
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          shipping_methods: [
            {
              id: "shipping_method_express",
              unit_price: 500,
              shipping_option: {
                id: "express",
              },
            },
            {
              id: "shipping_method_standard",
              unit_price: 100,
              shipping_option: {
                id: "standard",
              },
            },
            {
              id: "shipping_method_snail",
              unit_price: 200,
              shipping_option: {
                id: "snail",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 500,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_standard",
          amount: 100,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute budget exceeded action when applicable total exceeds campaign budget for type spend", async () => {
      await createCampaigns(repositoryManager)

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          campaign_id: "campaign-id-1",
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "across",
            value: "1200",
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        shipping_methods: [
          {
            id: "shipping_method_express",
            unit_price: 1200,
            shipping_option: {
              id: "express",
            },
          },
        ],
      })

      expect(result).toEqual([
        { action: "campaignBudgetExceeded", code: "PROMOTION_TEST" },
      ])
    })

    it("should compute budget exceeded action when applicable total exceeds campaign budget for type usage", async () => {
      await createCampaigns(repositoryManager)

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          campaign_id: "campaign-id-2",
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "across",
            value: "1200",
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      await service.updateCampaigns({
        id: "campaign-id-2",
        budget: { used: 1000 },
      })

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        shipping_methods: [
          {
            id: "shipping_method_express",
            unit_price: 1200,
            shipping_option: {
              id: "express",
            },
          },
        ],
      })

      expect(result).toEqual([
        { action: "campaignBudgetExceeded", code: "PROMOTION_TEST" },
      ])
    })
  })

  describe("when promotion is for the entire order", () => {
    it("should compute the correct item amendments", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "order",
            value: "200",
            max_quantity: 2,
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        items: [
          {
            id: "item_cotton_tshirt",
            quantity: 1,
            unit_price: 100,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_tshirt",
            },
          },
          {
            id: "item_cotton_sweater",
            quantity: 2,
            unit_price: 150,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_sweater",
            },
          },
        ],
      })

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 50,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 150,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute the correct item amendments when there are multiple promotions to apply", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "order",
            value: "30",
            max_quantity: 2,
          },
        },
      ])

      const [createdPromotionTwo] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "order",
            value: "50",
            max_quantity: 1,
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 50,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_tshirt",
              },
            },
            {
              id: "item_cotton_sweater",
              quantity: 1,
              unit_price: 150,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_sweater",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 7.5,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 22.5,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 12.5,
          code: "PROMOTION_TEST_2",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 37.5,
          code: "PROMOTION_TEST_2",
        },
      ])
    })

    it("should not compute actions when applicable total is 0", async () => {
      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "order",
            value: "500",
            max_quantity: 2,
          },
        },
      ])

      const [createdPromotionTwo] = await service.create([
        {
          code: "PROMOTION_TEST_2",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "order",
            value: "50",
            max_quantity: 1,
          },
        },
      ])

      const result = await service.computeActions(
        ["PROMOTION_TEST", "PROMOTION_TEST_2"],
        {
          customer: {
            customer_group: {
              id: "VIP",
            },
          },
          items: [
            {
              id: "item_cotton_tshirt",
              quantity: 1,
              unit_price: 50,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_tshirt",
              },
            },
            {
              id: "item_cotton_sweater",
              quantity: 1,
              unit_price: 150,
              product_category: {
                id: "catg_cotton",
              },
              product: {
                id: "prod_sweater",
              },
            },
          ],
        }
      )

      expect(result).toEqual([
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 50,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 150,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 12.5,
          code: "PROMOTION_TEST_2",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 37.5,
          code: "PROMOTION_TEST_2",
        },
      ])
    })
  })

  describe("when adjustments are present in the context", () => {
    it("should compute the correct item amendments along with removal of applied item adjustment", async () => {
      const [adjustmentPromotion] = await service.create([
        {
          code: "ADJUSTMENT_CODE",
          type: PromotionType.STANDARD,
        },
      ])

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "items",
            allocation: "each",
            value: "200",
            max_quantity: 1,
            target_rules: [
              {
                attribute: "product_category.id",
                operator: "eq",
                values: ["catg_cotton"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        items: [
          {
            id: "item_cotton_tshirt",
            quantity: 1,
            unit_price: 100,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_tshirt",
            },
            adjustments: [
              {
                id: "test-adjustment",
                code: "ADJUSTMENT_CODE",
              },
            ],
          },
          {
            id: "item_cotton_sweater",
            quantity: 5,
            unit_price: 150,
            product_category: {
              id: "catg_cotton",
            },
            product: {
              id: "prod_sweater",
            },
          },
        ],
      })

      expect(result).toEqual([
        {
          action: "removeItemAdjustment",
          adjustment_id: "test-adjustment",
          code: "ADJUSTMENT_CODE",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_tshirt",
          amount: 100,
          code: "PROMOTION_TEST",
        },
        {
          action: "addItemAdjustment",
          item_id: "item_cotton_sweater",
          amount: 150,
          code: "PROMOTION_TEST",
        },
      ])
    })

    it("should compute the correct item amendments along with removal of applied shipping adjustment", async () => {
      const [adjustmentPromotion] = await service.create([
        {
          code: "ADJUSTMENT_CODE",
          type: PromotionType.STANDARD,
        },
      ])

      const [createdPromotion] = await service.create([
        {
          code: "PROMOTION_TEST",
          type: PromotionType.STANDARD,
          rules: [
            {
              attribute: "customer.customer_group.id",
              operator: "in",
              values: ["VIP", "top100"],
            },
          ],
          application_method: {
            type: "fixed",
            target_type: "shipping_methods",
            allocation: "across",
            value: "200",
            target_rules: [
              {
                attribute: "shipping_option.id",
                operator: "in",
                values: ["express", "standard"],
              },
            ],
          },
        },
      ])

      const result = await service.computeActions(["PROMOTION_TEST"], {
        customer: {
          customer_group: {
            id: "VIP",
          },
        },
        shipping_methods: [
          {
            id: "shipping_method_express",
            unit_price: 500,
            shipping_option: {
              id: "express",
            },
            adjustments: [
              {
                id: "test-adjustment",
                code: "ADJUSTMENT_CODE",
              },
            ],
          },
          {
            id: "shipping_method_standard",
            unit_price: 100,
            shipping_option: {
              id: "standard",
            },
          },
          {
            id: "shipping_method_snail",
            unit_price: 200,
            shipping_option: {
              id: "snail",
            },
          },
        ],
      })

      expect(result).toEqual([
        {
          action: "removeShippingMethodAdjustment",
          adjustment_id: "test-adjustment",
          code: "ADJUSTMENT_CODE",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_express",
          amount: 166.66666666666669,
          code: "PROMOTION_TEST",
        },
        {
          action: "addShippingMethodAdjustment",
          shipping_method_id: "shipping_method_standard",
          amount: 33.33333333333333,
          code: "PROMOTION_TEST",
        },
      ])
    })
  })
})
