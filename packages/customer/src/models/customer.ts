import { DAL } from "@medusajs/types"
import { DALUtils, generateEntityId } from "@medusajs/utils"
import {
  BeforeCreate,
  Cascade,
  Collection,
  Entity,
  Filter,
  Index,
  ManyToMany,
  ManyToOne,
  OnInit,
  OneToMany,
  OptionalProps,
  PrimaryKey,
  Property,
} from "@mikro-orm/core"
import CustomerGroup from "./customer-group"
import CustomerGroupCustomer from "./customer-group-customer"
import Address from "./address"

type OptionalCustomerProps =
  | "groups"
  | "addresses"
  | DAL.SoftDeletableEntityDateColumns

@Entity({ tableName: "customer" })
@Filter(DALUtils.mikroOrmSoftDeletableFilterOptions)
export default class Customer {
  [OptionalProps]?: OptionalCustomerProps

  @PrimaryKey({ columnType: "text" })
  id: string

  @Property({ columnType: "text", nullable: true })
  company_name: string | null = null

  @Property({ columnType: "text", nullable: true })
  first_name: string | null = null

  @Property({ columnType: "text", nullable: true })
  last_name: string | null = null

  @Property({ columnType: "text", nullable: true })
  email: string | null = null

  @Property({ columnType: "text", nullable: true })
  phone: string | null = null

  @Property({ columnType: "boolean", default: false })
  has_account: boolean = false

  @Property({ columnType: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null = null

  @ManyToMany({
    mappedBy: "customers",
    entity: () => CustomerGroup,
    pivotEntity: () => CustomerGroupCustomer,
  })
  groups = new Collection<CustomerGroup>(this)

  @OneToMany(() => Address, (address) => address.customer, {
    cascade: [Cascade.REMOVE],
  })
  addresses = new Collection<Address>(this)

  @Property({
    onCreate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  created_at: Date

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  updated_at: Date

  @Property({ columnType: "timestamptz", nullable: true })
  deleted_at: Date | null = null

  @Property({ columnType: "text", nullable: true })
  created_by: string | null = null

  @BeforeCreate()
  onCreate() {
    this.id = generateEntityId(this.id, "cus")
  }

  @OnInit()
  onInit() {
    this.id = generateEntityId(this.id, "cus")
  }
}
