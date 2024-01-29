import { User } from "@medusajs/medusa"
import { Button, Container, Heading, StatusBadge, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { languages } from "../../../../../i18n/config"

type ProfileGeneralSectionProps = {
  user: Omit<User, "password_hash">
}

export const ProfileGeneralSection = ({ user }: ProfileGeneralSectionProps) => {
  const { i18n, t } = useTranslation()
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{t("profile.domain")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("profile.manageYourProfileDetails")}
          </Text>
        </div>
        <Link to="/settings/profile/edit">
          <Button size="small" variant="secondary">
            {t("general.edit")}
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.name")}
        </Text>
        <Text size="small" leading="compact">
          {user.first_name} {user.last_name}
        </Text>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.email")}
        </Text>
        <Text size="small" leading="compact">
          {user.email}
        </Text>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          {t("profile.language")}
        </Text>
        <Text size="small" leading="compact">
          {languages.find((lang) => lang.code === i18n.language)
            ?.display_name || "-"}
        </Text>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          {t("profile.usageInsights")}
        </Text>
        <StatusBadge color="red" className="w-fit">
          {t("general.disabled")}
        </StatusBadge>
      </div>
    </Container>
  )
}
