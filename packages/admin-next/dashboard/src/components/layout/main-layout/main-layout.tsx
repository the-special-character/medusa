import {
  ChevronDownMini,
  CurrencyDollar,
  MinusMini,
  ReceiptPercent,
  ShoppingCart,
  SquaresPlus,
  Tag,
  Users,
} from "@medusajs/icons"
import { Avatar, Text } from "@medusajs/ui"
import * as Collapsible from "@radix-ui/react-collapsible"
import { useAdminStore } from "medusa-react"
import { useTranslation } from "react-i18next"

import { Skeleton } from "../../common/skeleton"
import { NavItem, NavItemProps } from "../nav-item"
import { Shell } from "../shell"

import extensions from "medusa-admin:routes/links"

export const MainLayout = () => {
  return (
    <Shell>
      <MainSidebar />
    </Shell>
  )
}

const MainSidebar = () => {
  return (
    <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
      <div className="flex flex-1 flex-col">
        <div className="bg-ui-bg-subtle sticky top-0">
          <Header />
          <div className="px-3">
            <div className="border-ui-border-strong h-px w-full border-b border-dashed" />
          </div>
        </div>
        <CoreRouteSection />
        <ExtensionRouteSection />
      </div>
    </aside>
  )
}

const Header = () => {
  const { store, isError, error } = useAdminStore()

  const name = store?.name
  const fallback = store?.name?.slice(0, 1).toUpperCase()

  if (isError) {
    throw error
  }

  return (
    <div className="w-full px-3 py-2">
      <div className="flex items-center p-1 md:pr-2">
        <div className="flex items-center gap-x-3">
          {fallback ? (
            <Avatar variant="squared" fallback={fallback} />
          ) : (
            <Skeleton className="w-8 h-8 rounded-md" />
          )}
          {name ? (
            <Text size="small" weight="plus" leading="compact">
              {store.name}
            </Text>
          ) : (
            <Skeleton className="w-[120px] h-[9px]" />
          )}
        </div>
      </div>
    </div>
  )
}

const useCoreRoutes = (): Omit<NavItemProps, "pathname">[] => {
  const { t } = useTranslation()

  return [
    {
      icon: <ShoppingCart />,
      label: t("orders.domain"),
      to: "/orders",
      items: [
        {
          label: t("draftOrders.domain"),
          to: "/draft-orders",
        },
      ],
    },
    {
      icon: <Tag />,
      label: t("products.domain"),
      to: "/products",
      items: [
        {
          label: t("collections.domain"),
          to: "/collections",
        },
        {
          label: t("categories.domain"),
          to: "/categories",
        },
        {
          label: t("giftCards.domain"),
          to: "/gift-cards",
        },
        {
          label: t("inventory.domain"),
          to: "/inventory",
        },
      ],
    },
    {
      icon: <Users />,
      label: t("customers.domain"),
      to: "/customers",
      items: [
        {
          label: t("customerGroups.domain"),
          to: "/customer-groups",
        },
      ],
    },
    {
      icon: <ReceiptPercent />,
      label: t("discounts.domain"),
      to: "/discounts",
    },
    {
      icon: <CurrencyDollar />,
      label: t("pricing.domain"),
      to: "/pricing",
    },
  ]
}

const CoreRouteSection = () => {
  const coreRoutes = useCoreRoutes()

  return (
    <nav className="flex flex-col gap-y-1 py-2">
      {coreRoutes.map((route) => {
        return <NavItem key={route.to} {...route} />
      })}
    </nav>
  )
}

const ExtensionRouteSection = () => {
  if (!extensions.links || extensions.links.length === 0) {
    return null
  }

  return (
    <div>
      <div className="px-3">
        <div className="border-ui-border-strong h-px w-full border-b border-dashed" />
      </div>
      <div className="flex flex-col gap-y-1 py-2">
        <Collapsible.Root defaultOpen>
          <div className="px-4">
            <Collapsible.Trigger asChild className="group/trigger">
              <button className="text-ui-fg-subtle flex w-full items-center justify-between px-2">
                <Text size="xsmall" weight="plus" leading="compact">
                  Extensions
                </Text>
                <div className="text-ui-fg-muted">
                  <ChevronDownMini className="group-data-[state=open]/trigger:hidden" />
                  <MinusMini className="group-data-[state=closed]/trigger:hidden" />
                </div>
              </button>
            </Collapsible.Trigger>
          </div>
          <Collapsible.Content>
            <div className="flex flex-col gap-y-1 py-1 pb-4">
              {extensions.links.map((link) => {
                return (
                  <NavItem
                    key={link.path}
                    to={link.path}
                    label={link.label}
                    icon={link.icon ? <link.icon /> : <SquaresPlus />}
                    type="extension"
                  />
                )
              })}
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </div>
  )
}
