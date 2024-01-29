import { PencilSquare, Trash } from "@medusajs/icons"
import type { ProductCollection } from "@medusajs/medusa"
import { Container, Heading, Text, usePrompt } from "@medusajs/ui"
import { useAdminDeleteCollection } from "medusa-react"
import { useTranslation } from "react-i18next"
import { ActionMenu } from "../../../../../components/common/action-menu"

type CollectionGeneralSectionProps = {
  collection: ProductCollection
}

export const CollectionGeneralSection = ({
  collection,
}: CollectionGeneralSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()

  const { mutateAsync } = useAdminDeleteCollection(collection.id)

  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("collections.deleteWarning", {
        count: 1,
      }),
    })

    if (!res) {
      return
    }

    await mutateAsync()
  }

  return (
    <Container className="p-0 divide-y">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{collection.title}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t("general.edit"),
                  to: `/collections/${collection.id}/edit`,
                },
              ],
            },
            {
              actions: [
                {
                  icon: <Trash />,
                  label: t("general.delete"),
                  onClick: handleDelete,
                },
              ],
            },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.handle")}
        </Text>
        <Text size="small">/{collection.handle}</Text>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.products")}
        </Text>
        <Text size="small">{collection.products?.length || "-"}</Text>
      </div>
    </Container>
  )
}
