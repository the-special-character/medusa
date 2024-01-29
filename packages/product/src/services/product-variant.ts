import { Context, DAL, ProductTypes } from "@medusajs/types"
import {
  InjectTransactionManager,
  isString,
  MedusaContext,
  ModulesSdkUtils,
} from "@medusajs/utils"
import { Product, ProductVariant } from "@models"

import { IProductVariantRepository, ProductVariantServiceTypes } from "@types"
import ProductService from "./product"

type InjectedDependencies = {
  productVariantRepository: DAL.RepositoryService
  productService: ProductService<any>
}

export default class ProductVariantService<
  TEntity extends ProductVariant = ProductVariant,
  TProduct extends Product = Product
> extends ModulesSdkUtils.abstractServiceFactory<
  InjectedDependencies,
  {
    create: ProductTypes.CreateProductVariantOnlyDTO
    update: ProductVariantServiceTypes.UpdateProductVariantDTO
  }
>(ProductVariant)<TEntity> {
  protected readonly productVariantRepository_: IProductVariantRepository<TEntity>
  protected readonly productService_: ProductService<TProduct>

  constructor({
    productVariantRepository,
    productService,
  }: InjectedDependencies) {
    // @ts-ignore
    super(...arguments)
    this.productVariantRepository_ = productVariantRepository
    this.productService_ = productService
  }

  @InjectTransactionManager("productVariantRepository_")
  // @ts-ignore
  override async create(
    productOrId: TProduct | string,
    data: ProductTypes.CreateProductVariantOnlyDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity[]> {
    let product = productOrId as unknown as Product

    if (isString(productOrId)) {
      product = await this.productService_.retrieve(
        productOrId,
        { relations: ["variants"] },
        sharedContext
      )
    }

    let computedRank = product.variants.toArray().length

    const data_ = [...data]
    data_.forEach((variant) => {
      delete variant?.product_id

      Object.assign(variant, {
        variant_rank: computedRank++,
        product,
      })
    })

    return await this.productVariantRepository_.create(data_, {
      transactionManager: sharedContext.transactionManager,
    })
  }

  @InjectTransactionManager("productVariantRepository_")
  // @ts-ignore
  override async update(
    productOrId: TProduct | string,
    data: ProductVariantServiceTypes.UpdateProductVariantDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity[]> {
    let product = productOrId as unknown as Product

    if (isString(productOrId)) {
      product = await this.productService_.retrieve(
        productOrId,
        {},
        sharedContext
      )
    }

    const variantsData = [...data]
    variantsData.forEach((variant) => Object.assign(variant, { product }))

    return await this.productVariantRepository_.update(variantsData, {
      transactionManager: sharedContext.transactionManager,
    })
  }
}
