import { ModuleRegistrationName } from "@medusajs/modules-sdk"
import { IPromotionModuleService } from "@medusajs/types"
import { PromotionType } from "@medusajs/utils"
import path from "path"
import { startBootstrapApp } from "../../../../environment-helpers/bootstrap-app"
import { useApi } from "../../../../environment-helpers/use-api"
import { getContainer } from "../../../../environment-helpers/use-container"
import { initDb, useDb } from "../../../../environment-helpers/use-db"
import adminSeeder from "../../../../helpers/admin-seeder"

jest.setTimeout(50000)

const env = { MEDUSA_FF_MEDUSA_V2: true }
const adminHeaders = {
  headers: { "x-medusa-access-token": "test_token" },
}

describe("POST /admin/promotions/:id", () => {
  let dbConnection
  let appContainer
  let shutdownServer
  let promotionModuleService: IPromotionModuleService

  beforeAll(async () => {
    const cwd = path.resolve(path.join(__dirname, "..", "..", ".."))
    dbConnection = await initDb({ cwd, env } as any)
    shutdownServer = await startBootstrapApp({ cwd, env })
    appContainer = getContainer()
    promotionModuleService = appContainer.resolve(
      ModuleRegistrationName.PROMOTION
    )
  })

  afterAll(async () => {
    const db = useDb()
    await db.shutdown()
    await shutdownServer()
  })

  beforeEach(async () => {
    await adminSeeder(dbConnection)
  })

  afterEach(async () => {
    const db = useDb()
    await db.teardown()
  })

  it("should throw an error if id does not exist", async () => {
    const api = useApi() as any
    const { response } = await api
      .post(
        `/admin/promotions/does-not-exist`,
        { type: PromotionType.STANDARD },
        adminHeaders
      )
      .catch((e) => e)

    expect(response.status).toEqual(404)
    expect(response.data.message).toEqual(
      `Promotion with id "does-not-exist" not found`
    )
  })

  it("should throw an error when both campaign and campaign_id params are passed", async () => {
    const createdPromotion = await promotionModuleService.create({
      code: "TEST",
      type: PromotionType.STANDARD,
      is_automatic: true,
      application_method: {
        target_type: "items",
        type: "fixed",
        allocation: "each",
        value: "100",
        max_quantity: 100,
      },
    })

    const api = useApi() as any

    const { response } = await api
      .post(
        `/admin/promotions/${createdPromotion.id}`,
        {
          campaign: {
            name: "test campaign",
          },
          campaign_id: "test",
        },
        adminHeaders
      )
      .catch((e) => e)

    expect(response.status).toEqual(400)
    expect(response.data.message).toContain(
      `Failed XOR relation between "campaign_id" and "campaign"`
    )
  })

  it("should update a promotion successfully", async () => {
    const createdPromotion = await promotionModuleService.create({
      code: "TEST",
      type: PromotionType.STANDARD,
      is_automatic: true,
      application_method: {
        target_type: "items",
        type: "fixed",
        allocation: "each",
        value: "100",
        max_quantity: 100,
      },
    })

    const api = useApi() as any
    const response = await api.post(
      `/admin/promotions/${createdPromotion.id}`,
      {
        code: "TEST_TWO",
        application_method: {
          value: "200",
        },
      },
      adminHeaders
    )

    expect(response.status).toEqual(200)
    expect(response.data.promotion).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        code: "TEST_TWO",
        application_method: expect.objectContaining({
          value: 200,
        }),
      })
    )
  })

  it("should update a buyget promotion successfully", async () => {
    const createdPromotion = await promotionModuleService.create({
      code: "PROMOTION_TEST",
      type: PromotionType.BUYGET,
      application_method: {
        type: "fixed",
        target_type: "items",
        allocation: "across",
        value: "100",
        apply_to_quantity: 1,
        buy_rules_min_quantity: 1,
        buy_rules: [
          {
            attribute: "product_collection.id",
            operator: "eq",
            values: ["pcol_towel"],
          },
        ],
        target_rules: [
          {
            attribute: "product.id",
            operator: "eq",
            values: "prod_mat",
          },
        ],
      },
    })

    const api = useApi() as any
    const response = await api.post(
      `/admin/promotions/${createdPromotion.id}`,
      {
        code: "TEST_TWO",
        application_method: {
          value: "200",
          buy_rules_min_quantity: 6,
        },
      },
      adminHeaders
    )

    expect(response.status).toEqual(200)
    expect(response.data.promotion).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        code: "TEST_TWO",
        application_method: expect.objectContaining({
          value: 200,
          buy_rules_min_quantity: 6,
        }),
      })
    )
  })
})
